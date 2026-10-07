import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { PhotoEntryResponse } from '~/api/api';
import { MoonIcon } from '~/components/MoonIcon';
import {
  EntryStatePill,
  formatDateRange,
  getEntryStateMeta,
  getPhotoEntryTypeMeta,
} from '~/routes/PhotoManagement/utils/entryDisplay';
import { DARK_SKY_ILLUMINATION, getMoonInfo } from '~/utils/moon';
import { mkUseStyles, useTheme } from '~/utils/theme';

type PhotoEntryMonthAgendaProps = {
  entries: PhotoEntryResponse[];
  onEntryClick: (entry: PhotoEntryResponse) => void;
};

type Span = { entry: PhotoEntryResponse; start: Date; end: Date };

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MAX_DOTS = 3;

/** YYYY-MM-DD read as a local day, as the desktop calendar does. */
const toLocalDay = (value?: string | null): Date | null => {
  if (!value) return null;
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const toSpan = (entry: PhotoEntryResponse): Span | null => {
  const start = toLocalDay(entry.startDate) ?? toLocalDay(entry.endDate);
  const end = toLocalDay(entry.endDate) ?? start;
  if (!start || !end) return null;
  return end < start ? { entry, start: end, end: start } : { entry, start, end };
};

const covers = (span: Span, day: Date) => span.start <= day && span.end >= day;

/**
 * The calendar on a phone: sessions drawn across a seven-column month do not
 * fit 360px, so the month becomes a compact grid of days — a dot per session,
 * the dark-sky nights tinted — and the sessions themselves are listed under it,
 * for the tapped day or, with none tapped, for the whole month.
 */
export const PhotoEntryMonthAgenda = ({ entries, onEntryClick }: PhotoEntryMonthAgendaProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date | null>(null);
  const today = new Date();

  const spans = useMemo(() => entries.map(toSpan).filter((span): span is Span => Boolean(span)), [entries]);
  const undated = entries.length - spans.length;

  const days = useMemo(() => {
    const first = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const last = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const result: Date[] = [];
    for (let day = first; day <= last; day = addDays(day, 1)) result.push(day);
    return result;
  }, [month]);

  const listed = useMemo(() => {
    const inRange = selected
      ? spans.filter((span) => covers(span, selected))
      : spans.filter((span) => span.start <= endOfMonth(month) && span.end >= startOfMonth(month));
    return inRange.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [spans, selected, month]);

  const changeMonth = (delta: number) => {
    setMonth((m) => addMonths(m, delta));
    setSelected(null);
  };

  const selectedMoon = selected ? getMoonInfo(selected) : null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button type='button' aria-label='Previous month' style={styles.navBtn} onClick={() => changeMonth(-1)}>
          <FiChevronLeft size={18} />
        </button>
        <button
          type='button'
          style={styles.monthButton}
          // The month's name doubles as "back to today".
          onClick={() => {
            setMonth(startOfMonth(new Date()));
            setSelected(null);
          }}
        >
          <span style={styles.title}>{format(month, 'MMMM yyyy')}</span>
          {!isSameMonth(month, today) ? <span style={styles.todayHint}>Tap for today</span> : null}
        </button>
        <button type='button' aria-label='Next month' style={styles.navBtn} onClick={() => changeMonth(1)}>
          <FiChevronRight size={18} />
        </button>
      </div>

      <div style={styles.grid}>
        {WEEKDAYS.map((day, i) => (
          <span key={i} style={styles.weekday}>
            {day}
          </span>
        ))}
        {days.map((day) => {
          const outside = !isSameMonth(day, month);
          const isToday = isSameDay(day, today);
          const isSelected = selected ? isSameDay(day, selected) : false;
          const dark = getMoonInfo(day).illumination < DARK_SKY_ILLUMINATION;
          const onDay = spans.filter((span) => covers(span, day));
          return (
            <button
              key={day.toISOString()}
              type='button'
              onClick={() => setSelected(isSelected ? null : day)}
              style={{
                ...styles.day,
                opacity: outside ? 0.35 : 1,
                backgroundColor: isSelected
                  ? theme.colors.blue + theme.colorOpacity(0.22)
                  : dark
                    ? theme.colors.purple02 + theme.colorOpacity(0.1)
                    : 'transparent',
                borderColor: isSelected ? theme.colors.blue : 'transparent',
              }}
            >
              <span style={{ ...styles.dayNumber, ...(isToday ? styles.today : null) }}>{format(day, 'd')}</span>
              <span style={styles.dots}>
                {onDay.slice(0, MAX_DOTS).map((span) => {
                  const state = getEntryStateMeta(span.entry);
                  return (
                    <span
                      key={span.entry.id}
                      style={{
                        ...styles.dot,
                        backgroundColor: state.planned ? 'transparent' : state.accent,
                        border: `1px ${state.planned ? 'dashed' : 'solid'} ${state.planned ? state.border : state.accent}`,
                      }}
                    />
                  );
                })}
                {onDay.length > MAX_DOTS ? <span style={styles.more}>+</span> : null}
              </span>
            </button>
          );
        })}
      </div>

      <div style={styles.legend}>
        <span style={{ ...styles.legendSwatch, backgroundColor: theme.colors.purple02 + theme.colorOpacity(0.25) }} />
        Dark sky
        {undated ? <span style={styles.muted}>· {undated} without dates not shown</span> : null}
      </div>

      <div style={styles.agendaHead}>
        <span style={styles.agendaTitle}>
          {selected ? format(selected, 'EEEE, d MMMM') : `All of ${format(month, 'MMMM')}`}
        </span>
        {selectedMoon ? (
          <span style={styles.agendaMoon}>
            <MoonIcon phase={selectedMoon.phase} size={16} />
            {Math.round(selectedMoon.illumination * 100)}%
          </span>
        ) : null}
        {selected ? (
          <button type='button' aria-label='Show the whole month' style={styles.clear} onClick={() => setSelected(null)}>
            <FiX size={15} />
          </button>
        ) : null}
      </div>

      <div style={styles.agenda}>
        {listed.length === 0 ? (
          <span style={styles.empty}>{selected ? 'No session on this day.' : 'No session this month.'}</span>
        ) : (
          listed.map(({ entry, start, end }) => {
            const state = getEntryStateMeta(entry);
            const type = getPhotoEntryTypeMeta(entry.type);
            const TypeIcon = type.icon;
            return (
              <button
                key={entry.id}
                type='button'
                onClick={() => onEntryClick(entry)}
                style={{
                  ...styles.row,
                  borderLeftStyle: state.planned ? 'dashed' : 'solid',
                  borderLeftColor: state.planned ? state.border : state.accent,
                  opacity: state.cancelled ? 0.55 : 1,
                }}
              >
                <span style={styles.rowTop}>
                  <span
                    style={{ ...styles.rowName, textDecoration: state.cancelled ? 'line-through' : 'none' }}
                  >
                    {entry.name}
                  </span>
                  <EntryStatePill entry={entry} />
                </span>
                <span style={styles.rowMeta}>
                  <TypeIcon size={12} color={type.color} />
                  {formatDateRange(start, end)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    gap: t.spacing.sm,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexShrink: 0 },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: t.borderRadius.default,
    border: 'none',
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.7),
  },
  monthButton: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
  },
  title: { fontSize: 17, fontWeight: 700, color: t.colors.white },
  todayHint: { fontSize: 11, color: t.colors.blue },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    rowGap: 4,
    columnGap: 2,
    flexShrink: 0,
  },
  weekday: { textAlign: 'center', fontSize: 11, fontWeight: 700, color: t.colors.dark05, paddingBottom: 2 },
  day: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 3,
    height: 46,
    paddingTop: 5,
    borderRadius: t.borderRadius.default,
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: 'pointer',
    minWidth: 0,
  },
  dayNumber: {
    width: 24,
    height: 24,
    lineHeight: '24px',
    textAlign: 'center',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    color: t.colors.white,
  },
  today: { backgroundColor: t.colors.blue, color: t.colors.white },
  dots: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3, height: 7 },
  dot: { width: 6, height: 6, borderRadius: 3, boxSizing: 'border-box' },
  more: { fontSize: 9, fontWeight: 700, lineHeight: 1, color: t.colors.dark05 },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    fontSize: 11,
    color: t.colors.dark05,
    flexShrink: 0,
  },
  legendSwatch: { width: 12, height: 12, borderRadius: 3 },
  muted: { color: t.colors.dark05 },
  agendaHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    paddingTop: t.spacing.s,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
    flexShrink: 0,
  },
  agendaTitle: { flex: 1, fontSize: 15, fontWeight: 700, color: t.colors.white },
  agendaMoon: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, fontSize: 12, color: t.colors.dark05 },
  clear: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    border: 'none',
    borderRadius: 16,
    cursor: 'pointer',
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.7),
  },
  agenda: { gap: t.spacing.s, flexShrink: 0 },
  empty: { fontSize: 13, color: t.colors.dark05, padding: `${t.spacing.s}px 0` },
  row: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 4,
    padding: `${t.spacing.s}px ${t.spacing.sm}px`,
    borderRadius: t.borderRadius.medium,
    border: 'none',
    borderLeftWidth: 3,
    textAlign: 'left',
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.8),
  },
  rowTop: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
  rowName: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, wordBreak: 'break-word' },
  rowMeta: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, fontSize: 12, color: t.colors.dark05 },
}));
