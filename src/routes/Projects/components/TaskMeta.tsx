import { CSSProperties } from 'react';
import { FiCalendar, FiCheckSquare, FiGitBranch, FiMessageSquare, FiPaperclip } from 'react-icons/fi';
import { StatusCategory, TaskPriority, TaskResponse } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Avatar, useProjectStyles } from '~/routes/Projects/components/shared';
import { dueLabel, PRIORITY_LABEL, PRIORITY_TONE, quantityLabel } from '~/routes/Projects/utils';
import { useTheme } from '~/utils/theme';

/** The small facts under a task's title: due, checklist, subtasks, priority, who. */
export const TaskMeta = ({
  task,
  hideQuantity,
  style,
}: {
  task: TaskResponse;
  hideQuantity?: boolean;
  style?: CSSProperties;
}) => {
  const shared = useProjectStyles();
  const theme = useTheme();
  const done = task.status.category === StatusCategory.Done;
  const quantity = quantityLabel(task.quantity, task.unit);

  return (
    <span style={{ ...shared.row, gap: theme.spacing.sm, ...shared.muted, fontSize: 12, ...style }}>
      {quantity && !hideQuantity ? (
        <span style={{ color: theme.colors.blue04, fontWeight: 600 }}>{quantity}</span>
      ) : null}
      {task.dueDate ? (
        <span style={{ ...shared.row, gap: 4, color: task.overdue && !done ? theme.colors.red : undefined }}>
          <FiCalendar size={12} />
          {dueLabel(task.dueDate)}
        </span>
      ) : null}
      {task.checklist.total ? (
        <span style={{ ...shared.row, gap: 4 }}>
          <FiCheckSquare size={12} />
          {task.checklist.done}/{task.checklist.total}
        </span>
      ) : null}
      {task.documentCount ? (
        <span style={{ ...shared.row, gap: 4 }}>
          <FiPaperclip size={12} />
          {task.documentCount}
        </span>
      ) : null}
      {task.commentCount ? (
        <span style={{ ...shared.row, gap: 4 }}>
          <FiMessageSquare size={12} />
          {task.commentCount}
        </span>
      ) : null}
      {task.subtaskCount ? (
        <span style={{ ...shared.row, gap: 4 }}>
          <FiGitBranch size={12} />
          {task.subtaskCount}
        </span>
      ) : null}
      {task.priority === TaskPriority.High || task.priority === TaskPriority.Urgent ? (
        <Badge label={PRIORITY_LABEL[task.priority]} tone={PRIORITY_TONE[task.priority]} style={{ fontSize: 11 }} />
      ) : null}
      {task.assignee ? <Avatar user={task.assignee} size={20} /> : null}
    </span>
  );
};
