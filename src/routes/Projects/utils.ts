import { format, isToday, isTomorrow } from 'date-fns';
import { IconType } from 'react-icons';
import { FiCheckSquare, FiFolder, FiInbox, FiMap, FiTool } from 'react-icons/fi';
import {
  BomStatus,
  ProjectProgressResponse,
  ProjectRole,
  ProjectStatus,
  ProjectSummaryResponse,
  ProjectType,
  ProjectUserResponse,
  StatusCategory,
  TaskPriority,
} from '~/api/api';
import { BadgeTone } from '~/components/Badge';
import { SearchSelectOption } from '~/components/SearchSelect';
import { MainNavigationRoute } from '~/navigation/types';

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
