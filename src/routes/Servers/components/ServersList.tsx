import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { ServerResponseDto } from '~/api/api';
import { Table } from '~/components/Table';
import { ActionButtons } from '~/components/Table/ActionButtons';
import { useServers } from '~/routes/Servers/hooks/useServers';
import { useTheme } from '~/utils/theme';
import { MdOutlineSettingsEthernet } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export const ServersList = () => {
  const theme = useTheme();
  const defaultData = useMemo(() => [], []);

  const { servers, pagination, count, setPagination } = useServers();
  const navigate = useNavigate();
  const handleNavigateToServer = (id: string) => {
    navigate(id);
  };

  const columns = useMemo<ColumnDef<ServerResponseDto>[]>(
    () => [
      {
        header: 'Name',
        footer: (props) => props.column.id,
        cell: (info) =>
          info.getValue() ? (
            <p style={{ marginLeft: theme.spacing.m }}>{info.getValue() as string}</p>
          ) : (
            <p style={{ color: theme.colors.yellow }}>Empty</p>
          ),
        accessorKey: 'name',
      },
      {
        header: 'Created At',
        footer: (props) => props.column.id,
        cell: (info) => (
          <div>
            <p style={{ margin: 0, padding: 0 }}>{format(info.getValue<Date>(), 'hh:mm:ss')}</p>
            <p style={{ margin: 0, padding: 0, color: theme.colors.blue04, fontSize: '14px' }}>
              {format(info.getValue<Date>(), ' dd MMMM y')}
            </p>
          </div>
        ),
        accessorKey: 'createdAt',
      },
      {
        header: 'IP Address',
        footer: (props) => props.column.id,
        cell: (info) => info.getValue(),
        accessorKey: 'ipAddress',
      },
      {
        header: 'Actions',
        id: 'actions',
        footer: (props) => props.column.id,
        cell: (info) => (
          <div style={{ alignItems: 'flex-end', paddingRight: theme.spacing.m }}>
            <ActionButtons
              id={info.getValue() as string}
              key={info.row.original.id}
              onCustom={handleNavigateToServer}
              onDelete={() => {}}
              customChildren={
                <div style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <p style={{ marginRight: theme.spacing.m, userSelect: 'none' }}>Manage</p>
                  <MdOutlineSettingsEthernet size={20} />
                </div>
              }
            />
          </div>
        ),
        accessorKey: 'id',
        maxSize: 180,
      },
    ],
    [],
  );
  const table = useReactTable({
    data: servers || defaultData,
    pageCount: count ? Math.ceil(count / pagination.pageSize) : 1,
    columns,
    state: {
      pagination: pagination,
    },
    meta: {},

    columnResizeMode: 'onChange',
    manualPagination: true,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
  });

  return <Table table={table} />;
};
