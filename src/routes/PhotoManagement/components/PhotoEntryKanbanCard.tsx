import { format } from 'date-fns';
import { motion, useMotionValue } from 'framer-motion';
import { useMemo, useRef } from 'react';
import { FiAlertCircle, FiBriefcase, FiCheckCircle, FiFileText, FiFolder, FiMoon } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { MediaStatus, PhotoEntryResponse, PhotoEntryType } from '~/api/api';
import { getPhotoEntryStatusColors } from '~/routes/PhotoManagement/utils/colors';

type PhotoEntryKanbanCardProps = {
  entry: PhotoEntryResponse;
  pending: boolean;
  isDragging: boolean;
  onCardClick: (entry: PhotoEntryResponse) => void;
  onDragStart: (entry: PhotoEntryResponse) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (entry: PhotoEntryResponse) => void;
  styles: Record<string, any>;
};

export const PhotoEntryKanbanCard = ({
  entry,
  pending,
  isDragging,
  onCardClick,
  onDragStart,
  onDragMove,
  onDragEnd,
  styles,
}: PhotoEntryKanbanCardProps) => {
  const cardColors = getPhotoEntryStatusColors(entry.status);
  const typeMeta = useMemo(() => getPhotoEntryTypeMeta(entry.type), [entry.type]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const movedRef = useRef(false);

  const startDate = useMemo(() => parseDate(entry.startDate), [entry.startDate]);
  const endDate = useMemo(() => parseDate(entry.endDate), [entry.endDate]);
  const createdAt = useMemo(() => parseDate(entry.createdAt), [entry.createdAt]);

  const dateRange = useMemo(() => formatDateRange(startDate, endDate), [startDate, endDate]);
  const folderStatus = useMemo(
    () => getFolderStatusMeta(entry.foldersCreated, entry.uploadStatus),
    [entry.foldersCreated, entry.uploadStatus],
  );

  const TypeIcon = typeMeta.icon;
  const FolderStatusIcon = folderStatus.icon;

  return (
    <motion.div
      layout
      drag
      dragMomentum={false}
      dragElastic={0.03}
      style={{
        ...styles.card,
        borderLeft: `3px solid ${cardColors.accent}`,
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
      <div style={styles.cardTitle}>{entry.name}</div>

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

        <motion.div
          animate={
            folderStatus.pulse
              ? {
                  scale: [1, 1.04, 1],
                }
              : {
                  scale: 1,
                }
          }
          transition={
            folderStatus.pulse
              ? {
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : undefined
          }
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
            background: folderStatus.background,
            border: `1px solid ${folderStatus.border}`,
            color: folderStatus.color,
          }}
        >
          <FolderStatusIcon size={14} />
          <span>{folderStatus.label}</span>
        </motion.div>
      </div>

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

const getFolderStatusMeta = (
  foldersCreated: boolean,
  uploadStatus?: MediaStatus | null,
): {
  label: string;
  icon: IconType;
  background: string;
  border: string;
  color: string;
  pulse: boolean;
} => {
  if (!foldersCreated) {
    return {
      label: 'Folders pending',
      icon: FiFolder,
      background: 'rgba(232, 179, 72, 0.08)',
      border: 'rgba(232, 179, 72, 0.18)',
      color: '#E7BE63',
      pulse: false,
    };
  }

  if (uploadStatus === MediaStatus.Uploaded) {
    return {
      label: 'Photo uploaded',
      icon: FiCheckCircle,
      background: 'rgba(53, 158, 122, 0.10)',
      border: 'rgba(53, 158, 122, 0.20)',
      color: '#7BC8A6',
      pulse: false,
    };
  }

  return {
    label: 'Waiting for upload',
    icon: FiAlertCircle,
    background: 'rgba(220, 68, 55, 0.10)',
    border: 'rgba(220, 68, 55, 0.22)',
    color: '#F08A80',
    pulse: true,
  };
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
