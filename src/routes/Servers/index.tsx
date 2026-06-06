import { ServersList } from '~/routes/Servers/components/ServersList';
import { mkUseStyles } from '~/utils/theme';

export const Servers = () => {
  const styles = useStyles();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Servers</h2>
      <ServersList />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    height: '100%',
    minHeight: 0,
    gap: t.spacing.m,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
  },
}));
