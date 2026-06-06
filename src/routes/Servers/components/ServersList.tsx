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
        cell: (info) =>
          info.getValue() ? (
            <span>{info.getValue() as string}</span>
          ) : (
            <span style={{ color: theme.colors.yellow }}>Empty</span>
          ),
        accessorKey: 'name',
      },
      {
        header: 'Created At',
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
        cell: (info) => info.getValue(),
        accessorKey: 'ipAddress',
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: (info) => (
          <div style={{ alignItems: 'flex-end' }}>
            <ActionButtons
              id={info.getValue() as string}
              key={info.row.original.id}
              onCustom={handleNavigateToServer}
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
