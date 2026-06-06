import { ReactNode } from 'react';
import { format } from 'date-fns';
import { FaServer } from 'react-icons/fa6';
import { MdCategory, MdFlag, MdGroup, MdSwapHoriz, MdTerminal } from 'react-icons/md';
import {
  CountByDto,
  DashboardRecentProcessDto,
  PhotoEntryStatus,
  PhotoEntryType,
} from '~/api/api';
import { Badge, BadgeTone } from '~/components/Badge';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { StatCard } from '~/components/StatCard';
import { GallerySection } from '~/routes/Dashboard/components/GallerySection';
import { TrendsSection } from '~/routes/Dashboard/components/TrendsSection';
import { useDashboard } from '~/routes/Dashboard/hooks/useDashboard';
import { getPhotoEntryStatusColors } from '~/routes/PhotoManagement/utils/colors';
import { mkUseStyles, useTheme } from '~/utils/theme';

const typeColor = (theme: ReturnType<typeof useTheme>, key: string) => {
  switch (key) {
    case PhotoEntryType.Work:
      return theme.colors.purple02;
    case PhotoEntryType.Astro:
      return theme.colors.lightGreen;
    default:
      return theme.colors.blue04;
  }
};

/** byType/byStatus only contain present keys — fill the rest with zeros. */
const fillCounts = (arr: CountByDto[], keys: string[]) => {
  const map = new Map(arr.map((c) => [c.key, c.count]));
  return keys.map((key) => ({ key, count: map.get(key) ?? 0 }));
};

const BreakdownCard = ({
  title,
  icon,
  items,
  colorFor,
}: {
  title: string;
  icon: ReactNode;
  items: { key: string; count: number }[];
  colorFor: (key: string) => string;
}) => {
  const styles = useStyles();
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>
        {icon}
        <span>{title}</span>
      </div>
      <div style={styles.barsRow}>
        {items.map((item) => (
          <div key={item.key} style={styles.barCol}>
            <span style={styles.barCount}>{item.count}</span>
            <div style={styles.barTrack}>
              <div
                style={{
                  ...styles.barFill,
                  height: `${(item.count / max) * 100}%`,
                  backgroundColor: colorFor(item.key),
                }}
              />
            </div>
            <span style={styles.barLabel}>{item.key}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const processStatusTone = (status: string): BadgeTone => {
  switch (status) {
    case 'FAILED':
      return 'red';
    case 'STARTED':
    case 'ONGOING':
      return 'green';
    case 'CLOSED':
    case 'ENDED':
      return 'neutral';
    default:
      return 'neutral';
  }
};

const toneColor = (theme: ReturnType<typeof useTheme>, tone: BadgeTone) =>
  tone === 'red' ? theme.colors.red : tone === 'green' ? theme.colors.lightGreen : theme.colors.blue04;

const RecentProcessRow = ({ process }: { process: DashboardRecentProcessDto }) => {
  const styles = useStyles();
  const theme = useTheme();
  const tone = processStatusTone(process.status);
  const color = toneColor(theme, tone);
  return (
    <div style={styles.processRow}>
      <div style={{ ...styles.processIcon, color, backgroundColor: color + theme.colorOpacity(0.12) }}>
        <MdTerminal size={18} />
      </div>
      <div style={styles.processInfo}>
        <span style={styles.processName}>{process.name || process.id}</span>
        <span style={styles.processMeta}>{format(new Date(process.startedAt), 'd MMM y · HH:mm:ss')}</span>
      </div>
      <Badge label={process.status} tone={processStatusTone(process.status)} />
    </div>
  );
};

export const Dashboard = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { overview: data, gallery, loading, forbidden } = useDashboard();

  if (loading) return <div style={styles.centered}><Loader /></div>;
  if (forbidden)
    return <div style={styles.centered}>You don’t have access to the dashboard (requires dashboard.read).</div>;
  if (!data) return null;

  const byType = fillCounts(data.photoEntries.byType, Object.values(PhotoEntryType));
  const byStatus = fillCounts(data.photoEntries.byStatus, Object.values(PhotoEntryStatus));

  return (
    <Scrollbar style={styles.scrollArea}>
      <div style={styles.content}>
      <div style={styles.stats}>
        <StatCard
          icon={<FaServer size={20} />}
          label='Servers'
          value={String(data.servers.total)}
          sub={`${data.servers.online} online · ${data.servers.offline} offline`}
          accent='lightGreen'
        />
        <StatCard
          icon={<MdTerminal size={22} />}
          label='Processes'
          value={String(data.processes.total)}
          sub={`${data.processes.running} running · ${data.processes.failed} failed`}
          accent='blue'
        />
        <StatCard
          icon={<MdGroup size={22} />}
          label='Users'
          value={String(data.users.total)}
          accent='purple02'
        />
        <StatCard
          icon={<MdSwapHoriz size={22} />}
          label='Transfers'
          value={String(data.transfers.total)}
          sub={`${data.transfers.running} running · ${data.transfers.failed} failed`}
          accent='blue04'
        />
      </div>

      <div style={styles.panels}>
        <BreakdownCard
          title={`Photo Library · by type · ${data.photoEntries.total}`}
          icon={<MdCategory size={15} />}
          items={byType}
          colorFor={(key) => typeColor(theme, key)}
        />
        <BreakdownCard
          title='Photo Library · by status'
          icon={<MdFlag size={15} />}
          items={byStatus}
          colorFor={(key) => getPhotoEntryStatusColors(key as PhotoEntryStatus).accent}
        />
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>
          <MdTerminal size={16} /> Recent processes
        </div>
        <div style={styles.processList}>
          {data.processes.recent.length ? (
            data.processes.recent.map((p) => <RecentProcessRow key={p.id} process={p} />)
          ) : (
            <span style={styles.muted}>No recent processes.</span>
          )}
        </div>
      </div>

      {gallery ? <GallerySection gallery={gallery} /> : null}

      <TrendsSection />
      </div>
    </Scrollbar>
  );
};

const useStyles = mkUseStyles((t) => ({
  scrollArea: {
    height: '100%',
  },
  content: {
    gap: t.spacing.l,
    paddingRight: t.spacing.m,
    paddingBottom: t.spacing.m,
  },
  centered: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    color: t.colors.dark05,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.m,
  },
  panels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.m,
  },
  card: {
    flex: 1,
    minWidth: 320,
    gap: t.spacing.m,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    fontWeight: 700,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: t.spacing.m,
    paddingTop: t.spacing.s,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: t.spacing.xs,
  },
  barCount: {
    fontSize: 13,
    fontWeight: 800,
  },
  barTrack: {
    width: '100%',
    maxWidth: 48,
    height: 90,
    justifyContent: 'flex-end',
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.5),
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    minHeight: 3,
    borderTopLeftRadius: t.borderRadius.default,
    borderTopRightRadius: t.borderRadius.default,
  },
  barLabel: {
    fontSize: 11,
    color: t.colors.dark05,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  processList: {
    gap: t.spacing.s,
  },
  processRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    paddingTop: t.spacing.s,
    paddingBottom: t.spacing.s,
    paddingLeft: t.spacing.s,
    paddingRight: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.04)}`,
  },
  processIcon: {
    width: 36,
    height: 36,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
  },
  processInfo: {
    gap: 3,
    minWidth: 0,
    flex: 1,
  },
  processName: {
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  processMeta: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  muted: {
    color: t.colors.dark05,
  },
}));
