import { useCallback, useEffect, useRef } from 'react';
import useWebSocket from '~/hooks/useWebSocket';

export type ProjectChangedEvent = {
  projectId: string;
  kind: 'project' | 'status' | 'member' | 'task';
  taskId?: string;
  actorId: string;
};

/** Changes arrive in bursts (a drag renumbers a column); reloads are coalesced. */
const RELOAD_DELAY = 250;

/**
 * `project.changed` reaches every member of the project (D11). It carries no
 * data, only what changed, so the caller reloads what it shows. Events for
 * other projects are dropped when `projectId` is given.
 */
export const useProjectEvents = (onChange: (event: ProjectChangedEvent) => void, projectId?: string) => {
  const ref = useRef(onChange);
  ref.current = onChange;
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handle = useCallback(
    (event: ProjectChangedEvent) => {
      if (projectId && event.projectId !== projectId) return;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => ref.current(event), RELOAD_DELAY);
    },
    [projectId],
  );

  useWebSocket<ProjectChangedEvent>('project.changed', handle);
};
