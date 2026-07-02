import { useState } from 'react';
import { FiImage } from 'react-icons/fi';
import { GalleryLibraryResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { imgUrl } from '~/routes/Galleries/utils';
import { mkUseStyles, useTheme } from '~/utils/theme';

type InlineImagePickerProps = {
  label?: string;
  coverUrl?: string | null;
  onChange: (imageId: string | null, coverUrl: string | null) => void;
};

/** Compact single-image picker (from the gallery library) — inline so it works inside a modal. */
export const InlineImagePicker = ({ label = 'Image', coverUrl, onChange }: InlineImagePickerProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { galleriesApi } = useApi();
  const [open, setOpen] = useState(false);

  const libraryQuery = useAsync<GalleryLibraryResponse>(
    async () => {
      if (!galleriesApi) return undefined;
      const { data } = await galleriesApi.galleriesControllerLibrary({ take: 60 });
      return data;
    },
    [galleriesApi, open],
    { immediate: false },
  );

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !libraryQuery.data) libraryQuery.reload();
  };

  const current = imgUrl(coverUrl);
  const images = libraryQuery.data?.images ?? [];

  return (
    <div style={styles.container}>
      <span style={styles.label}>{label}</span>
      <div style={styles.row}>
        <div style={styles.thumb}>
          {current ? <img src={current} alt='' style={styles.thumbImg} /> : <FiImage size={18} color={theme.colors.dark05} />}
        </div>
        <Button label={coverUrl ? 'Change' : 'Choose image'} variant='secondary' onClick={toggle} />
        {coverUrl ? <Button label='Remove' variant='secondary' onClick={() => onChange(null, null)} /> : null}
      </div>

      {open ? (
        <div style={styles.gridWrap}>
          {libraryQuery.loading ? (
            <div style={styles.stateBox}>
              <Loader />
            </div>
          ) : images.length === 0 ? (
            <div style={styles.stateBox}>
              <span style={styles.muted}>No images in the library.</span>
            </div>
          ) : (
            <div style={styles.grid}>
              {images.map((img) => {
                const url = imgUrl(img.coverUrl);
                return (
                  <div
                    key={img.imageId}
                    style={styles.tile}
                    onClick={() => {
                      onChange(img.imageId, img.coverUrl);
                      setOpen(false);
                    }}
                  >
                    {url ? <img src={url} alt='' style={styles.tileImg} loading='lazy' /> : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.xs },
  label: { fontSize: 12, color: t.colors.blue04 },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
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
  gridWrap: {
    maxHeight: 220,
    overflowY: 'auto',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.4),
    padding: t.spacing.s,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
    gap: t.spacing.xs,
  },
  tile: {
    position: 'relative',
    aspectRatio: '1 / 1',
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  tileImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  stateBox: { minHeight: 80, alignItems: 'center', justifyContent: 'center' },
  muted: { fontSize: 13, color: t.colors.dark05 },
}));
