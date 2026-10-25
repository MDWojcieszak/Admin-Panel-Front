import { useNavigate } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { MdOutlineTaskAlt } from 'react-icons/md';
import { MyTasksView, TaskResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useToast } from '~/hooks/useToast';
import { MainNavigationRoute, ProjectsNavigationRoute } from '~/navigation/types';
import { Checkbox, useProjectStyles } from '~/routes/Projects/components/shared';
import { TaskMeta } from '~/routes/Projects/components/TaskMeta';
import { useProjectEvents } from '~/routes/Projects/hooks/useProjectEvents';
import { projectPath } from '~/routes/Projects/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

const SHOWN = 6;

/**
 * What is due on you today or already late, across every project. Hidden
 * when there is nothing: the dashboard only shows what needs a look.
 */
export const MyWorkCard = () => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const { tasksApi } = useApi();

  // "Today" already includes what is overdue: everything due by tonight.
  const query = useAsync<TaskResponse[]>(async () => {
    if (!tasksApi) return undefined;
    const { data } = await tasksApi.taskControllerMine({ view: MyTasksView.Today });
    return data;
  }, [tasksApi]);

  useProjectEvents(() => query.reload());

  const tasks = query.data ?? [];
  if (!tasks.length) return null;
  const overdue = tasks.filter((t) => t.overdue).length;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>
          <MdOutlineTaskAlt size={18} color={theme.colors.blue04} />
          My work today
        </span>
        <span style={shared.muted}>
          {tasks.length - overdue} due{overdue ? ' · ' : ''}
          {overdue ? <span style={{ color: theme.colors.red }}>{overdue} overdue</span> : null}
        </span>
      </div>
      <div style={shared.list}>
        {tasks.slice(0, SHOWN).map((task) => (
          <div
            key={task.id}
            style={{ ...shared.listRow, cursor: 'pointer' }}
            onClick={() => navigate(`${projectPath(task.project.id)}?task=${task.id}`)}
          >
            <Checkbox
              checked={false}
              onChange={async () => {
                if (!tasksApi) return;
                try {
                  await tasksApi.taskControllerToggle({ id: task.id });
                  query.reload();
                } catch (e) {
                  toast(getApiErrorMessage(e, 'Could not tick it off.'), 'error');
                }
              }}
            />
            <span style={styles.task}>
              <span style={{ ...shared.ellipsis, fontSize: 14, color: theme.colors.white }}>{task.title}</span>
              <span style={{ ...shared.muted, fontSize: 12 }}>
                {task.project.isInbox ? 'Inbox' : task.project.title}
              </span>
            </span>
            <TaskMeta task={task} />
          </div>
        ))}
      </div>
      <button
        type='button'
        style={styles.more}
        onClick={() => navigate(`/${MainNavigationRoute.PROJECTS}/${ProjectsNavigationRoute.MY_WORK}`)}
      >
        {tasks.length > SHOWN ? `All ${tasks.length} in My work` : 'Open My work'}
        <FiChevronRight size={14} />
      </button>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  card: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.m },
  title: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    fontSize: 16,
    fontWeight: 700,
    color: t.colors.white,
  },
  task: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 },
  more: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: 13,
    color: t.colors.blue04,
  },
}));
