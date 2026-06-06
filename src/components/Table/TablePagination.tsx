import { Table } from '@tanstack/react-table';
import { TbPlayerPlayFilled, TbPlayerTrackNextFilled, TbPlayerTrackPrevFilled } from 'react-icons/tb';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { motion } from 'framer-motion';

type TablePaginationProps<T> = {
  table: Table<T>;
};

export const TablePagination = <T extends object>({ table }: TablePaginationProps<T>) => {
  const styles = useStyles();
  const theme = useTheme();
  const prevDisabled = !table.getCanPreviousPage();
  const nextDisabled = !table.getCanNextPage();

  const renderButton = (icon: React.ReactNode, onClick: () => void, disabled: boolean, key: string) => (
    <motion.button
      key={key}
      style={{ ...styles.button, cursor: disabled ? 'default' : 'pointer', color: disabled ? theme.colors.dark04 : theme.colors.white }}
      whileHover={disabled ? undefined : { backgroundColor: theme.colors.gray01 }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
    </motion.button>
  );

  return (
    <div style={styles.container}>
      <span style={styles.pageInfo}>
        Page <strong style={styles.pageStrong}>{table.getState().pagination.pageIndex + 1}</strong> of{' '}
        {table.getPageCount() || 1}
      </span>
      <div style={styles.buttons}>
        {renderButton(<TbPlayerTrackPrevFilled size={14} />, () => table.setPageIndex(0), prevDisabled, 'first')}
        {renderButton(
          <TbPlayerPlayFilled style={{ rotate: '180deg' }} size={14} />,
          () => table.previousPage(),
          prevDisabled,
          'prev',
        )}
        {renderButton(<TbPlayerPlayFilled size={14} />, () => table.nextPage(), nextDisabled, 'next')}
        {renderButton(
          <TbPlayerTrackNextFilled size={14} />,
          () => table.setPageIndex(table.getPageCount() - 1),
          nextDisabled,
          'last',
        )}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flexDirection: 'row',
    gap: t.spacing.m,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  pageInfo: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  pageStrong: {
    color: t.colors.white,
  },
  buttons: {
    flexDirection: 'row',
    gap: t.spacing.xs,
  },
  button: {
    width: 32,
    height: 32,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.gray01 + t.colorOpacity(0.6)}`,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
  },
}));
