import { useMemo, useState } from 'react';

import {
  PaginationState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { fakeData } from '~/routes/Images/data';
import { TablePagination } from '~/components/Table/TablePagination';

export const ImagesTable = () => {
  const [data, _setData] = useState(fakeData);

  const columns = useMemo<ColumnDef<(typeof data)[0]>[]>(
    () => [
      {
        header: 'Title',
        footer: (props) => props.column.id,
        cell: (info) => info.getValue(),
        accessorKey: 'title',
      },
      {
        header: 'Date',
        footer: (props) => props.column.id,
        cell: (info) => info.getValue<Date>().toISOString(),
        accessorKey: 'dateTaken',
      },
      {
        header: 'Localization',
        footer: (props) => props.column.id,
        cell: (info) => info.getValue(),
        accessorKey: 'localiztion',
      },

      {
        id: 'fullName',
        header: 'Name',
        footer: (props) => props.column.id,
        accessorFn: (row) => `${row.authorfirstName} ${row.authorlastName}`,
      },
    ],
    [],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    // Pipeline
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  });

  return (
    <>
      <div className='p-2 block max-w-full overflow-x-scroll overflow-y-hidden'>
        <div className='h-2' />
        <table className='w-full '>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className='h-2' />
        <TablePagination table={table} />
      </div>
    </>
  );
};
