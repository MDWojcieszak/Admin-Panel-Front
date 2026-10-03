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

type DeployEventHandlers = {
  onAgentHealth?: (health: AgentHealthResponse) => void;
  /** A full snapshot or a single container change: either way, reload the list. */
  onContainersChanged?: () => void;
  onReleaseStatus?: (event: ReleaseStatusEvent) => void;
  onRuntime?: (event: ApplicationRuntimeEvent) => void;
  onUpdateAvailable?: (event: UpdateAvailableEvent) => void;
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
};
