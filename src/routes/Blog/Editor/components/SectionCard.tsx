import { ReactNode, useEffect, useState } from 'react';
import { MdArrowDownward, MdArrowUpward, MdClose, MdDelete } from 'react-icons/md';
import {
  BlogMediaPosition,
  BlogMediaSplit,
  BlogMobileStackOrder,
  BlogSectionType,
  CalloutVariant,
  EmbedProvider,
  GalleryLayout,
  PatchSectionDto,
  ResolvedSectionResponse,
  UpsertSectionTranslationDto,
} from '~/api/api';
import { MarkdownEditor } from '~/components/MarkdownEditor';
import { MediaThumb } from '~/routes/Blog/Editor/components/MediaThumb';
import { PoiPicker } from '~/routes/Blog/Editor/components/PoiPicker';
import { mkUseStyles, useTheme } from '~/utils/theme';

type SectionCardProps = {
  section: ResolvedSectionResponse;
  locale: string;
  isFirst: boolean;
  isLast: boolean;
  isActive: boolean;
  onActivate: (id: string) => void;
  onPatch: (id: string, patch: PatchSectionDto) => void;
  onTranslate: (id: string, patch: UpsertSectionTranslationDto) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onDelete: (id: string) => void;
  onRemoveImage: (sectionImageId: string) => void;
  onAddPoi: (sectionId: string, poiId: string) => void;
  onRemovePoi: (poiLinkId: string) => void;
};

const enumOptions = (e: Record<string, string>) => Object.values(e).map((v) => ({ label: v, value: v }));

export const SectionCard = (p: SectionCardProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { section, locale } = p;

  const [body, setBody] = useState(section.body ?? '');
  const [headingLevel, setHeadingLevel] = useState(section.headingLevel ?? 2);
  const [quoteAuthor, setQuoteAuthor] = useState(section.quoteAuthor ?? '');
  const [embedUrl, setEmbedUrl] = useState(section.embedUrl ?? '');
  const [calloutVariant, setCalloutVariant] = useState<CalloutVariant>(section.calloutVariant ?? CalloutVariant.Info);
  const [embedProvider, setEmbedProvider] = useState<EmbedProvider>(section.embedProvider ?? EmbedProvider.Youtube);
  const [galleryLayout, setGalleryLayout] = useState<GalleryLayout>(section.galleryLayout ?? GalleryLayout.Grid);
  const [mediaPosition, setMediaPosition] = useState<BlogMediaPosition>(section.mediaPosition ?? BlogMediaPosition.Left);
  const [mediaSplit, setMediaSplit] = useState<BlogMediaSplit>(section.mediaSplit ?? BlogMediaSplit.Half);
  const [mobileStackOrder, setMobileStackOrder] = useState<BlogMobileStackOrder>(
    section.mobileStackOrder ?? BlogMobileStackOrder.MediaFirst,
  );

  // Re-sync when the underlying section identity / locale changes.
  useEffect(() => {
    setBody(section.body ?? '');
    setHeadingLevel(section.headingLevel ?? 2);
    setQuoteAuthor(section.quoteAuthor ?? '');
    setEmbedUrl(section.embedUrl ?? '');
    setCalloutVariant(section.calloutVariant ?? CalloutVariant.Info);
    setEmbedProvider(section.embedProvider ?? EmbedProvider.Youtube);
    setGalleryLayout(section.galleryLayout ?? GalleryLayout.Grid);
    setMediaPosition(section.mediaPosition ?? BlogMediaPosition.Left);
    setMediaSplit(section.mediaSplit ?? BlogMediaSplit.Half);
    setMobileStackOrder(section.mobileStackOrder ?? BlogMobileStackOrder.MediaFirst);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id, locale]);

  const saveBody = () => {
    if (body !== (section.body ?? '')) p.onTranslate(section.id, { body });
  };

  const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) => (
    <select style={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );

  let inner: ReactNode = null;
  switch (section.type) {
    case BlogSectionType.Heading:
      inner = (
        <div style={styles.row}>
          <Select
            value={String(headingLevel)}
            onChange={(v) => {
              const lvl = Number(v);
              setHeadingLevel(lvl);
              p.onPatch(section.id, { headingLevel: lvl });
            }}
            options={[1, 2, 3, 4, 5, 6].map((n) => ({ label: 'H' + n, value: String(n) }))}
          />
          <input
            style={styles.headingInput}
            placeholder='Heading text'
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onBlur={saveBody}
          />
        </div>
      );
      break;
    case BlogSectionType.Paragraph:
      inner = <MarkdownEditor value={body} onChange={setBody} onBlur={saveBody} placeholder='Write in markdown…' />;
      break;
    case BlogSectionType.Quote:
      inner = (
        <>
          <MarkdownEditor value={body} onChange={setBody} onBlur={saveBody} height={160} placeholder='Quote…' />
          <input
            style={styles.input}
            placeholder='Quote author (optional)'
            value={quoteAuthor}
            onChange={(e) => setQuoteAuthor(e.target.value)}
            onBlur={() => quoteAuthor !== (section.quoteAuthor ?? '') && p.onPatch(section.id, { quoteAuthor: quoteAuthor || null })}
          />
        </>
      );
      break;
    case BlogSectionType.Callout:
      inner = (
        <>
          <div style={styles.row}>
            <span style={styles.fieldLabel}>Variant</span>
            <Select
              value={calloutVariant}
              onChange={(v) => {
                setCalloutVariant(v as CalloutVariant);
                p.onPatch(section.id, { calloutVariant: v as CalloutVariant });
              }}
              options={enumOptions(CalloutVariant)}
            />
          </div>
          <MarkdownEditor value={body} onChange={setBody} onBlur={saveBody} height={180} placeholder='Callout text…' />
        </>
      );
      break;
    case BlogSectionType.Embed:
      inner = (
        <div style={styles.stack}>
          <div style={styles.row}>
            <span style={styles.fieldLabel}>Provider</span>
            <Select
              value={embedProvider}
              onChange={(v) => {
                setEmbedProvider(v as EmbedProvider);
                p.onPatch(section.id, { embedProvider: v as EmbedProvider });
              }}
              options={enumOptions(EmbedProvider)}
            />
          </div>
          <input
            style={styles.input}
            placeholder='Embed URL'
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            onBlur={() => embedUrl !== (section.embedUrl ?? '') && p.onPatch(section.id, { embedUrl: embedUrl || null })}
          />
        </div>
      );
      break;
    case BlogSectionType.Divider:
      inner = <div style={styles.dividerPreview} />;
      break;
    case BlogSectionType.Image: {
      const img = section.images[0];
      inner = (
        <div style={styles.mediaArea}>
          {img ? (
            <div style={styles.imageTileLarge}>
              <MediaThumb imageId={img.imageId} style={styles.fill} />
              <button style={styles.removeImg} title='Remove image' onClick={() => p.onRemoveImage(img.id)}>
                <MdClose size={14} />
              </button>
            </div>
          ) : (
            <span style={styles.pickHint}>Open the Media panel (left) and click an image to set it.</span>
          )}
        </div>
      );
      break;
    }
    case BlogSectionType.Gallery:
      inner = (
        <div style={styles.mediaArea}>
          <div style={styles.row}>
            <span style={styles.fieldLabel}>Layout</span>
            <Select
              value={galleryLayout}
              onChange={(v) => {
                setGalleryLayout(v as GalleryLayout);
                p.onPatch(section.id, { galleryLayout: v as GalleryLayout });
              }}
              options={enumOptions(GalleryLayout)}
            />
          </div>
          {section.images.length ? (
            <div style={styles.galleryGrid}>
              {section.images.map((link) => (
                <div key={link.id} style={styles.imageTile}>
                  <MediaThumb imageId={link.imageId} style={styles.fill} />
                  <button style={styles.removeImg} title='Remove' onClick={() => p.onRemoveImage(link.id)}>
                    <MdClose size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <span style={styles.pickHint}>Open the Media panel (left) and click images to add them.</span>
        </div>
      );
      break;
    case BlogSectionType.MediaText: {
      const img = section.images[0];
      inner = (
        <div style={styles.mediaArea}>
          <div style={styles.row}>
            <span style={styles.fieldLabel}>Image side</span>
            <Select
              value={mediaPosition}
              onChange={(v) => {
                setMediaPosition(v as BlogMediaPosition);
                p.onPatch(section.id, { mediaPosition: v as BlogMediaPosition });
              }}
              options={enumOptions(BlogMediaPosition)}
            />
            <span style={styles.fieldLabel}>Split</span>
            <Select
              value={mediaSplit}
              onChange={(v) => {
                setMediaSplit(v as BlogMediaSplit);
                p.onPatch(section.id, { mediaSplit: v as BlogMediaSplit });
              }}
              options={enumOptions(BlogMediaSplit)}
            />
            <span style={styles.fieldLabel}>Mobile</span>
            <Select
              value={mobileStackOrder}
              onChange={(v) => {
                setMobileStackOrder(v as BlogMobileStackOrder);
                p.onPatch(section.id, { mobileStackOrder: v as BlogMobileStackOrder });
              }}
              options={enumOptions(BlogMobileStackOrder)}
            />
          </div>
          {img ? (
            <div style={styles.imageTileLarge}>
              <MediaThumb imageId={img.imageId} style={styles.fill} />
              <button style={styles.removeImg} title='Remove image' onClick={() => p.onRemoveImage(img.id)}>
                <MdClose size={14} />
              </button>
            </div>
          ) : (
            <span style={styles.pickHint}>Open the Media panel (left) and click an image to set it.</span>
          )}
          <MarkdownEditor value={body} onChange={setBody} onBlur={saveBody} height={180} placeholder='Text beside the image…' />
        </div>
      );
      break;
    }
    case BlogSectionType.Map:
    case BlogSectionType.Place:
      inner = (
        <div style={styles.mediaArea}>
          {section.pois.length ? (
            <div style={styles.poiList}>
              {section.pois.map((link) => (
                <div key={link.id} style={styles.poiRow}>
                  <div style={styles.poiInfo}>
                    <span style={styles.poiName}>{link.name}</span>
                    <span style={styles.poiLoc}>
                      {[link.city, link.region, link.country].filter(Boolean).join(', ') ||
                        `${link.latitude.toFixed(3)}, ${link.longitude.toFixed(3)}`}
                    </span>
                  </div>
                  <button style={styles.removePoi} title='Remove place' onClick={() => p.onRemovePoi(link.id)}>
                    <MdClose size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          {section.type === BlogSectionType.Place && section.pois.length ? null : (
            <PoiPicker onPick={(poiId) => p.onAddPoi(section.id, poiId)} />
          )}
          <span style={styles.pickHint}>
            {section.type === BlogSectionType.Place
              ? 'A place block shows a single point of interest.'
              : 'A map block can show several places.'}
          </span>
        </div>
      );
      break;
    case BlogSectionType.List:
    default:
      inner = (
        <span style={styles.placeholder}>
          {section.type} editing arrives in a follow-up. Order and removal already work.
        </span>
      );
  }

  return (
    <div
      style={{
        ...styles.card,
        borderColor: p.isActive ? theme.colors.blue : theme.colors.white + theme.colorOpacity(0.05),
      }}
      onClick={() => p.onActivate(section.id)}
    >
      <div style={styles.toolbar}>
        <span style={styles.type}>{section.type}</span>
        <div style={styles.toolbarActions}>
          <button style={styles.iconBtn} title='Move up' disabled={p.isFirst} onClick={() => p.onMove(section.id, -1)}>
            <MdArrowUpward size={16} color={p.isFirst ? theme.colors.dark04 : theme.colors.white} />
          </button>
          <button style={styles.iconBtn} title='Move down' disabled={p.isLast} onClick={() => p.onMove(section.id, 1)}>
            <MdArrowDownward size={16} color={p.isLast ? theme.colors.dark04 : theme.colors.white} />
          </button>
          <button style={styles.iconBtn} title='Delete block' onClick={() => p.onDelete(section.id)}>
            <MdDelete size={16} color={theme.colors.red} />
          </button>
        </div>
      </div>
      <div style={styles.bodyWrap}>{inner}</div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  card: {
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.05)}`,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  type: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: t.colors.blue04,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 2,
  },
  iconBtn: {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
  },
  bodyWrap: {
    gap: t.spacing.s,
  },
  stack: {
    gap: t.spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  fieldLabel: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  select: {
    height: 36,
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    colorScheme: 'dark',
    fontSize: 14,
  },
  input: {
    height: 40,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 14,
  },
  headingInput: {
    flex: 1,
    height: 44,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 20,
    fontWeight: 700,
  },
  dividerPreview: {
    height: 2,
    backgroundColor: t.colors.white + t.colorOpacity(0.12),
    borderRadius: 1,
  },
  placeholder: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  mediaArea: {
    gap: t.spacing.s,
  },
  imageTileLarge: {
    position: 'relative',
    width: '100%',
    height: 220,
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    backgroundColor: t.colors.gray05,
  },
  imageTile: {
    position: 'relative',
    aspectRatio: '1 / 1',
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    backgroundColor: t.colors.gray05,
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: t.spacing.s,
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  removeImg: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: 0,
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  pickHint: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  poiList: {
    gap: t.spacing.s,
  },
  poiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.4),
  },
  poiInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  poiName: {
    fontWeight: 600,
    fontSize: 14,
  },
  poiLoc: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  removePoi: {
    width: 26,
    height: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: 0,
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
}));
