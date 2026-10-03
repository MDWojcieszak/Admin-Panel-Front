import { CSSProperties, Fragment, ReactNode } from 'react';
import { Table as ReactTable, flexRender } from '@tanstack/react-table';
import { EmptyState } from '~/components/EmptyState';
import { Scrollbar } from '~/components/Scrollbar';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { motion } from 'framer-motion';
import { TablePagination } from '~/components/Table/TablePagination';

const ROW_HEIGHT = 52;

type TableProps<T> = {
  table: ReactTable<T>;
  hidePagination?: boolean;
  emptyState?: { icon?: ReactNode; title?: string; description?: string };
  /** Makes every row clickable (pointer cursor) and reports the row's data. */
  onRowClick?: (row: T) => void;
  /**
   * Splits the rows into labelled sections. Rows must already be ordered by
   * group; a heading is drawn wherever the key changes, with the group's count.
   */
  getGroup?: (row: T) => { key: string; label: ReactNode };
};

export const Table = <T extends object>({ table, hidePagination, emptyState, onRowClick, getGroup }: TableProps<T>) => {
  const styles = useStyles();
  const theme = useTheme();

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;

  const groupCounts = new Map<string, number>();
  if (getGroup) {
    rows.forEach((row) => {
      const { key } = getGroup(row.original);
      groupCounts.set(key, (groupCounts.get(key) ?? 0) + 1);
    });
  }

  // Shared flex sizing so header and body columns line up (proportional to column size).
  const cellStyle = (size: number, isLast: boolean): CSSProperties => ({
    flex: `${size} ${size} 0px`,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: isLast ? 'flex-end' : 'flex-start',
    gap: theme.spacing.s,
    padding: `0 ${theme.spacing.m}px`,
    overflow: 'hidden',
  });

  return (
    <div style={styles.wrapper}>
      <div style={styles.scrollWrap}>
        <Scrollbar style={styles.scroll}>
          <div style={styles.list}>
            {headerGroups.map((group) => (
              <div key={group.id} style={styles.headerRow}>
                {group.headers.map((header, i) => (
                  <div key={header.id} style={cellStyle(header.getSize(), i === group.headers.length - 1)}>
                    {header.isPlaceholder ? null : (
                      <span style={styles.headerLabel}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {rows.map((row, rowIndex) => {
              const cells = row.getVisibleCells();
              const group = getGroup?.(row.original);
              const startsGroup =
                group && (rowIndex === 0 || getGroup?.(rows[rowIndex - 1].original).key !== group.key);
              return (
                <Fragment key={row.id}>
                  {startsGroup ? (
                    <div style={{ ...styles.groupRow, marginTop: rowIndex === 0 ? 0 : theme.spacing.m }}>
                      {group.label}
                      <span style={styles.groupCount}>{groupCounts.get(group.key)}</span>
                    </div>
                  ) : null}
                  <motion.div
                    style={{
                      ...styles.row,
                      cursor: onRowClick ? 'pointer' : undefined,
                      backgroundColor:
                        rowIndex % 2
                          ? theme.colors.white + theme.colorOpacity(0.03)
                          : theme.colors.white + theme.colorOpacity(0.012),
                    }}
                    whileHover={{ backgroundColor: theme.colors.blue + theme.colorOpacity(0.13) }}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  >
                    {cells.map((cell, i) => (
                      <div key={cell.id} style={cellStyle(cell.column.getSize(), i === cells.length - 1)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </motion.div>
                </Fragment>
              );
            })}

            {rows.length === 0 ? (
              <div style={styles.emptyWrap}>
                <EmptyState
                  icon={emptyState?.icon}
                  title={emptyState?.title ?? 'Nothing here yet'}
                  description={emptyState?.description}
                />
              </div>
            ) : null}
          </div>
        </Scrollbar>
      </div>
      {hidePagination ? null : <TablePagination table={table} />}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  wrapper: {
    flex: 1,
    minHeight: 0,
    gap: t.spacing.m,
  },
  scrollWrap: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  scroll: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  list: {
    minHeight: '100%',
    gap: t.spacing.xs,
    paddingRight: t.spacing.m,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: `${t.spacing.xs}px ${t.spacing.m}px`,
    fontSize: 13,
    fontWeight: 700,
    color: t.colors.white,
  },
  groupCount: {
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    color: t.colors.dark05,
    backgroundColor: t.colors.white + t.colorOpacity(0.06),
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    height: 42,
    marginBottom: t.spacing.xs,
    borderRadius: t.borderRadius.medium,
    backgroundColor: t.colors.gray04,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.dark05,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_HEIGHT,
    borderRadius: t.borderRadius.medium,
    fontSize: 14,
    color: t.colors.white,
  },
  empty: {
    padding: t.spacing.m,
    color: t.colors.dark05,
  },
}));
