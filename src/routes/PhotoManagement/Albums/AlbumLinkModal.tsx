import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { FiImage } from 'react-icons/fi';
import {
  ImmichAlbumPreviewResponse,
  ImmichAlbumSource,
  PhotoEntryResponse,
  PhotoEntryType,
} from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Loader } from '~/components/Loader';
import { Select } from '~/components/Select';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { ImmichThumb } from '~/routes/PhotoManagement/components/ImmichThumb';
import { getApiErrorMessage, getApiErrorStatus } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

type AstroObjectItem = { id: string; name: string; code?: string };

type AlbumLinkModalProps = {
  mode: 'create' | 'attach';
  /** Immich album id — required in attach mode. */
  albumId?: string;
  albumName?: string;
  entries: PhotoEntryResponse[];
  /** Astro object catalog (id → name) for narrowing ASTRO entries. */
  astroObjects?: AstroObjectItem[];
  defaultEntryId?: string;
  onDone?: () => void | Promise<void>;
} & Partial<InternalModalProps>;

type FormValues = {
  photoEntryId: string;
  source: ImmichAlbumSource;
  astroObjectId: string;
  albumName: string;
};

const SOURCE_LABELS: Record<ImmichAlbumSource, string> = {
  EXPORT: 'Export · 04_EXPORT',
  EDIT: 'Edit · 03_EDIT',
  SELECTS: 'Selects · 02_SELECTS',
  SOURCE: 'Source · 01_SOURCE',
  DELIVERY: 'Delivery · 05_DELIVERY',
  ENTIRE: 'Entire entry',
};

const immichError = (e: unknown, fallback: string): string =>
  getApiErrorStatus(e) === 502 ? 'Immich is unreachable — check the integration configuration.' : getApiErrorMessage(e, fallback);

export const AlbumLinkModal = (p: AlbumLinkModalProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { immichApi, photoEntryApi } = useApi();
  const toast = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<ImmichAlbumPreviewResponse>();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string>();
  const [entryAstroIds, setEntryAstroIds] = useState<string[]>([]);

  const entryOptions = p.entries.map((e) => ({ label: e.name, value: e.id }));
  const firstEntry = p.defaultEntryId ?? p.entries[0]?.id ?? '';

  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: { photoEntryId: firstEntry, source: ImmichAlbumSource.Export, astroObjectId: '', albumName: '' },
  });

  const photoEntryId = watch('photoEntryId');
  const source = watch('source');
  const astroObjectId = watch('astroObjectId');

  const selectedEntry = p.entries.find((e) => e.id === photoEntryId);
  const isAstro = selectedEntry?.type === PhotoEntryType.Astro;

  const sourceOptions = (Object.values(ImmichAlbumSource) as ImmichAlbumSource[])
    .filter((s) => s !== ImmichAlbumSource.Delivery || selectedEntry?.type === PhotoEntryType.Work)
    .map((s) => ({ label: SOURCE_LABELS[s], value: s }));

  const astroName = (id: string) => {
    const o = p.astroObjects?.find((a) => a.id === id);
    return o ? o.code || o.name : id.slice(0, 8);
  };
  const astroOptions = [
    { label: 'All objects', value: '' },
    ...entryAstroIds.map((id) => ({ label: astroName(id), value: id })),
  ];

  // ASTRO entries can be narrowed to a single object's folder — fetch the entry's objects.
  useEffect(() => {
    setValue('astroObjectId', '');
    if (!photoEntryApi || !isAstro || !photoEntryId) {
      setEntryAstroIds([]);
      return;
    }
    let active = true;
    photoEntryApi
      .photoEntryControllerGetById({ id: photoEntryId })
      .then((r) => {
        if (!active) return;
        const ids = (r.data.astroObjects ?? [])
          .map((a) => a.astroObjectId)
          .filter((id): id is string => Boolean(id));
        setEntryAstroIds(ids);
      })
      .catch(() => active && setEntryAstroIds([]));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoEntryId, isAstro]);

  const previewReqId = useRef(0);
  const loadPreview = async (entryId: string, src: ImmichAlbumSource, astroId: string) => {
    if (!immichApi || !entryId) return;
    const reqId = ++previewReqId.current;
    setPreviewLoading(true);
    setPreviewError(undefined);
    try {
      const { data } = await immichApi.immichControllerPreviewAlbum({
        previewImmichAlbumDto: { photoEntryId: entryId, source: src, astroObjectId: astroId || undefined },
      });
      if (reqId !== previewReqId.current) return; // a newer request superseded this one
      setPreview(data);
    } catch (e) {
      if (reqId !== previewReqId.current) return;
      setPreview(undefined);
      setPreviewError(immichError(e, 'Could not load the folder preview.'));
    } finally {
      if (reqId === previewReqId.current) setPreviewLoading(false);
    }
  };

  useEffect(() => {
    loadPreview(photoEntryId, source, astroObjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoEntryId, source, astroObjectId]);

  const submit = async (data: FormValues) => {
    if (!immichApi || !data.photoEntryId) return;
    setSubmitting(true);
    try {
      if (p.mode === 'create') {
        const { data: result } = await immichApi.immichControllerCreateAlbum({
          createImmichAlbumDto: {
            photoEntryId: data.photoEntryId,
            source: data.source,
            astroObjectId: data.astroObjectId || undefined,
            albumName: data.albumName.trim() || undefined,
          },
        });
        toast(`Created "${result.albumName}" (${result.assetsAdded} photos)`, result.assetsFound ? 'success' : 'info');
      } else {
        if (!p.albumId) return;
        const { data: result } = await immichApi.immichControllerAttachEntry({
          albumId: p.albumId,
          attachEntryDto: { photoEntryId: data.photoEntryId, source: data.source, astroObjectId: data.astroObjectId || undefined },
        });
        toast(`Added ${result.assetsAdded} photo${result.assetsAdded === 1 ? '' : 's'}`, result.assetsAdded ? 'success' : 'info');
      }
      await p.onDone?.();
      await p.handleClose?.();
    } catch (e) {
      toast(immichError(e, 'Could not save the album link.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const assets = preview?.assets ?? [];

  return (
    <div style={styles.container}>
      {p.mode === 'attach' && p.albumName ? (
        <span style={styles.hint}>Adding a photo entry folder to “{p.albumName}”.</span>
      ) : null}

      <div style={styles.grid2}>
        <div style={styles.controls}>
          <Select name='photoEntryId' label='Photo entry' options={entryOptions} control={control} />
          <Select name='source' label='Folder' options={sourceOptions} control={control} />
          {isAstro && entryAstroIds.length > 0 ? (
            <Select name='astroObjectId' label='Astro object' options={astroOptions} control={control} />
          ) : null}
          {p.mode === 'create' ? (
            <Input name='albumName' label='Album name' description='Defaults to the entry name' type='text' control={control} />
          ) : null}
        </div>

        <div style={styles.galleryCol}>
          <div style={styles.galleryHead}>
            <span style={styles.galleryLabel}>Preview</span>
            <span style={styles.count}>
              {previewLoading ? 'Scanning…' : preview ? `${preview.total} photo${preview.total === 1 ? '' : 's'}` : ''}
            </span>
          </div>

          <div style={styles.galleryBody}>
            <AnimatePresence mode='wait'>
              {previewLoading ? (
                <motion.div
                  key='loading'
                  style={styles.stateBox}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader />
                </motion.div>
              ) : previewError ? (
                <motion.div key='error' style={styles.stateBox} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <span style={styles.error}>{previewError}</span>
                </motion.div>
              ) : assets.length === 0 ? (
                <motion.div key='empty' style={styles.stateBox} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <FiImage size={22} color={theme.colors.dark05} />
                  <span style={styles.muted}>No photos found in this folder.</span>
                </motion.div>
              ) : (
                <motion.div key='grid' style={styles.grid} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {assets.map((asset, i) => (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.18, delay: Math.min(i, 16) * 0.015 }}
                    >
                      <ImmichThumb assetId={asset.id} fileName={asset.originalFileName} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div style={styles.actions}>
        <Button label='Cancel' variant='secondary' onClick={() => p.handleClose?.()} />
        <Button
          label={p.mode === 'create' ? 'Create album' : 'Add to album'}
          onClick={handleSubmit(submit)}
          loading={submitting}
          disabled={previewLoading || !photoEntryId}
        />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    width: 'min(760px, 92vw)',
  },
  hint: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '230px minmax(0, 1fr)',
    gap: t.spacing.l,
    alignItems: 'start',
  },
  controls: {
    gap: t.spacing.s,
    minWidth: 0,
  },
  galleryCol: {
    minWidth: 0,
    gap: t.spacing.s,
  },
  galleryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  galleryLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: t.colors.dark05,
  },
  count: {
    fontSize: 13,
    fontWeight: 600,
    color: t.colors.blue04,
  },
  // Fixed-height gallery so changing folder/entry never reflows the modal.
  galleryBody: {
    height: 'min(46vh, 380px)',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.4),
    overflow: 'hidden',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
    gridAutoRows: 'min-content',
    gap: t.spacing.s,
    height: '100%',
    overflowY: 'auto',
    alignContent: 'start',
    padding: t.spacing.s,
  },
  stateBox: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.s,
    padding: t.spacing.m,
  },
  error: {
    fontSize: 13,
    color: t.colors.red,
    maxWidth: 360,
    textAlign: 'center',
  },
  muted: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.m,
  },
}));
