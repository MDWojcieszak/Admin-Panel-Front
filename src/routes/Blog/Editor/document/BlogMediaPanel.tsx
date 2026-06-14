import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdDelete, MdImage, MdUploadFile } from 'react-icons/md';
import { BlogMediaImageResponse } from '~/api/api';
import { ConfirmModal } from '~/components/ConfirmModal';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
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

/**
 * Upload a file to blog media (scope=BLOG). The generated client can't send multipart, and fetch() gives
 * no upload progress, so use XHR: onprogress reports the send %, then the server processes variants before
 * responding (we surface that gap as "Processing…").
 */
const uploadBlogMedia = (file: File, onProgress: (pct: number) => void): Promise<string> =>
  new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${import.meta.env.VITE_API_URL}/blog/media/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${getAccessToken()}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve((JSON.parse(xhr.responseText) as { id: string }).id);
        } catch {
          reject(new Error('Bad upload response'));
        }
      } else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(fd);
  });

export const BlogMediaPanel = ({ open, pickMode, onClose, onPick }: BlogMediaPanelProps) => {
  const styles = useStyles();
  const { blogMediaApi } = useApi();
  const [images, setImages] = useState<BlogMediaImageResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const deleteModal = useModal('blog-media-delete', ConfirmModal, { title: 'Delete image' });

  const doDelete = async (id: string) => {
    if (!blogMediaApi) return;
    try {
      await blogMediaApi.mediaControllerDeleteImage({ id });
      setImages((prev) => prev.filter((i) => i.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      toast('Image deleted', 'success');
    } catch (e) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      console.error('Error deleting blog media:', e);
      toast(
        err.response?.status === 409
          ? 'This image is still used in a post — remove it from the content first.'
          : err.response?.data?.message ?? 'Could not delete the image.',
        'error',
      );
    }
  };

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
    if (!file || !file.type.startsWith('image/') || uploading) return;
    setUploading(true);
    setProgress(0);
    try {
      const id = await uploadBlogMedia(file, setProgress);
      setProgress(100);
      await fetchPage(0, true);
      onPick(id);
    } catch (e) {
      console.error('Error uploading blog media:', e);
      toast('Could not upload the image.', 'error');
    } finally {
      setUploading(false);
      setProgress(0);
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
        style={{ ...styles.uploadZone, ...(uploading ? { cursor: 'default' } : null) }}
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleUpload(e.dataTransfer.files?.[0]);
        }}
      >
        <MdUploadFile size={22} />
        {uploading ? (
          <>
            <span style={styles.uploadText}>{progress < 100 ? `Uploading… ${progress}%` : 'Processing…'}</span>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressBar, width: `${progress}%` }} />
            </div>
          </>
        ) : (
          <span style={styles.uploadText}>Drop an image or click to upload</span>
        )}
      </div>

      <div style={styles.gridWrap}>
        <Scrollbar style={styles.scroll}>
          {images.length === 0 && !uploading ? (
            <div style={styles.empty}>
              <MdImage size={28} />
              <span>No images yet</span>
            </div>
          ) : (
            <div style={styles.grid}>
              {uploading ? (
                <div style={styles.tile}>
                  <div style={styles.pending}>
                    <Loader size={22} />
                    <span style={styles.pendingPct}>{progress < 100 ? `${progress}%` : '…'}</span>
                  </div>
                </div>
              ) : null}
              {images.map((img) => (
                <div key={img.id} className='blog-media-tile' style={styles.tile}>
                  <button
                    style={styles.tilePick}
                    title={pickMode ? 'Click to use · drag onto a block' : 'Click to insert · drag onto a block'}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(IMAGE_DND_TYPE, img.id);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onClick={() => onPick(img.id)}
                  >
                    <MediaThumb imageId={img.id} res='cover' style={styles.fill} />
                  </button>
                  <button
                    className='blog-media-del'
                    style={styles.tileDelete}
                    title='Delete from library'
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteModal.show({
                        message: 'Delete this image?',
                        description: 'It will be removed from the media library. Posts using it may break.',
                        confirmLabel: 'Delete',
                        danger: true,
                        onConfirm: () => doDelete(img.id),
                      });
                    }}
                  >
                    <MdDelete size={13} />
                  </button>
                </div>
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
  progressTrack: {
    width: '100%',
    height: 4,
    marginTop: 6,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: t.colors.white + t.colorOpacity(0.12),
  },
  progressBar: { height: '100%', backgroundColor: t.colors.blue, transition: 'width 0.15s ease' },
  pending: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: t.colors.gray04,
  },
  pendingPct: { fontSize: 11, fontWeight: 700, color: t.colors.dark05 },
  gridWrap: { flex: 1, minHeight: 0, position: 'relative' },
  scroll: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t.spacing.xs, paddingRight: t.spacing.l },
  tile: {
    position: 'relative',
    aspectRatio: '1 / 1',
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    backgroundColor: t.colors.gray04,
  },
  tilePick: {
    width: '100%',
    height: '100%',
    border: 0,
    padding: 0,
    cursor: 'grab',
    background: 'transparent',
  },
  tileDelete: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: 0,
    cursor: 'pointer',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
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
