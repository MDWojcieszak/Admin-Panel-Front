import { useEffect, useState } from 'react';
import { PermissionGroupResponseDto } from '~/api/api';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles, useTheme } from '~/utils/theme';

type UserGroupsModalProps = {
  userId?: string;
  userEmail?: string;
  groups?: PermissionGroupResponseDto[];
  canAssign?: boolean;
} & Partial<InternalModalProps>;

export const UserGroupsModal = (p: UserGroupsModalProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { aclApi } = useApi();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canAssign = p.canAssign ?? true;

  useEffect(() => {
    if (!aclApi || !p.userId) return;
    setLoading(true);
    aclApi
      .aclControllerGetUserGroups({ userId: p.userId })
      .then(({ data }) => setSelected(new Set((data.groups ?? []).map((g) => g.id))))
      .catch((e) => console.error('Error loading user groups:', e))
      .finally(() => setLoading(false));
  }, [aclApi, p.userId]);

  const toggle = (groupId: string) => {
    if (!canAssign) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!aclApi || !p.userId || !canAssign) return;
    setSaving(true);
    try {
      await aclApi.aclControllerSetUserGroups({
        userId: p.userId,
        setUserGroupsDto: { groupIds: Array.from(selected) },
      });
      p.handleClose?.();
    } catch (e) {
      console.error('Error saving user groups:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <span style={styles.subtitle}>{p.userEmail}</span>
      {loading ? (
        <Loader />
      ) : (
        <div style={styles.list}>
          {(p.groups ?? []).map((group) => {
            const isSelected = selected.has(group.id);
            return (
              <div
                key={group.id}
                style={{
                  ...styles.row,
                  backgroundColor: isSelected
                    ? theme.colors.blue + theme.colorOpacity(0.18)
                    : theme.colors.gray04 + theme.colorOpacity(0.5),
                  opacity: canAssign ? 1 : 0.5,
                  cursor: canAssign ? 'pointer' : 'not-allowed',
                }}
                onClick={() => toggle(group.id)}
              >
                <div
                  style={{
                    ...styles.checkbox,
                    backgroundColor: isSelected ? theme.colors.blue : 'transparent',
                    borderColor: isSelected ? theme.colors.blue : theme.colors.dark04,
                  }}
                >
                  {isSelected ? '✓' : ''}
                </div>
                <div style={styles.groupText}>
                  <span>{group.name}</span>
                  <span style={styles.groupMeta}>{group.permissions.length} permissions</span>
                </div>
              </div>
            );
          })}
          {(p.groups ?? []).length === 0 ? <span style={styles.empty}>No permission groups yet.</span> : null}
        </div>
      )}
      <Button label='Save' onClick={handleSave} loading={saving} disabled={!canAssign || loading} />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    width: 420,
  },
  subtitle: {
    color: t.colors.blue04,
    fontSize: 14,
  },
  list: {
    gap: t.spacing.s,
    maxHeight: 360,
    overflowY: 'auto',
    paddingRight: t.spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
  },
  checkbox: {
    width: 20,
    height: 20,
    minWidth: 20,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.dark04}`,
    alignItems: 'center',
    justifyContent: 'center',
    color: t.colors.white,
    fontSize: 13,
  },
  groupText: {
    gap: 2,
  },
  groupMeta: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  empty: {
    color: t.colors.dark05,
    fontSize: 14,
  },
}));
