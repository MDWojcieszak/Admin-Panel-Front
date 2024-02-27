import { Dispatch, SetStateAction, useMemo } from 'react';

import { PaginationState, useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table';
import { useTheme } from '~/utils/theme';
import { format } from 'date-fns';
import { ActionButtons } from '~/components/Table/ActionButtons';
import { Table } from '~/components/Table';
import { UserType } from '~/api/User';

type UsersTableProps = {
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  handleEdit?: F1<string>;
  handleDelete?: F1<string>;
  users?: UserType[];
  total?: number;
};

export const UsersTable = (p: UsersTableProps) => {
  const theme = useTheme();
  const defaultData = useMemo(() => [], []);

  const columns = useMemo<ColumnDef<UserType>[]>(
    () => [
      {
        header: 'Email',
        footer: (props) => props.column.id,
        cell: (info) => <div style={{ marginLeft: theme.spacing.m }}>{info.getValue<string>()}</div>,
        accessorKey: 'email',
        minSize: 250,
      },
      {
        header: 'First Name',
        footer: (props) => props.column.id,
        cell: (info) => info.getValue(),
        accessorKey: 'firstName',
      },
      {
        header: 'Last Name',
        footer: (props) => props.column.id,
        cell: (info) => info.getValue(),
        accessorKey: 'lastName',
      },
      {
        header: 'Created',
        footer: (props) => props.column.id,
        cell: (info) => (
          <div>
            <p style={{ margin: 0, padding: 0 }}>{format(info.getValue<Date>(), 'd MMMM')}</p>
            <p style={{ margin: 0, padding: 0, color: theme.colors.blue04, fontSize: '14px' }}>
              {format(info.getValue<Date>(), 'y')}
            </p>
          </div>
        ),
        accessorKey: 'createdAt',
      },
      {
        header: 'Role',
        footer: (props) => props.column.id,
        cell: (info) => info.getValue(),
        accessorKey: 'role',
      },
      {
        header: '',
        id: 'actions',
        footer: (props) => props.column.id,
        cell: (info) => (
          <ActionButtons
            id={info.row.original.id}
            key={info.row.original.id}
            onDelete={p.handleDelete}
            onEdit={p.handleEdit}
          />
        ),
        maxSize: 80,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: p.users || defaultData,
    pageCount: p.total ? Math.ceil(p.total / p.pagination.pageSize) : 1,
    columns,
    state: {
      pagination: p.pagination,
    },
    meta: {},
    columnResizeMode: 'onChange',
    manualPagination: true,
    onPaginationChange: p.setPagination,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
  });

  return <Table table={table} />;
};
