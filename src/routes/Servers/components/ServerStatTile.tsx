import { ReactNode } from 'react';
import { mkUseStyles, Theme, useTheme } from '~/utils/theme';

type ServerStatTileProps = {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: keyof Theme['colors'];
  /** 0–100; when provided, renders a thin usage bar under the value. */
  progress?: number;
};

export const ServerStatTile = ({ icon, label, value, sub, accent = 'blue04', progress }: ServerStatTileProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const clamped = progress === undefined ? undefined : Math.max(0, Math.min(100, progress));
  return (
    <div style={styles.container}>
      <div style={{ ...styles.iconWrap, color: theme.colors[accent] }}>{icon}</div>
      <div style={styles.text}>
        <span style={styles.label}>{label}</span>
        <span style={styles.value}>{value}</span>
        {sub ? <span style={styles.sub}>{sub}</span> : null}
        {clamped !== undefined ? (
          <div style={styles.bar}>
            <div style={{ ...styles.barFill, width: `${clamped}%`, backgroundColor: theme.colors[accent] }} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.m,
    minWidth: 200,
    flex: 1,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    borderRadius: t.borderRadius.large,
  },
  iconWrap: {
    width: 42,
    height: 42,
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.medium,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
  },
  text: {
    gap: 2,
    minWidth: 0,
    flex: 1,
  },
  bar: {
    height: 5,
    marginTop: 6,
    borderRadius: 3,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.8),
    overflow: 'hidden',
  },
  barFill: {
    height: 5,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    color: t.colors.dark05,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sub: {
    fontSize: 12,
    color: t.colors.dark05,
  },
}));
