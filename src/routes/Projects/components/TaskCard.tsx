import { format, isToday } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, TouchEvent, useState } from 'react';
import {
  FiAlertCircle,
  FiAlignLeft,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiCheckSquare,
  FiChevronDown,
  FiClock,
  FiGitBranch,
  FiMessageSquare,
  FiPaperclip,
  FiRepeat,
} from 'react-icons/fi';
import { ProjectStatusResponse, RepeatType, StatusCategory, TaskResponse } from '~/api/api';
import { PillSelect } from '~/components/PillSelect';
import { Avatar, Checkbox, useProjectStyles } from '~/routes/Projects/components/shared';
import {
  attentionColor,
  dueLabel,
  isPressing,
  PRIORITY_COLOR,
  PRIORITY_ICON,
  PRIORITY_LABEL,
  quantityLabel,
  REPEAT_SHORT,
} from '~/routes/Projects/utils';
import { mkUseStyles, useTheme } from '~/utils/theme';

const isDone = (task: TaskResponse) => task.status.category === StatusCategory.Done;

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
 * A task on the board, laid out as the photo entries are: the title, one quiet
 * line of what kind of task it is (priority in its colour, key, repeat), chips
 * for when it is due or reminds, and under a hairline what it holds (checklist,
 * subtasks, notes, files, comments) and whose it is. The edge lights only when
 * the task wants a look. Subtasks unfold under it as the tasks they are, with
 * a status that can be changed from here and their due date.
 */
export const TaskCard = (p: TaskCardProps) => {
  const { task, subtasks } = p;
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const [hover, setHover] = useState(false);
  const done = isDone(task);
  const priority = theme.colors[PRIORITY_COLOR[task.priority]];
  const PriorityIcon = PRIORITY_ICON[task.priority];
  const edge = attentionColor(task);
  const quantity = p.withQuantity ? quantityLabel(task.quantity, task.unit) : undefined;
  // The rows come with the board; the count is the backend's, for when they don't.
  const subtaskTotal = subtasks.length || task.subtaskCount;
  const statusOptions = p.statuses.map((s) => ({ value: s.id, label: s.name, color: s.color || theme.colors.dark05 }));

  const chips: ReactNode[] = [];
  if (task.dueDate && !done) chips.push(<DueChip key='due' task={task} />);
  if (task.reminderAt && !done) {
    chips.push(
      <Chip key='reminder' icon={<FiBell size={12} />} color={theme.colors.blue04} title='Reminder'>
        {dueLabel(task.reminderAt)} {format(new Date(task.reminderAt), 'HH:mm')}
      </Chip>,
    );
  }

  const hasFooter =
    task.checklist.total ||
    subtaskTotal ||
    task.notes ||
    task.documentCount ||
    task.commentCount ||
    task.assignee;

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
        borderLeftColor: edge ? theme.colors[edge] : 'transparent',
        opacity: p.dimmed ? 0.4 : 1,
        cursor: p.draggable ? 'grab' : 'pointer',
      }}
    >
      <span style={styles.title}>
        {quantity ? <span style={styles.quantity}>{quantity} </span> : null}
        {task.title}
      </span>

      <div style={styles.meta}>
        {/* Done says so in green where the priority was; the title stays as readable as ever. */}
        {done ? (
          <span style={{ ...styles.metaItem, ...styles.metaStrong, color: theme.colors.lightGreen }}>
            <FiCheckCircle size={12} strokeWidth={2.6} />
            Done{task.completedAt ? ` · ${dueLabel(task.completedAt)}` : ''}
          </span>
        ) : (
          <span
            title={`${PRIORITY_LABEL[task.priority]} priority`}
            style={{ ...styles.metaItem, ...styles.metaStrong, color: priority }}
          >
            <PriorityIcon size={14} strokeWidth={2.6} />
            {PRIORITY_LABEL[task.priority]}
          </span>
        )}
        <span style={styles.separator}>·</span>
        <span style={shared.key}>{task.key}</span>
        {task.repeat !== RepeatType.None ? (
          <>
            <span style={styles.separator}>·</span>
            <span style={styles.metaItem} title='Repeats'>
              <FiRepeat size={11} />
              {REPEAT_SHORT[task.repeat]}
            </span>
          </>
        ) : null}
      </div>

      {chips.length ? <div style={styles.chips}>{chips}</div> : null}

      {hasFooter ? (
        <div style={styles.footer}>
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
          {task.notes ? (
            <span style={styles.counter} title='Has notes'>
              <FiAlignLeft size={13} />
            </span>
          ) : null}
          {task.documentCount ? (
            <span style={styles.counter} title='Files'>
              <FiPaperclip size={13} />
              {task.documentCount}
            </span>
          ) : null}
          {task.commentCount ? (
            <span style={styles.counter} title='Comments'>
              <FiMessageSquare size={13} />
              {task.commentCount}
            </span>
          ) : null}
          {task.assignee ? (
            <span style={styles.assignee}>
              <Avatar user={task.assignee} size={22} />
            </span>
          ) : null}
        </div>
      ) : null}

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
                const SubPriorityIcon = PRIORITY_ICON[sub.priority];
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
                        {/* Read as the parent's is; a done one keeps its day, quietly. */}
                        <DueChip task={sub} small />
                        {sub.checklist.total ? (
                          <ProgressPill
                            icon={<FiCheckSquare size={11} />}
                            label='Checklist'
                            done={sub.checklist.done}
                            total={sub.checklist.total}
                          />
                        ) : null}
                        {isPressing(sub.priority) && !subDone ? (
                          <span
                            style={{ ...styles.counter, color: theme.colors[PRIORITY_COLOR[sub.priority]] }}
                            title={`${PRIORITY_LABEL[sub.priority]} priority`}
                          >
                            <SubPriorityIcon size={14} strokeWidth={2.6} />
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

/** A tinted, outlined chip with an icon: when the task is due, when it reminds. */
const Chip = ({
  icon,
  color,
  title,
  small,
  children,
}: {
  icon: ReactNode;
  color: string;
  title: string;
  /** Among a subtask's pills, at their size. */
  small?: boolean;
  children: ReactNode;
}) => {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <span
      title={title}
      style={{
        ...styles.chip,
        fontSize: small ? 11 : 12,
        color,
        backgroundColor: color + theme.colorOpacity(0.1),
        borderColor: color + theme.colorOpacity(0.24),
      }}
    >
      {icon}
      {children}
    </span>
  );
};

/** When a task is due: red once it is late, yellow on the day, quiet otherwise and once done. */
const DueChip = ({ task, small }: { task: TaskResponse; small?: boolean }) => {
  const theme = useTheme();
  if (!task.dueDate) return null;
  const done = isDone(task);
  const label = dueLabel(task.dueDate);
  if (task.overdue && !done) {
    return (
      <Chip small={small} icon={<FiAlertCircle size={small ? 11 : 12} />} color={theme.colors.red} title='Overdue'>
        Overdue · {label}
      </Chip>
    );
  }
  if (!done && isToday(new Date(task.dueDate))) {
    return (
      <Chip small={small} icon={<FiClock size={small ? 11 : 12} />} color={theme.colors.yellow} title='Due today'>
        Due today
      </Chip>
    );
  }
  return (
    <Chip small={small} icon={<FiCalendar size={small ? 11 : 12} />} color={theme.colors.dark05} title='Due'>
      {label}
    </Chip>
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
    gap: t.spacing.xs,
    padding: `${t.spacing.sm + 2}px ${t.spacing.m}px ${t.spacing.sm}px ${t.spacing.m - 1}px`,
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
  title: { fontSize: 14, fontWeight: 600, lineHeight: 1.35, color: t.colors.white, wordBreak: 'break-word' },
  quantity: { color: t.colors.blue04, fontWeight: 700 },
  // What kind of task it is: one quiet line, as the photo entries' type and dates.
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    fontSize: 12,
    color: t.colors.dark05,
    minWidth: 0,
  },
  metaItem: { display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' },
  metaStrong: { fontWeight: 700 },
  separator: { opacity: 0.45 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    height: 22,
    padding: '0 8px',
    boxSizing: 'border-box',
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
    fontWeight: 600,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
  // What the task holds, under a hairline, as the photo entries' counters.
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: t.spacing.sm,
    rowGap: 6,
    marginTop: 6,
    paddingTop: t.spacing.s,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.07)}`,
    minHeight: 22,
  },
  counter: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    fontWeight: 600,
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
    marginTop: 4,
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
