import { Cell, Header, HeaderGroup, Table as ReactTable, Row, flexRender } from '@tanstack/react-table';
import { Scrollbar } from '~/components/Scrollbar';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { TablePagination } from '~/components/Table/TablePagination';
const ROW_HEIGHT = 60;

type TablePaginationProps<T> = {
  table: ReactTable<T>;
};

export const Table = <T extends Object>({ table }: TablePaginationProps<T>) => {
  const styles = useStyles();
  const theme = useTheme();

  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders();
    const colWidth: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      colWidth[header.column.id] = header.column.getSize();
    }
    return colWidth;
  }, [table.getState().columnSizingInfo]);

  const renderHeader = (header: Header<T, unknown>) => (
    <th key={header.id} colSpan={header.colSpan} style={{ width: columnSizeVars[header.id] }}>
      {header.isPlaceholder ? null : (
        <div style={styles.headerLabel}>{flexRender(header.column.columnDef.header, header.getContext())}</div>
      )}
    </th>
  );

  const renderHeaderGroup = (headerGroup: HeaderGroup<T>) => (
    <tr key={headerGroup.id}>{headerGroup.headers.map(renderHeader)}</tr>
  );

  const renderCell = (cell: Cell<T, unknown>) => (
    <td style={{ ...styles.cell, width: columnSizeVars[cell.column.id] }} key={cell.id}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );

  const renderRow = (row: Row<T>, key: number) => (
    <motion.tr
      whileHover={{ backgroundColor: theme.colors.gray02 + theme.colorOpacity(0.8) }}
      key={row.id}
      style={{
        ...styles.row,
        backgroundColor: theme.colors.gray03 + (key % 2 ? theme.colorOpacity(0) : theme.colorOpacity(0.4)),
      }}
    >
      {row.getVisibleCells().map(renderCell)}
    </motion.tr>
  );

  return (
    <>
      <table style={styles.headerContainer}>
        <thead>{table.getHeaderGroups().map(renderHeaderGroup)}</thead>
      </table>
      <Scrollbar>
        <table style={styles.dataContainer}>
          <tbody>{table.getRowModel().rows.map(renderRow)}</tbody>
        </table>
      </Scrollbar>
      <TablePagination table={table} />
    </>
  );
};

const useStyles = mkUseStyles((t) => ({
  headerContainer: {
    marginRight: t.spacing.l,
    paddingTop: t.spacing.m,
    paddingBottom: t.spacing.m,
    borderSpacing: 0,
  },
  headerLabel: {
    textAlign: 'left',
  },
  dataContainer: {
    borderSpacing: 0,
    marginRight: t.spacing.l,
    borderCollapse: 'collapse',
  },
  row: {
    position: 'relative',
    height: ROW_HEIGHT,
    borderRadius: t.borderRadius.default,
  },
  cell: {
    border: 0,
    padding: 0,
    margin: 0,
  },
}));
