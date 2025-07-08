import { CircularLoading } from '~/components/CircularLoading';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { FaDotCircle } from 'react-icons/fa';
import { ServerStatus as ServerStatusType } from '~/api/api';

type ServerStatusProps = {
  isOnline?: boolean;
  status?: ServerStatusType;
  lasSeenAt?: Date;
};

export const ServerStatus = ({ isOnline, lasSeenAt, status }: ServerStatusProps) => {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <div style={styles.container}>
      {isOnline ? (
        <>
          <CircularLoading size={24} duration={2} stroke={theme.colors.lightGreen} strokeWidth={8} />
          <p style={{ color: theme.colors.white, marginLeft: theme.spacing.xs }}>{status}</p>
        </>
      ) : (
        <>
          <FaDotCircle size={22} color={theme.colors.dark05} />
          <p style={{ color: theme.colors.dark05, marginLeft: theme.spacing.xs }}>Offline</p>
        </>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}));
