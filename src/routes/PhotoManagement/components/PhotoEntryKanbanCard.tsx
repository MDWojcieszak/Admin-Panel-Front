import { motion, useMotionValue } from 'framer-motion';
import { CSSProperties, useMemo, useRef } from 'react';
import { PhotoEntryResponse } from '~/api/api';
import {
  EntryChip,
  formatDateRange,
  getCounters,
  getPhotoEntryTypeMeta,
  getStatusChips,
  parseDate,
} from '~/routes/PhotoManagement/utils/entryDisplay';

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
            <EntryChip key={chip.key} chip={chip} />
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
