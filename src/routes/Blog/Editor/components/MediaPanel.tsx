import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdRefresh } from 'react-icons/md';
import { FiUploadCloud } from 'react-icons/fi';
import { ImageService, ImageType } from '~/apiOld/Image';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { useModal } from '~/hooks/useModal';
import { CreateImageModal } from '~/routes/Images/modals/CreateImageModal';
import { MediaThumb } from '~/routes/Blog/Editor/components/MediaThumb';
import { mkUseStyles } from '~/utils/theme';

export const MEDIA_PANEL_WIDTH = 300;

type MediaPanelProps = {
  open: boolean;
  activeLabel?: string;
  onClose: () => void;
  onPick: (imageId: string) => void;
};

export const MediaPanel = ({ open, activeLabel, onClose, onPick }: MediaPanelProps) => {
  const styles = useStyles();
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ImageService.getList({ take: 60, skip: 0 });
      setImages(data.images);
    } catch (e) {
      console.error('Error loading media:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const uploadModal = useModal(
    'blog-media-upload',
    CreateImageModal,
    { title: 'Upload image' },
    {
      handleClose: async () => {
        uploadModal.hide();
        load();
      },
    },
  );

  return (
    <motion.div
      style={styles.panel}
      initial={false}
      animate={{ x: open ? 0 : -(MEDIA_PANEL_WIDTH + 8), opacity: open ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <div style={styles.header}>
        <span style={styles.title}>Media</span>
        <div style={styles.headerActions}>
          <button style={styles.iconBtn} title='Refresh' onClick={load}>
            <MdRefresh size={18} />
          </button>
          <button style={styles.iconBtn} title='Close' onClick={onClose}>
            <MdClose size={18} />
          </button>
        </div>
      </div>

      <button style={styles.upload} onClick={() => uploadModal.show()}>
        <FiUploadCloud size={16} /> Upload image
      </button>

      <span style={styles.hint}>
        {activeLabel ? `Click an image to add it to the ${activeLabel} block.` : 'Select a media block, then click an image.'}
      </span>

      <div style={styles.gridWrap}>
        <Scrollbar style={styles.scroll}>
          {loading && images.length === 0 ? (
            <div style={styles.centered}>
              <Loader />
            </div>
          ) : images.length === 0 ? (
            <span style={styles.empty}>No images yet. Upload one to get started.</span>
          ) : (
            <div style={styles.grid}>
              {images.map((img) => (
                <button key={img.id} style={styles.cell} onClick={() => onPick(img.id)} title='Add to block'>
                  <MediaThumb imageId={img.id} style={styles.thumb} />
                </button>
              ))}
            </div>
          )}
        </Scrollbar>
      </div>
    </motion.div>
  );
};

const useStyles = mkUseStyles((t) => ({
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: MEDIA_PANEL_WIDTH,
    zIndex: 5,
    gap: t.spacing.s,
    padding: t.spacing.m,
    backgroundColor: t.colors.gray04,
    borderRight: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 700,
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 2,
  },
  iconBtn: {
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
  },
  upload: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.s,
    height: 40,
    borderRadius: t.borderRadius.default,
    border: `1px dashed ${t.colors.white + t.colorOpacity(0.2)}`,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    display: 'flex',
  },
  hint: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  gridWrap: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  scroll: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: t.spacing.s,
    paddingRight: t.spacing.s,
  },
  cell: {
    padding: 0,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    cursor: 'pointer',
    background: 'transparent',
    aspectRatio: '1 / 1',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  centered: {
    alignItems: 'center',
    paddingTop: 40,
  },
  empty: {
    fontSize: 13,
    color: t.colors.dark05,
  },
}));
