import { useCallback, useMemo } from 'react';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { FaPlus } from 'react-icons/fa6';
import { PermissionGroupResponseDto } from '~/api/api';
import { Button } from '~/components/Button';
import { Table } from '~/components/Table';
import { ActionButtons } from '~/components/Table/ActionButtons';
import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import { GroupEditorModal } from '~/routes/AccessControl/modals/GroupEditorModal';
import { useAclGroups } from '~/routes/AccessControl/hooks/useAclGroups';
import { mkUseStyles, useTheme } from '~/utils/theme';

export const GroupsPanel = () => {
  const styles = useStyles();
  const theme = useTheme();
  const can = useCan();
  const canManage = can('acl.manage');
  const { groups, refresh, deleteGroup } = useAclGroups();
  const defaultData = useMemo<PermissionGroupResponseDto[]>(() => [], []);

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

  const handleDelete = useCallback(
    async (id: string) => {
      if (!canManage) return;
      try {
        await deleteGroup(id);
        refresh();
      } catch (e) {
        console.error('Error deleting permission group:', e);
      }
    },
    [canManage, deleteGroup, refresh],
  );

  const columns = useMemo<ColumnDef<PermissionGroupResponseDto>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: (info) => <span style={{ fontWeight: 600 }}>{info.getValue<string>()}</span>,
        minSize: 200,
      },
      {
        header: 'Description',
        accessorKey: 'description',
        cell: (info) =>
          info.getValue() ? (
            <span>{info.getValue<string>()}</span>
          ) : (
            <span style={{ color: theme.colors.dark05 }}>—</span>
          ),
        minSize: 240,
      },
      {
        header: 'Permissions',
        id: 'permissions',
        cell: (info) => info.row.original.permissions.length,
        maxSize: 130,
      },
      {
        header: 'Users',
        id: 'users',
        cell: (info) => info.row.original.userCount ?? 0,
        maxSize: 100,
      },
      {
        header: '',
        id: 'actions',
        cell: (info) =>
          canManage ? (
            <div style={{ alignItems: 'flex-end' }}>
              <ActionButtons
                id={info.row.original.id}
                onEdit={() => editorModal.show({ group: info.row.original, canManage })}
                onDelete={handleDelete}
              />
            </div>
          ) : null,
        maxSize: 110,
      },
    ],
    [theme, canManage, editorModal, handleDelete],
  );

  const table = useReactTable({
    data: groups || defaultData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <h2 style={styles.title}>Permission groups</h2>
        {canManage ? (
          <Button label='Create group' icon={<FaPlus />} onClick={() => editorModal.show({ canManage, group: undefined })} />
        ) : null}
      </div>
      <Table table={table} hidePagination />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    height: '100%',
    minHeight: 0,
    gap: t.spacing.m,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
  },
}));
