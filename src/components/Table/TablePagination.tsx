import { Table } from '@tanstack/react-table';
import { TbPlayerPlayFilled, TbPlayerTrackNextFilled, TbPlayerTrackPrevFilled } from 'react-icons/tb';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { motion } from 'framer-motion';
type TablePaginationProps<T> = {
  table: Table<T>;
};

export const TablePagination = <T extends Object>({ table }: TablePaginationProps<T>) => {
  const styles = useStyles();
  const theme = useTheme();
  const prevDisabled = !table.getCanPreviousPage();
  const nextDisabled = !table.getCanNextPage();
  return (
    <div style={styles.container}>
      <span className='flex items-center gap-1'>
        <strong>
          {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </strong>
      </span>
      <motion.button
        style={{ ...styles.button, cursor: prevDisabled ? 'default' : 'pointer' }}
        onClick={() => table.setPageIndex(0)}
        animate={{ backgroundColor: prevDisabled ? theme.colors.gray04 : theme.colors.gray02 }}
        disabled={prevDisabled}
      >
        <TbPlayerTrackPrevFilled size={16} />
      </motion.button>
      <motion.button
        style={{ ...styles.button, cursor: prevDisabled ? 'default' : 'pointer' }}
        onClick={() => table.previousPage()}
        animate={{ backgroundColor: prevDisabled ? theme.colors.gray04 : theme.colors.gray02 }}
        disabled={prevDisabled}
      >
        <TbPlayerPlayFilled style={{ rotate: '180deg' }} size={16} />
      </motion.button>

      <motion.button
        style={{ ...styles.button, cursor: nextDisabled ? 'default' : 'pointer' }}
        onClick={() => table.nextPage()}
        animate={{ backgroundColor: nextDisabled ? theme.colors.gray04 : theme.colors.gray02 }}
        disabled={nextDisabled}
      >
        <TbPlayerPlayFilled size={16} />
      </motion.button>

      <motion.button
        style={{ ...styles.button, cursor: nextDisabled ? 'default' : 'pointer' }}
        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        animate={{ backgroundColor: !table.getCanNextPage() ? theme.colors.gray04 : theme.colors.gray02 }}
        disabled={!table.getCanNextPage()}
      >
        <TbPlayerTrackNextFilled size={16} />
      </motion.button>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flexDirection: 'row',
    gap: t.spacing.m,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: t.spacing.m,
  },
  button: {
    padding: t.spacing.s,
    borderRadius: t.borderRadius.small,
    border: 0,
    lineHeight: '10px',
  },
}));
