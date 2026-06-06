import { useState } from 'react';
import { Button } from '~/components/Button';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles } from '~/utils/theme';

type SettingEditModalProps = {
  settingId?: string;
  settingName?: string;
  serverName?: string;
  canManage?: boolean;
} & Partial<InternalModalProps>;

export const SettingEditModal = (p: SettingEditModalProps) => {
  const styles = useStyles();
  const { serverApi } = useApi();
  const [name, setName] = useState(p.settingName ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const canManage = p.canManage ?? true;

  const handleSave = async () => {
    if (!serverApi || !p.settingId || !canManage) return;
    setError(undefined);
    setSaving(true);
    try {
      await serverApi.serverSettingsControllerPutCommand({ id: p.settingId, patchServerSettingDto: { name } });
      p.handleClose?.();
    } catch (e) {
      console.error('Error renaming setting:', e);
      setError('Could not save the name');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      {p.serverName ? <span style={styles.key}>{p.serverName}</span> : null}
      <label style={styles.label}>Display name</label>
      <input
        style={styles.input}
        value={name}
        disabled={!canManage}
        onChange={(e) => setName(e.target.value)}
        placeholder='Friendly name (leave empty to use the server key)'
      />
      {error ? <span style={styles.error}>{error}</span> : null}
      <Button label='Save' onClick={handleSave} loading={saving} disabled={!canManage} />
    </div>
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
  label: {
    fontSize: 12,
    color: t.colors.blue04,
  },
  input: {
    padding: t.spacing.m,
    color: t.colors.white,
    fontSize: 16,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    border: 0,
    outline: 'none',
  },
  error: {
    color: t.colors.red,
    fontSize: 14,
  },
}));
