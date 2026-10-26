import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiAlertCircle, FiArrowUpCircle, FiChevronRight, FiClock, FiLoader } from 'react-icons/fi';
import { ApplicationResponse, ContainerOrigin, ReleaseResponse, ReleaseStatus } from '~/api/api';
import { Badge } from '~/components/Badge';
import { DeploySteps } from '~/routes/Deploy/components/DeploySteps';
import { useDeployStyles } from '~/routes/Deploy/components/shared';
import {
  ORIGIN_LABEL,
  ORIGIN_TONE,
  RELEASE_LABEL,
  releaseLabel,
  RUNTIME_LABEL,
  RUNTIME_TONE,
  startedBy,
  TRIGGER_LABEL,
} from '~/routes/Deploy/utils';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** A release the agent is still working on; the backend allows one per application. */
export const IN_FLIGHT: ReleaseStatus[] = [ReleaseStatus.Pending, ReleaseStatus.Deploying, ReleaseStatus.Cancelling];

type ApplicationTileProps = {
  app: ApplicationResponse;
  /** The newest release, when it is under way, waiting for confirmation or just failed. */
  latest?: ReleaseResponse;
  onOpen: () => void;
};

/** "for 2 min" from a start time, ticking every few seconds while shown. */
const useElapsed = (since?: string) => {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!since) return;
    const timer = window.setInterval(() => tick((n) => n + 1), 5000);
    return () => window.clearInterval(timer);
  }, [since]);
  return since ? formatDistanceToNow(new Date(since)) : '';
};

/**
 * One application: what runs, and — the moment a deployment starts — that it
 * is under way, which version, who started it, for how long and how far its
 * steps have got. The tile is lit while it lasts, so it reads from across the list.
 */
export const ApplicationTile = ({ app, latest, onOpen }: ApplicationTileProps) => {
  const styles = useStyles();
  const shared = useDeployStyles();
  const theme = useTheme();
  const [hover, setHover] = useState(false);
  const release = app.currentRelease;
  const inFlight = latest && IN_FLIGHT.includes(latest.status) ? latest : undefined;
  const waiting = latest?.status === ReleaseStatus.Deferred ? latest : undefined;
  // A newest release that failed after the running one: worth saying until the next deploy.
  const failed =
    latest?.status === ReleaseStatus.Failed &&
    latest.id !== release?.id &&
    (!release || latest.createdAt > release.createdAt)
      ? latest
      : undefined;
  const elapsed = useElapsed(inFlight?.createdAt);
  const accent = inFlight ? theme.colors.blue : failed ? theme.colors.red : waiting ? theme.colors.yellow : undefined;

  return (
    <button
      type='button'
      style={{
        ...styles.tile,
        ...(hover ? styles.tileHover : null),
        ...(accent
          ? { borderColor: accent + theme.colorOpacity(0.55), boxShadow: `0 0 0 1px ${accent}22 inset` }
          : null),
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
    >
      <div style={styles.top}>
        <span style={styles.name}>{app.displayName || app.slug}</span>
        <Badge label={RUNTIME_LABEL[app.runtimeStatus]} tone={RUNTIME_TONE[app.runtimeStatus]} />
      </div>
      <span style={{ ...shared.muted, ...shared.mono, ...styles.ellipsis }}>
        {app.slug}
        {app.image ? ` · ${app.image}` : ''}
      </span>
      {app.origin !== ContainerOrigin.Managed || app.availableDigest ? (
        <div style={shared.row}>
          {app.origin !== ContainerOrigin.Managed ? (
            <Badge label={ORIGIN_LABEL[app.origin]} tone={ORIGIN_TONE[app.origin]} />
          ) : null}
          {app.availableDigest ? (
            <Badge label='Update available' tone='blue' icon={<FiArrowUpCircle size={12} />} />
          ) : null}
        </div>
      ) : null}

      {inFlight ? (
        <div style={{ ...styles.banner, ...styles.bannerLive }}>
          <div style={styles.bannerTop}>
            <motion.span
              style={styles.spinner}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            >
              <FiLoader size={14} />
            </motion.span>
            <span style={styles.bannerTitle}>
              {RELEASE_LABEL[inFlight.status]} {releaseLabel(inFlight)}
            </span>
            <span style={styles.bannerTime}>for {elapsed}</span>
          </div>
          <span style={styles.bannerMeta}>
            {TRIGGER_LABEL[inFlight.trigger]}
            {startedBy(inFlight) ? ` · ${startedBy(inFlight)}` : ''}
          </span>
          {inFlight.processId ? (
            // The steps fill in live from the process log, as on the application's page.
            <div style={styles.steps} onClick={(e) => e.stopPropagation()}>
              <DeploySteps compact processId={inFlight.processId} releaseStatus={inFlight.status} />
            </div>
          ) : (
            <span style={styles.bannerMeta}>Waiting for the agent to pick it up…</span>
          )}
        </div>
      ) : waiting ? (
        <div style={{ ...styles.banner, ...styles.bannerWaiting }}>
          <div style={styles.bannerTop}>
            <FiClock size={14} />
            <span style={styles.bannerTitle}>{releaseLabel(waiting)} waiting for confirmation</span>
          </div>
          <span style={styles.bannerMeta}>The agent deploys this one itself and reports when it is done.</span>
        </div>
      ) : failed ? (
        <div style={{ ...styles.banner, ...styles.bannerFailed }}>
          <div style={styles.bannerTop}>
            <FiAlertCircle size={14} />
            <span style={styles.bannerTitle}>{releaseLabel(failed)} failed</span>
            <span style={styles.bannerTime}>
              {formatDistanceToNow(new Date(failed.createdAt), { addSuffix: true })}
            </span>
          </div>
          {failed.failureReason ? <span style={styles.reason}>{failed.failureReason}</span> : null}
        </div>
      ) : null}

      <div style={styles.footer}>
        {release ? (
          <>
            <span style={styles.footerLabel}>Running</span>
            <span style={styles.version}>{releaseLabel(release)}</span>
            {release.deployedAt ? (
              <span style={shared.muted}>{formatDistanceToNow(new Date(release.deployedAt), { addSuffix: true })}</span>
            ) : null}
          </>
        ) : (
          <span style={shared.muted}>Never deployed</span>
        )}
        <FiChevronRight
          size={16}
          color={hover ? theme.colors.white : theme.colors.dark05}
          style={{ flexShrink: 0, marginLeft: 'auto' }}
        />
      </div>
    </button>
  );
};

const useStyles = mkUseStyles((t) => ({
  tile: {
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.s,
    padding: t.spacing.m,
    textAlign: 'left',
    cursor: 'pointer',
    color: 'inherit',
    font: 'inherit',
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    border: '1px solid transparent',
    transition: 'background-color 0.12s ease, border-color 0.2s ease',
    minWidth: 0,
  },
  tileHover: { backgroundColor: t.colors.gray02 + t.colorOpacity(0.75) },
  top: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.s,
  },
  name: {
    fontSize: 16,
    fontWeight: 700,
    color: t.colors.white,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  ellipsis: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  banner: { gap: 4, padding: `${t.spacing.s}px ${t.spacing.sm}px`, borderRadius: t.borderRadius.default },
  bannerLive: { backgroundColor: t.colors.blue + t.colorOpacity(0.12), color: t.colors.lightBlue },
  bannerWaiting: { backgroundColor: t.colors.yellow + t.colorOpacity(0.1), color: t.colors.yellow },
  bannerFailed: { backgroundColor: t.colors.red + t.colorOpacity(0.1), color: t.colors.red },
  bannerTop: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, minWidth: 0 },
  spinner: { display: 'flex', flexShrink: 0 },
  bannerTitle: {
    fontSize: 14,
    fontWeight: 700,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  bannerMeta: { fontSize: 12, opacity: 0.85 },
  // The time on the banner's first line, at its right end.
  bannerTime: { fontSize: 12, opacity: 0.85, whiteSpace: 'nowrap', marginLeft: 'auto', flexShrink: 0 },
  reason: {
    fontSize: 12,
    color: t.colors.white,
    opacity: 0.85,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  steps: { marginTop: 2, cursor: 'default' },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    marginTop: 'auto',
    paddingTop: t.spacing.s,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  version: { fontSize: 14, fontWeight: 700, color: t.colors.white },
}));
