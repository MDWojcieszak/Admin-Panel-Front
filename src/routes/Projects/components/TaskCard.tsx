import { isToday } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, TouchEvent, useState } from 'react';
import {
  FiAlertCircle,
  FiBell,
  FiCalendar,
  FiCheck,
  FiCheckSquare,
  FiChevronDown,
  FiFlag,
  FiGitBranch,
  FiMessageSquare,
  FiPaperclip,
  FiRepeat,
} from 'react-icons/fi';
import { ProjectStatusResponse, RepeatType, StatusCategory, TaskPriority, TaskResponse } from '~/api/api';
import { PillSelect } from '~/components/PillSelect';
import { Avatar, Checkbox, useProjectStyles } from '~/routes/Projects/components/shared';
import { dueLabel, PRIORITY_COLOR, PRIORITY_LABEL, quantityLabel } from '~/routes/Projects/utils';
import { mkUseStyles, useTheme } from '~/utils/theme';

const isDone = (task: TaskResponse) => task.status.category === StatusCategory.Done;
const pressing = (task: TaskResponse) => task.priority === TaskPriority.High || task.priority === TaskPriority.Urgent;

type TaskCardProps = {
  task: TaskResponse;
  /** The task's own subtasks, in board order; worked on right on the card. */
  subtasks: TaskResponse[];
  statuses: ProjectStatusResponse[];
  withQuantity: boolean;
  draggable: boolean;
  editable: boolean;
  checkable: boolean;
  dimmed: boolean;
  expanded: boolean;
  onExpand: () => void;
  onOpen: (taskId: string) => void;
  onToggle: (task: TaskResponse) => void;
  onStatus: (task: TaskResponse, statusId: string) => void;
  onTouchStart: (e: TouchEvent) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
};

/**
 * A task on the board: its priority on the edge and in a chip, its facts in
 * one line (checklist and subtasks as small progress pills among them), and
 * its subtasks unfolding under it as the tasks they are, each with a status
 * that can be changed from here.
 */
export const TaskCard = (p: TaskCardProps) => {
  const { task, subtasks } = p;
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const [hover, setHover] = useState(false);
  const done = isDone(task);
  const priority = theme.colors[PRIORITY_COLOR[task.priority]];
  const quantity = p.withQuantity ? quantityLabel(task.quantity, task.unit) : undefined;
  // The rows come with the board; the count is the backend's, for when they don't.
  const subtaskTotal = subtasks.length || task.subtaskCount;
  const overdue = task.overdue && !done;
  const dueToday = !overdue && !done && task.dueDate && isToday(new Date(task.dueDate));
  const statusOptions = p.statuses.map((s) => ({ value: s.id, label: s.name, color: s.color || theme.colors.dark05 }));

  return (
    <div
      data-task-card={task.id}
      draggable={p.draggable}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.key);
        p.onDragStart();
      }}
      onDragEnd={p.onDragEnd}
      onTouchStart={p.onTouchStart}
      onClick={() => p.onOpen(task.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...styles.card,
        ...(hover ? styles.cardHover : null),
        borderLeftColor: done ? theme.colors.lightGreen : priority,
        opacity: p.dimmed ? 0.4 : 1,
        cursor: p.draggable ? 'grab' : 'pointer',
      }}
    >
      <div style={styles.top}>
        {/* Done says so in green where the priority was; the text stays as readable as ever. */}
        {done ? (
          <span style={{ ...styles.priority, ...styles.done }}>
            <FiCheck size={11} strokeWidth={3} />
            Done
          </span>
        ) : (
          <span
            title={`${PRIORITY_LABEL[task.priority]} priority`}
            style={{ ...styles.priority, color: priority, backgroundColor: priority + theme.colorOpacity(0.14) }}
          >
            <FiFlag size={10} strokeWidth={2.6} />
            {PRIORITY_LABEL[task.priority]}
          </span>
        )}
        <span style={{ ...shared.key, marginLeft: 'auto' }}>{task.key}</span>
      </div>

      <span style={styles.title}>
        {quantity ? <span style={styles.quantity}>{quantity} </span> : null}
        {task.title}
      </span>

      <div style={styles.facts}>
        {task.checklist.total ? (
          <ProgressPill
            icon={<FiCheckSquare size={11} />}
            label='Checklist'
            done={task.checklist.done}
            total={task.checklist.total}
          />
        ) : null}
        {subtaskTotal ? (
          <ProgressPill
            icon={<FiGitBranch size={11} />}
            label='Subtasks'
            done={subtasks.filter(isDone).length}
            total={subtaskTotal}
            open={subtasks.length ? p.expanded : undefined}
            onClick={subtasks.length ? p.onExpand : undefined}
          />
        ) : null}
        {task.dueDate ? (
          <span
            style={{
              ...styles.fact,
              color: overdue ? theme.colors.red : dueToday ? theme.colors.yellow : undefined,
              fontWeight: overdue || dueToday ? 600 : undefined,
            }}
            title={overdue ? 'Overdue' : 'Due'}
          >
            {overdue ? <FiAlertCircle size={12} /> : <FiCalendar size={12} />}
            {dueLabel(task.dueDate)}
          </span>
        ) : null}
        {task.reminderAt && !done ? (
          <span style={styles.fact} title='A reminder is set'>
            <FiBell size={12} />
          </span>
        ) : null}
        {task.repeat !== RepeatType.None ? (
          <span style={styles.fact} title='Repeats'>
            <FiRepeat size={12} />
          </span>
        ) : null}
        {task.documentCount ? (
          <span style={styles.fact} title='Files'>
            <FiPaperclip size={12} />
            {task.documentCount}
          </span>
        ) : null}
        {task.commentCount ? (
          <span style={styles.fact} title='Comments'>
            <FiMessageSquare size={12} />
            {task.commentCount}
          </span>
        ) : null}
        {task.assignee ? (
          <span style={styles.assignee}>
            <Avatar user={task.assignee} size={22} />
          </span>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {p.expanded && subtasks.length ? (
          <motion.div
            key='subtasks'
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            style={styles.unfold}
            // A long press here is not meant to carry the parent away.
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div style={styles.tree}>
              {subtasks.map((sub) => {
                const subDone = isDone(sub);
                // Whose it is shows only where it differs from the parent's.
                const otherAssignee = sub.assignee && sub.assignee.id !== task.assignee?.id ? sub.assignee : null;
                return (
                  <div
                    key={sub.id}
                    style={styles.subtask}
                    onClick={(e) => {
                      e.stopPropagation();
                      p.onOpen(sub.id);
                    }}
                  >
                    {/* The tick takes a finger-sized area around the box. */}
                    <span
                      style={styles.tick}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (p.checkable) p.onToggle(sub);
                      }}
                    >
                      <Checkbox checked={subDone} disabled={!p.checkable} size={18} onChange={() => p.onToggle(sub)} />
                    </span>
                    <div style={styles.subtaskBody}>
                      <span style={styles.subtaskTitle}>{sub.title}</span>
                      <div style={styles.subtaskFacts}>
                        <PillSelect
                          small
                          label={`Status of ${sub.key}`}
                          value={sub.status.id}
                          options={statusOptions}
                          disabled={!p.editable}
                          onChange={(statusId) => p.onStatus(sub, statusId)}
                        />
                        {sub.checklist.total ? (
                          <ProgressPill
                            icon={<FiCheckSquare size={11} />}
                            label='Checklist'
                            done={sub.checklist.done}
                            total={sub.checklist.total}
                          />
                        ) : null}
                        {pressing(sub) && !subDone ? (
                          <span
                            style={{ ...styles.fact, color: theme.colors[PRIORITY_COLOR[sub.priority]] }}
                            title={`${PRIORITY_LABEL[sub.priority]} priority`}
                          >
                            <FiFlag size={11} />
                          </span>
                        ) : null}
                        {sub.dueDate && !subDone ? (
                          <span style={{ ...styles.fact, color: sub.overdue ? theme.colors.red : undefined }}>
                            <FiCalendar size={11} />
                            {dueLabel(sub.dueDate)}
                          </span>
                        ) : null}
                        {otherAssignee ? (
                          <span style={styles.assignee}>
                            <Avatar user={otherAssignee} size={18} />
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

/** "2/5" in a small pill whose fill is the progress: a checklist, or the subtasks to unfold. */
const ProgressPill = ({
  icon,
  label,
  done,
  total,
  open,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  done: number;
  total: number;
  open?: boolean;
  onClick?: () => void;
}) => {
  const styles = useStyles();
  const theme = useTheme();
  const complete = done === total;
  const color = complete ? theme.colors.lightGreen : theme.colors.blue04;
  const percent = Math.round((done / total) * 100);
  const content = (
    <>
      {icon}
      {done}/{total}
      {onClick ? (
        <FiChevronDown
          size={12}
          style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.18s ease' }}
        />
      ) : null}
    </>
  );
  const style = {
    ...styles.pill,
    color: complete ? color : theme.colors.white,
    // The pill fills up as the work does.
    background: `linear-gradient(90deg, ${color + theme.colorOpacity(0.22)} ${percent}%, ${
      theme.colors.white + theme.colorOpacity(0.06)
    } ${percent}%)`,
  };
  const title = `${label}: ${done} of ${total} done`;
  return onClick ? (
    <button
      type='button'
      title={`${title}. ${open ? 'Hide' : 'Show'} them`}
      aria-expanded={open}
      style={{ ...style, ...styles.pillButton }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {content}
    </button>
  ) : (
    <span title={title} style={style}>
      {content}
    </span>
  );
};

const useStyles = mkUseStyles((t) => ({
  card: {
    gap: t.spacing.s,
    padding: `${t.spacing.sm}px ${t.spacing.sm}px ${t.spacing.sm}px ${t.spacing.sm + 2}px`,
    borderRadius: 14,
    borderLeft: '3px solid transparent',
    backgroundColor: t.colors.gray03,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
    userSelect: 'none',
    // A long press picks the card up; no text callout or image menu over it.
    WebkitTouchCallout: 'none',
    transition: 'background-color 0.12s ease',
    flexShrink: 0,
  },
  cardHover: { backgroundColor: t.colors.gray02 },
  top: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, minWidth: 0 },
  priority: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  title: { fontSize: 14, fontWeight: 600, lineHeight: 1.35, color: t.colors.white, wordBreak: 'break-word' },
  done: { color: t.colors.lightGreen, backgroundColor: t.colors.lightGreen + t.colorOpacity(0.14) },
  quantity: { color: t.colors.blue04, fontWeight: 700 },
  facts: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: t.spacing.sm,
    rowGap: 6,
    minHeight: 22,
  },
  fact: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: t.colors.dark05,
    whiteSpace: 'nowrap',
  },
  assignee: { display: 'flex', marginLeft: 'auto', flexShrink: 0 },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 22,
    padding: '0 8px',
    boxSizing: 'border-box',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  // No `font` shorthand: it reset the size the pill sets.
  pillButton: { border: 'none', cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1 },
  unfold: { overflow: 'hidden' },
  // A tree hanging off the card, not a second checklist: a line on the left, rows without boxes.
  tree: {
    gap: 2,
    marginTop: 2,
    marginLeft: 6,
    paddingLeft: t.spacing.xs,
    borderLeft: `2px solid ${t.colors.white + t.colorOpacity(0.08)}`,
  },
  subtask: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 2,
    padding: '4px 4px 6px 0',
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
  },
  tick: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 28, flexShrink: 0 },
  subtaskBody: { flex: 1, minWidth: 0, gap: 4, paddingTop: 4 },
  subtaskTitle: { fontSize: 13, lineHeight: 1.3, color: t.colors.white, wordBreak: 'break-word' },
  subtaskFacts: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: t.spacing.s, minWidth: 0 },
}));
