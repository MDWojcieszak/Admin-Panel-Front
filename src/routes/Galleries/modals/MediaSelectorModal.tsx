import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiImage, FiMapPin, FiUpload } from 'react-icons/fi';
import { GalleryLibraryItemResponse } from '~/api/api';
import { FileService } from '~/apiOld/File';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { Switch } from '~/components/Switch';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { imgUrl } from '~/routes/Galleries/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

type MediaSelectorModalProps = {
  /** Image ids already in the gallery (shown disabled). */
  currentImageIds: string[];
  /** Merge chosen/uploaded image ids into the gallery. Should throw to keep the modal open. */
  onAdd: (imageIds: string[]) => Promise<void> | void;
} & Partial<InternalModalProps>;

const TAKE = 60;

export const MediaSelectorModal = (p: MediaSelectorModalProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const toast = useToast();
  const { galleriesApi } = useApi();

  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const [unassignedOnly, setUnassignedOnly] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<GalleryLibraryItemResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const inGallery = new Set(p.currentImageIds);

  const load = async (skip: number, replace: boolean) => {
    if (!galleriesApi) return;
    setLoading(true);
    setError(false);
    try {
      const { data } = await galleriesApi.galleriesControllerLibrary({
        take: TAKE,
        skip,
        unassignedOnly: unassignedOnly || undefined,
      });
      setTotal(data.total);
      setImages((prev) => (replace ? data.images : [...prev, ...data.images]));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unassignedOnly]);

  const toggle = (imageId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(imageId)) next.delete(imageId);
      else next.add(imageId);
      return next;
    });
  };

  const addSelected = async () => {
    if (!selected.size) return;
    setBusy(true);
    try {
      await p.onAdd([...selected]);
      await p.handleClose?.();
    } catch {
      // onAdd surfaces its own error; keep the modal open.
    } finally {
      setBusy(false);
    }
  };

  const onUploadFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const res = await FileService.uploadImages(Array.from(files));
      if (res.failed) toast(`${res.failed} file${res.failed === 1 ? '' : 's'} failed to upload`, 'info');
      await p.onAdd(res.images.map((i) => i.id));
      await p.handleClose?.();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not upload images.'), 'error');
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.tabs}>
        <div style={{ ...styles.tab, ...(tab === 'library' ? styles.tabActive : {}) }} onClick={() => setTab('library')}>
          Library
        </div>
        <div style={{ ...styles.tab, ...(tab === 'upload' ? styles.tabActive : {}) }} onClick={() => setTab('upload')}>
          Upload new
        </div>
      </div>

      {tab === 'library' ? (
        <>
          <div style={styles.libraryHead}>
            <Switch checked={unassignedOnly} onChange={setUnassignedOnly} label='Unassigned only' />
            <span style={styles.count}>
              {selected.size ? `${selected.size} selected` : `${images.length}${total > images.length ? ` / ${total}` : ''} images`}
            </span>
          </div>

          <div style={styles.gridWrap}>
            {loading && images.length === 0 ? (
              <div style={styles.stateBox}>
                <Loader />
              </div>
            ) : error && images.length === 0 ? (
              <div style={styles.stateBox}>
                <span style={styles.muted}>Couldn’t load the library. You can still upload new images.</span>
              </div>
            ) : images.length === 0 ? (
              <div style={styles.stateBox}>
                <EmptyState
                  icon={<FiImage size={22} color={theme.colors.blue04} />}
                  title='No images'
                  description={unassignedOnly ? 'No unassigned images.' : 'Upload images to build your library.'}
                />
              </div>
            ) : (
              <div style={styles.grid}>
                {images.map((img) => {
                  const already = inGallery.has(img.imageId);
                  const isSelected = selected.has(img.imageId);
                  const url = imgUrl(img.coverUrl);
                  return (
                    <div
                      key={img.imageId}
                      style={{
                        ...styles.tile,
                        ...(isSelected ? styles.tileSelected : {}),
                        ...(already ? styles.tileDisabled : {}),
                      }}
                      onClick={() => !already && toggle(img.imageId)}
                      title={already ? 'Already in this gallery' : undefined}
                    >
                      {url ? <img src={url} alt='' style={styles.img} loading='lazy' /> : <div style={styles.imgEmpty} />}
                      {already ? <div style={styles.disabledOverlay} /> : null}
                      {already ? (
                        <div style={styles.flag}>
                          <FiCheck size={11} /> In gallery
                        </div>
                      ) : img.usageCount > 0 ? (
                        <div style={styles.usage}>×{img.usageCount}</div>
                      ) : null}
                      {img.processingStatus !== 'DONE' ? (
                        <div style={styles.processing}>{img.processingStatus.toLowerCase()}</div>
                      ) : null}
                      {img.localization ? (
                        <div style={styles.tileLoc}>
                          <FiMapPin size={9} /> {img.localization}
                        </div>
                      ) : null}
                      {isSelected ? (
                        <div style={styles.check}>
                          <FiCheck size={14} />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {images.length > 0 && images.length < total ? (
            <Button label='Load more' variant='secondary' onClick={() => load(images.length, false)} loading={loading} />
          ) : null}

          <div style={styles.actions}>
            <Button label='Cancel' variant='secondary' onClick={() => p.handleClose?.()} />
            <Button
              label={selected.size ? `Add ${selected.size} to gallery` : 'Add to gallery'}
              onClick={addSelected}
              loading={busy}
              disabled={!selected.size}
            />
          </div>
        </>
      ) : (
        <div style={styles.uploadPane}>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            multiple
            style={{ display: 'none' }}
            onChange={(e) => onUploadFiles(e.target.files)}
          />
          <div style={styles.dropZone} onClick={() => fileInputRef.current?.click()}>
            <FiUpload size={26} color={theme.colors.blue04} />
            <span style={styles.dropTitle}>Upload new images</span>
            <span style={styles.muted}>They’re added to this gallery right away.</span>
          </div>
          <div style={styles.actions}>
            <Button label='Cancel' variant='secondary' onClick={() => p.handleClose?.()} />
            <Button label='Choose files' icon={<FiUpload size={14} />} onClick={() => fileInputRef.current?.click()} loading={busy} />
          </div>
        </div>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    width: 'min(760px, 92vw)',
  },
  tabs: {
    flexDirection: 'row',
    gap: t.spacing.xs,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
    padding: t.spacing.xxs,
    borderRadius: t.borderRadius.default,
    width: 'fit-content',
  },
  tab: {
    padding: `${t.spacing.xs}px ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    color: t.colors.dark05,
  },
  tabActive: {
    backgroundColor: t.colors.blue,
    color: t.colors.white,
  },
  libraryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  count: {
    fontSize: 13,
    fontWeight: 600,
    color: t.colors.blue04,
  },
  gridWrap: {
    height: 'min(52vh, 440px)',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.4),
    overflow: 'hidden',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
    gridAutoRows: 'min-content',
    gap: t.spacing.s,
    height: '100%',
    overflowY: 'auto',
    alignContent: 'start',
    padding: t.spacing.s,
  },
  tile: {
    position: 'relative',
    aspectRatio: '1 / 1',
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    cursor: 'pointer',
    border: '2px solid transparent',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  tileSelected: {
    border: `2px solid ${t.colors.blue}`,
  },
  tileDisabled: {
    cursor: 'default',
  },
  disabledOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.5),
    zIndex: 1,
  },
  img: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  imgEmpty: {
    position: 'absolute',
    inset: 0,
  },
  flag: {
    position: 'absolute',
    top: 4,
    left: 4,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    fontSize: 10,
    fontWeight: 700,
    color: t.colors.white,
    backgroundColor: t.colors.mainGreen,
    padding: '3px 6px',
    borderRadius: 999,
  },
  usage: {
    position: 'absolute',
    top: 4,
    left: 4,
    zIndex: 2,
    fontSize: 10,
    fontWeight: 700,
    color: t.colors.white,
    backgroundColor: t.colors.blue + t.colorOpacity(0.8),
    padding: '2px 5px',
    borderRadius: 999,
  },
  tileLoc: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    zIndex: 2,
    maxWidth: 'calc(100% - 8px)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    fontSize: 9,
    fontWeight: 600,
    color: t.colors.white,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.65),
    padding: '2px 5px',
    borderRadius: 999,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  processing: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: t.colors.white,
    backgroundColor: t.colors.yellow + t.colorOpacity(0.85),
    padding: '2px 4px',
    borderRadius: 999,
  },
  check: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    color: t.colors.white,
    backgroundColor: t.colors.blue,
  },
  stateBox: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: t.spacing.l,
    textAlign: 'center',
  },
  muted: {
    fontSize: 13,
    color: t.colors.dark05,
    maxWidth: 420,
  },
  uploadPane: {
    gap: t.spacing.m,
  },
  dropZone: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.s,
    padding: t.spacing.xxl,
    borderRadius: t.borderRadius.large,
    border: `1px dashed ${t.colors.gray01}`,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.4),
    cursor: 'pointer',
    textAlign: 'center',
  },
  dropTitle: {
    fontWeight: 600,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.m,
  },
}));
