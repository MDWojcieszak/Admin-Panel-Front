import { DragEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiImage, FiPlus } from 'react-icons/fi';
import { MdCollections } from 'react-icons/md';
import { GalleryListResponse, GalleryResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { CreateGalleryModal } from '~/routes/Galleries/modals/CreateGalleryModal';
import { imgUrl, STATUS_LABEL } from '~/routes/Galleries/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

export const GalleriesList = () => {
  const styles = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const { galleriesApi } = useApi();
  const toast = useToast();

  const galleriesQuery = useAsync<GalleryListResponse>(async () => {
    if (!galleriesApi) return undefined;
    const { data } = await galleriesApi.galleriesControllerList();
    return data;
  }, [galleriesApi]);

  const createModal = useModal('gallery-create', CreateGalleryModal, { title: 'New gallery' });

  const openCreate = () => {
    createModal.show({ onCreated: (id: string) => navigate(`/galleries/${id}`) });
  };

  // Local order for gallery drag&drop (persisted via PUT /galleries/order).
  const [ordered, setOrdered] = useState<GalleryResponse[]>([]);
  const orderedRef = useRef<GalleryResponse[]>([]);
  const dragIndex = useRef<number | null>(null);
  const setOrder = (next: GalleryResponse[]) => {
    orderedRef.current = next;
    setOrdered(next);
  };

  useEffect(() => {
    if (galleriesQuery.data) setOrder(galleriesQuery.data.galleries);
  }, [galleriesQuery.data]);

  const reorder = (from: number, to: number) => {
    const next = [...orderedRef.current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setOrder(next);
  };

  const persistOrder = async () => {
    if (!galleriesApi) return;
    try {
      const { data } = await galleriesApi.galleriesControllerReorder({
        reorderGalleriesDto: { ids: orderedRef.current.map((g) => g.id) },
      });
      galleriesQuery.setData(data);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save the gallery order.'), 'error');
      await galleriesQuery.reload();
    }
  };

  const galleries = galleriesQuery.data?.galleries ?? [];
  const galleryList = ordered.length ? ordered : galleries;

  return (
    <div style={styles.scroll}>
      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.titleWrap}>
            <h2 style={styles.heading}>Galleries</h2>
            <span style={styles.subheading}>Portfolio galleries — upload, arrange, set roles and publish.</span>
          </div>
          <div style={styles.headerActions}>
            <Button label='New gallery' icon={<FiPlus size={14} />} onClick={openCreate} />
          </div>
        </div>

        {/* Galleries grid */}
        {galleriesQuery.loading && !galleriesQuery.data ? (
          <Loader />
        ) : galleries.length === 0 ? (
          <EmptyState
            icon={<MdCollections size={26} color={theme.colors.blue04} />}
            title='No galleries yet'
            description='Create a gallery, or import loose images into a draft to get started.'
          />
        ) : (
          <div style={styles.grid}>
            {galleryList.map((g, i) => (
              <GalleryCard
                key={g.id}
                gallery={g}
                onClick={() => navigate(`/galleries/${g.id}`)}
                onDragStart={() => (dragIndex.current = i)}
                onDragOver={(e) => {
                  e.preventDefault();
                  const from = dragIndex.current;
                  if (from === null || from === i) return;
                  reorder(from, i);
                  dragIndex.current = i;
                }}
                onDragEnd={() => {
                  dragIndex.current = null;
                  persistOrder();
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const GalleryCard = ({
  gallery,
  onClick,
  onDragStart,
  onDragOver,
  onDragEnd,
}: {
  gallery: GalleryResponse;
  onClick: () => void;
  onDragStart?: () => void;
  onDragOver?: (e: DragEvent) => void;
  onDragEnd?: () => void;
}) => {
  const styles = useStyles();
  const theme = useTheme();
  const cover = imgUrl(gallery.coverUrl);
  const statusColor = {
    DRAFT: theme.colors.dark05,
    PUBLISHED: theme.colors.lightGreen,
    HIDDEN: theme.colors.yellow,
    ARCHIVED: theme.colors.red,
  }[gallery.status];
  return (
    <div
      style={styles.card}
      onClick={onClick}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div style={styles.cover}>
        {cover ? (
          <img src={cover} alt={gallery.title} style={styles.coverImg} loading='lazy' />
        ) : (
          <div style={styles.coverEmpty}>
            <FiImage size={22} color={theme.colors.dark05} />
          </div>
        )}
        <div style={{ ...styles.statusChip, color: statusColor }}>{STATUS_LABEL[gallery.status]}</div>
      </div>
      <div style={styles.cardInfo}>
        <span style={styles.cardTitle} title={gallery.title}>
          {gallery.title}
        </span>
        <span style={styles.cardMeta}>
          {gallery.imageCount} photo{gallery.imageCount === 1 ? '' : 's'}
        </span>
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
  },
  blockTitle: {
    fontWeight: 700,
    fontSize: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    flexWrap: 'wrap',
  },
  summaryMain: {
    fontWeight: 600,
  },
  summaryBadges: {
    flexDirection: 'row',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
  reprocessActions: {
    flexDirection: 'row',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: t.spacing.m,
  },
  card: {
    borderRadius: t.borderRadius.large,
    overflow: 'hidden',
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    border: `1px solid ${t.colors.gray01 + t.colorOpacity(0.5)}`,
    cursor: 'pointer',
  },
  cover: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1 / 1',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  coverImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  coverEmpty: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChip: {
    position: 'absolute',
    top: t.spacing.s,
    left: t.spacing.s,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: t.colors.white,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.72),
    padding: '3px 8px',
    borderRadius: 999,
  },
  cardInfo: {
    gap: 2,
    padding: t.spacing.s,
    minWidth: 0,
  },
  cardTitle: {
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardMeta: {
    fontSize: 12,
    color: t.colors.dark05,
  },
}));
