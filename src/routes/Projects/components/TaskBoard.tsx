import { DragEvent, TouchEvent, useEffect, useRef, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { CreateTaskDto, ProjectStatusResponse, StatusCategory, TaskResponse } from '~/api/api';
import { KanbanBoard, kanbanPalette } from '~/components/KanbanBoard';
import { useIsMobile } from '~/hooks/useBreakpoint';
import { QuickAdd } from '~/routes/Projects/components/QuickAdd';
import { useProjectStyles } from '~/routes/Projects/components/shared';
import { TaskCard } from '~/routes/Projects/components/TaskCard';
import { sortTasks, TaskSort } from '~/routes/Projects/utils';
import { mkUseStyles, useTheme } from '~/utils/theme';

type DropTarget = { statusId: string; index: number; beforeId: string | null };

/** A finger has to rest this long on a card to pick it up; moving sooner scrolls. */
const LONG_PRESS_MS = 350;
const MOVE_TOLERANCE = 8;
/** Near the board's edges a carried card scrolls it: sideways to the next lane, down a long one. */
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
  /** Top-level tasks; their subtasks come in `subtasks`, by parent. */
  tasks: TaskResponse[];
  subtasks: Map<string, TaskResponse[]>;
  sort: TaskSort;
  editable: boolean;
  checkable: boolean;
  withQuantity: boolean;
  onOpen: (taskId: string) => void;
  onToggle: (task: TaskResponse) => void;
  /** A subtask's status, changed from its parent's card. */
  onStatus: (task: TaskResponse, statusId: string) => void;
  /** `index` counts the column's other tasks, as the API's move does. */
  onMove: (taskId: string, statusId: string, index: number) => void;
  onAdd: (statusId: string, dto: CreateTaskDto) => Promise<unknown>;
};

/**
 * One lane per status, in workflow order, on the shared board, each tinted
 * with its status's colour; drag a card to change its status or, in manual
 * order, its place.
 * Sorted by priority or due date the order is the sort's, so a drop only
 * changes the status.
 */
export const TaskBoard = (p: TaskBoardProps) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const isMobile = useIsMobile();
  const [dragging, setDragging] = useState<string>();
  const [target, setTarget] = useState<DropTarget>();
  const [addingTo, setAddingTo] = useState<string>();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // What is under way shows its subtasks unless folded; the rest unfolds on demand.
  const isExpanded = (task: TaskResponse) => expanded[task.id] ?? task.status.category === StatusCategory.InProgress;
  const boardRef = useRef<HTMLDivElement>(null);
  const manual = p.sort === 'manual';

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
  /** Sorted, a card keeps its column's order: only a new status counts, and it goes last. */
  const commit = useRef<(taskId: string, to: DropTarget) => void>(() => undefined);
  commit.current = (taskId, to) => {
    if (manual) return p.onMove(taskId, to.statusId, to.index);
    const moving = p.tasks.find((t) => t.id === taskId);
    if (!moving || moving.status.id === to.statusId) return;
    p.onMove(taskId, to.statusId, p.tasks.filter((t) => t.status.id === to.statusId).length);
  };

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
        // The lanes share one vertical scroll, inside the sideways one.
        const lanes = board.querySelector<HTMLElement>('.app-scrollbar-view');
        if (lanes) {
          const v = lanes.getBoundingClientRect();
          if (y < v.top + EDGE) lanes.scrollTop -= EDGE_STEP;
          else if (y > v.bottom - EDGE) lanes.scrollTop += EDGE_STEP;
        }
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
      if (t.target) commit.current(t.id, t.target);
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
    if (dragging && target) commit.current(dragging, target);
    setDragging(undefined);
    setTarget(undefined);
  };

  return (
    <KanbanBoard
      scrollRef={boardRef}
      dragging={Boolean(dragging)}
      // Narrower than the screen on a phone, so the next lane peeks in.
      minLaneWidth={isMobile ? 'min(280px, 82vw)' : 260}
      lanes={p.statuses.map((status) => {
        const tasks = sortTasks(
          p.tasks.filter((t) => t.status.id === status.id),
          p.sort,
        );
        const isTarget = target?.statusId === status.id;
        // Sorted, there is no place in the lane to show: the lane lights up instead.
        const showIndicator = isTarget && manual;
        const indicator = <div key='drop-indicator' style={styles.indicator} />;
        return {
          id: status.id,
          title: status.name,
          count: tasks.length,
          palette: kanbanPalette(status.color || theme.colors.dark05),
          highlight: isTarget,
          actions: p.editable ? (
            <button
              type='button'
              title='Add a task here'
              style={{ ...shared.iconButton, ...styles.addButton }}
              onClick={() => setAddingTo(addingTo === status.id ? undefined : status.id)}
            >
              <FiPlus size={15} />
            </button>
          ) : undefined,
          bodyProps: {
            'data-status-column': status.id,
            onDragOver: (e) => dragOver(e, status.id),
            onDragLeave: (e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setTarget(undefined);
            },
            onDrop: drop,
          },
          children: (
            <>
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
                  {showIndicator && target.beforeId === task.id ? indicator : null}
                  <TaskCard
                    task={task}
                    subtasks={p.subtasks.get(task.id) ?? []}
                    statuses={p.statuses}
                    editable={p.editable}
                    withQuantity={p.withQuantity}
                    draggable={p.editable}
                    checkable={p.checkable}
                    dimmed={dragging === task.id}
                    expanded={isExpanded(task)}
                    onExpand={() => setExpanded((prev) => ({ ...prev, [task.id]: !isExpanded(task) }))}
                    onOpen={(id) => !suppressClick.current && p.onOpen(id)}
                    onToggle={p.onToggle}
                    onStatus={p.onStatus}
                    onTouchStart={(e) => touchStart(e, task.id)}
                    onDragStart={() => setDragging(task.id)}
                    onDragEnd={() => {
                      setDragging(undefined);
                      setTarget(undefined);
                    }}
                  />
                </div>
              ))}
              {showIndicator && target.beforeId === null ? indicator : null}
              {tasks.length === 0 && !isTarget && addingTo !== status.id ? (
                <span style={styles.empty}>{p.editable ? 'Drop a task here' : 'Nothing here'}</span>
              ) : null}
            </>
          ),
        };
      })}
    />
  );
};

const useStyles = mkUseStyles((t) => ({
  addButton: { width: 28, height: 28, margin: '-4px -6px -4px 0' },
  slot: { gap: t.spacing.s, flexShrink: 0 },
  indicator: { height: 3, borderRadius: 2, backgroundColor: t.colors.blue, flexShrink: 0 },
  empty: { fontSize: 12, color: t.colors.dark04, padding: `${t.spacing.l}px ${t.spacing.s}px`, textAlign: 'center' },
}));
