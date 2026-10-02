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
  const mediaChip = useMemo(() => getMediaChip(entry), [entry]);
  const signalChips = useMemo(() => getSignalChips(entry), [entry]);

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

      <div
        style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          marginTop: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            padding: '4px 8px',
            borderRadius: 999,
            fontSize: 14,
            lineHeight: 1,
            fontWeight: 500,
            background: typeMeta.background,
            border: `1px solid ${typeMeta.border}`,
            color: typeMeta.color,
            width: 'fit-content',
          }}
        >
          <TypeIcon size={16} />
          <span>{typeMeta.label}</span>
        </div>

        {mediaChip ? <CardChip chip={mediaChip} /> : null}
      </div>

      {signalChips.length ? (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
          {signalChips.map((chip) => (
            <CardChip key={chip.key} chip={chip} />
          ))}
        </div>
      ) : null}

      {entry.rootPath ? (
        <div
          style={{
            ...styles.cardMeta,
            marginTop: 8,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={entry.rootPath}
        >
          <span style={{ opacity: 0.68 }}>Path:</span> {entry.rootPath}
        </div>
      ) : null}

      {dateRange ? (
        <div style={{ ...styles.cardMeta, marginTop: 6 }}>
          <span style={{ opacity: 0.68 }}>Dates:</span> {dateRange}
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
        gap: 7,
        padding: '6px 10px',
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
      <Icon size={14} />
      <span>{chip.label}</span>
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
    return { key: 'uploaded', label: 'Material secured', icon: FiCheckCircle, ...TONES.green };
  }

  if (entry.status !== PhotoEntryStatus.Shot) return null;

  return { key: 'unsecured', label: 'Material not secured', icon: FiAlertCircle, ...TONES.red, pulse: true };
};

const getSignalChips = (entry: PhotoEntryResponse): Chip[] => {
  const chips: Chip[] = [];

  // Derived from the dates by the backend, so it needs no lane of its own.
  if (entry.isHappeningNow) {
    chips.push({ key: 'now', label: 'Happening now', icon: FiRadio, ...TONES.azure, pulse: true });
  }

  // Only worth saying where the stage no longer implies it — an entry parked back
  // in "After shoot" still carries the fact that it was edited at some point.
  if (entry.wasEdited && entry.postStage === PhotoEntryPostStage.None) {
    chips.push({ key: 'edited', label: 'Was edited', icon: FiEdit3, ...TONES.slate });
  }

  const progress = formatProgress(entry);
  if (progress) {
    chips.push({ key: 'progress', label: progress, icon: FiCheckSquare, ...TONES.slate });
  }

  const summary = entry.commentSummary;
  if (summary?.highlights) {
    chips.push({ key: 'highlights', label: String(summary.highlights), icon: FiStar, ...TONES.amber });
  }
  if (summary?.openTodos) {
    chips.push({ key: 'todos', label: `${summary.openTodos} to do`, icon: FiCheckSquare, ...TONES.azure });
  }
  if (summary?.problems) {
    chips.push({ key: 'problems', label: String(summary.problems), icon: FiAlertTriangle, ...TONES.red });
  }

  return chips;
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

const formatDateRange = (startDate?: Date | null, endDate?: Date | null) => {
  const formatValue = (date?: Date | null) => {
    if (!date) return null;
    return format(date, 'dd.MM.yyyy');
  };

  const start = formatValue(startDate);
  const end = formatValue(endDate);

  if (start && end) return `${start} → ${end}`;
  if (start) return `${start} → ...`;
  if (end) return `... → ${end}`;
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
