import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import {
  PaginationState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { TablePagination } from '~/components/Table/TablePagination';
import { ImageDataResponse, ImageService } from '~/api/Image';
import { ImageIcon } from '~/routes/Images/components/ImageIcon';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { format } from 'date-fns';
import { ActionButtons } from '~/components/Table/ActionButtons';
import { motion } from 'framer-motion';
import { useModal } from '~/hooks/useModal';
import { ImagePreviewModal } from '~/routes/Images/modals/ImagePreviewModal';
import { Scrollbar } from '~/components/Scrollbar';
type ImagesTableRef = {
  refresh: F0;
};

const ROW_HEIGHT = 60;

export const ImagesTable = forwardRef<ImagesTableRef>((_, ref) => {
  const [data, setData] = useState<ImageDataResponse['images']>([]);
  const imagePreviewModal = useModal('image-preview', ImagePreviewModal);
  const styles = useStyles();
  const theme = useTheme();
  useImperativeHandle(ref, () => ({
    refresh: () => {},
  }));
  useEffect(() => {
    try {
      ImageService.getList({ take: 19 }).then((r) => setData(r.images));
    } catch (e) {}
  }, []);

  const handleDelete = (id: string) => {};
  const handleEdit = (id: string) => {};

  const columns = useMemo<ColumnDef<ImageDataResponse['images'][number]>[]>(
    () => [
      {
        header: 'Image',
        footer: (props) => props.column.id,
        cell: (info) => (
          <ImageIcon
            handleOpenPreview={(id) =>
              imagePreviewModal.show({ id, title: data.find((d) => d.imageId === id)?.title || undefined })
            }
            id={info.getValue() as string}
          />
        ),
        accessorKey: 'imageId',
        maxSize: 100,
        minSize: 100,
      },
      {
        header: 'Title',
        footer: (props) => props.column.id,
        cell: (info) => info.getValue(),
        accessorKey: 'title',
      },
      {
        header: 'Date',
        footer: (props) => props.column.id,
        cell: (info) => (
          <div>
            <p style={{ margin: 0, padding: 0 }}>{format(info.getValue<Date>(), 'MMMM')}</p>
            <p style={{ margin: 0, padding: 0, color: theme.colors.blue04, fontSize: '14px' }}>
              {format(info.getValue<Date>(), 'y')}
            </p>
          </div>
        ),
        accessorKey: 'dateTaken',
      },
      {
        header: 'Localization',
        footer: (props) => props.column.id,
        cell: (info) => info.getValue(),
        accessorKey: 'localization',
      },

      {
        id: 'fullName',
        header: 'Name',
        footer: (props) => props.column.id,
        accessorFn: (row) => `${row.authorId}`,
      },
      {
        header: '',
        id: 'actions',
        footer: (props) => props.column.id,
        cell: (info) => (
          <ActionButtons
            id={info.row.original.imageId}
            key={info.column.id}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ),
        maxSize: 80,
      },
    ],
    [],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    meta: {},
    columnResizeMode: 'onChange',
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  });

  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders();
    const colWidth: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      colWidth[header.column.id] = header.column.getSize();
    }
    return colWidth;
  }, [table.getState().columnSizingInfo]);

  console.log(columnSizeVars);

  return (
    <>
      <table style={styles.headerContainer}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th key={header.id} colSpan={header.colSpan} style={{ width: columnSizeVars[header.id] }}>
                    {header.isPlaceholder ? null : (
                      <div style={styles.headerLabel}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
      </table>
      <Scrollbar>
        <table style={styles.dataContainer}>
          <tbody>
            {table.getRowModel().rows.map((row, key) => {
              return (
                <motion.tr
                  whileHover={{ backgroundColor: theme.colors.gray02 + theme.colorOpacity(0.8) }}
                  key={row.id}
                  style={{
                    ...styles.row,
                    backgroundColor: theme.colors.gray03 + (key % 2 ? theme.colorOpacity(0) : theme.colorOpacity(0.4)),
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td style={{ ...styles.cell, width: columnSizeVars[cell.column.id] }} key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </Scrollbar>

      <TablePagination table={table} />
    </>
  );
});

const useStyles = mkUseStyles((t) => ({
  container: {
    marginTop: t.spacing.m,
    position: 'relative',
  },
  headerContainer: {
    marginRight: t.spacing.l,
    paddingTop: t.spacing.s,
    paddingBottom: t.spacing.s,
    borderSpacing: 0,
  },
  headerLabel: {
    textAlign: 'left',
  },
  dataContainer: {
    borderSpacing: 0,
    marginRight: t.spacing.l,
  },
  row: {
    position: 'relative',
    height: ROW_HEIGHT,
  },
  cell: {
    border: 0,
    padding: 0,
    margin: 0,
  },
}));
