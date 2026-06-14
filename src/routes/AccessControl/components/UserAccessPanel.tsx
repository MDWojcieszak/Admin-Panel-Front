import { useMemo } from 'react';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { MdGroups } from 'react-icons/md';
import { Role, UserResponseDto } from '~/api/api';
import { Badge, roleTone } from '~/components/Badge';
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
  const defaultData = useMemo<UserResponseDto[]>(() => [], []);

  const { users, total, pagination, setPagination } = useUsersData();
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

  const columns = useMemo<ColumnDef<UserResponseDto>[]>(
    () => [
      {
        header: 'Email',
        cell: (info) => info.getValue<string>(),
        accessorKey: 'email',
        minSize: 260,
      },
      {
        header: 'Role',
        cell: (info) => {
          const role = info.getValue<string>();
          return <Badge label={role} tone={roleTone(role)} />;
        },
        accessorKey: 'role',
      },
      {
        header: '',
        id: 'actions',
        cell: (info) =>
          // Owners bypass groups entirely (they always have every permission) — no group management.
          info.row.original.role === Role.Owner ? (
            <div style={{ alignItems: 'flex-end' }}>
              <span style={{ color: theme.colors.dark05, fontSize: 12 }}>Full access</span>
            </div>
          ) : (
            <div style={{ alignItems: 'flex-end' }}>
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
    data: users || defaultData,
    pageCount: total ? Math.ceil(total / pagination.pageSize) : 1,
    columns,
    state: { pagination },
    manualPagination: true,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table table={table} />;
};
