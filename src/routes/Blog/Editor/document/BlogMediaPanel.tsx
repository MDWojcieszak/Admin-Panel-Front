import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdUploadFile } from 'react-icons/md';
import { BlogMediaImageResponse } from '~/api/api';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { MediaThumb } from '~/routes/Blog/Editor/components/MediaThumb';
import { IMAGE_DND_TYPE } from '~/routes/Blog/Editor/document/schema';
import { getAccessToken } from '~/utils/accessToken';
import { mkUseStyles } from '~/utils/theme';

export const BLOG_MEDIA_PANEL_WIDTH = 300;

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
    if (!file) return;
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
      animate={{ x: open ? 0 : -(BLOG_MEDIA_PANEL_WIDTH + 8), opacity: open ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <div style={styles.header}>
        <span style={styles.title}>{pickMode ? 'Pick image' : 'Media library'}</span>
        <button style={styles.iconBtn} title='Close' onClick={onClose}>
          <MdClose size={18} />
        </button>
      </div>
      <span style={styles.hint}>{pickMode ? 'Click an image to use it here.' : 'Click an image to insert it into the post.'}</span>

      <input
        ref={fileRef}
        type='file'
        accept='image/*'
        style={{ display: 'none' }}
        onChange={(e) => handleUpload(e.target.files?.[0])}
      />
      <button style={styles.upload} onClick={() => fileRef.current?.click()} disabled={uploading}>
        <MdUploadFile size={18} /> {uploading ? 'Uploading…' : 'Upload image'}
      </button>

      <div style={styles.gridWrap}>
        <Scrollbar style={styles.scroll}>
          <div style={styles.grid}>
            {images.map((img) => (
              <button
                key={img.id}
                style={styles.tile}
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
    top: 0,
    bottom: 0,
    width: BLOG_MEDIA_PANEL_WIDTH,
    zIndex: 40,
    gap: t.spacing.s,
    padding: t.spacing.m,
    backgroundColor: t.colors.gray04,
    borderRight: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontWeight: 700, fontSize: 16 },
  hint: { fontSize: 12, color: t.colors.dark05 },
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
    display: 'flex',
  },
  gridWrap: { flex: 1, minHeight: 0, position: 'relative' },
  scroll: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t.spacing.xs, paddingRight: t.spacing.xs },
  tile: {
    aspectRatio: '1 / 1',
    borderRadius: t.borderRadius.small,
    overflow: 'hidden',
    border: 0,
    padding: 0,
    cursor: 'pointer',
    backgroundColor: t.colors.gray05,
  },
  fill: { width: '100%', height: '100%' },
  loadMore: {
    marginTop: t.spacing.s,
    height: 34,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.1)}`,
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
    fontSize: 12,
  },
}));
