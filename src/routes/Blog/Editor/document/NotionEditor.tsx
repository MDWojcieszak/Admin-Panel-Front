import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import '~/routes/Blog/Editor/document/editor.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { filterSuggestionItems } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { SuggestionMenuController, getDefaultReactSlashMenuItems, useCreateBlockNote } from '@blocknote/react';
import {
  MdHorizontalRule,
  MdImage,
  MdLink,
  MdMap,
  MdPhotoLibrary,
  MdPlace,
  MdViewColumn,
  MdWarningAmber,
} from 'react-icons/md';
import { useApi } from '~/hooks/useApi';
import { useBlogDraft } from '~/routes/Blog/Editor/hooks/useBlogDraft';
import { BlogEditorBridge, BlogEditorBridgeContext } from '~/routes/Blog/Editor/document/bridge';
import { BlogMediaPanel } from '~/routes/Blog/Editor/document/BlogMediaPanel';
import { CommentGutter } from '~/routes/Blog/Editor/components/CommentGutter';
import { CommentsLayer } from '~/routes/Blog/Editor/components/CommentsLayer';
import { BlogEditor, BlogPartialBlock, IMAGE_DND_TYPE, blogSchema, parseColumns } from '~/routes/Blog/Editor/document/schema';
import { blocksToDocument, sectionsToBlocks } from '~/routes/Blog/Editor/document/serialize';
import { mkUseStyles } from '~/utils/theme';

/** Insert a block at the cursor: convert the current block if empty, else insert after it. */
const insertBlock = (editor: BlogEditor, type: BlogPartialBlock['type']) => {
  const cur = editor.getTextCursorPosition().block;
  const content = (cur as { content?: unknown }).content;
  if (Array.isArray(content) && content.length === 0) editor.updateBlock(cur, { type } as BlogPartialBlock);
  else editor.insertBlocks([{ type } as BlogPartialBlock], cur, 'after');
};

type NotionEditorProps = {
  postId: string;
  locale: string;
  mediaOpen: boolean;
  setMediaOpen: (open: boolean) => void;
  commentsOpen: boolean;
  setCommentsOpen: (open: boolean) => void;
  onSaved?: (hasUnpublishedChanges: boolean) => void;
  onSaveStateChange?: (state: SaveState) => void;
};

export type SaveState = 'idle' | 'saving' | 'saved';

const slashItems = (editor: BlogEditor) => [
  { title: 'Image', group: 'Blog', icon: <MdImage size={18} />, onItemClick: () => insertBlock(editor, 'blogImage') },
  { title: 'Gallery', group: 'Blog', icon: <MdPhotoLibrary size={18} />, onItemClick: () => insertBlock(editor, 'blogGallery') },
  { title: 'Columns', group: 'Blog', icon: <MdViewColumn size={18} />, onItemClick: () => insertBlock(editor, 'blogColumns') },
  { title: 'Callout', group: 'Blog', icon: <MdWarningAmber size={18} />, onItemClick: () => insertBlock(editor, 'blogCallout') },
  { title: 'Embed', group: 'Blog', icon: <MdLink size={18} />, onItemClick: () => insertBlock(editor, 'blogEmbed') },
  { title: 'Map', group: 'Blog', icon: <MdMap size={18} />, onItemClick: () => insertBlock(editor, 'blogMap') },
  { title: 'Place', group: 'Blog', icon: <MdPlace size={18} />, onItemClick: () => insertBlock(editor, 'blogPlace') },
  { title: 'Divider', group: 'Blog', icon: <MdHorizontalRule size={18} />, onItemClick: () => insertBlock(editor, 'divider') },
];

export const NotionEditor = ({
  postId,
  locale,
  mediaOpen,
  setMediaOpen,
  commentsOpen,
  setCommentsOpen,
  onSaved,
  onSaveStateChange,
}: NotionEditorProps) => {
  const styles = useStyles();
  const { blogDocumentApi } = useApi();
  const editor = useCreateBlockNote({ schema: blogSchema });
  const { draft } = useBlogDraft(postId, locale);
  const [composeFor, setComposeFor] = useState<string | null>(null);
  const [sectionMap, setSectionMap] = useState<Record<string, string>>({});

  const pickCbRef = useRef<((id: string) => void) | null>(null);
  const suppressRef = useRef(false);
  const savingRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const loadedKey = useRef<string>();
  const wrapRef = useRef<HTMLDivElement>(null);

  const bridge = useMemo<BlogEditorBridge>(
    () => ({
      pickImage: (cb) => {
        pickCbRef.current = cb;
        setMediaOpen(true);
      },
      addComment: (sectionId) => {
        setCommentsOpen(true);
        setComposeFor(sectionId || null);
      },
    }),
    [],
  );

  const insertImageBlock = useCallback(
    (imageId: string) => {
      const cur = editor.getTextCursorPosition().block;
      const content = (cur as { content?: unknown }).content;
      const block = { type: 'blogImage', props: { imageId } } as BlogPartialBlock;
      if (Array.isArray(content) && content.length === 0) editor.replaceBlocks([cur], [block]);
      else editor.insertBlocks([block], cur, 'after');
    },
    [editor],
  );

  const setState = useCallback((s: SaveState) => onSaveStateChange?.(s), [onSaveStateChange]);

  const doSave = useCallback(async () => {
    if (!blogDocumentApi || savingRef.current) return;
    savingRef.current = true;
    setState('saving');
    try {
      const blocks = await blocksToDocument(editor, editor.document);
      const { data } = await blogDocumentApi.documentControllerSave({
        postId,
        locale,
        saveDocumentDto: { blocks },
      });
      if (data.created.length) {
        suppressRef.current = true;
        for (const c of data.created) {
          const blk = editor.getBlock(c.clientKey);
          if (blk && 'sectionId' in blk.props) editor.updateBlock(blk, { props: { sectionId: c.sectionId } });
        }
        suppressRef.current = false;
      }
      onSaved?.(data.hasUnpublishedChanges);
      setState('saved');
    } catch (e) {
      console.error('Error saving document:', e);
      setState('idle');
    } finally {
      savingRef.current = false;
    }
  }, [blogDocumentApi, editor, postId, locale, onSaved, setState]);

  const scheduleSave = useCallback(() => {
    if (suppressRef.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(doSave, 900);
  }, [doSave]);

  // Load sections → blocks once per (postId, locale).
  useEffect(() => {
    const key = `${postId}:${locale}`;
    if (!draft || loadedKey.current === key) return;
    loadedKey.current = key;
    let active = true;
    (async () => {
      const { blocks, sectionIds } = await sectionsToBlocks(editor, draft.sections);
      if (!active) return;
      suppressRef.current = true;
      editor.replaceBlocks(editor.document, blocks);
      suppressRef.current = false;
      const map: Record<string, string> = {};
      editor.document.forEach((b, i) => {
        if (sectionIds[i]) map[b.id] = sectionIds[i];
      });
      setSectionMap(map);
    })();
    return () => {
      active = false;
    };
  }, [draft, postId, locale, editor]);

  // Drag an image from the media panel onto a block. ProseMirror swallows block-level React drops,
  // so handle it on the wrapper in the capture phase and resolve the target block via its data-id.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes(IMAGE_DND_TYPE)) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }
    };
    const onDrop = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes(IMAGE_DND_TYPE)) return;
      const imageId = e.dataTransfer.getData(IMAGE_DND_TYPE);
      if (!imageId) return;
      e.preventDefault();
      e.stopPropagation();
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const blockId = target?.closest('[data-id]')?.getAttribute('data-id') ?? undefined;
      const onImage = target?.closest('[data-content-type="blogImage"]');
      const colPane = target?.closest('[data-col-index]') as HTMLElement | null;
      try {
        if (onImage && blockId) {
          editor.updateBlock(blockId, { props: { imageId } });
        } else if (colPane && blockId) {
          const idx = parseInt(colPane.getAttribute('data-col-index') ?? '', 10);
          const blk = editor.getBlock(blockId);
          if (blk?.type === 'blogColumns' && !Number.isNaN(idx)) {
            const cols = parseColumns(blk.props.columns);
            if (cols[idx]) {
              cols[idx] = { ...cols[idx], type: 'image', imageId };
              editor.updateBlock(blockId, { props: { columns: JSON.stringify(cols) } });
            }
          }
        } else if (blockId) {
          editor.insertBlocks([{ type: 'blogImage', props: { imageId } } as BlogPartialBlock], blockId, 'after');
        } else {
          const last = editor.document[editor.document.length - 1];
          if (last) editor.insertBlocks([{ type: 'blogImage', props: { imageId } } as BlogPartialBlock], last, 'after');
        }
        scheduleSave();
      } catch (err) {
        console.error('Image drop failed:', err);
      }
    };
    el.addEventListener('dragover', onDragOver, true);
    el.addEventListener('drop', onDrop, true);
    return () => {
      el.removeEventListener('dragover', onDragOver, true);
      el.removeEventListener('drop', onDrop, true);
    };
  }, [editor, scheduleSave]);

  return (
    <BlogEditorBridgeContext.Provider value={bridge}>
      <div ref={wrapRef} style={styles.wrap}>
        <BlogMediaPanel
          open={mediaOpen}
          pickMode={!!pickCbRef.current}
          onClose={() => {
            pickCbRef.current = null;
            setMediaOpen(false);
          }}
          onPick={(id) => {
            if (pickCbRef.current) {
              pickCbRef.current(id);
              pickCbRef.current = null;
              setMediaOpen(false);
            } else {
              insertImageBlock(id);
            }
            scheduleSave();
          }}
        />
        <BlockNoteView
          editor={editor}
          theme='dark'
          slashMenu={false}
          onChange={scheduleSave}
          onBlur={() => {
            clearTimeout(saveTimer.current);
            doSave();
          }}
        >
          <SuggestionMenuController
            triggerCharacter='/'
            getItems={async (query) => {
              // Drop blocks a blog post shouldn't use (toggle lists, native media — our blocks replace those).
              const denied = ['toggle', 'image', 'video', 'audio', 'file'];
              const defaults = getDefaultReactSlashMenuItems(editor).filter(
                (i) => !denied.some((d) => i.title.toLowerCase().includes(d)),
              );
              return filterSuggestionItems([...defaults, ...slashItems(editor)], query);
            }}
          />
        </BlockNoteView>
        <CommentGutter
          containerRef={wrapRef}
          sectionMap={sectionMap}
          onAdd={(sid) => {
            setCommentsOpen(true);
            setComposeFor(sid || null);
          }}
        />
        <CommentsLayer
          open={commentsOpen}
          postId={postId}
          editor={editor}
          sectionMap={sectionMap}
          composeFor={composeFor}
          onClearCompose={() => setComposeFor(null)}
        />
      </div>
    </BlogEditorBridgeContext.Provider>
  );
};

const useStyles = mkUseStyles(() => ({
  wrap: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    width: '100%',
  },
}));
