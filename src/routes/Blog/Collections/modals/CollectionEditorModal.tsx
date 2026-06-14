import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { MdArrowDownward, MdArrowUpward, MdClose } from 'react-icons/md';
import { CollectionSummaryResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { Switch } from '~/components/Switch';
import { TextArea } from '~/components/TextArea';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { PoiPicker } from '~/routes/Blog/Editor/components/PoiPicker';
import { countryName, useBlogCountries } from '~/routes/Blog/hooks/useBlogCountries';
import { useBlogLocales } from '~/routes/Blog/hooks/useBlogLocales';
import { mkUseStyles, useTheme } from '~/utils/theme';

type CollectionEditorModalProps = {
  collection?: CollectionSummaryResponse;
  canManage?: boolean;
} & Partial<InternalModalProps>;

type Item = { id?: string; poiId: string; poiName: string };
type FormShape = {
  slug: string;
  region: string;
  countryId: string;
  title: Record<string, string>;
  description: Record<string, string>;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const CollectionEditorModal = (p: CollectionEditorModalProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { blogCollectionsApi } = useApi();
  const { locales, defaultLocale } = useBlogLocales();
  const toast = useToast();
  const isEdit = Boolean(p.collection);
  const canManage = p.canManage ?? true;
  const baseLocale = defaultLocale || 'en';
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(p.collection?.isPublic ?? false);
  const [items, setItems] = useState<Item[]>([]);

  const [activeLang, setActiveLang] = useState('');
  useEffect(() => {
    if (!activeLang && defaultLocale) setActiveLang(defaultLocale);
  }, [defaultLocale, activeLang]);

  const { countries } = useBlogCountries();
  const countryOptions = [
    { value: '', label: 'No country' },
    ...countries.map((c) => ({ value: c.id, label: countryName(c, baseLocale) })),
  ];

  const { control, getValues, reset, setValue, handleSubmit } = useForm<FormShape>({
    defaultValues: {
      slug: p.collection?.slug ?? '',
      region: p.collection?.region ?? '',
      countryId: '',
      title: p.collection?.title ? { [baseLocale]: p.collection.title } : {},
      description: {},
    },
  });
  const titles = useWatch({ control, name: 'title' }) ?? {};

  const loadDetails = useCallback(async () => {
    if (!blogCollectionsApi || !p.collection) return;
    try {
      const { data } = await blogCollectionsApi.collectionControllerGetById({ id: p.collection.id });
      const title: Record<string, string> = {};
      const description: Record<string, string> = {};
      data.translations.forEach((tr) => {
        if (tr.title) title[tr.locale] = tr.title;
        if (tr.description) description[tr.locale] = tr.description;
      });
      reset({ slug: p.collection.slug, region: p.collection.region ?? '', countryId: getValues('countryId'), title, description });
      setItems([...data.items].sort((a, b) => a.rank - b.rank).map((i) => ({ id: i.id, poiId: i.poiId, poiName: i.poiName })));
    } catch (e) {
      console.error('Error loading collection:', e);
    }
  }, [blogCollectionsApi, p.collection, reset, getValues]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  // Country is a FK; responses carry the slug — resolve it once the list loads.
  useEffect(() => {
    if (!p.collection?.country || !countries.length) return;
    const match = countries.find((c) => c.slug === p.collection?.country);
    if (match) setValue('countryId', match.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, p.collection?.country]);

  // Auto-fill the slug from the default-language title until the user edits the slug by hand.
  const baseTitle = useWatch({ control, name: `title.${baseLocale}` });
  const autoSlug = useRef('');
  useEffect(() => {
    if (isEdit) return;
    const current = getValues('slug');
    if (current && current !== autoSlug.current) return;
    const next = slugify(baseTitle || '');
    autoSlug.current = next;
    setValue('slug', next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTitle]);

  const addItem = async (poiId: string, poiName: string) => {
    if (items.some((i) => i.poiId === poiId)) return;
    if (isEdit && p.collection && blogCollectionsApi) {
      try {
        await blogCollectionsApi.collectionControllerAddItem({ id: p.collection.id, addCollectionItemDto: { poiId } });
        loadDetails();
      } catch (e) {
        console.error('Error adding item:', e);
      }
    } else {
      setItems((prev) => [...prev, { poiId, poiName }]);
    }
  };

  const removeItem = async (item: Item) => {
    if (isEdit && p.collection && item.id && blogCollectionsApi) {
      try {
        await blogCollectionsApi.collectionControllerDeleteItem({ id: p.collection.id, itemId: item.id });
      } catch (e) {
        console.error('Error removing item:', e);
      }
    }
    setItems((prev) => prev.filter((i) => i.poiId !== item.poiId));
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const swap = idx + dir;
    if (swap < 0 || swap >= items.length) return;
    const next = [...items];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setItems(next);
    if (isEdit && p.collection && blogCollectionsApi) {
      try {
        await blogCollectionsApi.collectionControllerReorderItems({
          id: p.collection.id,
          reorderCollectionItemsDto: { items: next.map((it, i) => ({ id: it.id as string, rank: i + 1 })) },
        });
      } catch (e) {
        console.error('Error reordering items:', e);
        loadDetails();
      }
    }
  };

  const handleSave = handleSubmit(async (data) => {
    if (!blogCollectionsApi || !canManage) return;
    const titleBase = data.title[baseLocale]?.trim();
    if (!data.slug.trim() || !titleBase) {
      toast('Slug and the default-language title are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      let id = p.collection?.id;
      if (isEdit && p.collection) {
        await blogCollectionsApi.collectionControllerPatch({
          id: p.collection.id,
          patchCollectionDto: { slug: data.slug, countryId: data.countryId || null, region: data.region || null, isPublic },
        });
      } else {
        const res = await blogCollectionsApi.collectionControllerCreate({
          createCollectionDto: {
            slug: data.slug,
            title: titleBase,
            description: data.description[baseLocale] || undefined,
            countryId: data.countryId || null,
            region: data.region || null,
            isPublic,
            locale: baseLocale,
          },
        });
        id = res.data.id;
      }

      if (id) {
        for (const loc of locales.map((l) => l.code)) {
          const title = data.title[loc]?.trim();
          if (!title) continue;
          if (!isEdit && loc === baseLocale) continue;
          await blogCollectionsApi.collectionControllerUpsertTranslation({
            id,
            locale: loc,
            upsertCollectionTranslationDto: { title, description: data.description[loc] || null },
          });
        }
        if (!isEdit) {
          for (const it of items) {
            await blogCollectionsApi.collectionControllerAddItem({ id, addCollectionItemDto: { poiId: it.poiId } });
          }
        }
      }
      p.handleClose?.();
    } catch (e) {
      const err = e as { response?: { status?: number } };
      console.error('Error saving collection:', e);
      toast(err.response?.status === 409 ? 'That slug is already taken.' : 'Could not save the collection.', 'error');
    } finally {
      setSaving(false);
    }
  });

  return (
    <div style={styles.container}>
      {/* Localized title + description with in-modal language tabs (remount per tab via key) */}
      <div style={styles.langRow}>
        <span style={styles.langLabel}>Language</span>
        <div style={styles.langTabs}>
          {locales.map((l) => {
            const active = l.code === activeLang;
            return (
              <button
                key={l.code}
                type='button'
                style={{
                  ...styles.langTab,
                  color: active ? theme.colors.white : theme.colors.dark05,
                  backgroundColor: active ? theme.colors.blue + theme.colorOpacity(0.25) : 'transparent',
                }}
                onClick={() => setActiveLang(l.code)}
              >
                {l.code.toUpperCase()}
                {titles[l.code] ? <span style={styles.dot} /> : null}
              </button>
            );
          })}
        </div>
      </div>
      <Input
        key={`t-${activeLang}`}
        name={`title.${activeLang}`}
        label={`Title (${activeLang.toUpperCase()})`}
        description=''
        control={control}
        disableAutofill={false}
      />
      <TextArea
        key={`d-${activeLang}`}
        name={`description.${activeLang}`}
        label={`Description (${activeLang.toUpperCase()})`}
        description='Optional'
        control={control}
      />

      <Input name='slug' label='Slug' description='URL key, unique' control={control} disableAutofill={false} />

      <div style={styles.row}>
        <Select label='Country' name='countryId' control={control} options={countryOptions} style={styles.flex} />
        <Input name='region' label='Region' description='Optional' control={control} style={styles.flex} disableAutofill={false} />
      </div>

      <div style={styles.publicRow}>
        <span style={styles.publicLabel}>Public</span>
        <Switch checked={isPublic} onChange={setIsPublic} disabled={!canManage} />
      </div>

      {/* Ranked places — pickable on create and edit. */}
      <div style={styles.itemsSection}>
        <span style={styles.sectionLabel}>Ranked places</span>
        {items.map((it, i) => (
          <div key={it.poiId} style={styles.itemRow}>
            <span style={styles.rank}>{i + 1}</span>
            <span style={styles.poiName}>{it.poiName}</span>
            <button style={styles.iconBtn} disabled={i === 0} onClick={() => move(i, -1)}>
              <MdArrowUpward size={16} color={i === 0 ? theme.colors.dark04 : theme.colors.white} />
            </button>
            <button style={styles.iconBtn} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
              <MdArrowDownward size={16} color={i === items.length - 1 ? theme.colors.dark04 : theme.colors.white} />
            </button>
            <button style={styles.iconBtn} onClick={() => removeItem(it)}>
              <MdClose size={16} color={theme.colors.red} />
            </button>
          </div>
        ))}
        <PoiPicker onPick={addItem} />
      </div>

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
  row: { flexDirection: 'row', gap: t.spacing.m, alignItems: 'flex-start' },
  flex: { flex: 1, minWidth: 0 },
  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  langLabel: { fontSize: 12, fontWeight: 600, color: t.colors.blue04 },
  langTabs: {
    flexDirection: 'row',
    gap: 4,
    padding: 3,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
  },
  langTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 40,
    height: 26,
    paddingLeft: t.spacing.s,
    paddingRight: t.spacing.s,
    border: 0,
    cursor: 'pointer',
    borderRadius: t.borderRadius.small,
    fontSize: 12,
    fontWeight: 700,
  },
  dot: { width: 6, height: 6, borderRadius: '50%', backgroundColor: t.colors.lightGreen },
  publicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: t.spacing.xs,
    paddingBottom: t.spacing.xs,
  },
  publicLabel: { fontSize: 14, fontWeight: 600, color: t.colors.white },
  itemsSection: {
    gap: t.spacing.s,
    paddingTop: t.spacing.m,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  sectionLabel: { fontSize: 12, fontWeight: 600, color: t.colors.blue04 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  rank: { width: 22, minWidth: 22, textAlign: 'center', fontWeight: 800, color: t.colors.blue04 },
  poiName: { flex: 1, minWidth: 0, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
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
}));
