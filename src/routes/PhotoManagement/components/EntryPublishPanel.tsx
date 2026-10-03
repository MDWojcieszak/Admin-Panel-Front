import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FiAlertTriangle,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiRefreshCw,
  FiX,
} from 'react-icons/fi';
import {
  ExportFileResponse,
  ExportFileStatus,
  ExportScanResponse,
  GalleryResponse,
  PublishExportsDto,
} from '~/api/api';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
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
  const selectableKeys = useMemo(() => files.filter(isSelectable).map((f) => f.key), [files]);

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
            <Button
              label={selected.length === selectableKeys.length && selected.length ? 'Clear selection' : 'Select all'}
              variant='secondary'
              disabled={!selectableKeys.length}
              onClick={() => setSelected(selected.length === selectableKeys.length ? [] : selectableKeys)}
            />
            <span style={styles.muted}>
              {selected.length
                ? `${selected.length} selected — gallery order follows the numbers`
                : 'Pick photos to publish'}
            </span>

            <div style={styles.target}>
              <select value={target} onChange={(e) => setTarget(e.target.value)} style={styles.select}>
                <option value='new'>New gallery (draft)…</option>
                {galleries.map((gallery) => (
                  <option key={gallery.id} value={gallery.id}>
                    {gallery.title}
                  </option>
                ))}
              </select>
              {target === 'new' ? (
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder='Gallery title'
                  style={styles.titleInput}
                />
              ) : null}
              <Button
                label={selected.length ? `Publish ${selected.length}` : 'Publish'}
                disabled={!selected.length}
                loading={publishing}
                onClick={publish}
              />
            </div>
          </div>

          <div style={styles.grid}>
            {files.map((file, index) => {
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
        </>
      )}

      {lightbox !== null && files[lightbox] ? (
        <Lightbox
          files={files}
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
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.m, flexWrap: 'wrap' },
  target: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, marginLeft: 'auto', flexWrap: 'wrap' },
  select: {
    height: 44,
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    border: 'none',
    color: t.colors.white,
    fontSize: 14,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.7),
  },
  titleInput: {
    height: 44,
    width: 220,
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    border: 'none',
    outline: 'none',
    color: t.colors.white,
    fontSize: 14,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.7),
  },
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
