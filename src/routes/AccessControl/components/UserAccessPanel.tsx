import { useMemo } from 'react';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { MdGroups } from 'react-icons/md';
import { UserType } from '~/apiOld/User';
import { Table } from '~/components/Table';
import { ActionButtons } from '~/components/Table/ActionButtons';
import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import { useUsersData } from '~/routes/Accounts/hooks/useUsersData';
import { useAclGroups } from '~/routes/AccessControl/hooks/useAclGroups';
import { UserGroupsModal } from '~/routes/AccessControl/modals/UserGroupsModal';
import { useTheme } from '~/utils/theme';

export const UserAccessPanel = () => {
  const theme = useTheme();
  const can = useCan();
  const canAssign = can('acl.assign');
  const defaultData = useMemo<UserType[]>(() => [], []);

  const { data, pagination, setPagination } = useUsersData();
  const { groups } = useAclGroups();

  const userGroupsModal = useModal(
    'acl-user-groups',
    UserGroupsModal,
    { title: 'Manage user groups' },
    {
      handleClose: async () => {
        userGroupsModal.hide();
      },
    },
  );

  const columns = useMemo<ColumnDef<UserType>[]>(
    () => [
      {
        header: 'Email',
        cell: (info) => <div style={{ marginLeft: theme.spacing.m }}>{info.getValue<string>()}</div>,
        accessorKey: 'email',
        minSize: 260,
      },
      {
        header: 'Role',
        cell: (info) => info.getValue(),
        accessorKey: 'role',
      },
      {
        header: '',
        id: 'actions',
        cell: (info) => (
          <div style={{ alignItems: 'flex-end', paddingRight: theme.spacing.m }}>
            <ActionButtons
              id={info.row.original.id}
              key={info.row.original.id}
              onCustom={
                canAssign
                  ? () =>
                      userGroupsModal.show({
                        userId: info.row.original.id,
                        userEmail: info.row.original.email,
                        groups,
                        canAssign,
                      })
                  : undefined
              }
              customChildren={
                <div style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s }}>
                  <MdGroups size={18} />
                  <span style={{ userSelect: 'none' }}>Groups</span>
                </div>
              }
            />
          </div>
        ),
        maxSize: 160,
      },
    ],
    [theme, canAssign, groups, userGroupsModal],
  );

  const table = useReactTable({
    data: data?.users || defaultData,
    pageCount: data?.total ? Math.ceil(data.total / pagination.pageSize) : 1,
    columns,
    state: { pagination },
    manualPagination: true,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table table={table} />;
};
