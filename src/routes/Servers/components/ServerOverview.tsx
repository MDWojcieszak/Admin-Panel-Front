import { format } from 'date-fns';
import { BsHddStack } from 'react-icons/bs';
import { MdAccessTime, MdPersonOutline, MdPlace, MdTimer } from 'react-icons/md';
import { ServerDetailsResponseDto } from '~/api/api';
import { Loader } from '~/components/Loader';
import { Clocks } from '~/routes/Servers/components/Clocks';
import { DiskTile } from '~/routes/Servers/components/DiskTile';
import { ServerStatTile } from '~/routes/Servers/components/ServerStatTile';
import { formatAgo, formatUptime, toGigabytes } from '~/routes/Servers/utils';
import { mkUseStyles, useTheme } from '~/utils/theme';

type ServerOverviewProps = {
  server?: ServerDetailsResponseDto;
};

export const ServerOverview = ({ server }: ServerOverviewProps) => {
  const styles = useStyles();
  const theme = useTheme();
  if (!server) return <Loader />;

  const { properties } = server;
  const isOnline = properties.isOnline;

  const startedBy = properties.startedBy;
  const startedByName =
    startedBy && (startedBy.firstName || startedBy.lastName)
      ? [startedBy.firstName, startedBy.lastName].filter(Boolean).join(' ')
      : startedBy?.email;

  const disks = properties.diskInfo ?? [];
  const storageUsed = disks.reduce((acc, d) => acc + (d.used ?? 0), 0);
  const storageCapacity = disks.reduce((acc, d) => acc + (d.used ?? 0) + (d.available ?? 0), 0);
  const storagePercent = storageCapacity ? Math.round((storageUsed / storageCapacity) * 100) : 0;

  const lastSeen = isOnline ? 'Online now' : formatAgo(properties.lastSeenAt);

  return (
    <div style={styles.container}>
      <div style={styles.stats}>
        <ServerStatTile
          icon={<MdTimer size={22} />}
          label='Uptime'
          value={(isOnline && formatUptime(properties.uptime)) || (isOnline ? 'just now' : 'Offline')}
          accent={isOnline ? 'lightGreen' : 'dark05'}
        />
        <ServerStatTile icon={<MdAccessTime size={22} />} label='Last seen' value={lastSeen} />
        <ServerStatTile
          icon={<MdPersonOutline size={22} />}
          label='Started by'
          value={startedByName || '—'}
          sub={startedBy?.role}
        />
        <ServerStatTile icon={<MdPlace size={22} />} label='Location' value={server.location || '—'} />
        <ServerStatTile
          icon={<BsHddStack size={20} />}
          label='Storage'
          value={`${toGigabytes(storageUsed).toFixed(0)} / ${toGigabytes(storageCapacity).toFixed(0)} GB`}
          sub={`${storagePercent}% · ${disks.length} disk${disks.length === 1 ? '' : 's'}`}
          accent='blue03'
          progress={storagePercent}
        />
      </div>

      <Clocks isOnline={isOnline} cpuInfo={properties.cpuInfo} memoryInfo={properties.memoryInfo} />

      <div style={styles.storage}>
        <div style={styles.storageTitle}>
          <BsHddStack size={18} color={theme.colors.blue04} />
          <span>Disks</span>
        </div>
        <div style={styles.disks}>
          {disks.length ? (
            disks.map((disk, index) => <DiskTile diskInfo={disk} key={index} />)
          ) : (
            <span style={styles.empty}>No disk information available.</span>
          )}
        </div>
      </div>

      <div style={styles.footer}>
        <span>Created {format(new Date(server.createdAt), 'd MMM y, HH:mm')}</span>
        {server.updatedAt ? <span>· Updated {format(new Date(server.updatedAt), 'd MMM y, HH:mm')}</span> : null}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.l,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.m,
  },
  storage: {
    gap: t.spacing.m,
  },
  storageTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    fontWeight: 700,
    fontSize: 16,
  },
  disks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.m,
  },
  empty: {
    color: t.colors.dark05,
  },
  footer: {
    flexDirection: 'row',
    gap: t.spacing.s,
    fontSize: 12,
    color: t.colors.dark05,
  },
}));
