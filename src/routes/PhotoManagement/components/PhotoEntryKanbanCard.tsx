import { format } from 'date-fns';
import { motion, useMotionValue } from 'framer-motion';
import { CSSProperties, useMemo, useRef } from 'react';
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiBriefcase,
  FiCheckCircle,
  FiCheckSquare,
  FiEdit3,
  FiFileText,
  FiFolder,
  FiHelpCircle,
  FiImage,
  FiMoon,
  FiRadio,
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
import { isOverduePlan } from '~/routes/PhotoManagement/utils/kanban';

type PhotoEntryKanbanCardProps = {
  entry: PhotoEntryResponse;
  /** Date label shown beside the name when another entry shares it. */
  qualifier?: string;
  accentColor: string;
  pending: boolean;
  isDragging: boolean;
  onCardClick: (entry: PhotoEntryResponse) => void;
  onDragStart: (entry: PhotoEntryResponse) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (entry: PhotoEntryResponse) => void;
  styles: Record<string, CSSProperties>;
};

type Counter = {
  key: string;
  label: string;
  title: string;
  icon: IconType;
  color: string;
};

// The global stylesheet makes every div a column; the rows here have to say so.
const ROW: CSSProperties = { display: 'flex', flexDirection: 'row', alignItems: 'center' };

const COUNTERS: CSSProperties = {
  gap: 12,
  marginTop: 10,
  paddingTop: 8,
  borderTop: '1px solid rgba(146, 164, 177, 0.14)',
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1,
};

type Chip = {
  key: string;
  label: string;
  icon: IconType;
  background: string;
  border: string;
  color: string;
  pulse?: boolean;
};

export const PhotoEntryKanbanCard = ({
  entry,
  qualifier,
  accentColor,
  pending,
  isDragging,
  onCardClick,
  onDragStart,
  onDragMove,
  onDragEnd,
  styles,
}: PhotoEntryKanbanCardProps) => {
  const typeMeta = useMemo(() => getPhotoEntryTypeMeta(entry.type), [entry.type]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const movedRef = useRef(false);

  const startDate = useMemo(() => parseDate(entry.startDate), [entry.startDate]);
  const endDate = useMemo(() => parseDate(entry.endDate), [entry.endDate]);

  const dateRange = useMemo(() => formatDateRange(startDate, endDate), [startDate, endDate]);
  const statusChips = useMemo(() => getStatusChips(entry), [entry]);
  const counters = useMemo(() => getCounters(entry), [entry]);

  const TypeIcon = typeMeta.icon;

  return (
    <motion.div
      layout
      drag
      dragMomentum={false}
      dragElastic={0.03}
      style={{
        ...styles.card,
        borderLeft: `3px solid ${accentColor}`,
        position: 'relative',
        zIndex: isDragging ? 9999 : 1,
        x,
        y,
        opacity: isDragging ? 0.96 : pending ? 0.65 : 1,
      }}
      whileDrag={{
        rotate: 1,
        zIndex: 9999,
        boxShadow: '0 24px 48px rgba(0,0,0,0.28)',
        cursor: 'grabbing',
      }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      onDragStart={() => {
        movedRef.current = true;
        onDragStart(entry);
      }}
      onDrag={(_, info) => {
        onDragMove(info.point.x, info.point.y);
      }}
      onDragEnd={() => {
        x.set(0);
        y.set(0);

        window.setTimeout(() => {
          movedRef.current = false;
        }, 0);

        onDragEnd(entry);
      }}
      onClick={() => {
        if (isDragging || movedRef.current) return;
        onCardClick(entry);
      }}
    >
      <div style={styles.cardTitle}>
        {entry.name}
        {qualifier ? <span style={{ opacity: 0.55, fontWeight: 400 }}> · {qualifier}</span> : null}
      </div>

      {/* Type and dates share one quiet line: they describe the session rather
          than ask for attention, so they no longer get pills of their own. */}
      <div style={{ ...ROW, ...styles.cardMeta, gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
        <span style={{ ...ROW, gap: 4, color: typeMeta.color, fontWeight: 600 }}>
          <TypeIcon size={13} />
          {typeMeta.label}
        </span>
        {dateRange ? (
          <>
            <span style={{ opacity: 0.4 }}>·</span>
            <span style={{ whiteSpace: 'nowrap' }}>{dateRange}</span>
          </>
        ) : null}
      </div>

      {statusChips.length ? (
        <div style={{ ...ROW, gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {statusChips.map((chip) => (
            <CardChip key={chip.key} chip={chip} />
          ))}
        </div>
      ) : null}

      {counters.length ? (
        <div style={{ ...ROW, ...COUNTERS, flexWrap: 'wrap' }}>
          {counters.map((counter) => {
            const Icon = counter.icon;
            return (
              <span key={counter.key} title={counter.title} style={{ ...ROW, gap: 4, color: counter.color }}>
                <Icon size={13} />
                {counter.label}
              </span>
            );
          })}
        </div>
      ) : null}
    </motion.div>
  );
};

const CardChip = ({ chip }: { chip: Chip }) => {
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

const TONES = {
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
const getMediaChip = (entry: PhotoEntryResponse): Chip | null => {
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
const getStatusChips = (entry: PhotoEntryResponse): Chip[] => {
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
const getCounters = (entry: PhotoEntryResponse): Counter[] => {
  const counters: Counter[] = [];

  const progress = formatProgress(entry);
  if (progress) {
    counters.push({ key: 'progress', label: progress, title: 'Progress', icon: FiImage, color: TONES.slate.color });
  }

  const summary = entry.commentSummary;
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
const formatProgress = (entry: PhotoEntryResponse): string | null => {
  const { photoCount, selectedCount, editedCount } = entry;

  if (editedCount != null && selectedCount != null) return `${editedCount} / ${selectedCount} edited`;
  if (selectedCount != null && photoCount != null) return `${selectedCount} / ${photoCount} selected`;
  if (selectedCount != null) return `${selectedCount} selected`;
  if (photoCount != null) return `${photoCount} frames`;

  return null;
};

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date;
};

/** Says the shared month/year once: "12–13 Aug 2026", "28 Aug – 2 Sep 2026". */
const formatDateRange = (startDate?: Date | null, endDate?: Date | null) => {
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

const getPhotoEntryTypeMeta = (
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
