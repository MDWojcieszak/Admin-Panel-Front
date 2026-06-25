import { useEffect, useState } from 'react';

/**
 * Wake deadline used when the backend hasn't told us one yet (e.g. on a fresh page
 * load we only have `statusChangedAt` from REST, not the event's `wakeTimeoutMs`).
 * Matches the backend default.
 */
export const DEFAULT_WAKE_TIMEOUT_MS = 120000;

/**
 * Drives a determinate wake-progress bar entirely from backend-provided values.
 * `since` is the moment the WAKE_IN_PROGRESS status took effect (`statusChangedAt` /
 * the event's `since`); `wakeTimeoutMs` is the deadline. While `active`, a 1s tick
 * advances `elapsed`/`progress`; the rest is pure math, no FE-owned wake logic.
 */
export const useWakeProgress = (
  since?: string | null,
  wakeTimeoutMs: number = DEFAULT_WAKE_TIMEOUT_MS,
  active: boolean = true,
) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active, since]);

  const start = since ? Date.parse(since) : NaN;
  const elapsedMs = Number.isNaN(start) ? 0 : Math.max(0, now - start);
  const timeout = wakeTimeoutMs > 0 ? wakeTimeoutMs : DEFAULT_WAKE_TIMEOUT_MS;
  const progress = Math.max(0, Math.min(1, elapsedMs / timeout));

  return { elapsedMs, elapsedSec: Math.floor(elapsedMs / 1000), progress };
};
