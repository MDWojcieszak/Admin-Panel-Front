import { useEffect, useRef } from 'react';
import { HiX } from 'react-icons/hi';
import { ProcessLog, ProcessLogLevel } from '~/api/api';
import { ProgressBar } from '~/components/ProgressBar';
import { useProcess } from '~/routes/Servers/hooks/useProcess';
import { mkUseStyles, Theme, useTheme } from '~/utils/theme';

type ProcessTerminalProps = {
  processId: string;
  name?: string;
  onClose?: F0;
  /** When true the terminal fills its parent instead of floating in the corner. */
  embedded?: boolean;
};

const LEVEL_COLOR: Record<ProcessLogLevel, keyof Theme['colors']> = {
  LOG: 'dark05',
  SUCCESS: 'lightGreen',
  WARNING: 'yellow',
  ERROR: 'red',
};

export const ProcessTerminal = ({ processId, name, onClose, embedded }: ProcessTerminalProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { logs, progress, label, status, loading } = useProcess(processId);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  const renderLog = (log: ProcessLog) => (
    <div key={log.id} style={styles.logLine}>
      <span style={styles.logTime}>{new Date(log.timestamp).toLocaleTimeString()}</span>
      <span style={{ ...styles.message, color: theme.colors[LEVEL_COLOR[log.level] ?? 'white'] }}>{log.message}</span>
    </div>
  );

  return (
    <div style={embedded ? styles.embedded : styles.container}>
      <div style={styles.header}>
        <div style={styles.titleBlock}>
          <span style={styles.title}>{name || 'Process'}</span>
          {status ? <span style={styles.status}>{status}</span> : null}
        </div>
        {onClose ? <HiX size={22} onClick={onClose} style={styles.close} /> : null}
      </div>
      <div style={styles.progressRow}>
        <ProgressBar progress={progress} />
        <span style={styles.progressLabel}>
          {label ? `${label} · ` : ''}
          {Math.round(progress)}%
        </span>
      </div>
      <div style={embedded ? { ...styles.terminal, ...styles.embeddedTerminal } : styles.terminal}>
        {loading && logs.length === 0 ? <span style={styles.logTime}>Loading logs…</span> : logs.map(renderLog)}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    position: 'fixed',
    right: t.spacing.l,
    bottom: t.spacing.l,
    width: 560,
    maxWidth: 'calc(100vw - 48px)',
    zIndex: 40,
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.98),
    border: `1px solid ${t.colors.gray01}`,
    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
  },
  embedded: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    minWidth: 0,
    overflow: 'hidden',
    gap: t.spacing.s,
    padding: t.spacing.m,
    paddingRight: t.spacing.l,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
    border: `1px solid ${t.colors.gray01}`,
  },
  embeddedTerminal: {
    height: 'auto',
    flex: 1,
    minHeight: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: t.spacing.m,
    minWidth: 0,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    minWidth: 0,
    flex: 1,
  },
  title: {
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  status: {
    fontSize: 12,
    color: t.colors.blue04,
    backgroundColor: t.colors.gray02,
    padding: `2px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
  },
  close: {
    cursor: 'pointer',
  },
  progressRow: {
    gap: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  terminal: {
    height: 280,
    overflowY: 'auto',
    overflowX: 'hidden',
    minWidth: 0,
    alignSelf: 'stretch',
    fontFamily: 'monospace',
    fontSize: 13,
    backgroundColor: t.colors.black + t.colorOpacity(0.5),
    borderRadius: t.borderRadius.default,
    padding: t.spacing.s,
    gap: 2,
  },
  logLine: {
    flexDirection: 'row',
    gap: t.spacing.s,
    alignItems: 'flex-start',
    minWidth: 0,
    alignSelf: 'stretch',
  },
  logTime: {
    color: t.colors.dark04,
    minWidth: 70,
    flexShrink: 0,
  },
  message: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
  },
}));
