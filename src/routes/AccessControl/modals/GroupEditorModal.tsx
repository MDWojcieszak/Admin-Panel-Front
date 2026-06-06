import { useState } from 'react';
import { PermissionGroupResponseDto } from '~/api/api';
import { Button } from '~/components/Button';
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

export const GroupEditorModal = (p: GroupEditorModalProps) => {
  const styles = useStyles();
  const { aclApi } = useApi();
  const { refresh: refreshPermissions } = usePermissions();
  const { grouped } = usePermissionCatalog();

  const [name, setName] = useState(p.group?.name ?? '');
  const [description, setDescription] = useState(p.group?.description ?? '');
  const [permissions, setPermissions] = useState<string[]>(p.group?.permissions ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const isEdit = Boolean(p.group);
  const canManage = p.canManage ?? true;

  const handleSave = async () => {
    if (!aclApi || !canManage) return;
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      if (isEdit && p.group) {
        await aclApi.aclControllerUpdateGroup({
          id: p.group.id,
          updatePermissionGroupDto: { name, description, permissions },
        });
      } else {
        await aclApi.aclControllerCreateGroup({
          createPermissionGroupDto: { name, description, permissions },
        });
      }
      await refreshPermissions();
      p.handleClose?.();
    } catch (e) {
      console.error('Error saving permission group:', e);
      setError('Could not save the group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.field}>
        <label style={styles.label}>Name</label>
        <input
          style={styles.input}
          value={name}
          disabled={!canManage}
          onChange={(e) => setName(e.target.value)}
          placeholder='e.g. Server operators'
        />
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Description</label>
        <input
          style={styles.input}
          value={description}
          disabled={!canManage}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Optional description'
        />
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Permissions ({permissions.length})</label>
        <PermissionPicker grouped={grouped} value={permissions} onChange={setPermissions} disabled={!canManage} />
      </div>
      {error ? <span style={styles.error}>{error}</span> : null}
      <Button
        label={isEdit ? 'Save changes' : 'Create group'}
        onClick={handleSave}
        loading={loading}
        disabled={!canManage}
      />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    width: 460,
  },
  field: {
    gap: t.spacing.s,
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
