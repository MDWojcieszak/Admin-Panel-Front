import { ReactNode } from 'react';
import { MdInbox } from 'react-icons/md';
import { mkUseStyles, useTheme } from '~/utils/theme';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
};

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <div style={styles.container}>
      <div style={styles.iconWrap}>{icon ?? <MdInbox size={26} color={theme.colors.blue04} />}</div>
      <span style={styles.title}>{title}</span>
      {description ? <span style={styles.description}>{description}</span> : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: t.spacing.s,
    padding: t.spacing.xl,
  },
  iconWrap: {
    width: 56,
    height: 56,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    color: t.colors.blue04,
    backgroundColor: t.colors.blue + t.colorOpacity(0.12),
    border: `1px solid ${t.colors.blue + t.colorOpacity(0.25)}`,
    marginBottom: t.spacing.xs,
  },
  title: {
    fontWeight: 700,
    fontSize: 15,
  },
  description: {
    fontSize: 13,
    color: t.colors.dark05,
    maxWidth: 320,
  },
}));
