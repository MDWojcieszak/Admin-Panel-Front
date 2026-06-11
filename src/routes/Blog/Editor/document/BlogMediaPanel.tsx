import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdImage, MdUploadFile } from 'react-icons/md';
import { BlogMediaImageResponse } from '~/api/api';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { MediaThumb } from '~/routes/Blog/Editor/components/MediaThumb';
import { IMAGE_DND_TYPE } from '~/routes/Blog/Editor/document/schema';
import { getAccessToken } from '~/utils/accessToken';
import { mkUseStyles } from '~/utils/theme';

export const BLOG_MEDIA_PANEL_WIDTH = 320;

type BlogMediaPanelProps = {
  open: boolean;
  pickMode?: boolean;
  onClose: () => void;
  onPick: (imageId: string) => void;
};

/** Upload a file to blog media (scope=BLOG); the generated client can't send multipart, so do it directly. */
const uploadBlogMedia = async (file: File): Promise<string> => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${import.meta.env.VITE_API_URL}/blog/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    body: fd,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  const data = (await res.json()) as { id: string };
  return data.id;
};

export const BlogMediaPanel = ({ open, pickMode, onClose, onPick }: BlogMediaPanelProps) => {
  const styles = useStyles();
  const { blogMediaApi } = useApi();
  const [images, setImages] = useState<BlogMediaImageResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // The endpoint caps `take` at 20 — paginate with skip and a "load more" button.
  const fetchPage = useCallback(
    async (skip: number, replace: boolean) => {
      if (!blogMediaApi) return;
      try {
        const { data } = await blogMediaApi.mediaControllerList({ take: 20, skip });
        setTotal(data.total);
        setImages((prev) => (replace ? data.images : [...prev, ...data.images]));
      } catch (e) {
        console.error('Error loading blog media:', e);
      }
    },
    [blogMediaApi],
  );

  useEffect(() => {
    if (open) fetchPage(0, true);
  }, [open, fetchPage]);

  const handleUpload = async (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const id = await uploadBlogMedia(file);
      await fetchPage(0, true);
      onPick(id);
    } catch (e) {
      console.error('Error uploading blog media:', e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      style={styles.panel}
      initial={false}
      animate={{ x: open ? 0 : -(BLOG_MEDIA_PANEL_WIDTH + 12), opacity: open ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <div style={styles.header}>
        <div style={styles.titleWrap}>
          <span style={styles.title}>{pickMode ? 'Pick image' : 'Media'}</span>
          {total ? <span style={styles.count}>{total}</span> : null}
        </div>
        <button style={styles.iconBtn} title='Close' onClick={onClose}>
          <MdClose size={18} />
        </button>
      </div>

      <input ref={fileRef} type='file' accept='image/*' style={{ display: 'none' }} onChange={(e) => handleUpload(e.target.files?.[0])} />
      <div
        className={`blog-upload-zone${dragOver ? ' over' : ''}`}
        style={styles.uploadZone}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleUpload(e.dataTransfer.files?.[0]);
        }}
      >
        <MdUploadFile size={22} />
        <span style={styles.uploadText}>{uploading ? 'Uploading…' : 'Drop an image or click to upload'}</span>
      </div>

      <div style={styles.gridWrap}>
        <Scrollbar style={styles.scroll}>
          {images.length === 0 ? (
            <div style={styles.empty}>
              <MdImage size={28} />
              <span>No images yet</span>
            </div>
          ) : (
            <div style={styles.grid}>
              {images.map((img) => (
                <button
                  key={img.id}
                  className='blog-media-tile'
                  style={styles.tile}
                  title={pickMode ? 'Click to use · drag onto a block' : 'Click to insert · drag onto a block'}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(IMAGE_DND_TYPE, img.id);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => onPick(img.id)}
                >
                  <MediaThumb imageId={img.id} style={styles.fill} />
                </button>
              ))}
            </div>
          )}
          {images.length < total ? (
            <button style={styles.loadMore} onClick={() => fetchPage(images.length, false)}>
              Load more ({images.length}/{total})
            </button>
          ) : null}
        </Scrollbar>
      </div>
    </motion.div>
  );
};

const useStyles = mkUseStyles((t) => ({
  panel: {
    position: 'fixed',
    left: 0,
    top: 60,
    bottom: 0,
    width: BLOG_MEDIA_PANEL_WIDTH,
    zIndex: 6,
    gap: t.spacing.m,
    padding: t.spacing.m,
    backgroundColor: t.colors.gray045,
    borderRight: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
  title: { fontWeight: 700, fontSize: 17 },
  count: {
    minWidth: 22,
    height: 20,
    paddingLeft: 6,
    paddingRight: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
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
  uploadZone: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: `${t.spacing.l}px ${t.spacing.m}px`,
    borderRadius: t.borderRadius.large,
    border: `1.5px dashed ${t.colors.white + t.colorOpacity(0.18)}`,
    color: t.colors.dark05,
    cursor: 'pointer',
    textAlign: 'center',
  },
  uploadText: { fontSize: 12 },
  gridWrap: { flex: 1, minHeight: 0, position: 'relative' },
  scroll: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: t.spacing.s, paddingRight: t.spacing.l },
  tile: {
    position: 'relative',
    aspectRatio: '1 / 1',
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    border: 0,
    padding: 0,
    cursor: 'grab',
    backgroundColor: t.colors.gray04,
  },
  fill: { width: '100%', height: '100%' },
  empty: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: t.spacing.s,
    paddingTop: 50,
    color: t.colors.dark05,
    fontSize: 13,
  },
  loadMore: {
    marginTop: t.spacing.s,
    width: '100%',
    height: 34,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.1)}`,
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
    fontSize: 12,
  },
}));
