import { ProgressBar } from '~/components/ProgressBar';
import { useWakeProgress } from '~/routes/Servers/hooks/useWakeProgress';
import { mkUseStyles } from '~/utils/theme';

type WakeProgressProps = {
  /** When the WAKE_IN_PROGRESS status took effect (`statusChangedAt` / event `since`). */
  since?: string | null;
  /** Wake deadline in ms; defaults to the backend default when omitted. */
  wakeTimeoutMs?: number;
  /** Hide the "Waking up…" caption (for tight spots like table rows). */
  compact?: boolean;
};

/**
 * Determinate wake bar rendered from backend values only. Show it while a server is
 * WAKE_IN_PROGRESS; it self-advances on a 1s tick and is replaced by the ONLINE/ERROR
 * badge once the backend resolves the transition.
 */
export const WakeProgress = ({ since, wakeTimeoutMs, compact }: WakeProgressProps) => {
  const styles = useStyles();
  const { elapsedSec, progress } = useWakeProgress(since, wakeTimeoutMs);

  return (
    <div style={{ ...styles.container, minWidth: compact ? 120 : 160 }}>
      <ProgressBar progress={Math.round(progress * 100)} />
      {compact ? null : <span style={styles.caption}>Waking up… {elapsedSec}s</span>}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.xs,
  },
  caption: {
    fontSize: 12,
    color: t.colors.dark05,
  },
}));
