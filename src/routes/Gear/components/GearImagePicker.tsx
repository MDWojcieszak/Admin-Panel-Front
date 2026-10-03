import { useCallback, useEffect, useRef, useState } from 'react';
import { FiImage, FiSearch, FiUpload } from 'react-icons/fi';
import { GearImageResponse } from '~/api/api';
import { GearImageService } from '~/apiOld/Gear';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { imgUrl } from '~/routes/Galleries/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** The backend caps a page at 20. */
const PAGE_SIZE = 20;

type GearImagePickerProps = {
  label?: string;
  coverUrl?: string | null;
  onChange: (imageId: string | null, coverUrl: string | null) => void;
};

const usedByCaption = (image: GearImageResponse): string => {
  if (!image.usedBy.length) return 'Unused';
  const [first, ...rest] = image.usedBy;
  return rest.length ? `${first.name} +${rest.length}` : first.name;
};

/**
 * The photo of a gear item or system. Gear photos live apart from the gallery:
 * a new one is uploaded straight into the gear pool, and an existing one can be
 * reused — two identical batteries share one picture. Each thumbnail says which
 * gear already shows it.
 */
export const GearImagePicker = ({ label = 'Photo', coverUrl, onChange }: GearImagePickerProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { gearApi } = useApi();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<GearImageResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [unusedOnly, setUnusedOnly] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(
    async (skip: number) => {
      if (!gearApi) return;
      setLoading(true);
      try {
        const { data } = await gearApi.gearControllerListImages({
          take: PAGE_SIZE,
          skip,
          search: search.trim() || undefined,
          unusedOnly: unusedOnly || undefined,
        });
        setTotal(data.total);
        setImages((prev) => (skip === 0 ? data.images : [...prev, ...data.images]));
      } catch (e) {
        toast(getApiErrorMessage(e, 'Could not load gear photos.'), 'error');
      } finally {
        setLoading(false);
      }
    },
    [gearApi, search, unusedOnly, toast],
  );

  // Refetch from the top whenever the grid opens or a filter changes; the
  // search waits for a pause in typing.
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => load(0), search ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [open, load, search]);

  const upload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { id } = await GearImageService.upload(file);
      onChange(id, `/image/cover?id=${id}`);
      setOpen(false);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not upload the photo.'), 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const current = imgUrl(coverUrl);

  return (
    <div style={styles.container}>
      <span style={styles.label}>{label}</span>
      <div style={styles.row}>
        <div style={styles.thumb}>
          {current ? (
            <img src={current} alt='' style={styles.thumbImg} />
          ) : (
            <FiImage size={18} color={theme.colors.dark05} />
          )}
        </div>
        <Button
          label='Upload new'
          variant='secondary'
          icon={<FiUpload size={14} />}
          loading={uploading}
          onClick={() => fileInputRef.current?.click()}
        />
        <Button label={open ? 'Close' : 'Choose existing'} variant='secondary' onClick={() => setOpen((v) => !v)} />
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          style={{ display: 'none' }}
          onChange={(e) => upload(e.target.files)}
        />
        {coverUrl ? <Button label='Remove' variant='secondary' onClick={() => onChange(null, null)} /> : null}
      </div>

      {open ? (
        <div style={styles.panel}>
          <div style={styles.filters}>
            <label style={styles.searchBox}>
              <FiSearch size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search by the gear that uses it…'
                style={styles.searchInput}
              />
            </label>
            <button
              type='button'
              aria-pressed={unusedOnly}
              onClick={() => setUnusedOnly((v) => !v)}
              style={{ ...styles.chip, ...(unusedOnly ? styles.chipOn : {}) }}
            >
              Unused only
            </button>
          </div>

          <div style={styles.gridWrap}>
            {loading && images.length === 0 ? (
              <div style={styles.stateBox}>
                <Loader />
              </div>
            ) : images.length === 0 ? (
              <div style={styles.stateBox}>
                <span style={styles.muted}>
                  {search || unusedOnly ? 'No photo matches.' : 'No gear photos yet — use Upload new.'}
                </span>
              </div>
            ) : (
              <>
                <div style={styles.grid}>
                  {images.map((image) => {
                    const url = imgUrl(image.lowResUrl) ?? imgUrl(image.coverUrl);
                    const caption = usedByCaption(image);
                    return (
                      <button
                        key={image.id}
                        type='button'
                        title={image.usedBy.map((user) => user.name).join(', ') || 'Not used by any gear yet'}
                        style={styles.tile}
                        onClick={() => {
                          onChange(image.id, image.coverUrl);
                          setOpen(false);
                        }}
                      >
                        <div style={styles.tileImage}>
                          {url ? <img src={url} alt='' style={styles.tileImg} loading='lazy' /> : null}
                        </div>
                        <span style={{ ...styles.caption, opacity: image.usedBy.length ? 1 : 0.6 }}>{caption}</span>
                      </button>
                    );
                  })}
                </div>
                {images.length < total ? (
                  <div style={styles.more}>
                    <Button
                      label={`Load more (${total - images.length})`}
                      variant='secondary'
                      loading={loading}
                      onClick={() => load(images.length)}
                    />
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.xs },
  label: { fontSize: 12, color: t.colors.blue04 },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexWrap: 'wrap', whiteSpace: 'nowrap' },
  thumb: {
    width: 48,
    height: 48,
    minWidth: 48,
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  panel: {
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.4),
  },
  filters: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
  searchBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flex: 1,
    height: 36,
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: t.colors.white,
    fontSize: 13,
    padding: 0,
  },
  chip: {
    height: 30,
    padding: '0 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    color: t.colors.dark05,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: t.colors.dark04 + t.colorOpacity(0.5),
  },
  chipOn: {
    color: t.colors.white,
    borderColor: t.colors.blue,
    backgroundColor: t.colors.blue + t.colorOpacity(0.18),
  },
  gridWrap: { maxHeight: 280, overflowY: 'auto' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))',
    gap: t.spacing.s,
  },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    minWidth: 0,
  },
  tileImage: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  tileImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  caption: {
    fontSize: 11,
    color: t.colors.white,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  more: { alignItems: 'center', paddingTop: t.spacing.s },
  stateBox: { minHeight: 80, alignItems: 'center', justifyContent: 'center' },
  muted: { fontSize: 13, color: t.colors.dark05 },
}));
