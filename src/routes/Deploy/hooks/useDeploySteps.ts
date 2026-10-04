import { useEffect, useMemo, useState } from 'react';
import { ReleaseStatus, ServerProcessStatus } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import useWebSocket from '~/hooks/useWebSocket';
import { ProcessLogPayload, ProcessStatusPayload } from '~/routes/Servers/types';

export type StepKey = 'build' | 'pull' | 'down' | 'up' | 'health';
export type StepState = 'done' | 'failed' | 'running' | 'idle';
export type DeployStep = { key: StepKey; label: string; state: StepState };

/** The backend pages process logs by at most 20. */
const PAGE = 20;
/** Enough for a long pull; beyond this only the newest lines are read. */
const MAX_LINES = 4000;

const LABELS: Record<StepKey, string> = {
  build: 'Build',
  pull: 'Pull',
  down: 'Down',
  up: 'Up',
  health: 'Health',
};

/**
 * Which step a log line opens. The agent prints every compose command as
 * `$ docker compose … <subcommand>` before running it, and announces the
 * health gate in plain words (deployment-agent, deploy.service.ts).
 */
const stepOf = (message: string): StepKey | undefined => {
  if (message.startsWith('$ docker')) {
    const words = message.split(/\s+/);
    if (words.includes('build')) return 'build';
    if (words.includes('pull')) return 'pull';
    if (words.includes('down')) return 'down';
    if (words.includes('up')) return 'up';
  }
  if (message.startsWith('Waiting for services to become healthy')) return 'health';
  return undefined;
};

const finishedOk = (process?: ServerProcessStatus, release?: ReleaseStatus) =>
  process === ServerProcessStatus.Ended ||
  process === ServerProcessStatus.Closed ||
  release === ReleaseStatus.Active ||
  release === ReleaseStatus.Superseded;

const finishedBad = (process?: ServerProcessStatus, release?: ReleaseStatus) =>
  process === ServerProcessStatus.Failed || release === ReleaseStatus.Failed || release === ReleaseStatus.RolledBack;

/**
 * The deployment as steps — build, pull, (down,) up, health — read from the
 * process log: done, failed, running, or idle when it never ran.
 */
export const useDeploySteps = (processId?: string, releaseStatus?: ReleaseStatus) => {
  const { serverApi } = useApi();
  const [messages, setMessages] = useState<string[]>([]);
  const [status, setStatus] = useState<ServerProcessStatus>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!serverApi || !processId) return;
    let active = true;
    setMessages([]);
    setStatus(undefined);
    setLoading(true);
    (async () => {
      try {
        const [first, process] = await Promise.all([
          serverApi.serverProcessControllerGetAllLogs({ id: processId, take: PAGE, skip: 0 }),
          serverApi.serverProcessControllerGetOne({ id: processId }),
        ]);
        if (!active) return;
        setStatus(process.data.status);
        // Pages come newest first; fetch the rest side by side, then put them in order.
        const total = Math.min(first.data.total, MAX_LINES);
        const skips: number[] = [];
        for (let skip = PAGE; skip < total; skip += PAGE) skips.push(skip);
        const pages = [first.data.logs];
        for (let i = 0; i < skips.length; i += 8) {
          const batch = await Promise.all(
            skips
              .slice(i, i + 8)
              .map((skip) => serverApi.serverProcessControllerGetAllLogs({ id: processId, take: PAGE, skip })),
          );
          if (!active) return;
          pages.push(...batch.map((r) => r.data.logs));
        }
        setMessages(
          pages
            .flat()
            .reverse()
            .map((log) => log.message),
        );
      } catch (e) {
        console.error('Error loading the deployment log:', e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [serverApi, processId]);

  useWebSocket<ProcessLogPayload>('process.log', (payload) => {
    if (payload.processId === processId) setMessages((prev) => [...prev, payload.message]);
  });
  useWebSocket<ProcessStatusPayload>('process.status', (payload) => {
    if (payload.processId === processId) setStatus(payload.status);
  });

  const steps = useMemo<DeployStep[]>(() => {
    const started: StepKey[] = [];
    let healthy = false;
    let unhealthy = false;
    messages.forEach((message) => {
      const step = stepOf(message);
      if (step && !started.includes(step)) started.push(step);
      if (message.startsWith('All services healthy')) healthy = true;
      if (message.startsWith('Health gate failed')) unhealthy = true;
    });
    const ok = finishedOk(status, releaseStatus);
    const bad = finishedBad(status, releaseStatus);
    const last = started[started.length - 1];

    const stateOf = (key: StepKey): StepState => {
      if (key === 'health') {
        if (healthy) return 'done';
        if (unhealthy) return 'failed';
      }
      if (!started.includes(key)) return 'idle';
      if (key !== last) return 'done';
      if (bad) return 'failed';
      if (ok) return 'done';
      return 'running';
    };

    const keys: StepKey[] = [
      'build',
      'pull',
      ...(started.includes('down') ? (['down'] as StepKey[]) : []),
      'up',
      'health',
    ];
    return keys.map((key) => ({ key, label: LABELS[key], state: stateOf(key) }));
  }, [messages, status, releaseStatus]);

  return { steps, loading };
};
