import { Dispatch, SetStateAction, useMemo } from 'react';

import { PaginationState, useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table';
import { ImageType } from '~/api/Image';
import { ImageIcon } from '~/routes/Images/components/ImageIcon';
import { useTheme } from '~/utils/theme';
import { format } from 'date-fns';
import { ActionButtons } from '~/components/Table/ActionButtons';
import { useModal } from '~/hooks/useModal';
import { ImagePreviewModal } from '~/routes/Images/modals/ImagePreviewModal';
import { Table } from '~/components/Table';

type ImagesTableProps = {
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  handleEdit?: F1<string>;
  handleDelete?: F1<string>;
  images?: ImageType[];
  total?: number;
};

export const ImagesTable = (p: ImagesTableProps) => {
  const imagePreviewModal = useModal('image-preview', ImagePreviewModal);
  const theme = useTheme();
  const defaultData = useMemo(() => [], []);

  const columns = useMemo<ColumnDef<ImageType>[]>(
    () => [
      {
        header: 'Image',
        footer: (props) => props.column.id,
        cell: (info) => (
          <ImageIcon
            key={info.getValue() as string}
            handleOpenPreview={(id) =>
              imagePreviewModal.show({ id, title: p.images?.find((d) => d.imageId === id)?.title || undefined })
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
    data: p.images || defaultData,
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
