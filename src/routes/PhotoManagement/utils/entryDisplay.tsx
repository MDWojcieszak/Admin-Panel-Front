import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiBriefcase,
  FiCalendar,
  FiCamera,
  FiCheckCircle,
  FiCheckSquare,
  FiEdit3,
  FiFileText,
  FiFolder,
  FiHelpCircle,
  FiImage,
  FiMessageSquare,
  FiMoon,
  FiRadio,
  FiSlash,
  FiStar,
} from 'react-icons/fi';
import { IconType } from 'react-icons';
import {
  MediaStatus,
  PhotoEntryPostStage,
  PhotoEntryResponse,
  PhotoEntryStatus,
  PhotoEntryType,
} from '~/api/api';
import { getKanbanColumnColors } from '~/routes/PhotoManagement/utils/colors';
import { getEntryColumn, isOverduePlan } from '~/routes/PhotoManagement/utils/kanban';

/**
 * How a session is presented — type, dates, state, chips and counters — shared
 * by the board, the list and the calendar so a session looks alike in all three.
 */

export type Counter = {
  key: string;
  label: string;
  title: string;
  icon: IconType;
  color: string;
};

export type Chip = {
  key: string;
  label: string;
  icon: IconType;
  background: string;
  border: string;
  color: string;
  pulse?: boolean;
};

export const EntryChip = ({ chip }: { chip: Chip }) => {
  const Icon = chip.icon;

  return (
    <motion.div
      animate={chip.pulse ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={chip.pulse ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : undefined}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        padding: '4px 8px',
        borderRadius: 999,
        fontSize: 12,
        lineHeight: 1,
        fontWeight: 600,
        width: 'fit-content',
        background: chip.background,
        border: `1px solid ${chip.border}`,
        color: chip.color,
      }}
    >
      <Icon size={12} />
      <span style={{ whiteSpace: 'nowrap' }}>{chip.label}</span>
    </motion.div>
  );
};

export const TONES = {
  amber: { background: 'rgba(232, 179, 72, 0.08)', border: 'rgba(232, 179, 72, 0.18)', color: '#E7BE63' },
  green: { background: 'rgba(53, 158, 122, 0.10)', border: 'rgba(53, 158, 122, 0.20)', color: '#7BC8A6' },
  red: { background: 'rgba(220, 68, 55, 0.10)', border: 'rgba(220, 68, 55, 0.22)', color: '#F08A80' },
  azure: { background: 'rgba(0, 157, 248, 0.10)', border: 'rgba(0, 157, 248, 0.22)', color: '#7FCBFF' },
  slate: { background: 'rgba(146, 164, 177, 0.08)', border: 'rgba(146, 164, 177, 0.18)', color: '#A9BCC9' },
};

/**
 * Unsecured material is only a warning once the session has happened — on a
 * planned entry "not uploaded" is simply the normal state and saying so would
 * make every future trip look like a problem.
 */
export const getMediaChip = (entry: PhotoEntryResponse): Chip | null => {
  if (!entry.foldersCreated) {
    return { key: 'folders', label: 'Folders pending', icon: FiFolder, ...TONES.amber };
  }

  if (entry.uploadStatus === MediaStatus.Uploaded) {
    return { key: 'uploaded', label: 'Upload confirmed', icon: FiCheckCircle, ...TONES.green };
  }

  if (entry.status !== PhotoEntryStatus.Shot) return null;

  return { key: 'unsecured', label: 'Waiting for upload', icon: FiAlertCircle, ...TONES.red, pulse: true };
};

/** States worth a pill: the upload state plus what the stage alone does not tell. */
export const getStatusChips = (entry: PhotoEntryResponse): Chip[] => {
  const chips: Chip[] = [];

  // Derived from the dates by the backend, so it needs no lane of its own.
  if (entry.isHappeningNow) {
    chips.push({ key: 'now', label: 'Happening now', icon: FiRadio, ...TONES.azure, pulse: true });
  }

  // The dates have passed but nobody said how it went; the session card asks.
  if (isOverduePlan(entry)) {
    chips.push({ key: 'overdue', label: 'Did it happen?', icon: FiHelpCircle, ...TONES.amber, pulse: true });
  }

  const media = getMediaChip(entry);
  if (media) chips.push(media);

  // Only worth saying where the stage no longer implies it — an entry parked back
  // in "After shoot" still carries the fact that it was edited at some point.
  if (entry.wasEdited && entry.postStage === PhotoEntryPostStage.None) {
    chips.push({ key: 'edited', label: 'Was edited', icon: FiEdit3, ...TONES.slate });
  }

  return chips;
};

/**
 * Numbers go into a footer as plain icon + count. As pills they each took a full
 * line and a busy session grew into a tower of badges.
 */
export const getCounters = (entry: PhotoEntryResponse): Counter[] => {
  const counters: Counter[] = [];

  const progress = formatProgress(entry);
  if (progress) {
    counters.push({ key: 'progress', label: progress, title: 'Progress', icon: FiImage, color: TONES.slate.color });
  }

  const summary = entry.commentSummary;
  // Plain notes and ticked-off to-dos fall into none of the coloured counts
  // below, so without the total a session with only those looked uncommented.
  if (summary?.total) {
    counters.push({
      key: 'comments',
      label: String(summary.total),
      title: `${summary.total} comment${summary.total === 1 ? '' : 's'}`,
      icon: FiMessageSquare,
      color: TONES.slate.color,
    });
  }
  if (summary?.openTodos) {
    counters.push({
      key: 'todos',
      label: String(summary.openTodos),
      title: `${summary.openTodos} open to-do${summary.openTodos === 1 ? '' : 's'}`,
      icon: FiCheckSquare,
      color: TONES.azure.color,
    });
  }
  if (summary?.highlights) {
    counters.push({
      key: 'highlights',
      label: String(summary.highlights),
      title: `${summary.highlights} highlight${summary.highlights === 1 ? '' : 's'}`,
      icon: FiStar,
      color: TONES.amber.color,
    });
  }
  if (summary?.problems) {
    counters.push({
      key: 'problems',
      label: String(summary.problems),
      title: `${summary.problems} problem${summary.problems === 1 ? '' : 's'}`,
      icon: FiAlertTriangle,
      color: TONES.red.color,
    });
  }

  return counters;
};

/**
 * Counts are nullable and `null` means "unknown", never zero, so each pairing is
 * only rendered when both of its numbers are actually known.
 */
export const formatProgress = (entry: PhotoEntryResponse): string | null => {
  const { photoCount, selectedCount, editedCount } = entry;

  if (editedCount != null && selectedCount != null) return `${editedCount} / ${selectedCount} edited`;
  if (selectedCount != null && photoCount != null) return `${selectedCount} / ${photoCount} selected`;
  if (selectedCount != null) return `${selectedCount} selected`;
  if (photoCount != null) return `${photoCount} frames`;

  return null;
};

export const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date;
};

/** Says the shared month/year once: "12–13 Aug 2026", "28 Aug – 2 Sep 2026". */
export const formatDateRange = (startDate?: Date | null, endDate?: Date | null) => {
  if (startDate && endDate) {
    const sameYear = startDate.getFullYear() === endDate.getFullYear();
    const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth();
    if (sameMonth && startDate.getDate() === endDate.getDate()) return format(startDate, 'd MMM yyyy');
    if (sameMonth) return `${format(startDate, 'd')}–${format(endDate, 'd MMM yyyy')}`;
    if (sameYear) return `${format(startDate, 'd MMM')} – ${format(endDate, 'd MMM yyyy')}`;
    return `${format(startDate, 'd MMM yyyy')} – ${format(endDate, 'd MMM yyyy')}`;
  }
  if (startDate) return `from ${format(startDate, 'd MMM yyyy')}`;
  if (endDate) return `until ${format(endDate, 'd MMM yyyy')}`;
  return null;
};

export const getPhotoEntryTypeMeta = (
  type: PhotoEntryType,
): {
  label: string;
  icon: IconType;
  background: string;
  border: string;
  color: string;
} => {
  switch (type) {
    case PhotoEntryType.Work:
      return {
        label: 'Work',
        icon: FiBriefcase,
        background: 'rgba(84, 132, 255, 0.08)',
        border: 'rgba(84, 132, 255, 0.18)',
        color: '#9AB8FF',
      };

    case PhotoEntryType.Astro:
      return {
        label: 'Astro',
        icon: FiMoon,
        background: 'rgba(168, 85, 247, 0.08)',
        border: 'rgba(168, 85, 247, 0.18)',
        color: '#D1B3FF',
      };

    case PhotoEntryType.General:
    default:
      return {
        label: 'General',
        icon: FiFileText,
        background: 'rgba(53, 158, 122, 0.08)',
        border: 'rgba(53, 158, 122, 0.18)',
        color: '#8FD1B4',
      };
  }
};

export type EntryStateMeta = {
  label: string;
  icon: IconType;
  /** Stage colour on the board; the list and calendar reuse it. */
  accent: string;
  background: string;
  border: string;
  /** Planned sessions are drawn hollow (dashed), shot ones solid. */
  planned: boolean;
  cancelled: boolean;
};

const STAGE_TITLES: Record<string, string> = {
  AFTER_SHOOT: 'After shoot',
  SELECTING: 'Selecting',
  EDITING: 'Editing',
  FINISHED: 'Finished',
};

/**
 * One answer to "where is this session": planned (hollow, calendar icon),
 * shot (solid, camera icon, named by its post stage) or cancelled.
 */
export const getEntryStateMeta = (entry: PhotoEntryResponse): EntryStateMeta => {
  if (entry.status === PhotoEntryStatus.Cancelled) {
    return {
      label: 'Cancelled',
      icon: FiSlash,
      accent: TONES.red.color,
      background: 'rgba(220, 68, 55, 0.06)',
      border: 'rgba(220, 68, 55, 0.22)',
      planned: false,
      cancelled: true,
    };
  }

  const column = getEntryColumn(entry) ?? 'PLANNED';
  const palette = getKanbanColumnColors(column);

  if (column === 'PLANNED') {
    return {
      label: isOverduePlan(entry) ? 'Planned · past' : 'Planned',
      icon: FiCalendar,
      accent: palette.accent,
      background: 'rgba(146, 164, 177, 0.05)',
      border: 'rgba(146, 164, 177, 0.45)',
      planned: true,
      cancelled: false,
    };
  }

  return {
    label: STAGE_TITLES[column],
    icon: FiCamera,
    accent: palette.accent,
    background: palette.activeBackground,
    border: palette.border,
    planned: false,
    cancelled: false,
  };
};

/** The state as a pill: hollow and dashed while planned, filled once shot. */
export const EntryStatePill = ({ entry }: { entry: PhotoEntryResponse }) => {
  const meta = getEntryStateMeta(entry);
  const Icon = meta.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        color: meta.planned ? '#C9D4DC' : meta.accent,
        backgroundColor: meta.planned ? 'transparent' : meta.background,
        borderWidth: 1,
        borderStyle: meta.planned ? 'dashed' : 'solid',
        borderColor: meta.border,
      }}
    >
      <Icon size={12} />
      {meta.label}
    </span>
  );
};
