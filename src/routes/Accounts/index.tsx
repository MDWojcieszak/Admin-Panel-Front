import { Card } from '~/components/Card';
import { GlassCard } from '~/components/GlassCard';

import { mkUseStyles, useTheme } from '~/utils/theme';

export const Accounts = () => {
  const styles = useStyles();
  return (
    <GlassCard style={styles.container}>
      <Card>
        <div>Accounts</div>
      </Card>
    </GlassCard>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {},
}));
