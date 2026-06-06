import { Dispatch, SetStateAction, useMemo } from 'react';
import { PaginationState, useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { MdInfoOutline } from 'react-icons/md';
import { UserResponseDto } from '~/api/api';
import { Badge, roleTone } from '~/components/Badge';
import { ActionButtons } from '~/components/Table/ActionButtons';
import { Table } from '~/components/Table';
import { useTheme } from '~/utils/theme';

type UsersTableProps = {
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  onDetails?: F1<string>;
  users?: UserResponseDto[];
  total?: number;
};

export const UsersTable = (p: UsersTableProps) => {
  const theme = useTheme();
  const defaultData = useMemo<UserResponseDto[]>(() => [], []);

  const columns = useMemo<ColumnDef<UserResponseDto>[]>(
    () => [
      {
        header: 'Email',
        cell: (info) => info.getValue<string>(),
        accessorKey: 'email',
        minSize: 250,
      },
      {
        header: 'Name',
        cell: (info) => {
          const u = info.row.original;
          const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
          return name || <span style={{ color: theme.colors.dark05 }}>—</span>;
        },
        id: 'name',
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
        header: 'Created',
        cell: (info) => (
          <div>
            <p style={{ margin: 0, padding: 0 }}>{format(new Date(info.getValue<string>()), 'd MMMM')}</p>
            <p style={{ margin: 0, padding: 0, color: theme.colors.blue04, fontSize: '14px' }}>
              {format(new Date(info.getValue<string>()), 'y')}
            </p>
          </div>
        ),
        accessorKey: 'createdAt',
      },
      {
        header: '',
        id: 'actions',
        cell: (info) => (
          <div style={{ alignItems: 'flex-end' }}>
            <ActionButtons
              id={info.row.original.id}
              key={info.row.original.id}
              onCustom={p.onDetails}
              customChildren={
                <div style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s }}>
                  <MdInfoOutline size={18} />
                  <span style={{ userSelect: 'none' }}>Details</span>
                </div>
              }
            />
          </div>
        ),
        maxSize: 140,
      },
    ],
    [theme, p.onDetails],
  );

  const table = useReactTable({
    data: p.users || defaultData,
    pageCount: p.total ? Math.ceil(p.total / p.pagination.pageSize) : 1,
    columns,
    state: { pagination: p.pagination },
    manualPagination: true,
    onPaginationChange: p.setPagination,
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table table={table} />;
};
