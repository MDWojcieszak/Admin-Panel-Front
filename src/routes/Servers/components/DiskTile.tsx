import { ReactNode } from 'react';
import { BsDeviceHddFill } from 'react-icons/bs';
import { DiskInfoDto } from '~/api/api';
import { mkUseStyles, useTheme } from '~/utils/theme';

type DiskTileProps = {
  diskInfo: DiskInfoDto;
  actions?: ReactNode;
};

const gigabytes = (bytes: number) => bytes / Math.pow(1024, 3);

export const DiskTile = ({ diskInfo, actions }: DiskTileProps) => {
  const styles = useStyles();
  const theme = useTheme();

  const used = diskInfo.used ?? 0;
  const available = diskInfo.available ?? 0;
  const capacity = used + available;
  const usage = capacity ? (used / capacity) * 100 : 0;
  const hasData = capacity > 0;

  const usageColor = usage >= 90 ? theme.colors.red : usage >= 70 ? theme.colors.yellow : theme.colors.lightGreen;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.iconWrap}>
          <BsDeviceHddFill size={22} color={theme.colors.blue04} />
        </div>
        <div style={styles.titleBlock}>
          <span style={styles.name}>{diskInfo.name || 'Local disk'}</span>
          <span style={styles.sub}>{[diskInfo.fs, diskInfo.type].filter(Boolean).join(' · ') || '—'}</span>
        </div>
        {diskInfo.mediaType ? <span style={styles.badge}>{diskInfo.mediaType}</span> : null}
        {actions}
      </div>

      <div style={styles.statsRow}>
        <span style={styles.used}>
          {hasData ? `${gigabytes(used).toFixed(1)} / ${gigabytes(capacity).toFixed(1)} GB` : 'Unknown'}
        </span>
        {hasData ? <span style={{ ...styles.percent, color: usageColor }}>{usage.toFixed(0)}%</span> : null}
      </div>

      <div style={styles.bar}>
        <div style={{ ...styles.barFill, width: `${usage}%`, backgroundColor: usageColor }} />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    width: 320,
    flex: 1,
    maxWidth: 420,
    gap: t.spacing.m,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
  },
  iconWrap: {
    width: 40,
    height: 40,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.medium,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sub: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  badge: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: t.colors.blue04,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.7),
    padding: `3px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  used: {
    fontSize: 14,
    color: t.colors.blue04,
  },
  percent: {
    fontSize: 18,
    fontWeight: 800,
  },
  bar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.8),
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
}));
