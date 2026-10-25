import { useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiColumns, FiInbox, FiList, FiSettings, FiUsers } from 'react-icons/fi';
import { CreateTaskDto, ProjectDetailResponse, ProjectRole, ProjectType, TaskResponse } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { PageHeader } from '~/components/PageHeader';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useIsMobile } from '~/hooks/useBreakpoint';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { MainNavigationRoute } from '~/navigation/types';
import { QuickAdd } from '~/routes/Projects/components/QuickAdd';
import { Avatar, ProjectsPage, useProjectStyles } from '~/routes/Projects/components/shared';
import { TaskBoard } from '~/routes/Projects/components/TaskBoard';
import { TaskList } from '~/routes/Projects/components/TaskList';
import { useProjectEvents } from '~/routes/Projects/hooks/useProjectEvents';
import { ProjectSettingsModal } from '~/routes/Projects/modals/ProjectSettingsModal';
import { ShareModal } from '~/routes/Projects/modals/ShareModal';
import { TaskPanel } from '~/routes/Projects/modals/TaskPanel';
import {
  canCheck,
  canEdit,
  donePercent,
  dueLabel,
  ROLE_LABEL,
  ROLE_TONE,
  STATUS_LABEL,
  STATUS_TONE,
  TYPE_LABEL,
  userName,
} from '~/routes/Projects/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

enum View {
  BOARD = 'board',
  LIST = 'list',
}

const QUICK_ADD_PLACEHOLDER: Record<ProjectType, string> = {
  GENERAL: 'Add a task',
  LIST: 'Add an item: "2 kg flour", "milk"',
  TRIP: 'Something to arrange or pack',
  DIY: 'A step, a part to order, a thing to test',
};

/** Projects are listed at /projects; the panel opens a task with ?task=<id>. */
const projectsRoot = `/${MainNavigationRoute.PROJECTS}`;

export const ProjectDetail = () => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const toast = useToast();
  const { id: routeId } = useParams<{ id: string }>();
  const [params, setParams] = useSearchParams();
  const { projectsApi, tasksApi } = useApi();

  const projectQuery = useAsync<ProjectDetailResponse>(async () => {
    if (!projectsApi || !routeId) return undefined;
    const { data } = await projectsApi.projectControllerGet({ id: routeId });
    return data;
  }, [projectsApi, routeId]);
  const project = projectQuery.data;

  const tasksQuery = useAsync<TaskResponse[]>(async () => {
    if (!projectsApi || !project) return undefined;
    const { data } = await projectsApi.projectControllerListTasks({ id: project.id });
    return data;
  }, [projectsApi, project?.id]);
  const tasks = tasksQuery.data ?? [];

  const reload = () => {
    projectQuery.reload();
    tasksQuery.reload();
  };

  useProjectEvents(
    (event) => {
      if (event.kind === 'task') {
        tasksQuery.reload();
        // Progress and counts in the header follow the tasks.
        projectQuery.reload();
      } else reload();
    },
    project?.id,
  );

  const taskModal = useModal('project-task', TaskPanel, { title: 'Task', type: 'side' });
  const shareModal = useModal('project-share', ShareModal, { title: 'Share' });
  const settingsModal = useModal('project-settings', ProjectSettingsModal, { title: 'Project settings', type: 'side' });

  const openTask = (taskId: string) => setParams((prev) => ({ ...Object.fromEntries(prev), task: taskId }));

  // The panel follows the URL, so a task link opens straight into it.
  const taskParam = params.get('task');
  const shownTask = useRef<string | null>(null);
  useEffect(() => {
    if (!taskParam || !project || shownTask.current === taskParam) return;
    shownTask.current = taskParam;
    const closed = () => {
      shownTask.current = null;
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('task');
        return next;
      });
    };
    taskModal.show({
      taskId: taskParam,
      onClose: closed,
      handleClose: async () => {
        closed();
        taskModal.hide();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskParam, project?.id]);

  if (projectQuery.loading && !project) return <Loader />;
  if (!project) {
    return (
      <EmptyState
        title='Project not found'
        description='It was deleted, or it is no longer shared with you.'
        icon={<FiInbox size={24} color={theme.colors.blue04} />}
      />
    );
  }

  const editable = canEdit(project.role);
  const checkable = canCheck(project.role, project.viewersCanCheck);
  const shopping = project.type === ProjectType.List;
  const defaultView = shopping || isMobile ? View.LIST : View.BOARD;
  const view = (params.get('view') as View | null) ?? defaultView;
  const setView = (next: View) =>
    setParams((prev) => {
      const out = new URLSearchParams(prev);
      if (next === defaultView) out.delete('view');
      else out.set('view', next);
      return out;
    });

  const run = async (action: () => Promise<unknown>, failure: string) => {
    try {
      await action();
    } catch (e) {
      toast(getApiErrorMessage(e, failure), 'error');
    } finally {
      tasksQuery.reload();
      projectQuery.reload();
    }
  };

  const addTask = (dto: CreateTaskDto, statusId?: string) =>
    run(async () => {
      if (!projectsApi) return;
      await projectsApi.projectControllerCreateTask({ id: project.id, createTaskDto: { ...dto, statusId } });
    }, 'Could not add the task.');

  const moveTask = (taskId: string, statusId: string, index: number) => {
    const status = project.statuses.find((s) => s.id === statusId);
    tasksQuery.setData((prev) => {
      const moving = prev?.find((t) => t.id === taskId);
      if (!prev || !moving || !status) return prev;
      const others = prev.filter((t) => t.id !== taskId);
      const column = others.filter((t) => t.status.id === statusId);
      const moved = {
        ...moving,
        status: { id: status.id, name: status.name, color: status.color, category: status.category },
      };
      const before = column[index];
      const at = before
        ? others.indexOf(before)
        : column.length
          ? others.indexOf(column[column.length - 1]) + 1
          : others.length;
      return [...others.slice(0, at), moved, ...others.slice(at)];
    });
    run(async () => {
      if (!tasksApi) return;
      await tasksApi.taskControllerMove({ id: taskId, moveTaskDto: { statusId, index } });
    }, 'Could not move the task.');
  };

  const toggleTask = (task: TaskResponse) =>
    run(async () => {
      if (!tasksApi) return;
      await tasksApi.taskControllerToggle({ id: task.id });
    }, 'Could not change the task.');

  const { progress } = project;
  const people = [project.owner, ...project.members.map((m) => m.user)];

  const body =
    view === View.BOARD ? (
      <TaskBoard
        statuses={project.statuses}
        tasks={tasks}
        editable={editable}
        withQuantity={shopping}
        onOpen={openTask}
        onMove={moveTask}
        onAdd={(statusId, dto) => addTask(dto, statusId)}
      />
    ) : (
      <TaskList
        statuses={project.statuses}
        tasks={tasks}
        checkable={checkable}
        shopping={shopping}
        onOpen={openTask}
        onToggle={toggleTask}
      />
    );

  return (
    <ProjectsPage
      scroll={view === View.LIST}
      header={
        <>
          <PageHeader
            leading={
              <button
                type='button'
                title='All projects'
                style={shared.iconButton}
                onClick={() => navigate(projectsRoot)}
              >
                <FiArrowLeft size={18} />
              </button>
            }
            title={project.isInbox ? 'Inbox' : project.title}
            badges={
              <>
                <span style={shared.key}>{project.key}</span>
                {project.isInbox ? null : <Badge label={TYPE_LABEL[project.type]} />}
                {project.isInbox ? null : (
                  <Badge label={STATUS_LABEL[project.status]} tone={STATUS_TONE[project.status]} />
                )}
                {project.role !== ProjectRole.Owner ? (
                  <Badge label={ROLE_LABEL[project.role]} tone={ROLE_TONE[project.role]} />
                ) : null}
                {project.archivedAt ? <Badge label='Archived' tone='yellow' /> : null}
              </>
            }
            meta={[
              progress.total ? `${progress.done} of ${progress.total} done` : 'No tasks yet',
              progress.overdue ? `${progress.overdue} overdue` : '',
              project.dueDate ? `due ${dueLabel(project.dueDate)}` : '',
              project.role !== ProjectRole.Owner ? `shared by ${userName(project.owner)}` : '',
            ]
              .filter(Boolean)
              .join(' · ')}
            actions={
              <>
                {project.isInbox ? null : (
                  <button
                    type='button'
                    title='Share'
                    style={styles.people}
                    onClick={() => shareModal.show({ projectId: project.id, onLeft: () => navigate(projectsRoot) })}
                  >
                    {people.length > 1 ? (
                      people.slice(0, 4).map((u) => <Avatar key={u.id} user={u} size={26} />)
                    ) : (
                      <FiUsers size={16} />
                    )}
                    <span>Share</span>
                  </button>
                )}
                <Button
                  label={isMobile ? '' : 'Settings'}
                  variant='secondary'
                  icon={<FiSettings size={14} />}
                  onClick={() => settingsModal.show({ projectId: project.id, onGone: () => navigate(projectsRoot) })}
                />
              </>
            }
          />
          {project.description ? (
            <span style={{ ...shared.muted, ...styles.description }}>{project.description}</span>
          ) : null}
          <div style={styles.bar}>
            <div style={{ ...styles.barFill, width: `${donePercent(progress)}%` }} />
          </div>
          <div style={styles.toolbar}>
            {editable ? (
              <div style={styles.quickAdd}>
                <QuickAdd
                  placeholder={QUICK_ADD_PLACEHOLDER[project.type]}
                  withQuantity={shopping}
                  onAdd={(dto) => addTask(dto)}
                />
              </div>
            ) : (
              <span style={{ ...shared.muted, flex: 1 }}>
                {checkable ? 'You can tick things off here.' : 'You can look, not change.'}
              </span>
            )}
            <SegmentedTabs
              items={[
                { label: 'Board', value: View.BOARD, icon: <FiColumns size={14} /> },
                { label: 'List', value: View.LIST, icon: <FiList size={14} /> },
              ]}
              selected={view}
              handleSelect={(value) => setView(value as View)}
              layoutId='project-view'
            />
          </div>
        </>
      }
    >
      {tasksQuery.loading && !tasksQuery.data ? <Loader /> : body}
    </ProjectsPage>
  );
};

const useStyles = mkUseStyles((t) => ({
  description: { maxWidth: 720, whiteSpace: 'pre-wrap', marginTop: -t.spacing.s },
  bar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: t.colors.white + t.colorOpacity(0.06),
  },
  barFill: { height: '100%', backgroundColor: t.colors.lightGreen, transition: 'width 0.3s ease' },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.m, flexWrap: 'wrap' },
  quickAdd: { flex: '1 1 280px', maxWidth: 640 },
  people: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 36,
    padding: `0 ${t.spacing.sm}px 0 ${t.spacing.xs}px`,
    border: 'none',
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    color: t.colors.white,
    backgroundColor: t.colors.gray01 + t.colorOpacity(0.6),
  },
}));
