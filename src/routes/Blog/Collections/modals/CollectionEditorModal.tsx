import { useCallback, useEffect, useState } from 'react';
import { MdArrowDownward, MdArrowUpward, MdClose } from 'react-icons/md';
import { CollectionItemAdminResponse, CollectionSummaryResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { PoiPicker } from '~/routes/Blog/Editor/components/PoiPicker';
import { mkUseStyles, useTheme } from '~/utils/theme';

type CollectionEditorModalProps = {
  collection?: CollectionSummaryResponse;
  locale?: string;
  canManage?: boolean;
} & Partial<InternalModalProps>;

export const CollectionEditorModal = (p: CollectionEditorModalProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { blogCollectionsApi } = useApi();
  const isEdit = Boolean(p.collection);
  const canManage = p.canManage ?? true;
  const locale = p.locale ?? 'en';
  const [saving, setSaving] = useState(false);

  const [slug, setSlug] = useState(p.collection?.slug ?? '');
  const [title, setTitle] = useState(p.collection?.title ?? '');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState(p.collection?.country ?? '');
  const [region, setRegion] = useState(p.collection?.region ?? '');
  const [isPublic, setIsPublic] = useState(p.collection?.isPublic ?? false);
  const [items, setItems] = useState<CollectionItemAdminResponse[]>([]);

  const loadDetails = useCallback(async () => {
    if (!blogCollectionsApi || !p.collection) return;
    try {
      const { data } = await blogCollectionsApi.collectionControllerGetById({ id: p.collection.id });
      const tr = data.translations.find((t) => t.locale === locale);
      setTitle(tr?.title ?? data.translations[0]?.title ?? '');
      setDescription(tr?.description ?? '');
      setItems([...data.items].sort((a, b) => a.rank - b.rank));
    } catch (e) {
      console.error('Error loading collection:', e);
    }
  }, [blogCollectionsApi, p.collection, locale]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handleSave = async () => {
    if (!blogCollectionsApi || !canManage || !slug.trim() || !title.trim()) return;
    setSaving(true);
    try {
      if (isEdit && p.collection) {
        await blogCollectionsApi.collectionControllerPatch({
          id: p.collection.id,
          patchCollectionDto: { slug, country: country || null, region: region || null, isPublic },
        });
        await blogCollectionsApi.collectionControllerUpsertTranslation({
          id: p.collection.id,
          locale,
          upsertCollectionTranslationDto: { title, description: description || null },
        });
      } else {
        await blogCollectionsApi.collectionControllerCreate({
          createCollectionDto: {
            slug,
            title,
            description: description || undefined,
            country: country || null,
            region: region || null,
            isPublic,
            locale,
          },
        });
      }
      p.handleClose?.();
    } catch (e) {
      console.error('Error saving collection:', e);
    } finally {
      setSaving(false);
    }
  };

  const addItem = async (poiId: string) => {
    if (!blogCollectionsApi || !p.collection) return;
    try {
      await blogCollectionsApi.collectionControllerAddItem({ id: p.collection.id, addCollectionItemDto: { poiId } });
      loadDetails();
    } catch (e) {
      console.error('Error adding item:', e);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!blogCollectionsApi || !p.collection) return;
    try {
      await blogCollectionsApi.collectionControllerDeleteItem({ id: p.collection.id, itemId });
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (e) {
      console.error('Error removing item:', e);
    }
  };

  const move = async (itemId: string, dir: -1 | 1) => {
    if (!blogCollectionsApi || !p.collection) return;
    const idx = items.findIndex((i) => i.id === itemId);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= items.length) return;
    const next = [...items];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setItems(next);
    try {
      await blogCollectionsApi.collectionControllerReorderItems({
        id: p.collection.id,
        reorderCollectionItemsDto: { items: next.map((it, i) => ({ id: it.id, rank: i + 1 })) },
      });
    } catch (e) {
      console.error('Error reordering items:', e);
      loadDetails();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.row}>
        <div style={styles.field}>
          <span style={styles.label}>Title ({locale.toUpperCase()})</span>
          <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Best of Iceland' />
        </div>
        <div style={styles.field}>
          <span style={styles.label}>Slug</span>
          <input style={styles.input} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder='best-of-iceland' />
        </div>
      </div>
      <div style={styles.field}>
        <span style={styles.label}>Description ({locale.toUpperCase()})</span>
        <textarea style={styles.textarea} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div style={styles.row}>
        <div style={styles.field}>
          <span style={styles.label}>Country</span>
          <input style={styles.input} value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
        <div style={styles.field}>
          <span style={styles.label}>Region</span>
          <input style={styles.input} value={region} onChange={(e) => setRegion(e.target.value)} />
        </div>
      </div>
      <label style={styles.checkboxRow}>
        <input type='checkbox' checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Public
      </label>

      {isEdit && p.collection ? (
        <div style={styles.itemsSection}>
          <span style={styles.label}>Ranked places</span>
          {items.map((it, i) => (
            <div key={it.id} style={styles.itemRow}>
              <span style={styles.rank}>{i + 1}</span>
              <span style={styles.poiName}>{it.poiName}</span>
              <button style={styles.iconBtn} disabled={i === 0} onClick={() => move(it.id, -1)}>
                <MdArrowUpward size={16} color={i === 0 ? theme.colors.dark04 : theme.colors.white} />
              </button>
              <button style={styles.iconBtn} disabled={i === items.length - 1} onClick={() => move(it.id, 1)}>
                <MdArrowDownward size={16} color={i === items.length - 1 ? theme.colors.dark04 : theme.colors.white} />
              </button>
              <button style={styles.iconBtn} onClick={() => removeItem(it.id)}>
                <MdClose size={16} color={theme.colors.red} />
              </button>
            </div>
          ))}
          <PoiPicker onPick={addItem} />
        </div>
      ) : (
        <span style={styles.editHint}>Create the collection first, then reopen it to rank places.</span>
      )}

      <Button label={isEdit ? 'Save collection' : 'Create collection'} onClick={handleSave} loading={saving} disabled={!canManage} />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.s,
    width: 520,
    maxHeight: '76vh',
    overflowY: 'auto',
    paddingRight: t.spacing.s,
  },
  row: {
    flexDirection: 'row',
    gap: t.spacing.m,
  },
  field: {
    flex: 1,
    minWidth: 0,
    gap: t.spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: t.colors.blue04,
  },
  input: {
    height: 38,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 14,
  },
  textarea: {
    boxSizing: 'border-box',
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 14,
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    fontSize: 14,
    cursor: 'pointer',
  },
  itemsSection: {
    gap: t.spacing.s,
    paddingTop: t.spacing.m,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  rank: {
    width: 22,
    minWidth: 22,
    textAlign: 'center',
    fontWeight: 800,
    color: t.colors.blue04,
  },
  poiName: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  iconBtn: {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
  },
  editHint: {
    fontSize: 12,
    color: t.colors.dark05,
    paddingTop: t.spacing.s,
  },
}));
