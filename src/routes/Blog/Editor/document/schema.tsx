import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  MdAdd,
  MdCheckCircle,
  MdClose,
  MdDelete,
  MdImage,
  MdInfoOutline,
  MdLightbulb,
  MdPlace,
  MdTextFields,
  MdWarningAmber,
} from 'react-icons/md';
import { Block, BlockNoteEditor, BlockNoteSchema, PartialBlock, defaultBlockSpecs } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import { CalloutVariant, EmbedProvider, PoiAdminResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import { MediaThumb } from '~/routes/Blog/Editor/components/MediaThumb';
import { PoiPicker } from '~/routes/Blog/Editor/components/PoiPicker';
import { useBlogEditorBridge } from '~/routes/Blog/Editor/document/bridge';
import { mkUseStyles, useTheme } from '~/utils/theme';

// ---- helpers --------------------------------------------------------------

const parseIds = (raw: string): string[] => {
  try {
    const v = JSON.parse(raw || '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

/** Small chip that resolves a POI id to its name once. */
const PoiChip = ({ poiId, onRemove }: { poiId: string; onRemove: () => void }) => {
  const styles = useBlockStyles();
  const theme = useTheme();
  const { blogPoiApi } = useApi();
  const [poi, setPoi] = useState<PoiAdminResponse>();
  useEffect(() => {
    if (!blogPoiApi) return;
    blogPoiApi
      .poiControllerGetAdmin({ id: poiId })
      .then((r) => setPoi(r.data))
      .catch(() => undefined);
  }, [blogPoiApi, poiId]);
  return (
    <div style={styles.poiChip} contentEditable={false}>
      <MdPlace size={14} color={theme.colors.blue04} />
      <span style={styles.poiChipName}>{poi?.name ?? poiId}</span>
      <button style={styles.poiChipRemove} onClick={onRemove} type='button'>
        <MdClose size={13} />
      </button>
    </div>
  );
};

// ---- custom block specs ---------------------------------------------------

const Divider = createReactBlockSpec(
  { type: 'divider', propSchema: { sectionId: { default: '' } }, content: 'none' },
  {
    render: () => {
      const styles = useBlockStyles();
      return <div style={styles.divider} contentEditable={false} />;
    },
  },
)();

const BlogImage = createReactBlockSpec(
  {
    type: 'blogImage',
    propSchema: {
      sectionId: { default: '' },
      imageId: { default: '' },
      imageSize: { default: '' },
      aspectRatio: { default: '' },
      overlayPosition: { default: '' },
      caption: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const styles = useBlockStyles();
      const bridge = useBlogEditorBridge();
      const { imageId, caption } = block.props;
      return (
        <div style={styles.mediaBlock} contentEditable={false}>
          {imageId ? (
            <MediaThumb imageId={imageId} style={styles.image} />
          ) : (
            <button
              style={styles.emptyPick}
              type='button'
              onClick={() => bridge.pickImage((id) => editor.updateBlock(block, { props: { imageId: id } }))}
            >
              <MdImage size={20} /> Pick an image
            </button>
          )}
          <div style={styles.mediaBar}>
            {imageId ? (
              <button
                style={styles.barBtn}
                type='button'
                onClick={() => bridge.pickImage((id) => editor.updateBlock(block, { props: { imageId: id } }))}
              >
                Replace
              </button>
            ) : null}
            <input
              style={styles.captionInput}
              placeholder='Caption (optional)'
              defaultValue={caption}
              onBlur={(e) => editor.updateBlock(block, { props: { caption: e.target.value } })}
            />
          </div>
        </div>
      );
    },
  },
)();

const BlogGallery = createReactBlockSpec(
  {
    type: 'blogGallery',
    propSchema: { sectionId: { default: '' }, imageIds: { default: '[]' }, galleryLayout: { default: '' } },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const styles = useBlockStyles();
      const bridge = useBlogEditorBridge();
      const ids = parseIds(block.props.imageIds);
      const setIds = (next: string[]) => editor.updateBlock(block, { props: { imageIds: JSON.stringify(next) } });
      return (
        <div style={styles.galleryBlock} contentEditable={false}>
          <div style={styles.galleryGrid}>
            {ids.map((id) => (
              <div key={id} style={styles.galleryTile}>
                <MediaThumb imageId={id} style={styles.fill} />
                <button style={styles.tileRemove} type='button' onClick={() => setIds(ids.filter((x) => x !== id))}>
                  <MdClose size={13} />
                </button>
              </div>
            ))}
            <button
              style={styles.galleryAdd}
              type='button'
              onClick={() => bridge.pickImage((id) => setIds([...ids, id]))}
            >
              <MdImage size={18} />
            </button>
          </div>
        </div>
      );
    },
  },
)();

// ---- columns block: N panes (2–4), each image or text ----------------------

export type ColumnDef = { type: 'text' | 'image'; imageId?: string; html?: string };

export const parseColumns = (raw: string): ColumnDef[] => {
  try {
    const v = JSON.parse(raw || '[]');
    if (Array.isArray(v) && v.length) {
      return v.map((c) => ({
        type: c?.type === 'image' ? 'image' : 'text',
        imageId: typeof c?.imageId === 'string' ? c.imageId : '',
        html: typeof c?.html === 'string' ? c.html : '',
      }));
    }
  } catch {
    /* ignore */
  }
  return [
    { type: 'text', html: '' },
    { type: 'image', imageId: '' },
  ];
};

/** contentEditable text cell — native Ctrl+B / Ctrl+I; HTML persisted on blur. */
const ColumnTextEditor = ({ html, onChange }: { html: string; onChange: (html: string) => void }) => {
  const styles = useBlockStyles();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html || '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      style={styles.columnText}
      onBlur={() => onChange(ref.current?.innerHTML ?? '')}
    />
  );
};

const BlogColumns = createReactBlockSpec(
  {
    type: 'blogColumns',
    propSchema: {
      sectionId: { default: '' },
      columns: { default: '[{"type":"text","html":""},{"type":"image","imageId":""}]' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const styles = useBlockStyles();
      const bridge = useBlogEditorBridge();
      const cols = parseColumns(block.props.columns);
      const save = (next: ColumnDef[]) => editor.updateBlock(block, { props: { columns: JSON.stringify(next) } });
      const update = (i: number, patch: Partial<ColumnDef>) =>
        save(cols.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
      return (
        <div style={styles.columnsBlock}>
          <div style={{ ...styles.columnsGrid, gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
            {cols.map((col, i) => (
              <div key={i} style={styles.column}>
                <div style={styles.columnHead} contentEditable={false}>
                  <button
                    style={styles.columnTypeBtn}
                    type='button'
                    title={col.type === 'text' ? 'Switch to image' : 'Switch to text'}
                    onClick={() => update(i, col.type === 'text' ? { type: 'image' } : { type: 'text' })}
                  >
                    {col.type === 'text' ? <MdImage size={14} /> : <MdTextFields size={14} />}
                  </button>
                  {cols.length > 1 ? (
                    <button
                      style={styles.columnRemove}
                      type='button'
                      title='Remove column'
                      onClick={() => save(cols.filter((_, idx) => idx !== i))}
                    >
                      <MdDelete size={14} />
                    </button>
                  ) : null}
                </div>
                {col.type === 'image' ? (
                  col.imageId ? (
                    <div style={styles.columnImageWrap} contentEditable={false}>
                      <MediaThumb imageId={col.imageId} style={styles.fill} />
                      <button style={styles.tileRemove} type='button' onClick={() => update(i, { imageId: '' })}>
                        <MdClose size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      style={styles.columnPick}
                      type='button'
                      contentEditable={false}
                      onClick={() => bridge.pickImage((id) => update(i, { imageId: id }))}
                    >
                      <MdImage size={18} /> Pick
                    </button>
                  )
                ) : (
                  <ColumnTextEditor html={col.html ?? ''} onChange={(h) => update(i, { html: h })} />
                )}
              </div>
            ))}
          </div>
          {cols.length < 4 ? (
            <button
              style={styles.columnsAdd}
              type='button'
              contentEditable={false}
              onClick={() => save([...cols, { type: 'text', html: '' }])}
            >
              <MdAdd size={16} /> Add column
            </button>
          ) : null}
        </div>
      );
    },
  },
)();

const BlogEmbed = createReactBlockSpec(
  {
    type: 'blogEmbed',
    propSchema: { sectionId: { default: '' }, url: { default: '' }, provider: { default: '' } },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const styles = useBlockStyles();
      return (
        <div style={styles.embedBlock} contentEditable={false}>
          <select
            style={styles.embedSelect}
            value={block.props.provider}
            onChange={(e) => editor.updateBlock(block, { props: { provider: e.target.value } })}
          >
            <option value=''>Provider…</option>
            {Object.values(EmbedProvider).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            style={styles.embedInput}
            placeholder='Embed URL'
            defaultValue={block.props.url}
            onBlur={(e) => editor.updateBlock(block, { props: { url: e.target.value } })}
          />
        </div>
      );
    },
  },
)();

const BlogMap = createReactBlockSpec(
  { type: 'blogMap', propSchema: { sectionId: { default: '' }, poiIds: { default: '[]' } }, content: 'none' },
  {
    render: ({ block, editor }) => {
      const styles = useBlockStyles();
      const ids = parseIds(block.props.poiIds);
      const setIds = (next: string[]) => editor.updateBlock(block, { props: { poiIds: JSON.stringify(next) } });
      return (
        <div style={styles.poiBlock} contentEditable={false}>
          <span style={styles.poiBlockLabel}>Map — places</span>
          <div style={styles.poiChips}>
            {ids.map((id) => (
              <PoiChip key={id} poiId={id} onRemove={() => setIds(ids.filter((x) => x !== id))} />
            ))}
          </div>
          <PoiPicker onPick={(poiId) => !ids.includes(poiId) && setIds([...ids, poiId])} />
        </div>
      );
    },
  },
)();

const BlogPlace = createReactBlockSpec(
  { type: 'blogPlace', propSchema: { sectionId: { default: '' }, poiId: { default: '' } }, content: 'none' },
  {
    render: ({ block, editor }) => {
      const styles = useBlockStyles();
      const { poiId } = block.props;
      return (
        <div style={styles.poiBlock} contentEditable={false}>
          <span style={styles.poiBlockLabel}>Place</span>
          {poiId ? (
            <div style={styles.poiChips}>
              <PoiChip poiId={poiId} onRemove={() => editor.updateBlock(block, { props: { poiId: '' } })} />
            </div>
          ) : (
            <PoiPicker onPick={(id) => editor.updateBlock(block, { props: { poiId: id } })} />
          )}
        </div>
      );
    },
  },
)();

const BlogCallout = createReactBlockSpec(
  {
    type: 'blogCallout',
    propSchema: { sectionId: { default: '' }, variant: { default: CalloutVariant.Info } },
    content: 'inline',
  },
  {
    render: ({ block, editor, contentRef }) => {
      const styles = useBlockStyles();
      const theme = useTheme();
      const variants: { value: CalloutVariant; color: string; icon: ReactNode }[] = [
        { value: CalloutVariant.Info, color: theme.colors.blue, icon: <MdInfoOutline size={16} /> },
        { value: CalloutVariant.Tip, color: theme.colors.blue04, icon: <MdLightbulb size={16} /> },
        { value: CalloutVariant.Warning, color: theme.colors.yellow, icon: <MdWarningAmber size={16} /> },
        { value: CalloutVariant.Success, color: theme.colors.lightGreen, icon: <MdCheckCircle size={16} /> },
      ];
      const active = variants.find((v) => v.value === block.props.variant) ?? variants[0];
      return (
        <div
          style={{
            ...styles.calloutBlock,
            backgroundColor: active.color + theme.colorOpacity(0.12),
            borderLeft: `3px solid ${active.color}`,
          }}
        >
          <div style={styles.calloutHeader} contentEditable={false}>
            <span style={{ ...styles.calloutIcon, color: active.color }}>{active.icon}</span>
            <span style={{ ...styles.calloutVariantLabel, color: active.color }}>{active.value}</span>
            <div style={styles.calloutPills}>
              {variants.map((v) => (
                <button
                  key={v.value}
                  type='button'
                  title={v.value}
                  style={{
                    ...styles.calloutPill,
                    ...(v.value === active.value ? { color: v.color, backgroundColor: v.color + theme.colorOpacity(0.18) } : null),
                  }}
                  onClick={() => editor.updateBlock(block, { props: { variant: v.value } })}
                >
                  {v.icon}
                </button>
              ))}
            </div>
          </div>
          <div style={styles.calloutBody} ref={contentRef} />
        </div>
      );
    },
  },
)();

export const blogSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    divider: Divider,
    blogImage: BlogImage,
    blogGallery: BlogGallery,
    blogColumns: BlogColumns,
    blogEmbed: BlogEmbed,
    blogMap: BlogMap,
    blogPlace: BlogPlace,
    blogCallout: BlogCallout,
  },
});

type ExtractSchema<T> = T extends BlockNoteSchema<infer B, infer I, infer S> ? [B, I, S] : never;
type S = ExtractSchema<typeof blogSchema>;
export type BlogEditor = BlockNoteEditor<S[0], S[1], S[2]>;
export type BlogBlock = Block<S[0], S[1], S[2]>;
export type BlogPartialBlock = PartialBlock<S[0], S[1], S[2]>;

/** Our custom block type names — anything else is "prose" (native). */
export const CUSTOM_BLOCK_TYPES = new Set([
  'divider',
  'blogImage',
  'blogGallery',
  'blogColumns',
  'blogEmbed',
  'blogMap',
  'blogPlace',
  'blogCallout',
]);

const useBlockStyles = mkUseStyles((t) => ({
  divider: {
    display: 'block',
    width: '100%',
    height: 2,
    boxSizing: 'border-box',
    backgroundColor: t.colors.white + t.colorOpacity(0.22),
    borderRadius: 1,
    margin: `${t.spacing.m}px 0`,
  },
  mediaBlock: { gap: t.spacing.s, padding: t.spacing.s, borderRadius: t.borderRadius.default, backgroundColor: t.colors.gray04 + t.colorOpacity(0.4) },
  image: { width: '100%', maxHeight: 360, borderRadius: t.borderRadius.default, overflow: 'hidden' },
  emptyPick: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.s,
    height: 120,
    borderRadius: t.borderRadius.default,
    border: `1px dashed ${t.colors.white + t.colorOpacity(0.2)}`,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
    display: 'flex',
  },
  mediaBar: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
  barBtn: {
    height: 30,
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.small,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.12)}`,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
    fontSize: 13,
  },
  captionInput: {
    flex: 1,
    minWidth: 0,
    height: 30,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.small,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 13,
  },
  galleryBlock: { padding: t.spacing.s },
  galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing.s },
  galleryTile: { position: 'relative', aspectRatio: '1 / 1', borderRadius: t.borderRadius.default, overflow: 'hidden', backgroundColor: t.colors.gray05 },
  fill: { width: '100%', height: '100%' },
  tileRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: 0,
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  galleryAdd: {
    aspectRatio: '1 / 1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    border: `1px dashed ${t.colors.white + t.colorOpacity(0.2)}`,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
  },
  columnsBlock: { display: 'flex', flexDirection: 'column', gap: t.spacing.s, width: '100%' },
  columnsGrid: { display: 'grid', gap: t.spacing.m, width: '100%' },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.xs,
    minWidth: 0,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.35),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.05)}`,
  },
  columnHead: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  columnTypeBtn: {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
  },
  columnRemove: {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    color: t.colors.red,
    cursor: 'pointer',
  },
  columnImageWrap: {
    display: 'block',
    position: 'relative',
    width: '100%',
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
  },
  columnPick: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.s,
    height: 100,
    borderRadius: t.borderRadius.default,
    border: `1px dashed ${t.colors.white + t.colorOpacity(0.2)}`,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
  },
  columnText: {
    display: 'block',
    minHeight: 80,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.4),
    color: t.colors.white,
    outline: 'none',
    fontSize: 14,
    lineHeight: 1.5,
  },
  columnsAdd: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.xs,
    alignSelf: 'flex-start',
    height: 32,
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    border: `1px dashed ${t.colors.white + t.colorOpacity(0.2)}`,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
    fontSize: 13,
  },
  embedBlock: { flexDirection: 'row', gap: t.spacing.s, alignItems: 'center' },
  embedSelect: {
    height: 36,
    borderRadius: t.borderRadius.small,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    colorScheme: 'dark',
    fontSize: 13,
  },
  embedInput: {
    flex: 1,
    minWidth: 0,
    height: 36,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.small,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 14,
  },
  poiBlock: { gap: t.spacing.s, padding: t.spacing.s, borderRadius: t.borderRadius.default, backgroundColor: t.colors.gray04 + t.colorOpacity(0.4) },
  poiBlockLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: t.colors.blue04 },
  poiChips: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs },
  poiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 28,
    paddingLeft: t.spacing.s,
    paddingRight: 4,
    borderRadius: t.borderRadius.small,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  poiChipName: { fontSize: 13 },
  poiChipRemove: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: 0,
    background: 'transparent',
    color: t.colors.red,
    cursor: 'pointer',
  },
  calloutBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    width: '100%',
    boxSizing: 'border-box',
  },
  calloutHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  calloutIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  calloutVariantLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  calloutPills: {
    display: 'flex',
    flexDirection: 'row',
    gap: t.spacing.xs,
  },
  calloutPill: {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
  },
  calloutBody: {
    width: '100%',
  },
}));
