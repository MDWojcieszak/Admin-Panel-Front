import { ServersList } from '~/routes/Servers/components/ServersList';
import { mkUseStyles } from '~/utils/theme';

export const Servers = () => {
  const styles = useStyles();

  return (
    <div style={styles.container}>
      <ServersList />
    </div>
  );
};

const useStyles = mkUseStyles(() => ({
  container: {
    height: '100%',
  },
}));
