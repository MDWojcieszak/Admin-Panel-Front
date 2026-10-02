import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { GearSystemResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Switch } from '~/components/Switch';
import { TextArea } from '~/components/TextArea';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { InlineImagePicker } from '~/routes/Galleries/components/InlineImagePicker';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type GearSystemModalProps = {
  system?: GearSystemResponse;
  onSaved?: () => void | Promise<void>;
} & Partial<InternalModalProps>;

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  label: z.string().optional(),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export const GearSystemModal = (p: GearSystemModalProps) => {
  const styles = useStyles();
  const { gearApi } = useApi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(p.system?.visible ?? true);
  const [imageId, setImageId] = useState<string | null | undefined>(undefined); // undefined = keep existing
  const [coverUrl, setCoverUrl] = useState<string | null | undefined>(p.system?.coverUrl);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: p.system?.name ?? '',
      label: p.system?.label ?? '',
      description: p.system?.description ?? '',
    },
  });

  const submit = async (data: FormValues) => {
    if (!gearApi) return;
    setLoading(true);
    try {
      const base = {
        name: data.name.trim(),
        label: data.label?.trim() || undefined,
        description: data.description?.trim() || undefined,
        visible,
      };
      if (p.system) {
        await gearApi.gearControllerUpdateSystem({
          id: p.system.id,
          updateGearSystemDto: { ...base, ...(imageId !== undefined ? { imageId } : {}) },
        });
        toast('System updated', 'success');
      } else {
        await gearApi.gearControllerCreateSystem({
          createGearSystemDto: { ...base, imageId: imageId ?? undefined },
        });
        toast('System created', 'success');
      }
      await p.onSaved?.();
      await p.handleClose?.();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save the system.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Input name='name' label='Name' description='e.g. Fujifilm X' type='text' control={form.control} />
      <Input name='label' label='Label' description='e.g. APS-C (optional)' type='text' control={form.control} />
      <TextArea name='description' label='Description' description='Why this system (optional)' control={form.control} rows={3} />
      <InlineImagePicker
        label='System image (optional)'
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
        <Button label={p.system ? 'Save system' : 'Create system'} onClick={form.handleSubmit(submit)} loading={loading} />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.s, width: 460 },
  visibleRow: { marginTop: t.spacing.xs },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: t.spacing.m, marginTop: t.spacing.s },
}));
