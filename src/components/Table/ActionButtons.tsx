import { MdDelete, MdEdit } from 'react-icons/md';
import { mkUseStyles } from '~/utils/theme';

type ActionButtonsProps = {
  id: string;
  onDelete?: F1<string>;
  onEdit?: F1<string>;
};
export const ActionButtons = (p: ActionButtonsProps) => {
  const styles = useStyles();
  return (
    <div style={styles.container}>
      {p.onEdit && (
        <button>
          <MdEdit />
        </button>
      )}
      {p.onDelete && (
        <button>
          <MdDelete />
        </button>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flexDirection: 'row',
    gap: t.spacing.m,
  },
}));
