import { ReactNode } from 'react';
import { mkUseStyles, Theme, useTheme } from '~/utils/theme';

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: keyof Theme['colors'];
  /** 0–100; renders a thin bar under the value. */
  progress?: number;
};

/** Single-stat card styled to match the dashboard trend charts. */
export const StatCard = ({ icon, label, value, sub, accent = 'blue04', progress }: StatCardProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const color = theme.colors[accent];
  const clamped = progress === undefined ? undefined : Math.max(0, Math.min(100, progress));
  return (
    <div style={styles.card}>
      <div style={{ ...styles.header, color }}>
        {icon}
        <span style={styles.label}>{label}</span>
      </div>
      <span style={styles.value}>{value}</span>
      {sub ? <span style={styles.sub}>{sub}</span> : null}
      {clamped !== undefined ? (
        <div style={styles.bar}>
          <div style={{ ...styles.barFill, width: `${clamped}%`, backgroundColor: color }} />
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  card: {
    flex: 1,
    minWidth: 190,
    gap: t.spacing.xs,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.04)}`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  value: {
    fontSize: 28,
    fontWeight: 800,
    lineHeight: 1.1,
    color: t.colors.white,
  },
  sub: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  bar: {
    height: 5,
    marginTop: 4,
    borderRadius: 3,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.7),
    overflow: 'hidden',
  },
  barFill: {
    height: 5,
    borderRadius: 3,
  },
}));
