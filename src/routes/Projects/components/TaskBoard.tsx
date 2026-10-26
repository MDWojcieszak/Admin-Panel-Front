import { DragEvent, TouchEvent, useEffect, useRef, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { CreateTaskDto, ProjectStatusResponse, StatusCategory, TaskResponse } from '~/api/api';
import { QuickAdd } from '~/routes/Projects/components/QuickAdd';
import { StatusDot, useProjectStyles } from '~/routes/Projects/components/shared';
import { TaskMeta } from '~/routes/Projects/components/TaskMeta';
import { mkUseStyles, useTheme } from '~/utils/theme';

type DropTarget = { statusId: string; index: number; beforeId: string | null };

/** A finger has to rest this long on a card to pick it up; moving sooner scrolls. */
const LONG_PRESS_MS = 350;
const MOVE_TOLERANCE = 8;
/** Near the board's side edges a carried card scrolls the board, to reach the next column. */
const EDGE = 48;
const EDGE_STEP = 14;

/** Where in a column a point falls: the index among the cards not being moved. */
const placeIn = (column: HTMLElement, statusId: string, y: number, moving: string): DropTarget => {
  const others = Array.from(column.querySelectorAll<HTMLElement>('[data-task-card]')).filter(
    (el) => el.dataset.taskCard !== moving,
  );
  const index = others.filter((el) => {
    const r = el.getBoundingClientRect();
    return r.top + r.height / 2 < y;
  }).length;
  return { statusId, index, beforeId: others[index]?.dataset.taskCard ?? null };
};

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
  const shared = useProjectStyles();
  const [dragging, setDragging] = useState<string>();
  const [target, setTarget] = useState<DropTarget>();
  const [addingTo, setAddingTo] = useState<string>();
  const boardRef = useRef<HTMLDivElement>(null);

  const aim = (next: DropTarget | undefined) =>
    setTarget((prev) =>
      prev?.statusId === next?.statusId && prev?.index === next?.index && prev?.beforeId === next?.beforeId
        ? prev
        : next,
    );

  const dragOver = (e: DragEvent<HTMLDivElement>, statusId: string) => {
    if (!dragging) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    aim(placeIn(e.currentTarget, statusId, e.clientY, dragging));
  };

  // Touch has no HTML5 drag and drop: a long press picks the card up, the
  // finger carries it, lifting it drops it. The latest values live in a ref,
  // since the document's listeners outlive any one render.
  const touch = useRef<{ id: string; x: number; y: number; timer?: number; carrying: boolean; target?: DropTarget }>();
  const suppressClick = useRef(false);
  const onMove = useRef(p.onMove);
  onMove.current = p.onMove;

  const touchStart = (e: TouchEvent, taskId: string) => {
    if (!p.editable || e.touches.length !== 1) return;
    const { clientX: x, clientY: y } = e.touches[0];
    const pending = { id: taskId, x, y, carrying: false };
    touch.current = {
      ...pending,
      timer: window.setTimeout(() => {
        if (touch.current?.id !== taskId) return;
        touch.current.carrying = true;
        suppressClick.current = true;
        navigator.vibrate?.(10);
        setDragging(taskId);
      }, LONG_PRESS_MS),
    };
  };

  useEffect(() => {
    const move = (e: globalThis.TouchEvent) => {
      const t = touch.current;
      if (!t) return;
      const { clientX: x, clientY: y } = e.touches[0];
      if (!t.carrying) {
        // Moved before the press was long: a scroll, not a pick-up.
        if (Math.hypot(x - t.x, y - t.y) > MOVE_TOLERANCE) {
          window.clearTimeout(t.timer);
          touch.current = undefined;
        }
        return;
      }
      e.preventDefault();
      const board = boardRef.current;
      if (board) {
        const r = board.getBoundingClientRect();
        if (x < r.left + EDGE) board.scrollLeft -= EDGE_STEP;
        else if (x > r.right - EDGE) board.scrollLeft += EDGE_STEP;
      }
      const column = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-status-column]');
      t.target = column ? placeIn(column, column.dataset.statusColumn!, y, t.id) : undefined;
      aim(t.target);
    };
    const end = () => {
      const t = touch.current;
      if (!t) return;
      window.clearTimeout(t.timer);
      touch.current = undefined;
      if (!t.carrying) return;
      if (t.target) onMove.current(t.id, t.target.statusId, t.target.index);
      setDragging(undefined);
      setTarget(undefined);
      // The click a long press ends with must not open the task.
      window.setTimeout(() => (suppressClick.current = false), 50);
    };
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', end);
    document.addEventListener('touchcancel', end);
    return () => {
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', end);
      document.removeEventListener('touchcancel', end);
    };
  }, []);

  const drop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dragging && target) p.onMove(dragging, target.statusId, target.index);
    setDragging(undefined);
    setTarget(undefined);
  };

  return (
    <div ref={boardRef} style={styles.board}>
      {p.statuses.map((status) => {
        const tasks = p.tasks.filter((t) => t.status.id === status.id);
        const isTarget = target?.statusId === status.id;
        const indicator = <div key='drop-indicator' style={styles.indicator} />;
        return (
          <div
            key={status.id}
            data-status-column={status.id}
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
                  style={{ ...shared.iconButton, ...styles.addButton }}
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
                    onOpen={() => !suppressClick.current && p.onOpen(task.id)}
                    onTouchStart={(e) => touchStart(e, task.id)}
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
  onTouchStart,
  onDragStart,
  onDragEnd,
}: {
  task: TaskResponse;
  draggable: boolean;
  dimmed: boolean;
  onOpen: () => void;
  onTouchStart: (e: TouchEvent) => void;
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
      onTouchStart={onTouchStart}
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
    // Narrower than the screen on a phone, so the next column peeks in.
    flex: '0 0 min(280px, 85vw)',
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
  addButton: { width: 32, height: 32 },
  cards: { gap: t.spacing.s, overflowY: 'auto', minHeight: 40 },
  slot: { gap: t.spacing.s },
  card: {
    gap: t.spacing.s,
    padding: `${t.spacing.sm}px ${t.spacing.sm}px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray01 + t.colorOpacity(0.55),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.05)}`,
    userSelect: 'none',
    // A long press picks the card up; no text callout or image menu over it.
    WebkitTouchCallout: 'none',
    transition: 'background-color 0.12s ease',
  },
  cardHover: { backgroundColor: t.colors.gray01 + t.colorOpacity(0.85) },
  cardTitle: { fontSize: 14, lineHeight: 1.35, wordBreak: 'break-word' },
  indicator: { height: 3, borderRadius: 2, backgroundColor: t.colors.blue, flexShrink: 0 },
  empty: { fontSize: 12, color: t.colors.dark04, padding: `${t.spacing.s}px ${t.spacing.xs}px` },
}));
