import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles } from '~/utils/theme';

type SettingEditModalProps = {
  settingId?: string;
  settingName?: string;
  serverName?: string;
  canManage?: boolean;
} & Partial<InternalModalProps>;

type SchemaType = { name: string };

export const SettingEditModal = (p: SettingEditModalProps) => {
  const styles = useStyles();
  const { serverApi } = useApi();
  const [saving, setSaving] = useState(false);
  const canManage = p.canManage ?? true;

  const formMethods = useForm<SchemaType>({ defaultValues: { name: p.settingName ?? '' } });

  const handleSave = async (data: SchemaType) => {
    if (!serverApi || !p.settingId || !canManage) return;
    setSaving(true);
    try {
      await serverApi.serverSettingsControllerPutCommand({ id: p.settingId, patchServerSettingDto: { name: data.name } });
      p.handleClose?.();
    } catch (e) {
      console.error('Error renaming setting:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div style={styles.container}>
        {p.serverName ? <span style={styles.key}>{p.serverName}</span> : null}
        <Input
          name='name'
          label='Display name'
          description='Friendly name (leave empty to use the server key)'
          disableAutofill={false}
        />
        <Button label='Save' onClick={formMethods.handleSubmit(handleSave)} loading={saving} disabled={!canManage} />
      </div>
    </FormProvider>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.s,
    width: 360,
  },
  key: {
    fontSize: 13,
    color: t.colors.dark05,
    fontFamily: 'monospace',
  },
}));
