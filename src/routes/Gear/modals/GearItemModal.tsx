import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  GearCategory,
  GearCategoryResponse,
  GearItemAdminResponse,
  GearItemResponse,
  GearMediaSource,
  GearOwnership,
  GearSystemResponse,
} from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { Switch } from '~/components/Switch';
import { TextArea } from '~/components/TextArea';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { InlineImagePicker } from '~/routes/Galleries/components/InlineImagePicker';
import { getApiErrorMessage } from '~/utils/apiError';
import { GEAR_CATEGORY_GROUPS, OWNERSHIP_LABELS, gearCategoryLabel } from '~/utils/gearCategory';
import { mkUseStyles } from '~/utils/theme';

type GearItemModalProps = {
  item?: GearItemResponse | GearItemAdminResponse;
  systems: GearSystemResponse[];
  defaultSystemId?: string;
  defaultOwnership?: GearOwnership;
  onSaved?: () => void | Promise<void>;
} & Partial<InternalModalProps>;

/** Flattened with the group as a prefix — Select takes a flat list, 39 values need the hint. */
const CATEGORY_OPTIONS = GEAR_CATEGORY_GROUPS.flatMap((group) =>
  group.categories.map((category) => ({
    label: `${group.label} · ${gearCategoryLabel(category)}`,
    value: category,
  })),
);

const OWNERSHIP_OPTIONS = Object.values(GearOwnership).map((value) => ({
  label: OWNERSHIP_LABELS[value],
  value,
}));

const optionalNumber = z
  .string()
  .optional()
  .refine((value) => !value || /^\d+$/.test(value.trim()), 'Must be a whole number');

const schema = z.object({
  category: z.string().min(1),
  ownership: z.string().min(1),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  systemId: z.string().optional(),
  description: z.string().optional(),
  acquiredAt: z.string().optional(),
  retiredAt: z.string().optional(),
  priority: optionalNumber,
  estimatedPrice: optionalNumber,
  purchaseUrl: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const toInputDate = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

/** Empty means "no value" rather than "leave alone"; the backend stamps dates itself. */
const toIsoOrNull = (value?: string): string | null => (value ? new Date(value).toISOString() : null);
const toIntOrNull = (value?: string): number | null => (value?.trim() ? Number(value.trim()) : null);

export const GearItemModal = (p: GearItemModalProps) => {
  const styles = useStyles();
  const { gearApi } = useApi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(p.item?.visible ?? true);
  const [imageId, setImageId] = useState<string | null | undefined>(undefined);
  const [coverUrl, setCoverUrl] = useState<string | null | undefined>(p.item?.coverUrl);
  const [categories, setCategories] = useState<GearCategoryResponse[]>([]);

  const admin = p.item as GearItemAdminResponse | undefined;

  const systemOptions = [
    { label: 'No system (accessory)', value: '' },
    ...p.systems.map((s) => ({ label: s.name, value: s.id })),
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: p.item?.category ?? GearCategory.Camera,
      ownership: p.item?.ownership ?? p.defaultOwnership ?? GearOwnership.Owned,
      brand: p.item?.brand ?? '',
      model: p.item?.model ?? '',
      systemId: p.item?.systemId ?? p.defaultSystemId ?? '',
      description: p.item?.description ?? '',
      acquiredAt: toInputDate(admin?.acquiredAt),
      retiredAt: toInputDate(admin?.retiredAt),
      priority: admin?.priority != null ? String(admin.priority) : '',
      estimatedPrice: admin?.estimatedPrice != null ? String(admin.estimatedPrice) : '',
      purchaseUrl: admin?.purchaseUrl ?? '',
    },
  });

  const category = useWatch({ control: form.control, name: 'category' });
  const ownership = useWatch({ control: form.control, name: 'ownership' });

  useEffect(() => {
    if (!gearApi) return;
    gearApi
      .gearControllerListCategories()
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]));
  }, [gearApi]);

  /**
   * Whether the category holds material is the backend's call, surfaced here so
   * the user can see the consequence of their pick instead of guessing.
   */
  const categoryMeta = useMemo(
    () => categories.find((item) => item.category === category),
    [categories, category],
  );

  const submit = async (data: FormValues) => {
    if (!gearApi) return;
    setLoading(true);
    try {
      const base = {
        category: data.category as GearCategory,
        ownership: data.ownership as GearOwnership,
        brand: data.brand.trim(),
        model: data.model.trim(),
        systemId: data.systemId || null,
        description: data.description?.trim() || undefined,
        acquiredAt: toIsoOrNull(data.acquiredAt),
        retiredAt: toIsoOrNull(data.retiredAt),
        priority: toIntOrNull(data.priority),
        estimatedPrice: toIntOrNull(data.estimatedPrice),
        purchaseUrl: data.purchaseUrl?.trim() || null,
        visible,
      };

      if (p.item) {
        await gearApi.gearControllerUpdate({
          id: p.item.id,
          updateGearDto: { ...base, ...(imageId !== undefined ? { imageId } : {}) },
        });
        toast('Gear updated', 'success');
      } else {
        await gearApi.gearControllerCreate({ createGearDto: { ...base, imageId: imageId ?? undefined } });
        toast('Gear added', 'success');
      }
      await p.onSaved?.();
      await p.handleClose?.();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save the gear item.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const isWishlist = ownership === GearOwnership.Wishlist;

  return (
    <div style={styles.container}>
      <div style={styles.row}>
        <Select name='category' label='Category' options={CATEGORY_OPTIONS} control={form.control} style={styles.flex} />
        <Select
          name='ownership'
          label='Ownership'
          options={OWNERSHIP_OPTIONS}
          control={form.control}
          style={styles.flex}
        />
      </div>

      {categoryMeta ? (
        <div style={styles.metaRow}>
          {categoryMeta.mediaSource === GearMediaSource.None ? (
            <span style={styles.hint}>Holds no material to secure after a shoot.</span>
          ) : (
            <>
              <Badge label={`Holds material · ${categoryMeta.mediaSource}`} tone='yellow' />
              <span style={styles.hint}>
                {categoryMeta.secureAction}
                {categoryMeta.reminderDays != null ? ` · chased after ${categoryMeta.reminderDays} days` : ''}
              </span>
            </>
          )}
        </div>
      ) : null}

      <div style={styles.row}>
        <Select name='systemId' label='System' options={systemOptions} control={form.control} style={styles.flex} />
      </div>

      <div style={styles.row}>
        <Input name='brand' label='Brand' description='e.g. Fujifilm' type='text' control={form.control} style={styles.flex} />
        <Input name='model' label='Model' description='e.g. X-T5' type='text' control={form.control} style={styles.flex} />
      </div>

      <TextArea name='description' label='Description' description='Optional notes' control={form.control} rows={3} />

      <div style={styles.row}>
        <Input
          name='acquiredAt'
          label='Acquired'
          description='Left empty, it is stamped on becoming owned'
          type='date'
          control={form.control}
          style={styles.flex}
        />
        <Input
          name='retiredAt'
          label='Retired'
          description='Left empty, it is stamped on retiring'
          type='date'
          control={form.control}
          style={styles.flex}
        />
      </div>

      <div style={styles.row}>
        {isWishlist ? (
          <Input
            name='priority'
            label='Priority'
            description='0 is a must-have; higher is less urgent'
            type='number'
            control={form.control}
            style={styles.flex}
          />
        ) : null}
        <Input
          name='estimatedPrice'
          label='Estimated price'
          description='Whole units, one currency'
          type='number'
          control={form.control}
          style={styles.flex}
        />
      </div>

      <Input
        name='purchaseUrl'
        label='Purchase link'
        description='Where to buy it'
        type='text'
        control={form.control}
      />

      <InlineImagePicker
        label='Image (optional)'
        coverUrl={coverUrl}
        onChange={(id, url) => {
          setImageId(id);
          setCoverUrl(url);
        }}
      />

      <div style={styles.visibleRow}>
        <Switch checked={visible} onChange={setVisible} label='Visible on the public site' />
        {/* Two different questions: whether to show it, and whether you own it. */}
        <span style={styles.hint}>The public portfolio only ever shows owned gear, whatever this says.</span>
      </div>

      <div style={styles.actions}>
        <Button label='Cancel' variant='secondary' onClick={() => p.handleClose?.()} />
        <Button label={p.item ? 'Save' : 'Add gear'} onClick={form.handleSubmit(submit)} loading={loading} />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.s, width: 'min(560px, 92vw)' },
  row: { flexDirection: 'row', gap: t.spacing.m },
  flex: { flex: 1, minWidth: 0 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
  hint: { fontSize: 12, color: t.colors.dark05 },
  visibleRow: { marginTop: t.spacing.xs, gap: t.spacing.xs },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: t.spacing.m, marginTop: t.spacing.s },
}));
