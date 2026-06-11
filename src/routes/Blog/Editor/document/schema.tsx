import {
  Fragment,
  ReactNode,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MdAdd,
  MdCheckCircle,
  MdClose,
  MdDelete,
  MdFormatBold,
  MdFormatColorReset,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatQuote,
  MdImage,
  MdInfoOutline,
  MdLightbulb,
  MdPlace,
  MdSettings,
  MdSwapHoriz,
  MdTextFields,
  MdWarningAmber,
} from 'react-icons/md';
import { LuHeading1, LuHeading2, LuHeading3, LuPilcrow } from 'react-icons/lu';
import { Block, BlockNoteEditor, BlockNoteSchema, PartialBlock, defaultBlockSpecs } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import {
  BlogAspectRatio,
  BlogOverlayBackdrop,
  BlogOverlayPosition,
  BlogOverlayTheme,
  CalloutVariant,
  EmbedProvider,
  PoiAdminResponse,
} from '~/api/api';
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

/** Drag payload key for dropping a blog-media image onto a block. */
export const IMAGE_DND_TYPE = 'application/x-blog-image';

const RATIOS: { value: string; label: string; css?: string }[] = [
  { value: BlogAspectRatio.Original, label: 'Original' },
  { value: BlogAspectRatio.Ratio169, label: '16:9', css: '16 / 9' },
  { value: BlogAspectRatio.Ratio219, label: '21:9', css: '21 / 9' },
  { value: BlogAspectRatio.Ratio6524, label: '65:24', css: '65 / 24' },
  { value: BlogAspectRatio.Ratio43, label: '4:3', css: '4 / 3' },
  { value: BlogAspectRatio.Ratio32, label: '3:2', css: '3 / 2' },
  { value: BlogAspectRatio.Square, label: '1:1', css: '1 / 1' },
  { value: BlogAspectRatio.Ratio34, label: '3:4', css: '3 / 4' },
  { value: BlogAspectRatio.Ratio23, label: '2:3', css: '2 / 3' },
  { value: BlogAspectRatio.Ratio45, label: '4:5', css: '4 / 5' },
  { value: BlogAspectRatio.Ratio916, label: '9:16', css: '9 / 16' },
];

const OVERLAY_POSITIONS: BlogOverlayPosition[] = [
  BlogOverlayPosition.TopLeft,
  BlogOverlayPosition.TopCenter,
  BlogOverlayPosition.TopRight,
  BlogOverlayPosition.MiddleLeft,
  BlogOverlayPosition.MiddleCenter,
  BlogOverlayPosition.MiddleRight,
  BlogOverlayPosition.BottomLeft,
  BlogOverlayPosition.BottomCenter,
  BlogOverlayPosition.BottomRight,
];

const posAlign = (pos: string) => ({
  justifyContent: pos.startsWith('TOP') ? 'flex-start' : pos.startsWith('BOTTOM') ? 'flex-end' : 'center',
  alignItems: pos.endsWith('LEFT') ? 'flex-start' : pos.endsWith('RIGHT') ? 'flex-end' : 'center',
  textAlign: (pos.endsWith('LEFT') ? 'left' : pos.endsWith('RIGHT') ? 'right' : 'center') as CSSProperties['textAlign'],
});

/** Text overlay rendered on top of an image. */
const OverlayLayer = ({ text, position, themeVal, backdrop }: { text: string; position: string; themeVal: string; backdrop: string }) => {
  if (!text) return null;
  const a = posAlign(position);
  const layer: CSSProperties = { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: a.justifyContent, alignItems: a.alignItems, padding: 18, pointerEvents: 'none' };
  if (backdrop === BlogOverlayBackdrop.Scrim) layer.backgroundColor = 'rgba(0,0,0,0.35)';
  else if (backdrop === BlogOverlayBackdrop.Gradient)
    layer.backgroundImage = `linear-gradient(${position.startsWith('TOP') ? 'to top' : 'to bottom'}, transparent 45%, rgba(0,0,0,0.65))`;
  const dark = themeVal === BlogOverlayTheme.Dark;
  const glass = backdrop === BlogOverlayBackdrop.Glass;
  const textStyle: CSSProperties = {
    color: dark ? '#0a0a0a' : '#fff',
    fontWeight: 800,
    fontSize: 24,
    lineHeight: 1.2,
    maxWidth: '88%',
    textAlign: a.textAlign,
    whiteSpace: 'pre-wrap',
    padding: glass ? '8px 12px' : 0,
    borderRadius: glass ? 8 : 0,
    backgroundColor: glass ? (dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.28)') : 'transparent',
    backdropFilter: glass ? 'blur(8px)' : undefined,
    textShadow: backdrop === BlogOverlayBackdrop.None ? (dark ? '0 1px 2px rgba(255,255,255,0.5)' : '0 1px 4px rgba(0,0,0,0.65)') : undefined,
  };
  return (
    <div style={layer}>
      <span style={textStyle}>{text}</span>
    </div>
  );
};

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
      overlayPosition: { default: BlogOverlayPosition.BottomLeft },
      overlayText: { default: '' },
      overlayTheme: { default: BlogOverlayTheme.Light },
      overlayBackdrop: { default: BlogOverlayBackdrop.Scrim },
      caption: { default: '' },
      focalX: { default: 0.5 },
      focalY: { default: 0.5 },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const styles = useBlockStyles();
      const bridge = useBlogEditorBridge();
      const [open, setOpen] = useState(false);
      const { imageId, aspectRatio, caption, focalX, focalY, overlayText, overlayPosition, overlayTheme, overlayBackdrop } =
        block.props;
      const aspectCss = RATIOS.find((r) => r.value === aspectRatio)?.css;
      const setImage = (id: string) => editor.updateBlock(block, { props: { imageId: id } });
      const overlay = (
        <OverlayLayer text={overlayText} position={overlayPosition} themeVal={overlayTheme} backdrop={overlayBackdrop} />
      );
      const startFocalDrag = (e: ReactMouseEvent) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const apply = (cx: number, cy: number) =>
          editor.updateBlock(block, {
            props: {
              focalX: Math.min(1, Math.max(0, (cx - rect.left) / rect.width)),
              focalY: Math.min(1, Math.max(0, (cy - rect.top) / rect.height)),
            },
          });
        apply(e.clientX, e.clientY);
        const move = (ev: MouseEvent) => apply(ev.clientX, ev.clientY);
        const up = () => {
          window.removeEventListener('mousemove', move);
          window.removeEventListener('mouseup', up);
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
      };
      const gearBtn = (
        <button
          className='blog-img-gear'
          style={{ ...styles.gearBtn, ...(open ? styles.gearBtnActive : null) }}
          type='button'
          title='Image settings'
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        >
          <MdSettings size={16} />
        </button>
      );
      return (
        <div style={styles.mediaBlock} contentEditable={false}>
          {imageId ? (
            aspectCss ? (
              <div
                style={{ ...styles.imageFrame, aspectRatio: aspectCss, position: 'relative', cursor: 'move' }}
                title='Drag to set the focal point (kept visible when cropped)'
                onMouseDown={startFocalDrag}
              >
                <MediaThumb imageId={imageId} res='cover' fit='cover' focalX={focalX} focalY={focalY} style={styles.fill} />
                {overlay}
                <div style={{ ...styles.focalDot, left: `${focalX * 100}%`, top: `${focalY * 100}%` }} />
                {gearBtn}
              </div>
            ) : (
              <div style={{ ...styles.imageFrame, position: 'relative' }}>
                <MediaThumb imageId={imageId} res='cover' fit='natural' style={styles.fill} />
                {overlay}
                {gearBtn}
              </div>
            )
          ) : (
            <button style={styles.emptyPick} type='button' onClick={() => bridge.pickImage(setImage)}>
              <MdImage size={20} /> Pick or drop an image
            </button>
          )}
          <AnimatePresence>
            {imageId && open ? (
              <motion.div
                style={styles.imgControls}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }}
              >
                <div style={styles.ctrlGroup}>
                  <span style={styles.ctrlLabel}>Aspect ratio</span>
                  <div style={styles.ratioRow}>
                    {RATIOS.map((r) => (
                      <button
                        key={r.value}
                        type='button'
                        className={`blog-ratio${(aspectRatio || BlogAspectRatio.Original) === r.value ? ' is-active' : ''}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.updateBlock(block, { props: { aspectRatio: r.value } })}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={styles.ctrlGroup}>
                  <span style={styles.ctrlLabel}>Caption</span>
                  <input
                    style={styles.ctrlInput}
                    placeholder='Shown under the image'
                    defaultValue={caption}
                    onBlur={(e) => editor.updateBlock(block, { props: { caption: e.target.value } })}
                  />
                </div>
                <div style={styles.ctrlGroup}>
                  <span style={styles.ctrlLabel}>Text overlay</span>
                  <input
                    style={styles.ctrlInput}
                    placeholder='Text on the image (optional)'
                    defaultValue={overlayText}
                    onBlur={(e) => editor.updateBlock(block, { props: { overlayText: e.target.value } })}
                  />
                  {overlayText ? (
                    <div style={styles.overlayControls}>
                      <div style={styles.posGrid} title='Text position'>
                        {OVERLAY_POSITIONS.map((p) => (
                          <button
                            key={p}
                            type='button'
                            className={`blog-ratio${overlayPosition === p ? ' is-active' : ''}`}
                            style={styles.posCell}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => editor.updateBlock(block, { props: { overlayPosition: p } })}
                          />
                        ))}
                      </div>
                      <div style={styles.overlayOpts}>
                        {[BlogOverlayTheme.Light, BlogOverlayTheme.Dark].map((th) => (
                          <button
                            key={th}
                            type='button'
                            className={`blog-ratio${overlayTheme === th ? ' is-active' : ''}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => editor.updateBlock(block, { props: { overlayTheme: th } })}
                          >
                            {th === BlogOverlayTheme.Light ? 'Light' : 'Dark'}
                          </button>
                        ))}
                        {[BlogOverlayBackdrop.None, BlogOverlayBackdrop.Scrim, BlogOverlayBackdrop.Gradient, BlogOverlayBackdrop.Glass].map(
                          (bd) => (
                            <button
                              key={bd}
                              type='button'
                              className={`blog-ratio${overlayBackdrop === bd ? ' is-active' : ''}`}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => editor.updateBlock(block, { props: { overlayBackdrop: bd } })}
                            >
                              {bd.charAt(0) + bd.slice(1).toLowerCase()}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
                <button
                  style={styles.barBtn}
                  type='button'
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => bridge.pickImage(setImage)}
                >
                  Replace image
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
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

export type ColumnDef = { type: 'text' | 'image'; imageId?: string; html?: string; width?: number };

export const parseColumns = (raw: string): ColumnDef[] => {
  try {
    const v = JSON.parse(raw || '[]');
    if (Array.isArray(v) && v.length) {
      return v.map((c) => ({
        type: c?.type === 'image' ? 'image' : 'text',
        imageId: typeof c?.imageId === 'string' ? c.imageId : '',
        html: typeof c?.html === 'string' ? c.html : '',
        width: typeof c?.width === 'number' && c.width > 0 ? c.width : 1,
      }));
    }
  } catch {
    /* ignore */
  }
  return [
    { type: 'text', html: '', width: 1 },
    { type: 'image', imageId: '', width: 1 },
  ];
};

/** contentEditable text cell with an icon toolbar that appears while editing. */
const ColumnTextEditor = ({ html, onChange }: { html: string; onChange: (html: string) => void }) => {
  const styles = useBlockStyles();
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html || '<p><br></p>';
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch {
      /* not supported */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const exec = (cmd: string, value?: string) => {
    ref.current?.focus();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(cmd, false, value);
    onChange(ref.current?.innerHTML ?? '');
  };
  const btn = (key: string, icon: ReactNode, title: string, cmd: string, value?: string) => (
    <button
      key={key}
      className='blog-tb-btn'
      style={styles.tbBtn}
      type='button'
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => exec(cmd, value)}
    >
      {icon}
    </button>
  );
  const colors = [theme.colors.red, theme.colors.blue, theme.colors.lightGreen, theme.colors.yellow];
  return (
    <div style={styles.columnTextWrap}>
      <AnimatePresence>
        {focused ? (
          <motion.div
            style={styles.columnToolbar}
            contentEditable={false}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {btn('p', <LuPilcrow size={15} />, 'Text', 'formatBlock', '<p>')}
          {btn('h1', <LuHeading1 size={16} />, 'Heading 1', 'formatBlock', '<h1>')}
          {btn('h2', <LuHeading2 size={16} />, 'Heading 2', 'formatBlock', '<h2>')}
          {btn('h3', <LuHeading3 size={16} />, 'Heading 3', 'formatBlock', '<h3>')}
          <span style={styles.tbDivider} />
          {btn('b', <MdFormatBold size={17} />, 'Bold', 'bold')}
          {btn('i', <MdFormatItalic size={17} />, 'Italic', 'italic')}
          <span style={styles.tbDivider} />
          {btn('ul', <MdFormatListBulleted size={17} />, 'Bullet list', 'insertUnorderedList')}
          {btn('ol', <MdFormatListNumbered size={17} />, 'Numbered list', 'insertOrderedList')}
          {btn('q', <MdFormatQuote size={17} />, 'Quote', 'formatBlock', '<blockquote>')}
          <span style={styles.tbDivider} />
          {colors.map((c) => (
            <button
              key={c}
              className='blog-tb-color'
              style={{ ...styles.tbColor, backgroundColor: c }}
              type='button'
              title='Colour'
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec('foreColor', c)}
            />
          ))}
            {btn('reset', <MdFormatColorReset size={16} />, 'Reset colour', 'foreColor', theme.colors.white)}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div
        ref={ref}
        className='blog-col-text'
        contentEditable
        suppressContentEditableWarning
        style={styles.columnText}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          onChange(ref.current?.innerHTML ?? '');
          setFocused(false);
        }}
      />
    </div>
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
      const containerRef = useRef<HTMLDivElement>(null);
      const cols = parseColumns(block.props.columns);
      const save = (next: ColumnDef[]) => editor.updateBlock(block, { props: { columns: JSON.stringify(next) } });
      const update = (i: number, patch: Partial<ColumnDef>) =>
        save(cols.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
      const startResize = (i: number, e: ReactMouseEvent) => {
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const totalWidth = container.getBoundingClientRect().width;
        const startX = e.clientX;
        const start = parseColumns(block.props.columns);
        const totalFr = start.reduce((s, c) => s + (c.width ?? 1), 0);
        const pair = (start[i].width ?? 1) + (start[i + 1].width ?? 1);
        const wi0 = start[i].width ?? 1;
        const onMove = (ev: MouseEvent) => {
          const dxFr = ((ev.clientX - startX) / totalWidth) * totalFr;
          const wi = Math.max(0.3, Math.min(pair - 0.3, wi0 + dxFr));
          const next = start.map((c, idx) =>
            idx === i ? { ...c, width: wi } : idx === i + 1 ? { ...c, width: pair - wi } : c,
          );
          editor.updateBlock(block, { props: { columns: JSON.stringify(next) } });
        };
        const onUp = () => {
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      };
      return (
        <div style={styles.columnsBlock}>
          <div ref={containerRef} style={styles.columnsRow}>
            {cols.map((col, i) => (
              <Fragment key={i}>
                <div style={{ ...styles.column, flexGrow: col.width ?? 1, flexBasis: 0 }}>
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
                      <div
                        style={styles.columnImageWrap}
                        contentEditable={false}
                        data-col-index={i}
                      >
                        <MediaThumb imageId={col.imageId} res='cover' style={styles.fill} />
                        <button style={styles.tileRemove} type='button' onClick={() => update(i, { imageId: '' })}>
                          <MdClose size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        style={styles.columnPick}
                        type='button'
                        contentEditable={false}
                        data-col-index={i}
                        onClick={() => bridge.pickImage((id) => update(i, { imageId: id }))}
                      >
                        <MdImage size={18} /> Pick or drop
                      </button>
                    )
                  ) : (
                    <ColumnTextEditor html={col.html ?? ''} onChange={(h) => update(i, { html: h })} />
                  )}
                </div>
                {i < cols.length - 1 ? (
                  <div
                    className='blog-col-resize'
                    style={styles.resizeHandle}
                    contentEditable={false}
                    onMouseDown={(e) => startResize(i, e)}
                  >
                    <MdSwapHoriz size={14} />
                  </div>
                ) : null}
              </Fragment>
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

// Drop BlockNote's native media blocks so a dropped/pasted file can't become a native image/embed —
// our blogImage/blogGallery/blogColumns own all media (stored as blog-media, not external URLs).
const {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  image: _img,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  video: _vid,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  audio: _aud,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  file: _file,
  ...defaultsNoMedia
} = defaultBlockSpecs;

export const blogSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultsNoMedia,
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
  mediaBlock: { display: 'flex', flexDirection: 'column', gap: t.spacing.xs, width: '100%' },
  imageFrame: { width: '100%', borderRadius: t.borderRadius.default, overflow: 'hidden' },
  focalDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2px solid #fff',
    boxShadow: '0 0 0 2px rgba(0,0,0,0.45)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  ratioRow: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  ratioBtn: {
    height: 26,
    padding: '0 8px',
    borderRadius: t.borderRadius.small,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.1)}`,
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
    fontSize: 12,
  },
  ratioActive: {
    color: t.colors.white,
    backgroundColor: t.colors.blue + t.colorOpacity(0.25),
    border: `1px solid ${t.colors.blue + t.colorOpacity(0.4)}`,
  },
  caption: {
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 13,
    color: t.colors.dark05,
    background: 'transparent',
    border: 0,
    outline: 'none',
    padding: '2px 0',
  },
  overlaySection: { display: 'flex', flexDirection: 'column', gap: t.spacing.xs },
  overlayControls: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: t.spacing.m },
  posGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, width: 56, flexShrink: 0 },
  posCell: { width: 16, height: 16, padding: 0, borderRadius: 3 },
  overlayOpts: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  gearBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: 0,
    cursor: 'pointer',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  gearBtnActive: {
    backgroundColor: t.colors.blue,
  },
  imgControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.m,
    marginTop: t.spacing.xs,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.05)}`,
  },
  ctrlGroup: { display: 'flex', flexDirection: 'column', gap: t.spacing.xs },
  ctrlLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: t.colors.blue04 },
  ctrlInput: {
    height: 36,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 14,
  },
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
  mediaBar: { display: 'flex', flexDirection: 'column', gap: t.spacing.xs },
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
  columnsRow: { display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'stretch' },
  resizeHandle: {
    width: 18,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    cursor: 'col-resize',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.xs,
    minWidth: 0,
    padding: t.spacing.xs,
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
  columnTextWrap: { display: 'flex', flexDirection: 'column', gap: t.spacing.xs },
  columnToolbar: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 3,
    padding: 4,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
  },
  tbBtn: {
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
  tbDivider: {
    width: 1,
    height: 18,
    flexShrink: 0,
    backgroundColor: t.colors.white + t.colorOpacity(0.12),
    margin: '0 3px',
  },
  tbColor: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    border: `1px solid ${t.colors.white + t.colorOpacity(0.2)}`,
    cursor: 'pointer',
    padding: 0,
  },
  columnText: {
    display: 'block',
    minHeight: 80,
    padding: `${t.spacing.xs}px 0`,
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
