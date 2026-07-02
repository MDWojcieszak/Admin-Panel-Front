import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { GearCategory, GearItemResponse, GearSystemResponse } from '~/api/api';
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
import { mkUseStyles } from '~/utils/theme';

type GearItemModalProps = {
  item?: GearItemResponse;
  systems: GearSystemResponse[];
  defaultSystemId?: string;
  onSaved?: () => void | Promise<void>;
} & Partial<InternalModalProps>;

const CATEGORY_OPTIONS = Object.values(GearCategory).map((c) => ({ label: c, value: c }));

const schema = z.object({
  category: z.string().min(1),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  systemId: z.string().optional(),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export const GearItemModal = (p: GearItemModalProps) => {
  const styles = useStyles();
  const { gearApi } = useApi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(p.item?.visible ?? true);
  const [imageId, setImageId] = useState<string | null | undefined>(undefined);
  const [coverUrl, setCoverUrl] = useState<string | null | undefined>(p.item?.coverUrl);

  const systemOptions = [
    { label: 'No system (accessory)', value: '' },
    ...p.systems.map((s) => ({ label: s.name, value: s.id })),
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: p.item?.category ?? GearCategory.Camera,
      brand: p.item?.brand ?? '',
      model: p.item?.model ?? '',
      systemId: p.item?.systemId ?? p.defaultSystemId ?? '',
      description: p.item?.description ?? '',
    },
  });

  const submit = async (data: FormValues) => {
    if (!gearApi) return;
    setLoading(true);
    try {
      const base = {
        category: data.category as GearCategory,
        brand: data.brand.trim(),
        model: data.model.trim(),
        systemId: data.systemId || null,
        description: data.description?.trim() || undefined,
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

  return (
    <div style={styles.container}>
      <div style={styles.row}>
        <Select name='category' label='Category' options={CATEGORY_OPTIONS} control={form.control} style={styles.flex} />
        <Select name='systemId' label='System' options={systemOptions} control={form.control} style={styles.flex} />
      </div>
      <div style={styles.row}>
        <Input name='brand' label='Brand' description='e.g. Fujifilm' type='text' control={form.control} style={styles.flex} />
        <Input name='model' label='Model' description='e.g. X-T5' type='text' control={form.control} style={styles.flex} />
      </div>
      <TextArea name='description' label='Description' description='Optional notes' control={form.control} rows={3} />
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
      </div>
      <div style={styles.actions}>
        <Button label='Cancel' variant='secondary' onClick={() => p.handleClose?.()} />
        <Button label={p.item ? 'Save' : 'Add gear'} onClick={form.handleSubmit(submit)} loading={loading} />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.s, width: 'min(520px, 92vw)' },
  row: { flexDirection: 'row', gap: t.spacing.m },
  flex: { flex: 1, minWidth: 0 },
  visibleRow: { marginTop: t.spacing.xs },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: t.spacing.m, marginTop: t.spacing.s },
}));
