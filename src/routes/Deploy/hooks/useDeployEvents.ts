import { useEffect, useRef } from 'react';
import { AgentHealthResponse, CommandRuntimeStatus, ReleaseStatus } from '~/api/api';
import useWebSocket from '~/hooks/useWebSocket';

export type ReleaseStatusEvent = {
  applicationId: string;
  releaseId: string;
  status: ReleaseStatus;
  failureReason: string | null;
  at: string;
};

export type ApplicationRuntimeEvent = {
  applicationId: string;
  slug: string;
  runtimeStatus: CommandRuntimeStatus;
  message: string | null;
  at: string;
};

export type UpdateAvailableEvent = {
  applicationId: string;
  slug: string;
  digest: string;
};

/**
 * How a start/stop/restart ended. The request itself only says "sent": a
 * failure (a port already taken, a missing image) changes no container, so
 * this is the only place it shows up.
 */
export type StackActionResultEvent = {
  project: string;
  action: string;
  success: boolean;
  error: string | null;
};

type DeployEventHandlers = {
  onAgentHealth?: (health: AgentHealthResponse) => void;
  /** A full snapshot or a single container change: either way, reload the list. */
  onContainersChanged?: () => void;
  onReleaseStatus?: (event: ReleaseStatusEvent) => void;
  onRuntime?: (event: ApplicationRuntimeEvent) => void;
  onUpdateAvailable?: (event: UpdateAvailableEvent) => void;
  onStackActionResult?: (event: StackActionResultEvent) => void;
};

/** Container events arrive in bursts (one per container); reloads are coalesced. */
const CONTAINER_RELOAD_DELAY = 600;

/**
 * Live events from the `deployments` room. The handlers are read through a ref,
 * so callers can pass inline functions without resubscribing every render.
 */
export const useDeployEvents = (handlers: DeployEventHandlers) => {
  const ref = useRef(handlers);
  ref.current = handlers;
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const containersChanged = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => ref.current.onContainersChanged?.(), CONTAINER_RELOAD_DELAY);
  };

  useWebSocket<AgentHealthResponse>('agent.health', (health) => ref.current.onAgentHealth?.(health));
  useWebSocket('containers.snapshot', containersChanged);
  useWebSocket('container.changed', containersChanged);
  useWebSocket<ReleaseStatusEvent>('release.status', (event) => ref.current.onReleaseStatus?.(event));
  useWebSocket<ApplicationRuntimeEvent>('application.runtime', (event) => ref.current.onRuntime?.(event));
  useWebSocket<UpdateAvailableEvent>('application.update-available', (event) => ref.current.onUpdateAvailable?.(event));
  useWebSocket<StackActionResultEvent>('stack.action.result', (event) => ref.current.onStackActionResult?.(event));
};

/** Message for a failed action, or null when there is nothing to report. */
export const stackActionFailure = (event: StackActionResultEvent): string | null =>
  event.success ? null : `${event.action} on ${event.project} failed: ${event.error ?? 'no reason given'}`;
