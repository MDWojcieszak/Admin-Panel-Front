import { FaPlus } from 'react-icons/fa6';
import { Button } from '~/components/Button';
import { ActionButtons } from '~/components/Table/ActionButtons';
import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import { GroupEditorModal } from '~/routes/AccessControl/modals/GroupEditorModal';
import { useAclGroups } from '~/routes/AccessControl/hooks/useAclGroups';
import { mkUseStyles } from '~/utils/theme';

export const GroupsPanel = () => {
  const styles = useStyles();
  const can = useCan();
  const canManage = can('acl.manage');
  const { groups, refresh, deleteGroup } = useAclGroups();

  const editorModal = useModal(
    'acl-group-editor',
    GroupEditorModal,
    { title: 'Permission group' },
    {
      handleClose: async () => {
        refresh();
        editorModal.hide();
      },
    },
  );

  const handleDelete = async (id: string) => {
    if (!canManage) return;
    try {
      await deleteGroup(id);
      refresh();
    } catch (e) {
      console.error('Error deleting permission group:', e);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <Button
          label='Create group'
          icon={<FaPlus />}
          disabled={!canManage}
          onClick={() => editorModal.show({ canManage, group: undefined })}
        />
      </div>
      <div style={styles.list}>
        {(groups ?? []).map((group) => (
          <div key={group.id} style={styles.card}>
            <div style={styles.info}>
              <span style={styles.name}>{group.name}</span>
              {group.description ? <span style={styles.description}>{group.description}</span> : null}
              <div style={styles.metaRow}>
                <span style={styles.meta}>{group.permissions.length} permissions</span>
                <span style={styles.meta}>{group.userCount ?? 0} users</span>
              </div>
            </div>
            {canManage ? (
              <ActionButtons
                id={group.id}
                onEdit={() => editorModal.show({ group, canManage })}
                onDelete={handleDelete}
              />
            ) : null}
          </div>
        ))}
        {(groups ?? []).length === 0 ? <span style={styles.empty}>No permission groups yet.</span> : null}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    height: '100%',
  },
  toolbar: {
    flexDirection: 'row',
  },
  list: {
    gap: t.spacing.m,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: t.spacing.l,
    padding: t.spacing.m,
    minWidth: 320,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    borderRadius: t.borderRadius.default,
  },
  info: {
    gap: 4,
  },
  name: {
    fontWeight: 700,
    fontSize: 16,
  },
  description: {
    color: t.colors.blue04,
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    gap: t.spacing.m,
    marginTop: 4,
  },
  meta: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  empty: {
    color: t.colors.dark05,
  },
}));
