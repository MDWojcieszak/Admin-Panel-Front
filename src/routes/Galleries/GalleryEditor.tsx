import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiArrowLeft, FiEdit2, FiExternalLink, FiImage, FiInfo, FiMapPin, FiPlus, FiStar, FiTrash2 } from 'react-icons/fi';
import {
  GalleryDetailResponse,
  GalleryImageItemResponse,
  GalleryImageRole,
  GalleryStatus,
} from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { EmptyState } from '~/components/EmptyState';
import { Input } from '~/components/Input';
import { Loader } from '~/components/Loader';
import { Select } from '~/components/Select';
import { TextArea } from '~/components/TextArea';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { EditImageModal } from '~/routes/Images/modals/EditImageModal';
import { ImagePreviewModal } from '~/routes/Galleries/modals/ImagePreviewModal';
import { MediaSelectorModal } from '~/routes/Galleries/modals/MediaSelectorModal';
import { imgUrl, ROLE_LABEL, STATUS_LABEL, STATUS_TONE } from '~/routes/Galleries/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

const ROLES: GalleryImageRole[] = ['HERO', 'LARGE', 'NORMAL', 'HIDDEN'];
const STATUSES: GalleryStatus[] = ['DRAFT', 'PUBLISHED', 'HIDDEN', 'ARCHIVED'];
const ROLE_OPTIONS = ROLES.map((r) => ({ label: ROLE_LABEL[r], value: r }));
const STATUS_OPTIONS = STATUSES.map((s) => ({ label: STATUS_LABEL[s], value: s }));
const roleField = (imageId: string) => `role_${imageId}`;

const detailsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
});
type DetailsValues = z.infer<typeof detailsSchema>;

export const GalleryEditor = () => {
  const styles = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const { galleriesApi } = useApi();
  const toast = useToast();

  const [items, setItems] = useState<GalleryImageItemResponse[]>([]);
  const itemsRef = useRef<GalleryImageItemResponse[]>([]);
  const setLocalItems = (next: GalleryImageItemResponse[]) => {
    itemsRef.current = next;
    setItems(next);
  };

  const [saving, setSaving] = useState(false);
  const dragIndex = useRef<number | null>(null);

  const galleryQuery = useAsync<GalleryDetailResponse>(
    async () => {
      if (!galleriesApi || !id) return undefined;
      const { data } = await galleriesApi.galleriesControllerGetById({ id });
      return data;
    },
    [galleriesApi, id],
  );

  const detailsForm = useForm<DetailsValues>({ resolver: zodResolver(detailsSchema), defaultValues: { title: '', slug: '', description: '' } });
  // Backs the themed Select for status + per-image role (name `role_<imageId>`).
  const controlsForm = useForm<Record<string, string>>({ defaultValues: { status: 'DRAFT' } });

  const gallery = galleryQuery.data;

  useEffect(() => {
    if (!gallery) return;
    setLocalItems(gallery.items);
    detailsForm.reset({ title: gallery.title, slug: gallery.slug, description: gallery.description ?? '' });
    controlsForm.reset({
      status: gallery.status,
      ...Object.fromEntries(gallery.items.map((it) => [roleField(it.imageId), it.role])),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gallery]);

  const applyGallery = (data: GalleryDetailResponse) => {
    galleryQuery.setData(data);
    setLocalItems(data.items);
  };

  // Persist the full ordered list (drag&drop / roles / add / remove all funnel through here).
  const persist = async (list: GalleryImageItemResponse[]) => {
    if (!galleriesApi) return;
    setSaving(true);
    try {
      const { data } = await galleriesApi.galleriesControllerSetItems({
        id,
        setGalleryItemsDto: { items: list.map((it, i) => ({ imageId: it.imageId, order: i, role: it.role })) },
      });
      applyGallery(data);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save changes.'), 'error');
      await galleryQuery.reload();
    } finally {
      setSaving(false);
    }
  };

  const changeRole = (imageId: string, role: GalleryImageRole) => {
    const next = itemsRef.current.map((it) => (it.imageId === imageId ? { ...it, role } : it));
    setLocalItems(next);
    persist(next);
  };

  const removeItem = (imageId: string) => {
    persist(itemsRef.current.filter((it) => it.imageId !== imageId));
  };

  const reorder = (from: number, to: number) => {
    const next = [...itemsRef.current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setLocalItems(next);
  };

  // Merge picked/uploaded image ids into the gallery (used by the media selector).
  const addImages = async (imageIds: string[]) => {
    if (!galleriesApi || !imageIds.length) return;
    const existing = itemsRef.current.map((it) => ({ imageId: it.imageId, role: it.role }));
    const have = new Set(existing.map((e) => e.imageId));
    const added = imageIds.filter((imgId) => !have.has(imgId)).map((imgId) => ({ imageId: imgId, role: 'NORMAL' as GalleryImageRole }));
    if (!added.length) {
      toast('Those images are already in this gallery', 'info');
      return;
    }
    try {
      const { data } = await galleriesApi.galleriesControllerSetItems({
        id,
        setGalleryItemsDto: { items: [...existing, ...added].map((e, i) => ({ imageId: e.imageId, order: i, role: e.role })) },
      });
      applyGallery(data);
      toast(`Added ${added.length} image${added.length === 1 ? '' : 's'}`, 'success');
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not add images.'), 'error');
      throw e; // keep the selector modal open
    }
  };

  const mediaModal = useModal('gallery-media', MediaSelectorModal, { title: 'Add images' });
  const openMedia = () => mediaModal.show({ currentImageIds: itemsRef.current.map((it) => it.imageId), onAdd: addImages });

  const imageMetaModal = useModal('gallery-image-meta', EditImageModal, { title: 'Image details' });
  const openImageDetails = (imageId: string) => imageMetaModal.show({ imageId });

  const previewModal = useModal('gallery-image-preview', ImagePreviewModal, { title: 'Preview' });
  const openPreview = (item: GalleryImageItemResponse, initialInfo?: boolean) =>
    previewModal.show({ imageId: item.imageId, coverUrl: item.coverUrl, initialInfo, localization: item.localization, exif: item.exif });

  const saveDetails = async (data: DetailsValues) => {
    if (!galleriesApi) return;
    try {
      const { data: g } = await galleriesApi.galleriesControllerUpdate({
        id,
        updateGalleryDto: { title: data.title.trim(), slug: data.slug?.trim() || undefined, description: data.description?.trim() || undefined },
      });
      galleryQuery.setData({ ...(gallery as GalleryDetailResponse), ...g, items: gallery?.items ?? [] });
      toast('Details saved', 'success');
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save details.'), 'error');
    }
  };

  const setStatus = async (status: GalleryStatus) => {
    if (!galleriesApi || !gallery || status === gallery.status) return;
    try {
      const { data: g } = await galleriesApi.galleriesControllerPatchStatus({ id, patchGalleryStatusDto: { status } });
      galleryQuery.setData({ ...gallery, ...g, items: gallery.items });
      toast(`Status: ${STATUS_LABEL[status]}`, 'success');
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not change status.'), 'error');
    }
  };

  const setCover = async (imageId: string) => {
    if (!galleriesApi || !gallery) return;
    try {
      const { data: g } = await galleriesApi.galleriesControllerUpdate({ id, updateGalleryDto: { coverImageId: imageId } });
      galleryQuery.setData({ ...gallery, ...g, items: gallery.items });
      toast('Cover updated', 'success');
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not set the cover.'), 'error');
    }
  };

  const deleteModal = useModal('gallery-delete', ConfirmModal, { title: 'Delete gallery' });
  const confirmDelete = () => {
    deleteModal.show({
      message: `Delete gallery “${gallery?.title}”?`,
      description: 'The gallery is removed (the images stay in your library). This cannot be undone.',
      danger: true,
      confirmLabel: 'Delete gallery',
      onConfirm: async () => {
        if (!galleriesApi) return;
        try {
          await galleriesApi.galleriesControllerDelete({ id });
          toast('Gallery deleted', 'success');
          navigate('/galleries');
        } catch (e) {
          toast(getApiErrorMessage(e, 'Could not delete the gallery.'), 'error');
          throw e;
        }
      },
    });
  };

  if (galleryQuery.loading && !gallery) {
    return (
      <div style={styles.scroll}>
        <Loader />
      </div>
    );
  }

  if (!gallery) {
    return (
      <div style={styles.scroll}>
        <div style={styles.content}>
          <Button label='Back' variant='secondary' icon={<FiArrowLeft size={14} />} onClick={() => navigate('/galleries')} />
          <EmptyState title='Gallery not found' description='It may have been deleted.' />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.scroll}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <Button label='Back' variant='secondary' icon={<FiArrowLeft size={14} />} onClick={() => navigate('/galleries')} />
          <div style={styles.headerTitle}>
            <span style={styles.title}>{gallery.title}</span>
            <Badge label={STATUS_LABEL[gallery.status]} tone={STATUS_TONE[gallery.status]} />
            {saving ? <span style={styles.savingHint}>Saving…</span> : null}
          </div>
          <div style={styles.headerActions}>
            <Select
              name='status'
              label='Status'
              variant='secondary'
              options={STATUS_OPTIONS}
              control={controlsForm.control}
              onValueChange={(v) => setStatus(v as GalleryStatus)}
              style={styles.statusSelect}
            />
            {gallery.status !== 'PUBLISHED' ? <Button label='Publish' onClick={() => setStatus('PUBLISHED')} /> : null}
            <Button label='Delete' variant='danger' icon={<FiTrash2 size={14} />} onClick={confirmDelete} />
          </div>
        </div>

        {/* Details */}
        <div style={styles.block}>
          <span style={styles.blockTitle}>Details</span>
          <div style={styles.detailsGrid}>
            <Input name='title' label='Title' description='Gallery title' type='text' control={detailsForm.control} />
            <Input name='slug' label='Slug' description='URL slug' type='text' control={detailsForm.control} />
          </div>
          <TextArea name='description' label='Description' description='Optional description' control={detailsForm.control} rows={4} />
          <div style={styles.detailsActions}>
            <Button label='Save details' variant='secondary' onClick={detailsForm.handleSubmit(saveDetails)} />
          </div>
        </div>

        {/* Images */}
        <div style={styles.block}>
          <div style={styles.blockHeader}>
            <div style={styles.imagesTitle}>
              <span style={styles.blockTitle}>Images</span>
              <span style={styles.imagesHint}>Drag to reorder · pick a role · set the cover.</span>
            </div>
            <Button label='Add images' icon={<FiPlus size={14} />} onClick={openMedia} />
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={<FiImage size={24} color={theme.colors.blue04} />}
              title='No images yet'
              description='Add images from your library or upload new ones.'
            />
          ) : (
            <div style={styles.grid}>
              {items.map((it, i) => {
                const cover = imgUrl(it.coverUrl);
                const isCover = gallery.coverImageId === it.imageId;
                return (
                  <div
                    key={it.imageId}
                    style={{ ...styles.tile, ...(it.role === 'HIDDEN' ? styles.tileHidden : {}) }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      const from = dragIndex.current;
                      if (from === null || from === i) return;
                      reorder(from, i);
                      dragIndex.current = i;
                    }}
                  >
                    <div
                      style={styles.tileImageWrap}
                      draggable
                      onClick={() => openPreview(it)}
                      onDragStart={() => (dragIndex.current = i)}
                      onDragEnd={() => {
                        dragIndex.current = null;
                        persist(itemsRef.current);
                      }}
                    >
                      {cover ? (
                        <img src={cover} alt='' style={styles.tileImg} loading='lazy' draggable={false} />
                      ) : (
                        <div style={styles.tileEmpty}>
                          <FiImage size={20} color={theme.colors.dark05} />
                        </div>
                      )}
                      {isCover ? (
                        <div style={styles.coverBadge} title='Gallery cover'>
                          <FiStar size={11} />
                        </div>
                      ) : null}
                      {it.localization ? (
                        <div style={styles.tileLoc}>
                          <FiMapPin size={10} /> {it.localization}
                        </div>
                      ) : null}
                      <div
                        style={styles.tileInfo}
                        title='Details'
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreview(it, true);
                        }}
                      >
                        <FiInfo size={13} />
                      </div>
                    </div>
                    <div style={styles.footer}>
                      <Select
                        name={roleField(it.imageId)}
                        label='Role'
                        variant='secondary'
                        options={ROLE_OPTIONS}
                        control={controlsForm.control}
                        onValueChange={(v) => changeRole(it.imageId, v as GalleryImageRole)}
                      />
                      <div style={styles.actionsRow}>
                        <div
                          style={{ ...styles.coverToggle, ...(isCover ? styles.coverToggleActive : {}) }}
                          onClick={() => setCover(it.imageId)}
                        >
                          <FiStar size={12} />
                          <span>{isCover ? 'Cover' : 'Set cover'}</span>
                        </div>
                        <div style={styles.editBtn} onClick={() => openImageDetails(it.imageId)} title='Edit details'>
                          <FiEdit2 size={13} />
                        </div>
                        <div style={styles.removeBtn} onClick={() => removeItem(it.imageId)} title='Remove from gallery'>
                          <FiTrash2 size={13} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <a
          href={`${import.meta.env.VITE_API_URL}/galleries/${id}`}
          target='_blank'
          rel='noreferrer'
          style={styles.apiLink}
        >
          API preview <FiExternalLink size={12} />
        </a>
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
    paddingBottom: t.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    flexWrap: 'wrap',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  savingHint: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
  block: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    flexWrap: 'wrap',
  },
  blockTitle: {
    fontWeight: 700,
    fontSize: 16,
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: t.spacing.m,
  },
  detailsActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  imagesTitle: {
    gap: 2,
    minWidth: 0,
  },
  imagesHint: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
    gap: t.spacing.m,
  },
  tile: {
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
    border: `1px solid ${t.colors.gray01 + t.colorOpacity(0.5)}`,
    cursor: 'grab',
  },
  tileHidden: {
    opacity: 0.5,
  },
  tileImageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1 / 1',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  tileImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  tileEmpty: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    color: t.colors.white,
    backgroundColor: t.colors.blue + t.colorOpacity(0.9),
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
  footer: {
    gap: t.spacing.xs,
    padding: t.spacing.s,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
  },
  coverToggle: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 30,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.8),
  },
  coverToggleActive: {
    color: t.colors.white,
    backgroundColor: t.colors.blue,
  },
  editBtn: {
    width: 30,
    minWidth: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    color: t.colors.blue04,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.8),
  },
  removeBtn: {
    width: 30,
    minWidth: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    color: t.colors.red,
    backgroundColor: t.colors.red + t.colorOpacity(0.12),
  },
  statusSelect: {
    width: 160,
  },
  apiLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: t.colors.dark05,
    textDecoration: 'none',
    width: 'fit-content',
  },
}));
