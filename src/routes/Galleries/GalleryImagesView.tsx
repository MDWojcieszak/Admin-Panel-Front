import { useEffect, useState } from 'react';
import { FiImage, FiInfo, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import { GalleryLibraryItemResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { Switch } from '~/components/Switch';
import { useApi } from '~/hooks/useApi';
import { useModal } from '~/hooks/useModal';
import { ImagePreviewModal } from '~/routes/Galleries/modals/ImagePreviewModal';
import { imgUrl } from '~/routes/Galleries/utils';
import { mkUseStyles, useTheme } from '~/utils/theme';

const TAKE = 60;

export const GalleryImagesView = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { galleriesApi } = useApi();

  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [images, setImages] = useState<GalleryLibraryItemResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = async (skip: number, replace: boolean) => {
    if (!galleriesApi) return;
    setLoading(true);
    try {
      const { data } = await galleriesApi.galleriesControllerLibrary({
        take: TAKE,
        skip,
        unassignedOnly: unassignedOnly || undefined,
      });
      setTotal(data.total);
      setImages((prev) => (replace ? data.images : [...prev, ...data.images]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unassignedOnly]);

  const previewModal = useModal('gallery-images-preview', ImagePreviewModal, { title: 'Preview' });

  return (
    <div style={styles.scroll}>
      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.titleWrap}>
            <h2 style={styles.heading}>Images</h2>
            <span style={styles.subheading}>Every gallery image and whether it’s used in a gallery.</span>
          </div>
          <div style={styles.headerActions}>
            <Switch checked={unassignedOnly} onChange={setUnassignedOnly} label='Unassigned only' />
            <Button label='Refresh' variant='secondary' icon={<FiRefreshCw size={14} />} onClick={() => load(0, true)} loading={loading} />
          </div>
        </div>

        {loading && images.length === 0 ? (
          <Loader />
        ) : images.length === 0 ? (
          <EmptyState
            icon={<FiImage size={26} color={theme.colors.blue04} />}
            title='No images'
            description={unassignedOnly ? 'Every image is used in a gallery.' : 'Upload images from a gallery to get started.'}
          />
        ) : (
          <>
            <div style={styles.grid}>
              {images.map((img) => {
                const url = imgUrl(img.coverUrl);
                const preview = (initialInfo?: boolean) =>
                  previewModal.show({ imageId: img.imageId, coverUrl: img.coverUrl, initialInfo, localization: img.localization, exif: img.exif });
                return (
                  <div key={img.imageId} style={styles.tile} onClick={() => preview()}>
                    {url ? <img src={url} alt='' style={styles.img} loading='lazy' /> : <div style={styles.imgEmpty} />}
                    <div style={{ ...styles.usageChip, color: img.usageCount > 0 ? theme.colors.lightGreen : theme.colors.dark05 }}>
                      {img.usageCount > 0 ? `In ${img.usageCount} gal.` : 'Unused'}
                    </div>
                    {img.processingStatus !== 'DONE' ? (
                      <div style={styles.processing}>{img.processingStatus.toLowerCase()}</div>
                    ) : null}
                    {img.localization ? (
                      <div style={styles.tileLoc}>
                        <FiMapPin size={10} /> {img.localization}
                      </div>
                    ) : null}
                    <div
                      style={styles.tileInfo}
                      title='Details'
                      onClick={(e) => {
                        e.stopPropagation();
                        preview(true);
                      }}
                    >
                      <FiInfo size={13} />
                    </div>
                  </div>
                );
              })}
            </div>
            {images.length < total ? (
              <Button label='Load more' variant='secondary' onClick={() => load(images.length, false)} loading={loading} style={styles.loadMore} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  scroll: {
    height: '100%',
    minHeight: 0,
    width: '100%',
    overflowY: 'auto',
  },
  content: {
    gap: t.spacing.l,
    paddingBottom: t.spacing.m,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  titleWrap: {
    gap: 2,
    minWidth: 0,
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
  },
  subheading: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    flexWrap: 'wrap',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: t.spacing.s,
  },
  tile: {
    position: 'relative',
    aspectRatio: '1 / 1',
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
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
  usageChip: {
    position: 'absolute',
    top: 6,
    left: 6,
    fontSize: 10,
    fontWeight: 700,
    color: t.colors.white,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.72),
    padding: '2px 7px',
    borderRadius: 999,
  },
  processing: {
    position: 'absolute',
    top: 6,
    right: 6,
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: t.colors.white,
    backgroundColor: t.colors.yellow + t.colorOpacity(0.85),
    padding: '2px 4px',
    borderRadius: 999,
  },
  tileInfo: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
  },
  tileLoc: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    maxWidth: 'calc(100% - 44px)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 10,
    fontWeight: 600,
    color: t.colors.white,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
    padding: '2px 7px',
    borderRadius: 999,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  loadMore: {
    alignSelf: 'center',
  },
}));
