import { useState } from 'react';
import { FiChevronDown, FiChevronRight, FiFlag } from 'react-icons/fi';
import { ProjectStatusResponse, StatusCategory, TaskResponse } from '~/api/api';
import { useIsMobile } from '~/hooks/useBreakpoint';
import { Checkbox, StatusDot, useProjectStyles } from '~/routes/Projects/components/shared';
import { TaskMeta } from '~/routes/Projects/components/TaskMeta';
import { PRIORITY_COLOR, PRIORITY_LABEL, quantityLabel, sortTasks, TaskSort } from '~/routes/Projects/utils';
import { mkUseStyles, useTheme } from '~/utils/theme';

type TaskListProps = {
  statuses: ProjectStatusResponse[];
  /** Top-level tasks; their subtasks come in `subtasks`, by parent. */
  tasks: TaskResponse[];
  subtasks: Map<string, TaskResponse[]>;
  sort: TaskSort;
  checkable: boolean;
  /** Lists show the amount up front and hide task keys. */
  shopping: boolean;
  onOpen: (taskId: string) => void;
  onToggle: (task: TaskResponse) => void;
};

/**
 * Tasks grouped by status, ticked off in place, each with its subtasks under
 * it. Done groups start folded on a list, so what is still to buy stays on
 * screen.
 */
export const TaskList = (p: TaskListProps) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const [folded, setFolded] = useState<Record<string, boolean>>({});

  const groups = p.statuses
    .map((status) => ({
      status,
      tasks: sortTasks(
        p.tasks.filter((t) => t.status.id === status.id),
        p.sort,
      ),
    }))
    .filter((g) => g.tasks.length > 0);

  if (groups.length === 0) return <div style={shared.emptyRow}>No tasks yet. Add the first one above.</div>;

  return (
    <div style={styles.groups}>
      {groups.map(({ status, tasks }) => {
        const isFolded = folded[status.id] ?? (p.shopping && status.category === StatusCategory.Done);
        return (
          <div key={status.id} style={styles.group}>
            <button
              type='button'
              style={styles.groupHeader}
              onClick={() => setFolded((f) => ({ ...f, [status.id]: !isFolded }))}
            >
              {isFolded ? <FiChevronRight size={14} /> : <FiChevronDown size={14} />}
              <StatusDot color={status.color} />
              <span style={styles.groupTitle}>{status.name}</span>
              <span style={shared.muted}>{tasks.length}</span>
            </button>
            {isFolded ? null : (
              <div style={shared.list}>
                {tasks.map((task) => (
                  <div key={task.id} style={styles.entry}>
                    <TaskRow task={task} {...p} />
                    {(p.subtasks.get(task.id) ?? []).map((sub) => (
                      <TaskRow key={sub.id} task={sub} nested {...p} />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const TaskRow = ({ task, nested, ...p }: TaskListProps & { task: TaskResponse; nested?: boolean }) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const isMobile = useIsMobile();
  const done = task.status.category === StatusCategory.Done;
  const amount = quantityLabel(task.quantity, task.unit);
  const priority = theme.colors[PRIORITY_COLOR[task.priority]];
  // A list is ticked in any order: priority would only be noise on it.
  const showPriority = !p.shopping && !done;

  return (
    <div
      style={{
        ...shared.listRow,
        ...styles.row,
        ...(nested ? styles.nested : null),
        boxShadow: showPriority && !nested ? `inset 3px 0 0 ${priority}` : undefined,
      }}
      onClick={() => p.onOpen(task.id)}
    >
      {/* The tick takes a finger-sized area around the box. */}
      <span
        style={styles.tick}
        onClick={(e) => {
          e.stopPropagation();
          if (p.checkable) p.onToggle(task);
        }}
      >
        <Checkbox checked={done} disabled={!p.checkable} size={nested ? 18 : 20} onChange={() => p.onToggle(task)} />
      </span>
      {p.shopping && amount ? <span style={styles.amount}>{amount}</span> : null}
      <span
        style={{
          ...styles.title,
          fontSize: nested ? 13 : 14,
          color: theme.colors.white,
        }}
      >
        {task.title}
      </span>
      {showPriority ? (
        <span style={{ ...styles.priority, color: priority }} title={`${PRIORITY_LABEL[task.priority]} priority`}>
          <FiFlag size={11} />
          {isMobile ? null : PRIORITY_LABEL[task.priority]}
        </span>
      ) : null}
      {nested && !done ? <StatusDot color={task.status.color} size={7} /> : null}
      {/* A subtask's key is in its panel; on the row it only crowds a phone. */}
      {p.shopping || nested ? null : <span style={shared.key}>{task.key}</span>}
      <TaskMeta task={task} hideQuantity={p.shopping} hidePriority style={styles.meta} />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  groups: { gap: t.spacing.l },
  group: { gap: t.spacing.s },
  groupHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: t.colors.dark05,
    width: 'fit-content',
  },
  groupTitle: { fontSize: 13, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: t.colors.white },
  entry: { gap: 1 },
  // Wraps: on a narrow screen the facts drop under the title, to the right.
  row: { cursor: 'pointer', flexWrap: 'wrap', paddingLeft: t.spacing.xs },
  nested: { paddingLeft: t.spacing.xl, minHeight: 40, backgroundColor: t.colors.gray02 + t.colorOpacity(0.2) },
  tick: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    margin: '-4px -6px',
    flexShrink: 0,
    cursor: 'pointer',
  },
  amount: { fontSize: 14, fontWeight: 700, color: t.colors.blue04, whiteSpace: 'nowrap' },
  title: { flex: '1 1 160px', minWidth: 0, wordBreak: 'break-word' },
  priority: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  meta: { marginLeft: 'auto', justifyContent: 'flex-end' },
}));
