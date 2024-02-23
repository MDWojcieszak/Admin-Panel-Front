import { AnimatedTick } from '~/components/icons/Tick';

import { mkUseStyles } from '~/utils/theme';

export const Dashboard = () => {
  const styles = useStyles();
  return (
    <div style={styles.container}>
      <AnimatedTick />
    </div>
  );
};

const useStyles = mkUseStyles(() => ({
  container: {},
}));
