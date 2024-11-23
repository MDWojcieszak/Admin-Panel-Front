import { MdDelete, MdEdit } from 'react-icons/md';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { motion } from 'framer-motion';
type ActionButtonsProps = {
  id: string;
  onDelete?: F1<string>;
  onEdit?: F1<string>;
};
export const ActionButtons = (p: ActionButtonsProps) => {
  const styles = useStyles();
  const theme = useTheme();

  const handleEdit = () => {
    p.onEdit?.(p.id);
  };

  const handleDelete = () => {
    p.onDelete?.(p.id);
  };

  return (
    <div style={styles.container}>
      {p.onEdit && (
        <motion.div onClick={handleEdit} style={styles.button} whileHover={{ backgroundColor: theme.colors.blue }}>
          <MdEdit />
        </motion.div>
      )}
      {p.onDelete && (
        <motion.div onClick={handleDelete} style={styles.button} whileHover={{ backgroundColor: theme.colors.red }}>
          <MdDelete />
        </motion.div>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flexDirection: 'row',
    gap: t.spacing.s,
  },
  button: {
    backgroundColor: t.colors.gray05,
    paddingLeft: t.spacing.m,
    paddingRight: t.spacing.m,
    paddingTop: t.spacing.s,
    paddingBottom: t.spacing.s,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
  },
}));
