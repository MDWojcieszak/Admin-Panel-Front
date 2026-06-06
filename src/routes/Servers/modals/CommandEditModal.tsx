import { useState } from 'react';
import { Button } from '~/components/Button';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles } from '~/utils/theme';

type CommandEditModalProps = {
  commandId?: string;
  commandName?: string;
  canManage?: boolean;
} & Partial<InternalModalProps>;

export const CommandEditModal = (p: CommandEditModalProps) => {
  const styles = useStyles();
  const { serverApi } = useApi();
  const [name, setName] = useState(p.commandName ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const canManage = p.canManage ?? true;

  const handleSave = async () => {
    if (!serverApi || !p.commandId || !canManage) return;
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setError(undefined);
    setSaving(true);
    try {
      await serverApi.serverCommandsControllerPutCommand({ id: p.commandId, patchServerCommandDto: { name } });
      p.handleClose?.();
    } catch (e) {
      console.error('Error renaming command:', e);
      setError('Could not rename the command');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>Display name</label>
      <input
        style={styles.input}
        value={name}
        disabled={!canManage}
        onChange={(e) => setName(e.target.value)}
        placeholder='Command name'
      />
      {error ? <span style={styles.error}>{error}</span> : null}
      <Button label='Save' onClick={handleSave} loading={saving} disabled={!canManage} />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    width: 360,
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
