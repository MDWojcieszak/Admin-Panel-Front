import { DragEvent, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { CreateTaskDto, ProjectStatusResponse, StatusCategory, TaskResponse } from '~/api/api';
import { QuickAdd } from '~/routes/Projects/components/QuickAdd';
import { StatusDot, useProjectStyles } from '~/routes/Projects/components/shared';
import { TaskMeta } from '~/routes/Projects/components/TaskMeta';
import { mkUseStyles, useTheme } from '~/utils/theme';

type DropTarget = { statusId: string; index: number; beforeId: string | null };

type TaskBoardProps = {
  statuses: ProjectStatusResponse[];
  tasks: TaskResponse[];
  editable: boolean;
  withQuantity: boolean;
  onOpen: (taskId: string) => void;
  /** `index` counts the column's other tasks, as the API's move does. */
  onMove: (taskId: string, statusId: string, index: number) => void;
  onAdd: (statusId: string, dto: CreateTaskDto) => Promise<unknown>;
};

/** One column per status, in workflow order; drag a card to change its status or place. */
export const TaskBoard = (p: TaskBoardProps) => {
  const styles = useStyles();
  const [dragging, setDragging] = useState<string>();
  const [target, setTarget] = useState<DropTarget>();
  const [addingTo, setAddingTo] = useState<string>();

  const dragOver = (e: DragEvent<HTMLDivElement>, statusId: string) => {
    if (!dragging) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const others = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[data-task-card]')).filter(
      (el) => el.dataset.taskCard !== dragging,
    );
    const index = others.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2 < e.clientY;
    }).length;
    const beforeId = others[index]?.dataset.taskCard ?? null;
    if (target?.statusId !== statusId || target.index !== index) setTarget({ statusId, index, beforeId });
  };

  const drop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dragging && target) p.onMove(dragging, target.statusId, target.index);
    setDragging(undefined);
    setTarget(undefined);
  };

  return (
    <div style={styles.board}>
      {p.statuses.map((status) => {
        const tasks = p.tasks.filter((t) => t.status.id === status.id);
        const isTarget = target?.statusId === status.id;
        const indicator = <div key='drop-indicator' style={styles.indicator} />;
        return (
          <div
            key={status.id}
            style={{ ...styles.column, ...(isTarget ? styles.columnTarget : {}) }}
            onDragOver={(e) => dragOver(e, status.id)}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setTarget(undefined);
            }}
            onDrop={drop}
          >
            <div style={styles.columnHeader}>
              <StatusDot color={status.color} />
              <span style={styles.columnTitle}>{status.name}</span>
              <span style={styles.count}>{tasks.length}</span>
              {p.editable ? (
                <button
                  type='button'
                  title='Add a task here'
                  style={styles.addButton}
                  onClick={() => setAddingTo(addingTo === status.id ? undefined : status.id)}
                >
                  <FiPlus size={15} />
                </button>
              ) : null}
            </div>
            <div style={styles.cards}>
              {addingTo === status.id ? (
                <QuickAdd
                  autoFocus
                  placeholder='Title, Enter to add'
                  withQuantity={p.withQuantity}
                  onAdd={(dto) => p.onAdd(status.id, dto)}
                />
              ) : null}
              {tasks.map((task) => (
                <div key={task.id} style={styles.slot}>
                  {isTarget && target.beforeId === task.id ? indicator : null}
                  <TaskCard
                    task={task}
                    draggable={p.editable}
                    dimmed={dragging === task.id}
                    onOpen={() => p.onOpen(task.id)}
                    onDragStart={() => setDragging(task.id)}
                    onDragEnd={() => {
                      setDragging(undefined);
                      setTarget(undefined);
                    }}
                  />
                </div>
              ))}
              {isTarget && target.beforeId === null ? indicator : null}
              {tasks.length === 0 && !isTarget && addingTo !== status.id ? (
                <span style={styles.empty}>{p.editable ? 'Drop a task here' : 'Nothing here'}</span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TaskCard = ({
  task,
  draggable,
  dimmed,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  task: TaskResponse;
  draggable: boolean;
  dimmed: boolean;
  onOpen: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const [hover, setHover] = useState(false);
  const done = task.status.category === StatusCategory.Done;

  return (
    <div
      data-task-card={task.id}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.key);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...styles.card,
        ...(hover ? styles.cardHover : {}),
        opacity: dimmed ? 0.4 : 1,
        cursor: draggable ? 'grab' : 'pointer',
      }}
    >
      <span
        style={{
          ...styles.cardTitle,
          color: done ? theme.colors.dark05 : theme.colors.white,
          textDecoration: done ? 'line-through' : undefined,
        }}
      >
        {task.title}
      </span>
      <div style={{ ...shared.row, justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <span style={shared.key}>{task.key}</span>
        <TaskMeta task={task} />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  board: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.m,
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingBottom: t.spacing.s,
    minHeight: 0,
  },
  column: {
    flex: '0 0 280px',
    maxHeight: '100%',
    minHeight: 0,
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    border: '1px solid transparent',
    transition: 'border-color 0.12s ease',
  },
  columnTarget: { borderColor: t.colors.blue + t.colorOpacity(0.5) },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: `${t.spacing.xxs}px ${t.spacing.xs}px`,
    flexShrink: 0,
  },
  columnTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: t.colors.white,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  count: { fontSize: 12, color: t.colors.dark05 },
  addButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    padding: 0,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    color: t.colors.dark05,
    backgroundColor: 'transparent',
  },
  cards: { gap: t.spacing.s, overflowY: 'auto', minHeight: 40 },
  slot: { gap: t.spacing.s },
  card: {
    gap: t.spacing.s,
    padding: `${t.spacing.sm}px ${t.spacing.sm}px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray01 + t.colorOpacity(0.55),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.05)}`,
    userSelect: 'none',
    transition: 'background-color 0.12s ease',
  },
  cardHover: { backgroundColor: t.colors.gray01 + t.colorOpacity(0.85) },
  cardTitle: { fontSize: 14, lineHeight: 1.35, wordBreak: 'break-word' },
  indicator: { height: 3, borderRadius: 2, backgroundColor: t.colors.blue, flexShrink: 0 },
  empty: { fontSize: 12, color: t.colors.dark04, padding: `${t.spacing.s}px ${t.spacing.xs}px` },
}));
