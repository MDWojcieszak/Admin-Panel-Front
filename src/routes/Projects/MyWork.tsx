import { useState } from 'react';
import { FiInbox } from 'react-icons/fi';
import { MdOutlineTaskAlt } from 'react-icons/md';
import { MyTasksView, TaskResponse } from '~/api/api';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { PageHeader } from '~/components/PageHeader';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { QuickAdd } from '~/routes/Projects/components/QuickAdd';
import { Checkbox, ProjectsPage, StatusDot, useProjectStyles } from '~/routes/Projects/components/shared';
import { TaskMeta } from '~/routes/Projects/components/TaskMeta';
import { useProjectEvents } from '~/routes/Projects/hooks/useProjectEvents';
import { TaskPanel } from '~/routes/Projects/modals/TaskPanel';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

const VIEW_TABS = [
  { label: 'Today', value: MyTasksView.Today },
  { label: 'This week', value: MyTasksView.Week },
  { label: 'Overdue', value: MyTasksView.Overdue },
  { label: 'All open', value: MyTasksView.Open },
];

const EMPTY: Record<MyTasksView, string> = {
  TODAY: 'Nothing due today.',
  WEEK: 'Nothing due this week.',
  OVERDUE: 'Nothing overdue.',
  OPEN: 'No open tasks assigned to you, and the inbox is empty.',
};

/**
 * What is on you, across every project: tasks assigned to you and whatever
 * sits in your inbox. Quick add drops a task into the inbox, to sort later.
 */
export const MyWork = () => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const toast = useToast();
  const { tasksApi, projectsApi } = useApi();
  const [view, setView] = useState<MyTasksView>(MyTasksView.Open);
  // Ticked at once; the row leaves with the reload the change itself triggers.
  const [ticked, setTicked] = useState<Set<string>>(new Set());

  const query = useAsync<TaskResponse[]>(async () => {
    if (!tasksApi) return undefined;
    const { data } = await tasksApi.taskControllerMine({ view });
    setTicked(new Set());
    return data;
  }, [tasksApi, view]);

  useProjectEvents(() => query.reload());

  const taskModal = useModal('my-work-task', TaskPanel, { title: 'Task', type: 'side' });

  const toggle = async (task: TaskResponse) => {
    if (!tasksApi) return;
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(task.id)) next.delete(task.id);
      else next.add(task.id);
      return next;
    });
    try {
      await tasksApi.taskControllerToggle({ id: task.id });
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not change the task.'), 'error');
      query.reload();
    }
  };

  const tasks = query.data ?? [];

  return (
    <ProjectsPage
      header={
        <>
          <PageHeader title='My work' meta={tasks.length ? `${tasks.length} open` : undefined} />
          <div style={styles.toolbar}>
            <div style={styles.quickAdd}>
              <QuickAdd
                placeholder='Add to your inbox'
                onAdd={async (dto) => {
                  if (!projectsApi) return;
                  try {
                    const { data: inbox } = await projectsApi.projectControllerInbox();
                    await projectsApi.projectControllerCreateTask({ id: inbox.id, createTaskDto: dto });
                    query.reload();
                  } catch (e) {
                    toast(getApiErrorMessage(e, 'Could not add the task.'), 'error');
                  }
                }}
              />
            </div>
            <SegmentedTabs
              items={VIEW_TABS}
              selected={view}
              handleSelect={(value) => setView(value as MyTasksView)}
              layoutId='my-work-view'
            />
          </div>
        </>
      }
    >
      {query.loading && !query.data ? (
        <Loader />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<MdOutlineTaskAlt size={26} color={theme.colors.blue04} />}
          title='All clear'
          description={EMPTY[view]}
        />
      ) : (
        <div style={shared.list}>
          {tasks.map((task) => {
            const done = ticked.has(task.id);
            return (
              <div
                key={task.id}
                style={{ ...shared.listRow, cursor: 'pointer' }}
                onClick={() => taskModal.show({ taskId: task.id })}
              >
                <Checkbox checked={done} onChange={() => toggle(task)} />
                <div style={styles.main}>
                  <span
                    style={{
                      fontSize: 14,
                      color: done ? theme.colors.dark05 : theme.colors.white,
                      textDecoration: done ? 'line-through' : undefined,
                      wordBreak: 'break-word',
                    }}
                  >
                    {task.title}
                  </span>
                  <span style={{ ...shared.row, ...shared.muted, fontSize: 12 }}>
                    {task.project.isInbox ? <FiInbox size={12} /> : <StatusDot color={task.status.color} size={7} />}
                    {task.project.isInbox ? 'Inbox' : `${task.project.title} · ${task.status.name}`}
                    <span style={shared.key}>{task.key}</span>
                  </span>
                </div>
                <TaskMeta task={task} />
              </div>
            );
          })}
        </div>
      )}
    </ProjectsPage>
  );
};

const useStyles = mkUseStyles((t) => ({
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.m, flexWrap: 'wrap' },
  quickAdd: { flex: '1 1 280px', maxWidth: 640 },
  main: { flex: 1, minWidth: 0, gap: 2 },
}));
