import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ServerCategoriesDto } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles } from '~/utils/theme';

type CategoryModalProps = {
  serverId?: string;
  category?: ServerCategoriesDto;
  canManage?: boolean;
} & Partial<InternalModalProps>;

const makeSchema = (isEdit: boolean) =>
  z.object({
    name: z.string().optional(),
    value: isEdit ? z.string().optional() : z.string().min(1, 'Value is required'),
  });
type SchemaType = { name?: string; value?: string };

export const CategoryModal = (p: CategoryModalProps) => {
  const styles = useStyles();
  const { serverApi } = useApi();
  const isEdit = Boolean(p.category);
  const canManage = p.canManage ?? true;
  const [saving, setSaving] = useState(false);

  const formMethods = useForm<SchemaType>({
    resolver: zodResolver(makeSchema(isEdit)),
    defaultValues: { name: p.category?.name ?? '', value: p.category?.value ?? '' },
  });

  const handleSave = async (data: SchemaType) => {
    if (!serverApi || !canManage) return;
    setSaving(true);
    try {
      if (isEdit && p.category) {
        await serverApi.serverControllerPatchCategory({ id: p.category.id, patchCategoryDto: { name: data.name } });
      } else if (p.serverId) {
        await serverApi.serverControllerCreateCategory({
          serverId: p.serverId,
          createCategoryDto: { name: data.name || undefined, value: data.value ?? '' },
        });
      }
      p.handleClose?.();
    } catch (e) {
      console.error('Error saving category:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div style={styles.container}>
        <Input name='name' label='Name' description='Display name' />
        {!isEdit ? <Input name='value' label='Value' description='Unique key for this category' /> : null}
        <Button
          label={isEdit ? 'Save' : 'Create category'}
          onClick={formMethods.handleSubmit(handleSave)}
          loading={saving}
          disabled={!canManage}
        />
      </div>
    </FormProvider>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.s,
    width: 360,
  },
}));
