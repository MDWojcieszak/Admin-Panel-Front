import { useState } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { ProjectStatusResponse, StatusCategory, TaskResponse } from '~/api/api';
import { Checkbox, StatusDot, useProjectStyles } from '~/routes/Projects/components/shared';
import { TaskMeta } from '~/routes/Projects/components/TaskMeta';
import { quantityLabel } from '~/routes/Projects/utils';
import { mkUseStyles, useTheme } from '~/utils/theme';

type TaskListProps = {
  statuses: ProjectStatusResponse[];
  tasks: TaskResponse[];
  checkable: boolean;
  /** Lists show the amount up front and hide task keys. */
  shopping: boolean;
  onOpen: (taskId: string) => void;
  onToggle: (task: TaskResponse) => void;
};

/**
 * Tasks grouped by status, ticked off in place. Done groups start folded on a
 * list, so what is still to buy stays on screen.
 */
export const TaskList = (p: TaskListProps) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const [folded, setFolded] = useState<Record<string, boolean>>({});

  const groups = p.statuses
    .map((status) => ({ status, tasks: p.tasks.filter((t) => t.status.id === status.id) }))
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
                {tasks.map((task) => {
                  const done = task.status.category === StatusCategory.Done;
                  const amount = quantityLabel(task.quantity, task.unit);
                  return (
                    <div key={task.id} style={{ ...shared.listRow, ...styles.row }} onClick={() => p.onOpen(task.id)}>
                      <Checkbox checked={done} disabled={!p.checkable} onChange={() => p.onToggle(task)} />
                      {p.shopping && amount ? <span style={styles.amount}>{amount}</span> : null}
                      <span
                        style={{
                          ...styles.title,
                          color: done ? theme.colors.dark05 : theme.colors.white,
                          textDecoration: done ? 'line-through' : undefined,
                        }}
                      >
                        {task.title}
                      </span>
                      {p.shopping ? null : <span style={shared.key}>{task.key}</span>}
                      <TaskMeta task={task} hideQuantity={p.shopping} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
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
  row: { cursor: 'pointer' },
  amount: { fontSize: 14, fontWeight: 700, color: t.colors.blue04, whiteSpace: 'nowrap' },
  title: { flex: 1, minWidth: 0, fontSize: 14, wordBreak: 'break-word' },
}));
