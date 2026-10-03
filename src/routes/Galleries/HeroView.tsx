import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiImage, FiInfo, FiMapPin, FiPlus, FiX } from 'react-icons/fi';
import { PortfolioHeroResponse, PortfolioImageResponse, PortfolioSettingsResponse } from '~/api/api';
import { PageHeader } from '~/components/PageHeader';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Input } from '~/components/Input';
import { Loader } from '~/components/Loader';
import { Switch } from '~/components/Switch';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { ImagePreviewModal } from '~/routes/Galleries/modals/ImagePreviewModal';
import { MediaSelectorModal } from '~/routes/Galleries/modals/MediaSelectorModal';
import { imgUrl } from '~/routes/Galleries/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** Coerce a free-text field to a positive integer (mirrors the backend's <1 → 1 clamp). */
const clampInt = (value: string, fallback = 1) => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 1 ? n : fallback;
};

type SettingsForm = {
  heroLimit: string;
  galleryPreviewCount: string;
  galleryPageSize: string;
  homeGalleryLimit: string;
};

/** Global display limits for the public home page. */
const HomeSettingsPanel = () => {
  const styles = useStyles();
  const { galleriesApi } = useApi();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const form = useForm<SettingsForm>({
    defaultValues: { heroLimit: '', galleryPreviewCount: '', galleryPageSize: '', homeGalleryLimit: '' },
  });

  const settingsQuery = useAsync<PortfolioSettingsResponse>(async () => {
    if (!galleriesApi) return undefined;
    const { data } = await galleriesApi.galleriesControllerGetSettings();
    return data;
  }, [galleriesApi]);

  const fill = (s: PortfolioSettingsResponse) => {
    setShowAll(s.homeGalleryLimit == null);
    form.reset({
      heroLimit: String(s.heroLimit),
      galleryPreviewCount: String(s.galleryPreviewCount),
      galleryPageSize: String(s.galleryPageSize),
      homeGalleryLimit: s.homeGalleryLimit != null ? String(s.homeGalleryLimit) : '',
    });
  };

  useEffect(() => {
    if (settingsQuery.data) fill(settingsQuery.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsQuery.data]);

  const save = async (v: SettingsForm) => {
    if (!galleriesApi) return;
    setSaving(true);
    try {
      const { data } = await galleriesApi.galleriesControllerUpdateSettings({
        updatePortfolioSettingsDto: {
          heroLimit: clampInt(v.heroLimit),
          galleryPreviewCount: clampInt(v.galleryPreviewCount),
          galleryPageSize: clampInt(v.galleryPageSize),
          homeGalleryLimit: showAll ? null : clampInt(v.homeGalleryLimit),
        },
      });
      settingsQuery.setData(data);
      fill(data);
      toast('Home settings saved', 'success');
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save home settings.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.settingsBlock}>
      <div style={styles.settingsTitleWrap}>
        <span style={styles.blockTitle}>Display limits</span>
        <span style={styles.subheading}>How many items the public home page shows.</span>
      </div>
      {settingsQuery.loading && !settingsQuery.data ? (
        <Loader />
      ) : (
        <>
          <div style={styles.settingsGrid}>
            <Input
              name='heroLimit'
              label='Hero images'
              description='Max “Selected Work” shown'
              type='number'
              control={form.control}
            />
            <Input
              name='galleryPreviewCount'
              label='Album preview'
              description='Thumbnails per album on home'
              type='number'
              control={form.control}
            />
            <Input
              name='galleryPageSize'
              label='Gallery page size'
              description='Images per page in a gallery'
              type='number'
              control={form.control}
            />
            <Input
              name='homeGalleryLimit'
              label='Galleries on home'
              description={showAll ? 'Showing all albums' : 'Max albums on home'}
              type='number'
              control={form.control}
              style={showAll ? styles.disabledField : undefined}
            />
          </div>
          <div style={styles.settingsFooter}>
            <Switch checked={showAll} onChange={setShowAll} label='Show all albums on home' />
            <Button label='Save settings' variant='secondary' onClick={form.handleSubmit(save)} loading={saving} />
          </div>
        </>
      )}
    </div>
  );
};

export const HeroView = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { galleriesApi } = useApi();
  const toast = useToast();

  const [items, setItems] = useState<PortfolioImageResponse[]>([]);
  const itemsRef = useRef<PortfolioImageResponse[]>([]);
  const dragIndex = useRef<number | null>(null);
  const [saving, setSaving] = useState(false);
  const setLocal = (next: PortfolioImageResponse[]) => {
    itemsRef.current = next;
    setItems(next);
  };

  const heroQuery = useAsync<PortfolioHeroResponse>(async () => {
    if (!galleriesApi) return undefined;
    const { data } = await galleriesApi.galleriesControllerGetHero();
    return data;
  }, [galleriesApi]);

  useEffect(() => {
    if (heroQuery.data) setLocal(heroQuery.data.images);
  }, [heroQuery.data]);

  const persist = async (ids: string[]) => {
    if (!galleriesApi) return;
    setSaving(true);
    try {
      const { data } = await galleriesApi.galleriesControllerSetHero({ setHeroDto: { imageIds: ids } });
      setLocal(data.images);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save the hero selection.'), 'error');
      await heroQuery.reload();
    } finally {
      setSaving(false);
    }
  };

  const reorder = (from: number, to: number) => {
    const next = [...itemsRef.current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setLocal(next);
  };

  const previewModal = useModal('hero-image-preview', ImagePreviewModal, { title: 'Preview' });
  const mediaModal = useModal('hero-media', MediaSelectorModal, { title: 'Add to Selected Work' });

  const openAdd = () =>
    mediaModal.show({
      currentImageIds: itemsRef.current.map((i) => i.imageId),
      onAdd: async (ids: string[]) => {
        const have = new Set(itemsRef.current.map((i) => i.imageId));
        const merged = [...itemsRef.current.map((i) => i.imageId), ...ids.filter((id) => !have.has(id))];
        if (merged.length === itemsRef.current.length) {
          toast('Those images are already in Selected Work', 'info');
          return;
        }
        await persist(merged);
      },
    });

  return (
    <div style={styles.scroll}>
      <div style={styles.content}>
        <PageHeader title='Settings' />

        <HomeSettingsPanel />

        <div style={styles.sectionHeader}>
          <div style={styles.titleWrap}>
            <h3 style={styles.sectionTitle}>Selected Work</h3>
            <span style={styles.subheading}>Hand-picked, in order. Separate from the HERO role inside galleries.</span>
          </div>
          <div style={styles.headerActions}>
            {saving ? <span style={styles.savingHint}>Saving…</span> : null}
            <Button label='Add images' icon={<FiPlus size={14} />} onClick={openAdd} />
          </div>
        </div>

        {heroQuery.loading && !heroQuery.data ? (
          <Loader />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<FiImage size={26} color={theme.colors.blue04} />}
            title='No hero images yet'
            description='Add images to curate the home-page “Selected Work”.'
          />
        ) : (
          <div style={styles.grid}>
            {items.map((it, i) => {
              const cover = imgUrl(it.coverUrl);
              return (
                <div
                  key={it.imageId}
                  style={styles.tile}
                  onDragOver={(e) => {
                    e.preventDefault();
                    const from = dragIndex.current;
                    if (from === null || from === i) return;
                    reorder(from, i);
                    dragIndex.current = i;
                  }}
                >
                  <div
                    style={styles.imageWrap}
                    draggable
                    onClick={() =>
                      previewModal.show({
                        imageId: it.imageId,
                        coverUrl: it.coverUrl,
                        localization: it.localization,
                        exif: it.exif,
                      })
                    }
                    onDragStart={() => (dragIndex.current = i)}
                    onDragEnd={() => {
                      dragIndex.current = null;
                      persist(itemsRef.current.map((x) => x.imageId));
                    }}
                  >
                    {cover ? <img src={cover} alt='' style={styles.img} loading='lazy' draggable={false} /> : null}
                    <div style={styles.orderBadge}>{i + 1}</div>
                    {it.localization ? (
                      <div style={styles.loc}>
                        <FiMapPin size={10} /> {it.localization}
                      </div>
                    ) : null}
                    <div
                      style={styles.info}
                      title='Details'
                      onClick={(e) => {
                        e.stopPropagation();
                        previewModal.show({
                          imageId: it.imageId,
                          coverUrl: it.coverUrl,
                          initialInfo: true,
                          localization: it.localization,
                          exif: it.exif,
                        });
                      }}
                    >
                      <FiInfo size={13} />
                    </div>
                    <div
                      style={styles.remove}
                      title='Remove from Selected Work'
                      onClick={(e) => {
                        e.stopPropagation();
                        persist(itemsRef.current.filter((x) => x.imageId !== it.imageId).map((x) => x.imageId));
                      }}
                    >
                      <FiX size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  scroll: { height: '100%', minHeight: 0, width: '100%', overflowY: 'auto' },
  content: { gap: t.spacing.l, paddingBottom: t.spacing.m },
  titleWrap: { gap: 2, minWidth: 0 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  sectionTitle: { fontSize: 17, fontWeight: 700 },
  subheading: { fontSize: 13, color: t.colors.dark05, maxWidth: 620 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.m },
  savingHint: { fontSize: 12, color: t.colors.dark05 },
  settingsBlock: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    border: `1px solid ${t.colors.gray01 + t.colorOpacity(0.5)}`,
  },
  settingsTitleWrap: { gap: 2, minWidth: 0 },
  blockTitle: { fontWeight: 700, fontSize: 16 },
  settingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: t.spacing.m,
  },
  disabledField: { opacity: 0.4, pointerEvents: 'none' },
  settingsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    flexWrap: 'wrap',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: t.spacing.m,
  },
  tile: { borderRadius: t.borderRadius.large, overflow: 'hidden' },
  imageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: t.borderRadius.large,
    overflow: 'hidden',
    cursor: 'grab',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  img: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  orderBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    color: t.colors.white,
    backgroundColor: t.colors.blue + t.colorOpacity(0.9),
    padding: '0 6px',
  },
  loc: {
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
  info: {
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
  remove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: t.colors.red + t.colorOpacity(0.85),
  },
}));
