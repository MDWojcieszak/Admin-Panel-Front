import { CircularLoading } from '~/components/CircularLoading';
import { mkUseStyles, Theme, useTheme } from '~/utils/theme';
import { FaDotCircle } from 'react-icons/fa';
import { ServerStatus as ServerStatusEnum } from '~/api/api';

type ServerStatusProps = {
  isOnline?: boolean;
  status?: ServerStatusEnum;
  lasSeenAt?: Date;
};

type StatusDescriptor = {
  label: string;
  color: keyof Theme['colors'];
  spinner: boolean;
};

const describeStatus = (status: ServerStatusEnum | undefined, isOnline?: boolean): StatusDescriptor => {
  // Transitional states animate; everything else is a steady dot.
  if (status === ServerStatusEnum.WakeInProgress) return { label: 'Waking up…', color: 'yellow', spinner: true };
  if (status === ServerStatusEnum.ShutdownInProgress) return { label: 'Shutting down…', color: 'yellow', spinner: true };
  if (status === ServerStatusEnum.Error) return { label: 'Error', color: 'red', spinner: false };
  if (status === ServerStatusEnum.Maintenance) return { label: 'Maintenance', color: 'blue', spinner: false };

  // isOnline is authoritative for the offline state (avoids a spinning "Online" on a dead box).
  if (status === ServerStatusEnum.Offline || isOnline === false) return { label: 'Offline', color: 'dark05', spinner: false };
  if (status === ServerStatusEnum.Online || isOnline === true) return { label: 'Online', color: 'lightGreen', spinner: false };
  return { label: 'Unknown', color: 'dark05', spinner: false };
};

export const ServerStatus = ({ isOnline, status }: ServerStatusProps) => {
  const styles = useStyles();
  const theme = useTheme();

  const descriptor = describeStatus(status, isOnline);
  const color = theme.colors[descriptor.color];

  return (
    <div style={styles.container}>
      {descriptor.spinner ? (
        <CircularLoading size={24} duration={2} stroke={color} strokeWidth={8} />
      ) : (
        <FaDotCircle size={22} color={color} />
      )}
      <p style={{ color, marginLeft: theme.spacing.xs }}>{descriptor.label}</p>
    </div>
  );
};

const useStyles = mkUseStyles(() => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}));
