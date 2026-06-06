import { useState } from 'react';
import { CreateServerTransferDto, ServerTransferMode, ServerTransferResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles } from '~/utils/theme';

type TransferModalProps = {
  categoryId?: string;
  transfer?: ServerTransferResponse;
  canManage?: boolean;
} & Partial<InternalModalProps>;

export const TransferModal = (p: TransferModalProps) => {
  const styles = useStyles();
  const { defaultApi } = useApi();
  const canManage = p.canManage ?? true;
  const isEdit = Boolean(p.transfer);

  const [form, setForm] = useState({
    name: p.transfer?.name ?? '',
    description: p.transfer?.description ?? '',
    originPath: p.transfer?.originPath ?? '',
    targetPath: p.transfer?.targetPath ?? '',
    mode: (p.transfer?.mode ?? ServerTransferMode.Copy) as ServerTransferMode,
    enableMoveBackup: p.transfer?.enableMoveBackup ?? false,
    moveBackupPath: p.transfer?.moveBackupPath ?? '',
    bwLimitKbps: p.transfer?.bwLimitKbps != null ? String(p.transfer.bwLimitKbps) : '',
    isEnabled: true,
    secondsStart: '0',
    secondsStop: '0',
  });
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!defaultApi || !canManage) return;
    if (!form.name.trim() || !form.originPath.trim() || !form.targetPath.trim()) {
      setError('Name, origin and target paths are required');
      return;
    }
    setError(undefined);
    setSaving(true);
    try {
      if (isEdit && p.transfer) {
        await defaultApi.serverTransferControllerPatch({
          id: p.transfer.id,
          patchServerTransferDto: {
            name: form.name,
            description: form.description || undefined,
            originPath: form.originPath,
            targetPath: form.targetPath,
            mode: form.mode,
            enableMoveBackup: form.enableMoveBackup,
            moveBackupPath: form.moveBackupPath || undefined,
            bwLimitKbps: form.bwLimitKbps !== '' ? Number(form.bwLimitKbps) : undefined,
          },
        });
      } else {
        const dto: CreateServerTransferDto = {
          name: form.name,
          description: form.description || undefined,
          originPath: form.originPath,
          targetPath: form.targetPath,
          mode: form.mode,
          enableMoveBackup: form.enableMoveBackup,
          moveBackupPath: form.moveBackupPath || undefined,
          bwLimitKbps: form.bwLimitKbps !== '' ? Number(form.bwLimitKbps) : undefined,
          isEnabled: form.isEnabled,
          secondsStart: Number(form.secondsStart) || 0,
          secondsStop: Number(form.secondsStop) || 0,
        };
        await defaultApi.serverTransferControllerCreate({ id: p.categoryId ?? '', createServerTransferDto: dto });
      }
      p.handleClose?.();
    } catch (e) {
      console.error('Error saving transfer:', e);
      setError('Could not save the transfer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.row}>
        <input
          style={styles.input}
          placeholder='Name'
          value={form.name}
          disabled={!canManage}
          onChange={(e) => setField('name', e.target.value)}
        />
        <select
          style={styles.input}
          value={form.mode}
          disabled={!canManage}
          onChange={(e) => setField('mode', e.target.value as ServerTransferMode)}
        >
          {Object.values(ServerTransferMode).map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      </div>
      <input
        style={styles.input}
        placeholder='Description (optional)'
        value={form.description}
        disabled={!canManage}
        onChange={(e) => setField('description', e.target.value)}
      />
      <input
        style={styles.input}
        placeholder='Origin path'
        value={form.originPath}
        disabled={!canManage}
        onChange={(e) => setField('originPath', e.target.value)}
      />
      <input
        style={styles.input}
        placeholder='Target path'
        value={form.targetPath}
        disabled={!canManage}
        onChange={(e) => setField('targetPath', e.target.value)}
      />
      <label style={styles.checkboxRow}>
        <input
          type='checkbox'
          checked={form.isEnabled}
          disabled={!canManage}
          onChange={(e) => setField('isEnabled', e.target.checked)}
        />
        <span>Enabled</span>
      </label>
      <label style={styles.checkboxRow}>
        <input
          type='checkbox'
          checked={form.enableMoveBackup}
          disabled={!canManage}
          onChange={(e) => setField('enableMoveBackup', e.target.checked)}
        />
        <span>Enable move backup</span>
      </label>
      {form.enableMoveBackup ? (
        <input
          style={styles.input}
          placeholder='Move backup path'
          value={form.moveBackupPath}
          disabled={!canManage}
          onChange={(e) => setField('moveBackupPath', e.target.value)}
        />
      ) : null}
      <div style={styles.row}>
        <input
          style={styles.input}
          type='number'
          placeholder='Bandwidth limit (Kbps)'
          value={form.bwLimitKbps}
          disabled={!canManage}
          onChange={(e) => setField('bwLimitKbps', e.target.value)}
        />
        {!isEdit ? (
          <>
            <input
              style={styles.input}
              type='number'
              placeholder='Start (s)'
              value={form.secondsStart}
              disabled={!canManage}
              onChange={(e) => setField('secondsStart', e.target.value)}
            />
            <input
              style={styles.input}
              type='number'
              placeholder='Stop (s)'
              value={form.secondsStop}
              disabled={!canManage}
              onChange={(e) => setField('secondsStop', e.target.value)}
            />
          </>
        ) : null}
      </div>
      {error ? <span style={styles.error}>{error}</span> : null}
      <Button label={isEdit ? 'Save transfer' : 'Create transfer'} onClick={handleSave} loading={saving} disabled={!canManage} />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.s,
    width: 480,
  },
  row: {
    flexDirection: 'row',
    gap: t.spacing.s,
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: t.spacing.s,
    color: t.colors.white,
    fontSize: 14,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    border: 0,
    outline: 'none',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    cursor: 'pointer',
    fontSize: 14,
  },
  error: {
    color: t.colors.red,
    fontSize: 13,
  },
}));
