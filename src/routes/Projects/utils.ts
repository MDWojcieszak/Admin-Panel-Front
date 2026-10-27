import { format, isToday, isTomorrow } from 'date-fns';
import { IconType } from 'react-icons';
import {
  FiCheckSquare,
  FiChevronDown,
  FiChevronsUp,
  FiChevronUp,
  FiFolder,
  FiInbox,
  FiMap,
  FiMinus,
  FiTool,
} from 'react-icons/fi';
import {
  BomStatus,
  ProjectProgressResponse,
  ProjectRole,
  ProjectStatus,
  ProjectSummaryResponse,
  ProjectType,
  ProjectUserResponse,
  RepeatType,
  StatusCategory,
  TaskPriority,
  TaskResponse,
} from '~/api/api';
import { BadgeTone } from '~/components/Badge';
import { SearchSelectOption } from '~/components/SearchSelect';
import { MainNavigationRoute } from '~/navigation/types';
import { Theme } from '~/utils/theme';

export const projectPath = (id: string) => `/${MainNavigationRoute.PROJECTS}/${id}`;

export const TYPE_LABEL: Record<ProjectType, string> = {
  GENERAL: 'General',
  LIST: 'List',
  TRIP: 'Trip',
  DIY: 'Build',
};

export const TYPE_ICON: Record<ProjectType, IconType> = {
  GENERAL: FiFolder,
  LIST: FiCheckSquare,
  TRIP: FiMap,
  DIY: FiTool,
};

const TYPE_GROUP: Record<ProjectType, string> = {
  GENERAL: 'Projects',
  LIST: 'Lists',
  TRIP: 'Trips',
  DIY: 'Builds',
};
const TYPE_ORDER: ProjectType[] = [ProjectType.General, ProjectType.Diy, ProjectType.Trip, ProjectType.List];

/** Projects to pick from a search: the inbox first, then grouped by type; the key finds one too. */
export const projectOptions = (projects: ProjectSummaryResponse[]): SearchSelectOption[] =>
  [...projects]
    .sort((a, b) =>
      a.isInbox !== b.isInbox ? (a.isInbox ? -1 : 1) : TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type),
    )
    .map((p) => ({
      value: p.id,
      label: p.isInbox ? 'Inbox' : p.title,
      icon: p.isInbox ? FiInbox : TYPE_ICON[p.type],
      group: p.isInbox ? undefined : TYPE_GROUP[p.type],
      keywords: p.key,
      hint: p.isInbox ? undefined : p.key,
    }));

export const TYPE_DESCRIPTION: Record<ProjectType, string> = {
  GENERAL: 'Tasks on a board, statuses like Jira',
  LIST: 'Things to tick off: shopping, packing',
  TRIP: 'Plan a trip: what to arrange and pack',
  DIY: 'Something to build, documented as you go',
};

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNED: 'Planned',
  ACTIVE: 'Active',
  ON_HOLD: 'On hold',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};

export const STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  PLANNED: 'neutral',
  ACTIVE: 'blue',
  ON_HOLD: 'yellow',
  DONE: 'green',
  CANCELLED: 'neutral',
};

export const ROLE_LABEL: Record<ProjectRole, string> = {
  OWNER: 'Owner',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
};

export const ROLE_TONE: Record<ProjectRole, BadgeTone> = {
  OWNER: 'purple',
  EDITOR: 'blue',
  VIEWER: 'neutral',
};

export const CATEGORY_LABEL: Record<StatusCategory, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const PRIORITY_TONE: Record<TaskPriority, BadgeTone> = {
  LOW: 'neutral',
  MEDIUM: 'blue',
  HIGH: 'yellow',
  URGENT: 'red',
};

/** What a member may do, mirroring the backend's `allows` (D2). */
export const canEdit = (role: ProjectRole) => role !== ProjectRole.Viewer;
export const canCheck = (role: ProjectRole, viewersCanCheck: boolean) => canEdit(role) || viewersCanCheck;

export const userName = (u?: ProjectUserResponse | null) =>
  u ? [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email : '';

export const initials = (u: ProjectUserResponse) => {
  const name = userName(u);
  const parts = name.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
};

export const donePercent = (p: ProjectProgressResponse) => (p.total ? Math.round((p.done / p.total) * 100) : 0);

export const dueLabel = (iso: string) => {
  const date = new Date(iso);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, date.getFullYear() === new Date().getFullYear() ? 'd MMM' : 'd MMM yyyy');
};

/** `<input type="date">` value ↔ the API's ISO date-time (noon, so no zone shifts the day). */
export const toDateInput = (iso?: string | null) => (iso ? format(new Date(iso), 'yyyy-MM-dd') : '');
export const fromDateInput = (value: string) => (value ? new Date(`${value}T12:00:00`).toISOString() : null);

export const quantityLabel = (quantity?: number | null, unit?: string | null) =>
  quantity != null ? `${quantity}${unit ? ` ${unit}` : ''}` : unit || '';

export const BOM_STATUS_LABEL: Record<BomStatus, string> = {
  NEEDED: 'Needed',
  ORDERED: 'Ordered',
  HAVE: 'Have',
  USED: 'Used',
};

export const BOM_STATUS_COLOR: Record<BomStatus, string> = {
  NEEDED: '#F59E0B',
  ORDERED: '#3B82F6',
  HAVE: '#22C55E',
  USED: '#64748B',
};

/** "312.50 PLN"; a price without a currency is just the number. */
export const formatMoney = (value: number, currency?: string | null) => {
  const amount = value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${amount} ${currency}` : amount;
};

/** Typed by another member: only plain web links become clickable. */
export const SAFE_URL = /^https?:\/\//i;

/** A task's priority as a colour of the theme: calm green to red, each its own. */
export const PRIORITY_COLOR: Record<TaskPriority, keyof Theme['colors']> = {
  LOW: 'mainGreen',
  MEDIUM: 'blue',
  HIGH: 'yellow',
  URGENT: 'red',
};

/** Arrows as in a tracker: how far up the task is. */
export const PRIORITY_ICON: Record<TaskPriority, IconType> = {
  LOW: FiChevronDown,
  MEDIUM: FiMinus,
  HIGH: FiChevronUp,
  URGENT: FiChevronsUp,
};

/** How often a task comes back, short enough for a line of facts. */
export const REPEAT_SHORT: Record<RepeatType, string> = {
  NONE: '',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
  CUSTOM: 'Repeats',
};

/** High and urgent: worth a mark where room is short, a subtask's row or a badge among facts. */
export const isPressing = (priority: TaskPriority) => priority === TaskPriority.High || priority === TaskPriority.Urgent;

/**
 * Why a task wants a look now, as the colour of its edge: red when late or
 * urgent, yellow when due today or high, green when done. The rest get none,
 * so the few that light up stand out on a full board.
 */
export const attentionColor = (task: TaskResponse): keyof Theme['colors'] | undefined => {
  if (task.status.category === StatusCategory.Done) return 'lightGreen';
  if (task.overdue || task.priority === TaskPriority.Urgent) return 'red';
  if ((task.dueDate && isToday(new Date(task.dueDate))) || task.priority === TaskPriority.High) return 'yellow';
  return undefined;
};

/** Most pressing first. */
export const PRIORITY_RANK: Record<TaskPriority, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

/** How the tasks in a column or a group are ordered. */
export type TaskSort = 'manual' | 'priority' | 'due';

export const TASK_SORT_LABEL: Record<TaskSort, string> = {
  manual: 'Manual order',
  priority: 'By priority',
  due: 'By due date',
};

/** For a phone, where the select shares a line with the add field. */
export const TASK_SORT_SHORT: Record<TaskSort, string> = {
  manual: 'Manual',
  priority: 'Priority',
  due: 'Due date',
};

const dueTime = (task: TaskResponse) => (task.dueDate ? Date.parse(task.dueDate) : Infinity);

/** Tasks in the chosen order; ties fall back to the board's own order. */
export const sortTasks = (tasks: TaskResponse[], sort: TaskSort): TaskResponse[] => {
  if (sort === 'manual') return tasks;
  return [...tasks].sort((a, b) =>
    sort === 'priority'
      ? PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || dueTime(a) - dueTime(b) || a.order - b.order
      : dueTime(a) - dueTime(b) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.order - b.order,
  );
};

/** Top-level tasks, and each one's subtasks by its id (the list comes flat, with parentTaskId). */
export const splitSubtasks = (tasks: TaskResponse[]) => {
  const subtasks = new Map<string, TaskResponse[]>();
  const top: TaskResponse[] = [];
  tasks.forEach((task) => {
    if (task.parentTaskId) subtasks.set(task.parentTaskId, [...(subtasks.get(task.parentTaskId) ?? []), task]);
    else top.push(task);
  });
  return { top, subtasks };
};
