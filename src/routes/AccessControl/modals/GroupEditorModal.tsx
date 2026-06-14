import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PermissionGroupResponseDto } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { TextArea } from '~/components/TextArea';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { usePermissions } from '~/hooks/usePermissions';
import { PermissionPicker } from '~/routes/AccessControl/components/PermissionPicker';
import { usePermissionCatalog } from '~/routes/AccessControl/hooks/usePermissionCatalog';
import { mkUseStyles } from '~/utils/theme';

type GroupEditorModalProps = {
  group?: PermissionGroupResponseDto;
  canManage?: boolean;
} & Partial<InternalModalProps>;

const Schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});
type SchemaType = z.infer<typeof Schema>;

export const GroupEditorModal = (p: GroupEditorModalProps) => {
  const styles = useStyles();
  const { aclApi } = useApi();
  const { refresh: refreshPermissions } = usePermissions();
  const { grouped } = usePermissionCatalog();

  const [permissions, setPermissions] = useState<string[]>(p.group?.permissions ?? []);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(p.group);
  const canManage = p.canManage ?? true;

  const formMethods = useForm<SchemaType>({
    resolver: zodResolver(Schema),
    defaultValues: { name: p.group?.name ?? '', description: p.group?.description ?? '' },
  });

  const handleSave = async (data: SchemaType) => {
    if (!aclApi || !canManage) return;
    setLoading(true);
    try {
      const payload = { name: data.name, description: data.description ?? '', permissions };
      if (isEdit && p.group) {
        await aclApi.aclControllerUpdateGroup({ id: p.group.id, updatePermissionGroupDto: payload });
      } else {
        await aclApi.aclControllerCreateGroup({ createPermissionGroupDto: payload });
      }
      await refreshPermissions();
      p.handleClose?.();
    } catch (e) {
      console.error('Error saving permission group:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div style={styles.container}>
        <Input name='name' label='Name' description='e.g. Server operators' />
        <TextArea name='description' label='Description' description='Optional description' />
        <div style={styles.field}>
          <label style={styles.label}>Permissions ({permissions.length})</label>
          <PermissionPicker grouped={grouped} value={permissions} onChange={setPermissions} disabled={!canManage} />
        </div>
        <Button
          label={isEdit ? 'Save changes' : 'Create group'}
          onClick={formMethods.handleSubmit(handleSave)}
          loading={loading}
          disabled={!canManage}
        />
      </div>
    </FormProvider>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    width: 'min(760px, 88vw)',
  },
  field: {
    gap: t.spacing.s,
  },
  label: {
    fontSize: 12,
    color: t.colors.blue04,
  },
}));
