import { CommandRuntimeStatus, ContainerOrigin, ReleaseStatus, ReleaseTrigger } from '~/api/api';
import { BadgeTone } from '~/components/Badge';

export const ORIGIN_LABEL: Record<ContainerOrigin, string> = {
  MANAGED: 'Managed',
  ADOPTABLE: 'Adoptable',
  TRUENAS: 'TrueNAS',
  STANDALONE: 'Standalone',
};

export const ORIGIN_TONE: Record<ContainerOrigin, BadgeTone> = {
  MANAGED: 'green',
  ADOPTABLE: 'blue',
  TRUENAS: 'purple',
  STANDALONE: 'neutral',
};

export const ORIGIN_HINT: Record<ContainerOrigin, string> = {
  MANAGED: 'Deployed by this panel',
  ADOPTABLE: 'A compose stack the panel can take over',
  TRUENAS: 'Owned by TrueNAS — view and restart only',
  STANDALONE: 'A plain container without compose — view only',
};

export const RUNTIME_LABEL: Record<CommandRuntimeStatus, string> = {
  IDLE: 'Idle',
  STARTING: 'Starting',
  RUNNING: 'Running',
  STOPPING: 'Stopping',
  STOPPED: 'Stopped',
  ERROR: 'Error',
};

export const RUNTIME_TONE: Record<CommandRuntimeStatus, BadgeTone> = {
  IDLE: 'neutral',
  STARTING: 'yellow',
  RUNNING: 'green',
  STOPPING: 'yellow',
  STOPPED: 'neutral',
  ERROR: 'red',
};

export const RELEASE_LABEL: Record<ReleaseStatus, string> = {
  PENDING: 'Pending',
  DEPLOYING: 'Deploying',
  ACTIVE: 'Active',
  FAILED: 'Failed',
  SUPERSEDED: 'Superseded',
  ROLLED_BACK: 'Rolled back',
  DEFERRED: 'Deferred',
  UNKNOWN: 'Unknown',
  CANCELLED: 'Cancelled',
};

export const RELEASE_TONE: Record<ReleaseStatus, BadgeTone> = {
  PENDING: 'neutral',
  DEPLOYING: 'yellow',
  ACTIVE: 'green',
  FAILED: 'red',
  SUPERSEDED: 'neutral',
  ROLLED_BACK: 'purple',
  DEFERRED: 'blue',
  UNKNOWN: 'yellow',
  CANCELLED: 'neutral',
};

/** A release still in flight: its status will change on its own. */
export const isReleaseRunning = (status: ReleaseStatus) =>
  status === ReleaseStatus.Pending || status === ReleaseStatus.Deploying || status === ReleaseStatus.Deferred;

export const TRIGGER_LABEL: Record<ReleaseTrigger, string> = {
  MANUAL: 'Manual',
  WEBHOOK: 'Webhook',
  SCHEDULE: 'Schedule',
  AUTO_UPDATE: 'Auto update',
  ROLLBACK: 'Rollback',
  AUTO_ROLLBACK: 'Auto rollback',
};

/** Docker state of one container, as a badge tone. */
export const containerTone = (state: string, health?: string | null): BadgeTone => {
  if (health === 'unhealthy') return 'red';
  if (health === 'starting') return 'yellow';
  if (state === 'running') return 'green';
  if (state === 'restarting') return 'yellow';
  if (state === 'exited' || state === 'dead') return 'red';
  return 'neutral';
};

/** `sha256:abcdef…` → `abcdef123456`, enough to tell digests apart. */
export const shortDigest = (digest?: string | null) => (digest ? digest.replace(/^sha256:/, '').slice(0, 12) : '—');

export const shortCommit = (commit?: string | null) => (commit ? commit.slice(0, 7) : '—');

/**
 * How a release is named: its version (image tag), else its git commit,
 * else the image digest. Git releases rarely carry a version, and the
 * digest alone says nothing about what code runs.
 */
export const releaseLabel = (release: { version?: string | null; commit?: string | null; digest?: string | null }) =>
  release.version || (release.commit ? shortCommit(release.commit) : shortDigest(release.digest));

export type DiffLine = { kind: 'same' | 'added' | 'removed'; text: string };

/**
 * Line diff (LCS). Compose files are a few hundred lines at most, so the
 * quadratic table is fine and keeps this dependency-free.
 */
export const diffLines = (before: string, after: string): DiffLine[] => {
  const a = before.split('\n');
  const b = after.split('\n');
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      lines.push({ kind: 'same', text: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      lines.push({ kind: 'removed', text: a[i++] });
    } else {
      lines.push({ kind: 'added', text: b[j++] });
    }
  }
  while (i < a.length) lines.push({ kind: 'removed', text: a[i++] });
  while (j < b.length) lines.push({ kind: 'added', text: b[j++] });

  return lines;
};

/** Env var names the backend accepts (assertEnvKey). */
export const ENV_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
