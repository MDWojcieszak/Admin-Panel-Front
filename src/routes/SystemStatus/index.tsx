import { format } from 'date-fns';
import { MdRefresh } from 'react-icons/md';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import {
  AGGREGATE,
  AGGREGATE_SUB,
  CHECK,
  PingDot,
  SignalBars,
  UNKNOWN,
  latencyQuality,
  subsystemMeta,
} from '~/routes/SystemStatus/shared';
import { useSystemStatus } from '~/routes/SystemStatus/useSystemStatus';
import { mkUseStyles, useTheme } from '~/utils/theme';

export const SystemStatus = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { data, loading, error, refresh } = useSystemStatus();

  const aggregate = (data && AGGREGATE[data.status]) || UNKNOWN;
  const aggregateColor = theme.colors[aggregate.color];
  const dimBar = theme.colors.gray05 + theme.colorOpacity(0.9);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>System Status</h2>
          {data ? (
            <span style={styles.checkedAt}>Checked at {format(new Date(data.checkedAt), 'HH:mm:ss · d MMM')}</span>
          ) : (
            <span style={styles.checkedAt}>Live connectivity checks — run on demand.</span>
          )}
        </div>
        <Button
          label='Refresh'
          icon={<MdRefresh size={18} />}
          variant='secondary'
          onClick={refresh}
          loading={loading}
          disabled={loading}
        />
      </div>

      {loading && !data ? (
        <Loader />
      ) : error && !data ? (
        <div style={styles.errorBox}>Couldn’t load system status. Try refreshing.</div>
      ) : data ? (
        <>
          <div style={{ ...styles.aggregate, borderColor: aggregateColor, backgroundColor: aggregateColor + theme.colorOpacity(0.1) }}>
            <PingDot color={aggregateColor} pulse={data.status === 'ok'} size={14} />
            <div style={styles.aggregateText}>
              <span style={{ ...styles.aggregateLabel, color: aggregateColor }}>{aggregate.label}</span>
              <span style={styles.aggregateSub}>{AGGREGATE_SUB[data.status] || 'Subsystem health.'}</span>
            </div>
          </div>

          <div style={styles.tiles}>
            {data.checks.map((check) => {
              const meta = subsystemMeta(check.name);
              const status = CHECK[check.status] || UNKNOWN;
              const statusColor = theme.colors[status.color];
              const isUp = check.status === 'up';
              const isDown = check.status === 'down';
              // Latency is only a meaningful "ping" when the subsystem is actually up.
              // A down check still reports a latencyMs (time until it failed/timed out),
              // so we must not render that as a healthy signal.
              const quality = isUp && check.latencyMs != null ? latencyQuality(check.latencyMs) : undefined;
              const qualityColor = quality ? theme.colors[quality.color] : theme.colors.dark05;

              return (
                <div key={check.name} style={styles.tile}>
                  <div style={styles.tileTop}>
                    <div style={{ ...styles.iconWrap, color: statusColor, backgroundColor: statusColor + theme.colorOpacity(0.12) }}>
                      {meta.icon}
                    </div>
                    <div style={styles.tileHead}>
                      <span style={styles.tileName}>{meta.label}</span>
                      <div style={styles.badge}>
                        <PingDot color={statusColor} pulse={isUp} />
                        <span style={{ color: statusColor, fontWeight: 600, fontSize: 13 }}>{status.label}</span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.divider} />

                  <div style={styles.tileBottom}>
                    {isUp && quality ? (
                      <>
                        <SignalBars level={quality.level} color={qualityColor} dim={dimBar} />
                        <div style={styles.latencyText}>
                          <span style={styles.latencyValue}>{Math.round(check.latencyMs as number)} ms</span>
                          <span style={{ ...styles.latencyQuality, color: qualityColor }}>{quality.label}</span>
                        </div>
                      </>
                    ) : isDown ? (
                      <>
                        <SignalBars level={0} color={theme.colors.red} dim={dimBar} />
                        <span style={{ ...styles.latencyQuality, color: theme.colors.red }}>No response</span>
                      </>
                    ) : (
                      <span style={styles.latencyQuality}>Not checked</span>
                    )}
                  </div>

                  {check.detail ? (
                    <span style={{ ...styles.detail, color: isDown ? theme.colors.red : theme.colors.dark05 }}>
                      {check.detail}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.l,
    height: '100%',
    minHeight: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
  },
  checkedAt: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  aggregate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.l,
    borderRadius: t.borderRadius.large,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  aggregateText: {
    gap: 2,
  },
  aggregateLabel: {
    fontWeight: 700,
    fontSize: 18,
  },
  aggregateSub: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.m,
  },
  tile: {
    flex: 1,
    minWidth: 240,
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
  },
  iconWrap: {
    width: 42,
    height: 42,
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.medium,
  },
  tileHead: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  tileName: {
    fontWeight: 700,
    fontSize: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  divider: {
    height: 1,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.7),
  },
  tileBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    minHeight: 19,
  },
  latencyText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: t.spacing.s,
  },
  latencyValue: {
    fontSize: 18,
    fontWeight: 800,
    fontVariantNumeric: 'tabular-nums',
  },
  latencyQuality: {
    fontSize: 12,
    color: t.colors.dark05,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: 600,
  },
  detail: {
    fontSize: 13,
    wordBreak: 'break-word',
  },
  errorBox: {
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.red + t.colorOpacity(0.12),
    color: t.colors.red,
  },
}));
