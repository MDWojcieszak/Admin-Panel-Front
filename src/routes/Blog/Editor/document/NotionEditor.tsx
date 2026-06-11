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
  MdPermMedia,
  MdPhotoLibrary,
  MdPlace,
  MdViewColumn,
  MdWarningAmber,
} from 'react-icons/md';
import { useApi } from '~/hooks/useApi';
import { useBlogDraft } from '~/routes/Blog/Editor/hooks/useBlogDraft';
import { BlogEditorBridge, BlogEditorBridgeContext } from '~/routes/Blog/Editor/document/bridge';
import { BlogMediaPanel } from '~/routes/Blog/Editor/document/BlogMediaPanel';
import { BlogEditor, BlogPartialBlock, blogSchema } from '~/routes/Blog/Editor/document/schema';
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

export const NotionEditor = ({ postId, locale, onSaved, onSaveStateChange }: NotionEditorProps) => {
  const styles = useStyles();
  const { blogDocumentApi } = useApi();
  const editor = useCreateBlockNote({ schema: blogSchema });
  const { draft } = useBlogDraft(postId, locale);

  const [mediaOpen, setMediaOpen] = useState(false);
  const pickCbRef = useRef<((id: string) => void) | null>(null);
  const suppressRef = useRef(false);
  const savingRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const loadedKey = useRef<string>();

  const bridge = useMemo<BlogEditorBridge>(
    () => ({
      pickImage: (cb) => {
        pickCbRef.current = cb;
        setMediaOpen(true);
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
      const blocks = await sectionsToBlocks(editor, draft.sections);
      if (!active) return;
      suppressRef.current = true;
      editor.replaceBlocks(editor.document, blocks);
      suppressRef.current = false;
    })();
    return () => {
      active = false;
    };
  }, [draft, postId, locale, editor]);

  return (
    <BlogEditorBridgeContext.Provider value={bridge}>
      <div style={styles.wrap}>
        {!mediaOpen ? (
          <button
            style={styles.libraryToggle}
            title='Media library'
            onClick={() => {
              pickCbRef.current = null;
              setMediaOpen(true);
            }}
          >
            <MdPermMedia size={20} />
          </button>
        ) : null}
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
      </div>
    </BlogEditorBridgeContext.Provider>
  );
};

const useStyles = mkUseStyles((t) => ({
  wrap: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    width: '100%',
  },
  libraryToggle: {
    position: 'fixed',
    left: 14,
    top: 120,
    zIndex: 30,
    width: 42,
    height: 42,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: `1px solid ${t.colors.white + t.colorOpacity(0.1)}`,
    backgroundColor: t.colors.gray04,
    color: t.colors.white,
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
  },
}));
