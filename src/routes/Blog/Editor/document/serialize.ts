import {
  BlogSectionType,
  CalloutVariant,
  DocumentBlockDto,
  DocumentBlockType,
  ResolvedSectionResponse,
} from '~/api/api';
import { BlogBlock, BlogEditor, BlogPartialBlock, CUSTOM_BLOCK_TYPES } from '~/routes/Blog/Editor/document/schema';

const clampLevel = (lvl?: number | null): 1 | 2 | 3 => (lvl === 1 ? 1 : lvl === 3 ? 3 : 2);
const undef = (v?: string | null): string | undefined => v || undefined;

/** Extract plain text from BlockNote inline content (V1: plain text, no inline marks). */
const inlineToText = (content: unknown): string => {
  if (!Array.isArray(content)) return '';
  return content
    .map((node) => {
      if (node && typeof node === 'object' && 'type' in node) {
        const n = node as { type: string; text?: string; content?: unknown };
        if (n.type === 'text') return n.text ?? '';
        if (n.type === 'link') return inlineToText(n.content);
      }
      return '';
    })
    .join('');
};

// ---- LOAD: backend sections → BlockNote document --------------------------

export const sectionsToBlocks = async (
  editor: BlogEditor,
  sections: ResolvedSectionResponse[],
): Promise<BlogPartialBlock[]> => {
  const blocks: BlogPartialBlock[] = [];
  const ordered = [...sections].sort((a, b) => a.order - b.order);

  for (const s of ordered) {
    switch (s.type) {
      case BlogSectionType.Paragraph: {
        // Prose is stored as HTML to preserve inline formatting (bold/italic/colour/links).
        const parsed = s.body?.trim().startsWith('<')
          ? await editor.tryParseHTMLToBlocks(s.body)
          : await editor.tryParseMarkdownToBlocks(s.body || '');
        blocks.push(...(parsed as BlogPartialBlock[]));
        break;
      }
      case BlogSectionType.Heading:
        blocks.push({ type: 'heading', props: { level: clampLevel(s.headingLevel) }, content: s.title || s.body || '' });
        break;
      case BlogSectionType.Quote:
        blocks.push({ type: 'quote', content: s.body || '' });
        break;
      case BlogSectionType.List: {
        const md = [...s.items]
          .sort((a, b) => a.order - b.order)
          .map((i) => `- ${i.content || ''}`)
          .join('\n');
        const parsed = await editor.tryParseMarkdownToBlocks(md);
        blocks.push(...(parsed as BlogPartialBlock[]));
        break;
      }
      case BlogSectionType.Callout:
        blocks.push({
          type: 'blogCallout',
          props: { sectionId: s.id, variant: s.calloutVariant ?? CalloutVariant.Info },
          content: s.body || '',
        });
        break;
      case BlogSectionType.Divider:
        blocks.push({ type: 'divider', props: { sectionId: s.id } });
        break;
      case BlogSectionType.Image: {
        const img = s.images[0];
        blocks.push({
          type: 'blogImage',
          props: {
            sectionId: s.id,
            imageId: img?.imageId ?? '',
            imageSize: img?.size ?? '',
            aspectRatio: img?.aspectRatio ?? '',
            overlayPosition: img?.overlayPosition ?? '',
            caption: img?.caption ?? '',
          },
        });
        break;
      }
      case BlogSectionType.Gallery:
        blocks.push({
          type: 'blogGallery',
          props: {
            sectionId: s.id,
            imageIds: JSON.stringify([...s.images].sort((a, b) => a.order - b.order).map((i) => i.imageId)),
            galleryLayout: s.galleryLayout ?? '',
          },
        });
        break;
      case BlogSectionType.MediaText: {
        const img = s.images[0];
        blocks.push({
          type: 'blogMediaText',
          props: {
            sectionId: s.id,
            imageId: img?.imageId ?? '',
            mediaPosition: s.mediaPosition ?? '',
            mediaSplit: s.mediaSplit ?? '',
            mobileStackOrder: s.mobileStackOrder ?? '',
            caption: img?.caption ?? '',
          },
          content: s.body || '',
        });
        break;
      }
      case BlogSectionType.Embed:
        blocks.push({
          type: 'blogEmbed',
          props: { sectionId: s.id, url: s.embedUrl ?? '', provider: s.embedProvider ?? '' },
        });
        break;
      case BlogSectionType.Map:
        blocks.push({
          type: 'blogMap',
          props: { sectionId: s.id, poiIds: JSON.stringify([...s.pois].sort((a, b) => a.order - b.order).map((p) => p.poiId)) },
        });
        break;
      case BlogSectionType.Place:
        blocks.push({ type: 'blogPlace', props: { sectionId: s.id, poiId: s.pois[0]?.poiId ?? '' } });
        break;
      default:
        break;
    }
  }

  if (!blocks.length) blocks.push({ type: 'paragraph' });
  return blocks;
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

/** Map a single custom block to a DocumentBlockDto, or null if incomplete (skip → backend prunes it). */
const customToDoc = (b: BlogBlock): DocumentBlockDto | null => {
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
        caption: undef(b.props.caption),
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
    case 'blogMediaText':
      if (!b.props.imageId) return null;
      return {
        ...ref(b.props.sectionId, b.id),
        type: DocumentBlockType.MediaText,
        imageId: b.props.imageId,
        markdown: inlineToText(b.content),
        mediaPosition: undef(b.props.mediaPosition) as DocumentBlockDto['mediaPosition'],
        mediaSplit: undef(b.props.mediaSplit) as DocumentBlockDto['mediaSplit'],
        mobileStackOrder: undef(b.props.mobileStackOrder) as DocumentBlockDto['mobileStackOrder'],
        caption: undef(b.props.caption),
      };
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
        markdown: inlineToText(b.content),
      };
    default:
      return null;
  }
};

export const blocksToDocument = async (editor: BlogEditor, blocks: BlogBlock[]): Promise<DocumentBlockDto[]> => {
  const out: DocumentBlockDto[] = [];
  let prose: BlogBlock[] = [];

  const flush = async () => {
    if (!prose.length) return;
    const buffer = prose;
    prose = [];
    // Skip runs that are only empty paragraphs.
    const hasText = buffer.some((b) => inlineToText((b as { content?: unknown }).content).trim());
    if (!hasText) return;
    // HTML keeps inline marks/colours that Markdown would drop.
    const markdown = (await editor.blocksToFullHTML(buffer)).trim();
    if (markdown) out.push({ type: DocumentBlockType.Prose, markdown });
  };

  for (const b of blocks) {
    if (!CUSTOM_BLOCK_TYPES.has(b.type)) {
      prose.push(b);
      continue;
    }
    await flush();
    const doc = customToDoc(b);
    if (doc) out.push(doc);
  }
  await flush();
  return out;
};
