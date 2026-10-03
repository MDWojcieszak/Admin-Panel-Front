import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FiAlertTriangle,
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiImage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiUploadCloud,
  FiX,
} from 'react-icons/fi';
import {
  ExportFileResponse,
  ExportFileStatus,
  ExportScanResponse,
  GalleryResponse,
  PublishExportsDto,
} from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { STATUS_TONE, imgUrl } from '~/routes/Galleries/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

type EntryPublishPanelProps = {
  entryId: string;
  entryName: string;
  onClose: () => void;
};

const API_BASE = import.meta.env.VITE_API_URL as string;
/** Signed URLs: a plain <img>, no Authorization header. Never built by hand. */
const signed = (path?: string | null) => (path ? `${API_BASE}${path}` : undefined);

const POLL_MS = 2500;

type FilterKey = 'all' | 'new' | 'changed' | 'failed' | 'published' | 'unpublishable';

const FILTERS: { key: FilterKey; label: string; match: (file: ExportFileResponse) => boolean }[] = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'new', label: 'New', match: (f) => f.publishable && f.status === ExportFileStatus.New },
  { key: 'changed', label: 'Changed', match: (f) => f.status === ExportFileStatus.Changed },
  { key: 'failed', label: 'Failed', match: (f) => f.status === ExportFileStatus.Failed },
  { key: 'published', label: 'In a gallery', match: (f) => f.status === ExportFileStatus.Published },
  { key: 'unpublishable', label: 'Cannot publish', match: (f) => !f.publishable },
];

/** Selectable: rendered files that are not already in a gallery unchanged, nor in flight. */
const isSelectable = (file: ExportFileResponse) =>
  file.publishable && file.status !== ExportFileStatus.Published && file.status !== ExportFileStatus.Pending;

/**
 * Publishing from the session's 04_EXPORT folder into a gallery: pick the
 * shots, pick or create the gallery, publish. The order picked is the order
 * in the gallery. A changed file replaces its published copy in place; RAW and
 * HEIC files cannot go and say why.
 */
export const EntryPublishPanel = ({ entryId, entryName, onClose }: EntryPublishPanelProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const toast = useToast();
  const { photoEntryApi, galleriesApi } = useApi();

  const [scan, setScan] = useState<ExportScanResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [selected, setSelected] = useState<string[]>([]);
  const [galleries, setGalleries] = useState<GalleryResponse[]>([]);
  const [target, setTarget] = useState<string>('new');
  const [newTitle, setNewTitle] = useState(entryName);
  const [publishing, setPublishing] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const pollRef = useRef<number>();

  const load = useCallback(async () => {
    if (!photoEntryApi) return;
    try {
      const { data } = await photoEntryApi.photoEntryExportControllerScan({ id: entryId });
      setScan(data);
      setError(undefined);
      // A file that just went to a gallery or became unavailable drops out of the selection.
      setSelected((prev) => prev.filter((key) => data.files.some((f) => f.key === key && isSelectable(f))));
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not read the export folder.'));
    } finally {
      setLoading(false);
    }
  }, [photoEntryApi, entryId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!galleriesApi) return;
    galleriesApi
      .galleriesControllerList()
      .then(({ data }) => setGalleries(data.galleries))
      .catch(() => setGalleries([]));
  }, [galleriesApi]);

  // Keep scanning while anything is being published.
  useEffect(() => {
    window.clearTimeout(pollRef.current);
    if (scan?.summary.pending) pollRef.current = window.setTimeout(load, POLL_MS);
    return () => window.clearTimeout(pollRef.current);
  }, [scan, load]);

  // The image URLs are signed for about an hour; rescan just before they expire.
  useEffect(() => {
    if (!scan) return;
    const msLeft = new Date(scan.urlsExpireAt).getTime() - Date.now() - 60_000;
    const timer = window.setTimeout(load, Math.max(msLeft, 5_000));
    return () => window.clearTimeout(timer);
  }, [scan, load]);

  const files = scan?.files ?? [];
  const [filter, setFilter] = useState<FilterKey>('all');
  const visibleFiles = useMemo(
    () => files.filter(FILTERS.find((item) => item.key === filter)?.match ?? (() => true)),
    [files, filter],
  );
  const visibleSelectable = useMemo(() => visibleFiles.filter(isSelectable).map((f) => f.key), [visibleFiles]);
  const allVisibleSelected = visibleSelectable.length > 0 && visibleSelectable.every((key) => selected.includes(key));

  const toggle = (key: string) =>
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const publish = async () => {
    if (!photoEntryApi || !selected.length) return;
    const body: PublishExportsDto =
      target === 'new'
        ? { keys: selected, newGallery: true, newGalleryTitle: newTitle.trim() || undefined }
        : { keys: selected, galleryId: target };
    setPublishing(true);
    try {
      const { data } = await photoEntryApi.photoEntryExportControllerPublish({ id: entryId, publishExportsDto: body });
      toast(
        `Publishing ${data.queued} photo${data.queued === 1 ? '' : 's'}${
          data.skipped.length ? ` · ${data.skipped.length} skipped` : ''
        }`,
        'success',
      );
      setSelected([]);
      setTarget(data.galleryId);
      if (target === 'new' && galleriesApi) {
        const { data: list } = await galleriesApi.galleriesControllerList();
        setGalleries(list.galleries);
      }
      await load();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not publish.'), 'error');
    } finally {
      setPublishing(false);
    }
  };

  const summary = scan?.summary;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleBlock}>
          <span style={styles.title}>Publish from 04_EXPORT</span>
          {summary ? (
            <span style={styles.muted}>
              {summary.total} file{summary.total === 1 ? '' : 's'} · {summary.new} new · {summary.published} in a
              gallery
              {summary.changed ? ` · ${summary.changed} changed` : ''}
              {summary.pending ? ` · ${summary.pending} publishing…` : ''}
              {summary.failed ? ` · ${summary.failed} failed` : ''}
            </span>
          ) : null}
        </div>
        <div style={styles.headerActions}>
          <Button label='Rescan' variant='secondary' icon={<FiRefreshCw size={14} />} onClick={load} />
          <Button label='Close' variant='secondary' icon={<FiX size={14} />} onClick={onClose} />
        </div>
      </div>

      {loading && !scan ? (
        <Loader />
      ) : error ? (
        <span style={styles.error}>{error}</span>
      ) : !scan?.folderExists ? (
        <EmptyState title='No export folder' description={`${scan?.folder ?? '04_EXPORT'} does not exist yet.`} />
      ) : files.length === 0 ? (
        <EmptyState title='Nothing exported yet' description='Export JPEGs into 04_EXPORT and rescan.' />
      ) : (
        <>
          <div style={styles.toolbar}>
            <div style={styles.filters}>
              {FILTERS.map((item) => {
                const count = files.filter(item.match).length;
                if (item.key !== 'all' && !count) return null;
                return (
                  <button
                    key={item.key}
                    type='button'
                    aria-pressed={filter === item.key}
                    onClick={() => setFilter(item.key)}
                    style={{ ...styles.chip, ...(filter === item.key ? styles.chipOn : {}) }}
                  >
                    {item.label} <span style={styles.chipCount}>{count}</span>
                  </button>
                );
              })}
            </div>
            <button
              type='button'
              style={styles.linkButton}
              disabled={!visibleSelectable.length}
              onClick={() =>
                setSelected((prev) =>
                  allVisibleSelected
                    ? prev.filter((key) => !visibleSelectable.includes(key))
                    : [...prev, ...visibleSelectable.filter((key) => !prev.includes(key))],
                )
              }
            >
              {allVisibleSelected ? 'Deselect these' : 'Select all shown'}
            </button>
          </div>

          <div style={styles.grid}>
            {visibleFiles.map((file, index) => {
              const order = selected.indexOf(file.key);
              const selectable = isSelectable(file);
              return (
                <div
                  key={file.key}
                  style={{
                    ...styles.tile,
                    opacity: file.publishable ? 1 : 0.4,
                    borderColor: order >= 0 ? theme.colors.blue : 'transparent',
                  }}
                  title={file.reason ?? file.relativePath}
                >
                  <button type='button' style={styles.thumbButton} onClick={() => setLightbox(index)}>
                    {file.thumbUrl ? (
                      <img src={signed(file.thumbUrl)} alt={file.name} loading='lazy' style={styles.thumb} />
                    ) : (
                      <span style={styles.noThumb}>{file.format.toUpperCase()}</span>
                    )}
                  </button>

                  {selectable ? (
                    <button
                      type='button'
                      aria-label={order >= 0 ? 'Deselect' : 'Select'}
                      onClick={() => toggle(file.key)}
                      style={{ ...styles.check, ...(order >= 0 ? styles.checkOn : {}) }}
                    >
                      {order >= 0 ? order + 1 : ''}
                    </button>
                  ) : null}

                  <StatusTag file={file} />

                  <span style={styles.fileName}>{file.name}</span>
                </div>
              );
            })}
          </div>

          {/* Stays in reach at the bottom of the card while scrolling the grid. */}
          <div style={styles.actionBar}>
            <div style={styles.selectionInfo}>
              <span style={styles.selectionCount}>
                {selected.length ? `${selected.length} selected` : 'Nothing selected'}
              </span>
              <span style={styles.muted}>
                {selected.length ? 'Gallery order follows the numbers' : 'Tick photos to publish them'}
              </span>
            </div>
            {selected.length ? (
              <button type='button' style={styles.linkButton} onClick={() => setSelected([])}>
                Clear
              </button>
            ) : null}
            <div style={styles.actionRight}>
              <GalleryPicker
                galleries={galleries}
                target={target}
                newTitle={newTitle}
                onTarget={setTarget}
                onNewTitle={setNewTitle}
              />
              <Button
                label={selected.length ? `Publish ${selected.length}` : 'Publish'}
                icon={<FiUploadCloud size={14} />}
                disabled={!selected.length || (target === 'new' && !newTitle.trim())}
                loading={publishing}
                onClick={publish}
              />
            </div>
          </div>
        </>
      )}

      {lightbox !== null && visibleFiles[lightbox] ? (
        <Lightbox
          files={visibleFiles}
          index={lightbox}
          onIndex={setLightbox}
          onClose={() => setLightbox(null)}
          selectedOrder={(key) => selected.indexOf(key)}
          onToggle={toggle}
        />
      ) : null}
    </div>
  );
};

const StatusTag = ({ file }: { file: ExportFileResponse }) => {
  const styles = useStyles();
  if (!file.publishable) return <span style={{ ...styles.tag, ...styles.tagMuted }}>{file.format.toUpperCase()}</span>;
  switch (file.status) {
    case ExportFileStatus.Published:
      return (
        <a
          href={file.publication?.galleryId ? `/galleries/${file.publication.galleryId}` : undefined}
          target='_blank'
          rel='noreferrer'
          style={{ ...styles.tag, ...styles.tagGreen }}
          title='Open the gallery in a new tab'
        >
          <FiCheck size={11} /> In gallery <FiExternalLink size={10} />
        </a>
      );
    case ExportFileStatus.Changed:
      return (
        <span
          style={{ ...styles.tag, ...styles.tagYellow }}
          title='Changed since publishing — publishing again replaces it in place'
        >
          Changed
        </span>
      );
    case ExportFileStatus.Pending:
      return <span style={{ ...styles.tag, ...styles.tagBlue }}>Publishing…</span>;
    case ExportFileStatus.Failed:
      return (
        <span
          style={{ ...styles.tag, ...styles.tagRed }}
          title={`${file.publication?.error ?? 'Publishing failed'} — select it to try again`}
        >
          <FiAlertTriangle size={11} /> Failed
        </span>
      );
    default:
      return null;
  }
};

const Lightbox = ({
  files,
  index,
  onIndex,
  onClose,
  selectedOrder,
  onToggle,
}: {
  files: ExportFileResponse[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
  selectedOrder: (key: string) => number;
  onToggle: (key: string) => void;
}) => {
  const styles = useStyles();
  const file = files[index];
  const order = selectedOrder(file.key);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && index < files.length - 1) onIndex(index + 1);
      if (event.key === 'ArrowLeft' && index > 0) onIndex(index - 1);
      if (event.key === ' ' && isSelectable(file)) {
        event.preventDefault();
        onToggle(file.key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, files.length, file, onClose, onIndex, onToggle]);

  return (
    <div style={styles.lightbox} onClick={onClose}>
      <div style={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
        {file.previewUrl ? (
          <img src={signed(file.previewUrl)} alt={file.name} style={styles.lightboxImg} />
        ) : (
          <span style={styles.muted}>{file.reason ?? 'No preview for this file'}</span>
        )}
        <div style={styles.lightboxBar}>
          <button type='button' style={styles.navBtn} disabled={index === 0} onClick={() => onIndex(index - 1)}>
            <FiChevronLeft size={18} />
          </button>
          <span style={styles.lightboxName}>
            {file.name}
            {file.width && file.height ? ` · ${file.width}×${file.height}` : ''}
          </span>
          {isSelectable(file) ? (
            <Button
              label={order >= 0 ? `Selected #${order + 1}` : 'Select'}
              variant={order >= 0 ? 'primary' : 'secondary'}
              onClick={() => onToggle(file.key)}
            />
          ) : null}
          <button
            type='button'
            style={styles.navBtn}
            disabled={index === files.length - 1}
            onClick={() => onIndex(index + 1)}
          >
            <FiChevronRight size={18} />
          </button>
          <button type='button' style={styles.navBtn} onClick={onClose} aria-label='Close'>
            <FiX size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Where the selection goes: a new draft gallery named after the session, or an
 * existing gallery picked by its cover. Opens upwards from the action bar.
 */
const GalleryPicker = ({
  galleries,
  target,
  newTitle,
  onTarget,
  onNewTitle,
}: {
  galleries: GalleryResponse[];
  target: string;
  newTitle: string;
  onTarget: (target: string) => void;
  onNewTitle: (title: string) => void;
}) => {
  const styles = useStyles();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const selected = galleries.find((gallery) => gallery.id === target);
  const visible = galleries.filter((gallery) => gallery.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div ref={ref} style={styles.pickerWrap}>
      <button type='button' style={styles.pickerButton} onClick={() => setOpen((v) => !v)}>
        <span style={styles.pickerThumb}>
          {selected && imgUrl(selected.coverUrl) ? (
            <img src={imgUrl(selected.coverUrl)} alt='' style={styles.pickerThumbImg} />
          ) : selected ? (
            <FiImage size={14} color={theme.colors.dark05} />
          ) : (
            <FiPlus size={14} color={theme.colors.blue} />
          )}
        </span>
        <span style={styles.pickerText}>
          <span style={styles.pickerLabel}>Publish to</span>
          <span style={styles.pickerValue}>
            {selected ? selected.title : `New gallery · ${newTitle || 'untitled'}`}
          </span>
        </span>
        <FiChevronDown size={16} color={theme.colors.dark05} />
      </button>

      {open ? (
        <div style={styles.pickerMenu}>
          <div
            style={{ ...styles.newOption, ...(target === 'new' ? styles.optionOn : {}) }}
            onClick={() => onTarget('new')}
          >
            <span style={styles.optionThumb}>
              <FiPlus size={16} color={theme.colors.blue} />
            </span>
            <div style={styles.newOptionBody}>
              <span style={styles.optionTitle}>New gallery</span>
              <span style={styles.muted}>Created as a draft — publishing photos does not publish the page.</span>
              {target === 'new' ? (
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => onNewTitle(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder='Gallery title'
                  style={styles.menuInput}
                />
              ) : null}
            </div>
          </div>

          {galleries.length ? (
            <>
              <span style={styles.menuSection}>Existing galleries</span>
              {galleries.length > 6 ? (
                <label style={styles.menuSearch}>
                  <FiSearch size={13} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder='Search galleries…'
                    style={styles.menuSearchInput}
                  />
                </label>
              ) : null}
              <div style={styles.optionList}>
                {visible.map((gallery) => (
                  <button
                    key={gallery.id}
                    type='button'
                    style={{ ...styles.option, ...(gallery.id === target ? styles.optionOn : {}) }}
                    onClick={() => {
                      onTarget(gallery.id);
                      setOpen(false);
                    }}
                  >
                    <span style={styles.optionThumb}>
                      {imgUrl(gallery.coverUrl) ? (
                        <img src={imgUrl(gallery.coverUrl)} alt='' style={styles.pickerThumbImg} />
                      ) : (
                        <FiImage size={14} color={theme.colors.dark05} />
                      )}
                    </span>
                    <span style={styles.optionText}>
                      <span style={styles.optionTitle}>{gallery.title}</span>
                      <span style={styles.muted}>
                        {gallery.imageCount} photo{gallery.imageCount === 1 ? '' : 's'}
                      </span>
                    </span>
                    <Badge label={gallery.status.toLowerCase()} tone={STATUS_TONE[gallery.status]} />
                    {gallery.id === target ? <FiCheck size={14} color={theme.colors.blue} /> : null}
                  </button>
                ))}
                {!visible.length ? <span style={styles.muted}>No gallery matches.</span> : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    flexWrap: 'wrap',
  },
  titleBlock: { gap: 2 },
  title: { fontSize: 16, fontWeight: 700, color: t.colors.white },
  headerActions: { flexDirection: 'row', gap: t.spacing.s },
  muted: { fontSize: 12, color: t.colors.dark05 },
  error: { fontSize: 13, color: t.colors.red },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    flexWrap: 'wrap',
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs },
  chip: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 30,
    padding: '0 12px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    color: t.colors.dark05,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: t.colors.dark04 + t.colorOpacity(0.5),
  },
  chipOn: { color: t.colors.white, borderColor: t.colors.blue, backgroundColor: t.colors.blue + t.colorOpacity(0.18) },
  chipCount: { fontSize: 11, fontWeight: 700, opacity: 0.7 },
  linkButton: {
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    color: t.colors.blue04,
  },
  actionBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    flexWrap: 'wrap',
    padding: `${t.spacing.s}px ${t.spacing.m}px`,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
    boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.35)',
  },
  selectionInfo: { gap: 2 },
  selectionCount: { fontSize: 14, fontWeight: 700, color: t.colors.white },
  actionRight: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, marginLeft: 'auto', flexWrap: 'wrap' },
  pickerWrap: { position: 'relative' },
  pickerButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    minWidth: 260,
    maxWidth: 360,
    height: 48,
    padding: `0 ${t.spacing.s}px`,
    border: 'none',
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    textAlign: 'left',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.8),
  },
  pickerThumb: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: t.colors.gray01 + t.colorOpacity(0.6),
  },
  pickerThumbImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  pickerText: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: 1 },
  pickerLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  pickerValue: {
    fontSize: 14,
    fontWeight: 600,
    color: t.colors.white,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pickerMenu: {
    position: 'absolute',
    bottom: 56,
    right: 0,
    zIndex: 30,
    width: 380,
    maxHeight: 420,
    overflowY: 'auto',
    gap: t.spacing.xs,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
  },
  newOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
  },
  newOptionBody: { flex: 1, minWidth: 0, gap: 4 },
  optionOn: { backgroundColor: t.colors.blue + t.colorOpacity(0.14) },
  optionThumb: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.8),
  },
  optionTitle: { fontSize: 14, fontWeight: 600, color: t.colors.white },
  menuInput: {
    height: 36,
    marginTop: 4,
    padding: `0 ${t.spacing.s}px`,
    border: 'none',
    outline: 'none',
    borderRadius: t.borderRadius.default,
    color: t.colors.white,
    fontSize: 14,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.8),
  },
  menuSection: {
    padding: `${t.spacing.s}px ${t.spacing.s}px 2px`,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  menuSearch: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    margin: `0 ${t.spacing.xs}px`,
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  menuSearchInput: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: t.colors.white,
    fontSize: 13,
  },
  optionList: { gap: 2 },
  option: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: 6,
    border: 'none',
    borderRadius: t.borderRadius.default,
    textAlign: 'left',
    cursor: 'pointer',
    backgroundColor: 'transparent',
  },
  optionText: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: 1 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: t.spacing.s,
  },
  tile: {
    position: 'relative',
    gap: 4,
    padding: 4,
    borderRadius: t.borderRadius.default,
    borderWidth: 2,
    borderStyle: 'solid',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.3),
  },
  thumbButton: {
    display: 'block',
    width: '100%',
    aspectRatio: '3 / 2',
    padding: 0,
    border: 'none',
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    cursor: 'zoom-in',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  thumb: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  noThumb: { fontSize: 12, fontWeight: 700, color: t.colors.dark05 },
  check: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    border: '2px solid rgba(255, 255, 255, 0.85)',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    color: t.colors.white,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  checkOn: { backgroundColor: t.colors.blue, borderColor: t.colors.blue },
  tag: {
    position: 'absolute',
    top: 10,
    left: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    textDecoration: 'none',
  },
  tagGreen: { color: '#0F2E22', backgroundColor: '#7BC8A6' },
  tagYellow: { color: '#3A2C08', backgroundColor: '#E7BE63' },
  tagBlue: { color: '#062538', backgroundColor: '#7FCBFF' },
  tagRed: { color: '#3A0E0A', backgroundColor: '#F08A80' },
  tagMuted: { color: t.colors.white, backgroundColor: 'rgba(0, 0, 0, 0.55)' },
  fileName: {
    fontSize: 11,
    color: t.colors.dark05,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    padding: '0 2px',
  },
  lightbox: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  lightboxInner: { maxWidth: '92vw', maxHeight: '92vh', gap: t.spacing.s, alignItems: 'center' },
  lightboxImg: { maxWidth: '92vw', maxHeight: '82vh', objectFit: 'contain', display: 'block' },
  lightboxBar: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
  lightboxName: { fontSize: 13, color: t.colors.white, padding: `0 ${t.spacing.s}px` },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    border: 'none',
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
}));
