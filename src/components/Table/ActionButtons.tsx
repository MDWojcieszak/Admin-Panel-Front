import { MdDelete, MdEdit, MdInfo } from 'react-icons/md';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
type ActionButtonsProps = {
  id: string;
  onDelete?: F1<string>;
  onEdit?: F1<string>;
  onDetails?: F1<string>;
  onCustom?: F1<string>;
  customChildren?: ReactNode;
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

  const handleDetails = () => {
    p.onDetails?.(p.id);
  };

  const handleCustom = () => {
    p.onCustom?.(p.id);
  };

  return (
    <div style={styles.container}>
      {p.onCustom && (
        <motion.div onClick={handleCustom} style={styles.button} whileHover={{ backgroundColor: theme.colors.blue }}>
          {p.customChildren}
        </motion.div>
      )}
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
      {p.onDetails && (
        <motion.div
          onClick={handleDetails}
          style={styles.button}
          whileHover={{ backgroundColor: theme.colors.lightGreen }}
        >
          <MdInfo />
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
    alignItems: 'center',
    flexDirection: 'row',
  },
}));
