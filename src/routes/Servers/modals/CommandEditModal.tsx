import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles } from '~/utils/theme';

type CommandEditModalProps = {
  commandId?: string;
  commandName?: string;
  canManage?: boolean;
} & Partial<InternalModalProps>;

const Schema = z.object({
  name: z.string().min(1, 'Name is required'),
});
type SchemaType = z.infer<typeof Schema>;

export const CommandEditModal = (p: CommandEditModalProps) => {
  const styles = useStyles();
  const { serverApi } = useApi();
  const [saving, setSaving] = useState(false);
  const canManage = p.canManage ?? true;

  const formMethods = useForm<SchemaType>({
    resolver: zodResolver(Schema),
    defaultValues: { name: p.commandName ?? '' },
  });

  const handleSave = async (data: SchemaType) => {
    if (!serverApi || !p.commandId || !canManage) return;
    setSaving(true);
    try {
      await serverApi.serverCommandsControllerPutCommand({ id: p.commandId, patchServerCommandDto: { name: data.name } });
      p.handleClose?.();
    } catch (e) {
      console.error('Error renaming command:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div style={styles.container}>
        <Input
          name='name'
          label='Display name'
          description='Friendly name for the command'
          type='text'
          disableAutofill={false}
        />
        <Button
          label='Save'
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
    gap: t.spacing.m,
    width: 360,
  },
}));
