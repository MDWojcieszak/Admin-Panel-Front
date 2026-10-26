import { useEffect, useMemo, useState } from 'react';
import { FiCheck, FiCornerUpRight, FiSkipForward, FiTrash2 } from 'react-icons/fi';
import { ProjectRole, ProjectSummaryResponse, StatusCategory, TaskResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { SearchSelect } from '~/components/SearchSelect';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { useProjectStyles } from '~/routes/Projects/components/shared';
import { TaskMeta } from '~/routes/Projects/components/TaskMeta';
import { projectOptions } from '~/routes/Projects/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

type InboxTriageModalProps = {
  inboxId: string;
} & Partial<InternalModalProps>;

const TARGET_KEY = 'inbox-triage-target';

const lastTarget = () => {
  try {
    return localStorage.getItem(TARGET_KEY) ?? '';
  } catch {
    return '';
  }
};

/**
 * The inbox, one task at a time: move it to the project it belongs in, mark
 * it done, delete it, or leave it for later. An inbox nobody empties stops
 * being trusted; this makes emptying it a minute's work.
 */
export const InboxTriageModal = (p: InboxTriageModalProps) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const toast = useToast();
  const { projectsApi, tasksApi } = useApi();
  const [tasks, setTasks] = useState<TaskResponse[]>();
  const [projects, setProjects] = useState<ProjectSummaryResponse[]>([]);
  const [index, setIndex] = useState(0);
  const [target, setTarget] = useState(lastTarget);
  const [busy, setBusy] = useState(false);
  const [handled, setHandled] = useState(0);

  useEffect(() => {
    if (!projectsApi) return;
    projectsApi
      .projectControllerListTasks({ id: p.inboxId })
      .then(({ data }) => setTasks(data.filter((t) => t.status.category !== StatusCategory.Done)))
      .catch(() => setTasks([]));
    projectsApi
      .projectControllerList({ archived: false })
      .then(({ data }) => setProjects(data.filter((pr) => !pr.isInbox && pr.role !== ProjectRole.Viewer)))
      .catch(() => setProjects([]));
  }, [projectsApi, p.inboxId]);

  const options = useMemo(() => projectOptions(projects), [projects]);

  if (!tasks) return <Loader />;
  const task = tasks[index];

  if (!task) {
    return (
      <div style={styles.container}>
        <span style={styles.doneTitle}>{tasks.length ? 'Inbox processed' : 'The inbox is empty'}</span>
        <span style={shared.muted}>
          {handled
            ? `${handled} task${handled === 1 ? '' : 's'} sorted.`
            : tasks.length
              ? 'Everything left is waiting for later.'
              : 'Nothing to sort.'}
        </span>
        <Button label='Close' onClick={() => p.handleClose?.()} />
      </div>
    );
  }

  /** Done with this one: the next comes up. */
  const next = (counted: boolean) => {
    if (counted) {
      setHandled((n) => n + 1);
      setTasks((list) => list?.filter((t) => t.id !== task.id));
    } else {
      setIndex((i) => i + 1);
    }
  };

  const act = async (action: () => Promise<unknown>, failure: string) => {
    setBusy(true);
    try {
      await action();
      next(true);
    } catch (e) {
      toast(getApiErrorMessage(e, failure), 'error');
    } finally {
      setBusy(false);
    }
  };

  const move = () =>
    tasksApi &&
    target &&
    act(async () => {
      const { data } = await tasksApi.taskControllerMoveToProject({
        id: task.id,
        moveTaskToProjectDto: { projectId: target },
      });
      try {
        localStorage.setItem(TARGET_KEY, target);
      } catch {
        // Remembering the last project is a convenience only.
      }
      if (data.droppedDocuments) {
        toast(`${data.droppedDocuments} file(s) pinned by others stayed behind.`, 'info');
      }
    }, 'Could not move the task.');

  const remaining = tasks.length - index;

  return (
    <div style={styles.container}>
      <span style={shared.muted}>
        {remaining} to sort{handled ? ` · ${handled} done` : ''}
      </span>
      <div style={styles.card}>
        <span style={styles.title}>{task.title}</span>
        {task.notes ? <span style={{ ...shared.muted, ...styles.notes }}>{task.notes}</span> : null}
        <TaskMeta task={task} />
      </div>
      <div style={styles.moveRow}>
        <SearchSelect
          bare
          value={target && projects.some((pr) => pr.id === target) ? target : ''}
          options={options}
          placeholder='Move to…'
          onChange={setTarget}
          style={styles.select}
        />
        <Button
          label='Move'
          icon={<FiCornerUpRight size={14} />}
          disabled={!target || busy || !projects.some((pr) => pr.id === target)}
          onClick={move}
        />
      </div>
      <div style={styles.actions}>
        <Button
          label='Done'
          variant='secondary'
          icon={<FiCheck size={14} color={theme.colors.lightGreen} />}
          disabled={busy}
          onClick={() =>
            tasksApi && act(() => tasksApi.taskControllerToggle({ id: task.id }), 'Could not tick it off.')
          }
        />
        <Button
          label='Delete'
          variant='secondary'
          icon={<FiTrash2 size={14} />}
          disabled={busy}
          onClick={() => tasksApi && act(() => tasksApi.taskControllerRemove({ id: task.id }), 'Could not delete it.')}
        />
        <Button
          label='Later'
          variant='secondary'
          icon={<FiSkipForward size={14} />}
          disabled={busy}
          onClick={() => next(false)}
        />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.m, width: 'min(520px, 90vw)' },
  card: {
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
  },
  title: { fontSize: 18, fontWeight: 700, color: t.colors.white, wordBreak: 'break-word' },
  notes: { whiteSpace: 'pre-wrap', maxHeight: 160, overflowY: 'auto' },
  // Stretch: the Move button takes the select's height instead of sitting short beside it.
  moveRow: { flexDirection: 'row', alignItems: 'stretch', gap: t.spacing.s },
  select: { flex: 1, minWidth: 0 },
  actions: { flexDirection: 'row', gap: t.spacing.s, flexWrap: 'wrap' },
  doneTitle: { fontSize: 18, fontWeight: 700, color: t.colors.white },
}));
