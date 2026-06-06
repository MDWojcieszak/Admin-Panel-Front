/** Format an uptime given in seconds as a compact "3d 4h 12m" string. */
export const formatUptime = (seconds?: number): string | undefined => {
  if (!seconds || seconds <= 0) return undefined;
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes || (!days && !hours)) parts.push(`${minutes}m`);
  return parts.join(' ');
};

/** Compact "time ago" — e.g. "< 1 min", "5 min", "2 h", "3 d", "4 mo", "1 y". */
export const formatAgo = (date?: string | Date): string => {
  if (!date) return '—';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return '< 1 min';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo`;
  return `${Math.floor(months / 12)} y`;
};

const GIGABYTE = Math.pow(1024, 3);

/** Convert a byte count to gigabytes. */
export const toGigabytes = (bytes?: number): number => (bytes ? bytes / GIGABYTE : 0);

/** Format a byte count as "12.3 GB". */
export const formatGigabytes = (bytes?: number): string => `${toGigabytes(bytes).toFixed(1)} GB`;
