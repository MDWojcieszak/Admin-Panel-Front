import {
  BlogOverlayBackdrop,
  BlogOverlayPosition,
  BlogOverlayTheme,
  BlogSectionType,
  CalloutVariant,
  DocumentBlockDto,
  DocumentBlockType,
  DocumentLeafBlockDto,
  ResolvedSectionResponse,
} from '~/api/api';
import { BlogBlock, BlogEditor, BlogPartialBlock, CUSTOM_BLOCK_TYPES } from '~/routes/Blog/Editor/document/schema';
import { blocksToMarkdown, inlineToMarkdown, markdownToBlocks, parseInline } from '~/routes/Blog/Editor/document/markdown';

const clampLevel = (lvl?: number | null): 1 | 2 | 3 => (lvl === 1 ? 1 : lvl === 3 ? 3 : 2);
const undef = (v?: string | null): string | undefined => v || undefined;

// Module-global so reconstructed block ids are unique ACROSS loads. A per-call counter would reuse the
// same `bsec-0…` ids each reload — colliding with the blocks replaceBlocks is removing, which makes
// BlockNote regenerate them and breaks the section map (the comment gutter vanishes after a few switches).
let blockIdSeq = 0;

// ---- LOAD: backend sections → BlockNote document --------------------------

/** Reconstruct the block(s) for one leaf section. `keepSectionId` ties it to its section for reuse +
 *  comment anchoring; column children pass false so the whole columns subtree is re-created on save. */
const buildBlocks = (s: ResolvedSectionResponse, keepSectionId: boolean): BlogPartialBlock[] => {
  const sid = keepSectionId ? s.id : '';
  switch (s.type) {
    case BlogSectionType.Paragraph:
      return markdownToBlocks(s.body || '');
    case BlogSectionType.Heading:
      return [{ type: 'heading', props: { level: clampLevel(s.headingLevel) }, content: parseInline(s.title || s.body || '') } as BlogPartialBlock];
    case BlogSectionType.Quote:
      return [{ type: 'quote', content: parseInline(s.body || '') } as BlogPartialBlock];
    case BlogSectionType.List:
      return [...s.items]
        .sort((a, b) => a.order - b.order)
        .map((i) => ({ type: 'bulletListItem', content: parseInline(i.content || '') }) as BlogPartialBlock);
    case BlogSectionType.Callout:
      return [
        {
          type: 'blogCallout',
          props: { sectionId: sid, variant: s.calloutVariant ?? CalloutVariant.Info },
          content: parseInline(s.body || ''),
        } as BlogPartialBlock,
      ];
    case BlogSectionType.Divider:
      return [{ type: 'divider', props: { sectionId: sid } }];
    case BlogSectionType.Image: {
      const img = s.images[0];
      return [
        {
          type: 'blogImage',
          props: {
            sectionId: sid,
            imageId: img?.imageId ?? '',
            imageSize: img?.size ?? '',
            aspectRatio: img?.aspectRatio ?? '',
            overlayPosition: img?.overlayPosition ?? BlogOverlayPosition.BottomLeft,
            overlayText: img?.overlayText ?? '',
            overlayTheme: img?.overlayTheme ?? BlogOverlayTheme.Light,
            overlayBackdrop: img?.overlayBackdrop ?? BlogOverlayBackdrop.Scrim,
            caption: img?.caption ?? '',
            alt: img?.alt ?? '',
            focalX: img?.focalX ?? 0.5,
            focalY: img?.focalY ?? 0.5,
          },
        },
      ];
    }
    case BlogSectionType.Gallery:
      return [
        {
          type: 'blogGallery',
          props: {
            sectionId: sid,
            imageIds: JSON.stringify([...s.images].sort((a, b) => a.order - b.order).map((i) => i.imageId)),
            galleryLayout: s.galleryLayout ?? '',
          },
        },
      ];
    case BlogSectionType.Embed:
      return [{ type: 'blogEmbed', props: { sectionId: sid, url: s.embedUrl ?? '', provider: s.embedProvider ?? '' } }];
    case BlogSectionType.Map:
      return [
        {
          type: 'blogMap',
          props: { sectionId: sid, poiIds: JSON.stringify([...s.pois].sort((a, b) => a.order - b.order).map((p) => p.poiId)) },
        },
      ];
    case BlogSectionType.Place:
      return [{ type: 'blogPlace', props: { sectionId: sid, poiId: s.pois[0]?.poiId ?? '' } }];
    default:
      return [];
  }
};

export const sectionsToBlocks = async (
  _editor: BlogEditor,
  sections: ResolvedSectionResponse[],
): Promise<{ blocks: BlogPartialBlock[]; sectionMap: Record<string, string> }> => {
  const blocks: BlogPartialBlock[] = [];
  // Map a block to its backend section by giving every top-level block an explicit id and recording it
  // here — far more robust than index-aligning editor.document afterwards (column normalization or a
  // trailing paragraph could shift indices, e.g. losing the comment gutter after a locale switch).
  const sectionMap: Record<string, string> = {};
  // Give a block an explicit id and record its backend section (works at any nesting depth — columns
  // map their column/leaf children too, so the shared structure's ids are reused on save and per-locale
  // text lands on the right section instead of churning).
  const mark = <T,>(blk: T, sectionId: string): T => {
    const id = `bsec-${blockIdSeq++}`;
    (blk as { id?: string }).id = id;
    sectionMap[id] = sectionId;
    return blk;
  };
  const tag = (blk: BlogPartialBlock, sectionId: string) => blocks.push(mark(blk, sectionId));

  const childrenByParent = new Map<string, ResolvedSectionResponse[]>();
  for (const s of sections) {
    if (s.parentId) {
      const arr = childrenByParent.get(s.parentId) ?? [];
      arr.push(s);
      childrenByParent.set(s.parentId, arr);
    }
  }
  const ordered = sections.filter((s) => !s.parentId).sort((a, b) => a.order - b.order);

  for (const s of ordered) {
    if (s.type === BlogSectionType.Columns) {
      // COLUMNS → COLUMN (columnWidth) → leaf sections; rebuild the library's columnList/column blocks.
      const columnSecs = (childrenByParent.get(s.id) ?? []).sort((a, b) => a.order - b.order);
      // The library keeps column `width` averaging 1 (sum ≈ column count) and clamps each to ≥ 0.5, so it
      // resizes correctly. Backend stores shares (sum 1); scale them by the count to match the convention.
      const n = columnSecs.length || 1;
      const shares = columnSecs.map((c) => (typeof c.columnWidth === 'number' && c.columnWidth > 0 ? c.columnWidth : 1 / n));
      const shareSum = shares.reduce((acc, v) => acc + v, 0) || 1;
      // Map the columnList id BEFORE its columns/leaves so the comment gutter (which stops at the first
      // mapped block whose Y-span holds the cursor) resolves column content to the WHOLE columns block —
      // button in the right margin + a locatable top-level card — instead of a nested leaf in a column.
      const colListId = `bsec-${blockIdSeq++}`;
      sectionMap[colListId] = s.id;
      const columns = columnSecs.map((colSec, ci) => {
        const leaves = (childrenByParent.get(colSec.id) ?? []).sort((a, b) => a.order - b.order);
        // keepSectionId=true + mark() each leaf so column content reuses its section (shared structure,
        // per-locale text), and mark() the column itself for the COLUMN section.
        const children = leaves.flatMap((l) => buildBlocks(l, true).map((blk) => mark(blk, l.id)));
        return mark({ type: 'column', props: { width: (shares[ci] / shareSum) * n }, children } as unknown as BlogPartialBlock, colSec.id);
      });
      blocks.push({ id: colListId, type: 'columnList', children: columns } as unknown as BlogPartialBlock);
    } else {
      for (const blk of buildBlocks(s, true)) tag(blk, s.id);
    }
  }

  if (!blocks.length) blocks.push({ type: 'paragraph' });
  return { blocks, sectionMap };
};

// ---- SAVE: BlockNote document → DocumentBlockDto[] ------------------------

const parseIds = (raw: string): string[] => {
  try {
    const v = JSON.parse(raw || '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

const ref = (sectionId: string, blockId: string): { id?: string; clientKey?: string } =>
  sectionId ? { id: sectionId } : { clientKey: blockId };

/** Map a single custom block to a DocumentBlockDto, or null if incomplete (skip → backend prunes it).
 *  sectionMap (blockId → sectionId) lets the columns block reuse its COLUMNS section across saves so
 *  comments anchored to it survive (its column/leaf children still churn — comments live on the whole block). */
function customToDoc(b: BlogBlock, sectionMap?: Record<string, string>): DocumentBlockDto | null {
  switch (b.type) {
    case 'divider':
      return { ...ref(b.props.sectionId, b.id), type: DocumentBlockType.Divider };
    case 'blogImage':
      if (!b.props.imageId) return null;
      return {
        ...ref(b.props.sectionId, b.id),
        type: DocumentBlockType.Image,
        imageId: b.props.imageId,
        imageSize: undef(b.props.imageSize) as DocumentBlockDto['imageSize'],
        aspectRatio: undef(b.props.aspectRatio) as DocumentBlockDto['aspectRatio'],
        overlayPosition: undef(b.props.overlayPosition) as DocumentBlockDto['overlayPosition'],
        overlayText: undef(b.props.overlayText),
        overlayTheme: b.props.overlayText ? (b.props.overlayTheme as DocumentBlockDto['overlayTheme']) : undefined,
        overlayBackdrop: b.props.overlayText ? (b.props.overlayBackdrop as DocumentBlockDto['overlayBackdrop']) : undefined,
        caption: undef(b.props.caption),
        alt: undef(b.props.alt),
        focalX: b.props.focalX,
        focalY: b.props.focalY,
      };
    case 'blogGallery': {
      const imageIds = parseIds(b.props.imageIds);
      if (!imageIds.length) return null;
      return {
        ...ref(b.props.sectionId, b.id),
        type: DocumentBlockType.Gallery,
        imageIds,
        galleryLayout: undef(b.props.galleryLayout) as DocumentBlockDto['galleryLayout'],
      };
    }
    case 'columnList': {
      const columns = (b.children ?? [])
        .map((col) => {
          const width = (col.props as { width?: number }).width ?? 1;
          // Reuse the COLUMN section + each leaf's section (via serializeBlockList's blockRef) so the
          // shared structure is stable and per-locale text saves; new blocks fall back to clientKeys.
          const inner = serializeBlockList(col.children as BlogBlock[], sectionMap);
          return { ...ref(sectionMap?.[col.id] ?? '', col.id), width, blocks: inner as DocumentLeafBlockDto[] };
        })
        .filter((c) => c.blocks.length);
      if (!columns.length) return null;
      const total = columns.reduce((s, c) => s + c.width, 0) || 1;
      return {
        ...ref(sectionMap?.[b.id] ?? '', b.id),
        type: DocumentBlockType.Columns,
        columns: columns.map((c) => ({ ...c, width: c.width / total })),
      };
    }
    case 'blogEmbed':
      if (!b.props.url) return null;
      return {
        ...ref(b.props.sectionId, b.id),
        type: DocumentBlockType.Embed,
        url: b.props.url,
        provider: undef(b.props.provider) as DocumentBlockDto['provider'],
      };
    case 'blogMap': {
      const poiIds = parseIds(b.props.poiIds);
      if (!poiIds.length) return null;
      return { ...ref(b.props.sectionId, b.id), type: DocumentBlockType.Map, poiIds };
    }
    case 'blogPlace':
      if (!b.props.poiId) return null;
      return { ...ref(b.props.sectionId, b.id), type: DocumentBlockType.Place, poiId: b.props.poiId };
    case 'blogCallout':
      return {
        ...ref(b.props.sectionId, b.id),
        type: DocumentBlockType.Callout,
        variant: b.props.variant as CalloutVariant,
        markdown: inlineToMarkdown(b.content),
      };
    default:
      return null;
  }
}

const LIST_TYPES = new Set(['bulletListItem', 'numberedListItem', 'checkListItem']);

/**
 * Serialise a flat block list to DocumentBlockDto[]. Each native block becomes its OWN granular section
 * (Prose/Heading/Quote/List) reusing its backend section id from sectionMap, so the section — and any
 * comment anchored to it — survives a save instead of churning. New blocks fall back to a clientKey.
 */
function serializeBlockList(blocks: BlogBlock[], sectionMap?: Record<string, string>): DocumentBlockDto[] {
  const out: DocumentBlockDto[] = [];
  const used = new Set<string>();
  // Reuse the section id once per id (a section that loaded as several blocks keeps only its first).
  const blockRef = (b: BlogBlock): { id?: string; clientKey?: string } => {
    const sid = sectionMap?.[b.id];
    if (sid && !used.has(sid)) {
      used.add(sid);
      return { id: sid };
    }
    return { clientKey: b.id };
  };

  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (LIST_TYPES.has(b.type)) {
      const start = i;
      const items: { content: string }[] = [];
      while (i < blocks.length && LIST_TYPES.has(blocks[i].type)) {
        items.push({ content: inlineToMarkdown((blocks[i] as { content?: unknown }).content) });
        i++;
      }
      out.push({ ...blockRef(blocks[start]), type: DocumentBlockType.List, items });
      continue;
    }
    i++;
    if (b.type === 'heading') {
      out.push({ ...blockRef(b), type: DocumentBlockType.Heading, text: inlineToMarkdown(b.content), level: b.props.level });
    } else if (b.type === 'quote') {
      out.push({ ...blockRef(b), type: DocumentBlockType.Quote, markdown: inlineToMarkdown(b.content) });
    } else if (b.type === 'paragraph') {
      const markdown = inlineToMarkdown(b.content);
      if (markdown.trim() || sectionMap?.[b.id]) out.push({ ...blockRef(b), type: DocumentBlockType.Prose, markdown });
    } else if (CUSTOM_BLOCK_TYPES.has(b.type)) {
      const doc = customToDoc(b, sectionMap);
      if (doc) out.push(doc);
    } else {
      const markdown = blocksToMarkdown([b]).trim();
      if (markdown) out.push({ ...blockRef(b), type: DocumentBlockType.Prose, markdown });
    }
  }
  return out;
}

export const blocksToDocument = async (
  _editor: BlogEditor,
  blocks: BlogBlock[],
  sectionMap?: Record<string, string>,
): Promise<DocumentBlockDto[]> => serializeBlockList(blocks, sectionMap);
