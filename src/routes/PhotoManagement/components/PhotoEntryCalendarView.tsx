import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { CSSProperties, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiHelpCircle, FiRadio } from 'react-icons/fi';
import { PhotoEntryResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { MoonIcon } from '~/components/MoonIcon';
import { Scrollbar } from '~/components/Scrollbar';
import { getEntryStateMeta, getMediaChip, getPhotoEntryTypeMeta } from '~/routes/PhotoManagement/utils/entryDisplay';
import { isOverduePlan } from '~/routes/PhotoManagement/utils/kanban';
import { DARK_SKY_ILLUMINATION, getMoonInfo } from '~/utils/moon';
import { mkUseStyles, useTheme } from '~/utils/theme';

type PhotoEntryCalendarViewProps = {
  entries: PhotoEntryResponse[];
  onEntryClick: (entry: PhotoEntryResponse) => void;
};

type Span = { entry: PhotoEntryResponse; start: Date; end: Date };

type Placed = Span & { lane: number; fromCol: number; toCol: number; clippedStart: boolean; clippedEnd: boolean };

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TILE_HEIGHT = 46;
const DAY_HEADER = 30;
const ROW_GAP = 4;
const WEEK_MIN_HEIGHT = 100;

/** YYYY-MM-DD read as a local day, so a trip never slides a day in another time zone. */
const toLocalDay = (value?: string | null): Date | null => {
  if (!value) return null;
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

/** A session with one date sits on that day; one with none cannot be placed. */
const toSpan = (entry: PhotoEntryResponse): Span | null => {
  const start = toLocalDay(entry.startDate) ?? toLocalDay(entry.endDate);
  const end = toLocalDay(entry.endDate) ?? start;
  if (!start || !end) return null;
  return end < start ? { entry, start: end, end: start } : { entry, start, end };
};

/**
 * Lays one week's sessions out in lanes: earliest first, longer first on a tie,
 * each into the first lane that is free from its first day.
 */
const placeWeek = (spans: Span[], weekStart: Date): Placed[] => {
  const weekEnd = addDays(weekStart, 6);
  const inWeek = spans
    .filter((span) => span.start <= weekEnd && span.end >= weekStart)
    .sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime());

  const laneEnds: number[] = [];
  return inWeek.map((span) => {
    const fromCol = Math.max(0, differenceInCalendarDays(span.start, weekStart));
    const toCol = Math.min(6, differenceInCalendarDays(span.end, weekStart));
    let lane = laneEnds.findIndex((end) => end < fromCol);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = toCol;
    return {
      ...span,
      lane,
      fromCol,
      toCol,
      clippedStart: span.start < weekStart,
      clippedEnd: span.end > weekEnd,
    };
  });
};

/**
 * The month as a big grid with each session drawn across the days it takes —
 * the board's cards stretched over the calendar. Planned trips are hollow with a
 * dashed edge, shot ones filled in their stage colour, as everywhere else.
 */
export const PhotoEntryCalendarView = ({ entries, onEntryClick }: PhotoEntryCalendarViewProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const today = new Date();

  const spans = useMemo(() => entries.map(toSpan).filter((span): span is Span => Boolean(span)), [entries]);
  const undated = entries.length - spans.length;

  const weeks = useMemo(() => {
    const first = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const last = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const result: { start: Date; placed: Placed[]; lanes: number }[] = [];
    for (let start = first; start <= last; start = addDays(start, 7)) {
      const placed = placeWeek(spans, start);
      result.push({ start, placed, lanes: placed.reduce((max, p) => Math.max(max, p.lane + 1), 0) });
    }
    return result;
  }, [month, spans]);

  const inMonth = useMemo(
    () => spans.filter((span) => span.start <= endOfMonth(month) && span.end >= startOfMonth(month)).length,
    [spans, month],
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleBlock}>
          <span style={styles.title}>{format(month, 'MMMM yyyy')}</span>
          <span style={styles.muted}>
            {inMonth} session{inMonth === 1 ? '' : 's'} this month
            {undated ? ` · ${undated} without dates not shown` : ''}
          </span>
        </div>
        <div style={styles.nav}>
          <Button
            label='Today'
            variant='secondary'
            onClick={() => setMonth(startOfMonth(new Date()))}
            disabled={isSameMonth(month, today)}
          />
          <button
            type='button'
            aria-label='Previous month'
            style={styles.navBtn}
            onClick={() => setMonth((m) => addMonths(m, -1))}
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            type='button'
            aria-label='Next month'
            style={styles.navBtn}
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>

      <div style={styles.weekdays}>
        {WEEKDAYS.map((day) => (
          <span key={day} style={styles.weekday}>
            {day}
          </span>
        ))}
      </div>

      <Scrollbar style={styles.scroll}>
        <div style={styles.weeks}>
          {weeks.map((week) => (
            <div
              key={week.start.toISOString()}
              style={{
                ...styles.week,
                gridTemplateRows: `${DAY_HEADER}px repeat(${week.lanes}, ${TILE_HEIGHT}px) minmax(16px, 1fr)`,
                // Weeks share the height, but never below what their lanes need:
                // a fixed minimum let a busy week spill over the next one.
                minHeight: Math.max(WEEK_MIN_HEIGHT, DAY_HEADER + week.lanes * (TILE_HEIGHT + ROW_GAP) + 24),
              }}
            >
              {Array.from({ length: 7 }, (_, i) => {
                const day = addDays(week.start, i);
                const isToday = isSameDay(day, today);
                const outside = !isSameMonth(day, month);
                // Every calendar shows the moon: night shots outside astro care about it too.
                const moon = getMoonInfo(day);
                const darkSky = moon.illumination < DARK_SKY_ILLUMINATION;
                return (
                  <div
                    key={i}
                    style={{
                      ...styles.dayCell,
                      gridColumn: i + 1,
                      backgroundColor: darkSky
                        ? theme.colors.purple02 + theme.colorOpacity(0.08)
                        : i >= 5
                          ? theme.colors.white + theme.colorOpacity(0.02)
                          : 'transparent',
                      borderLeftWidth: i === 0 ? 0 : 1,
                    }}
                  >
                    <div style={{ ...styles.dayHead, opacity: outside ? 0.35 : 1 }}>
                      <span style={{ ...styles.dayNumber, ...(isToday ? styles.today : {}) }}>{format(day, 'd')}</span>
                      <span style={styles.moon}>
                        {darkSky ? <span style={styles.darkSky}>Dark sky</span> : null}
                        <span
                          style={styles.moonValue}
                          title={`${moon.name} · ${Math.round(moon.illumination * 100)}% lit`}
                        >
                          <MoonIcon phase={moon.phase} size={16} />
                          <span style={styles.moonPercent}>{Math.round(moon.illumination * 100)}%</span>
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}

              {week.placed.map((placed) => (
                <CalendarTile
                  key={placed.entry.id}
                  placed={placed}
                  onClick={() => onEntryClick(placed.entry)}
                  style={{
                    gridColumn: `${placed.fromCol + 1} / ${placed.toCol + 2}`,
                    gridRow: placed.lane + 2,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </Scrollbar>
    </div>
  );
};

const CalendarTile = ({ placed, style, onClick }: { placed: Placed; style: CSSProperties; onClick: () => void }) => {
  const styles = useStyles();
  const { entry } = placed;
  const state = getEntryStateMeta(entry);
  const type = getPhotoEntryTypeMeta(entry.type);
  const media = getMediaChip(entry);
  const TypeIcon = type.icon;
  const StateIcon = state.icon;
  const MediaIcon = media?.icon;
  const radius = 10;

  return (
    <button
      type='button'
      onClick={onClick}
      title={entry.name}
      style={{
        ...styles.tile,
        ...style,
        marginLeft: placed.clippedStart ? 0 : 4,
        marginRight: placed.clippedEnd ? 0 : 4,
        borderTopLeftRadius: placed.clippedStart ? 0 : radius,
        borderBottomLeftRadius: placed.clippedStart ? 0 : radius,
        borderTopRightRadius: placed.clippedEnd ? 0 : radius,
        borderBottomRightRadius: placed.clippedEnd ? 0 : radius,
        backgroundColor: state.planned ? 'rgba(30, 32, 37, 0.55)' : state.background,
        borderStyle: state.planned ? 'dashed' : 'solid',
        borderColor: state.border,
        // Shot sessions get the board card's accent edge; a week that continues a
        // trip from the previous one has no left edge to put it on.
        borderLeftWidth: state.planned || placed.clippedStart ? 1 : 3,
        borderLeftColor: state.planned ? state.border : state.accent,
        opacity: state.cancelled ? 0.5 : 1,
      }}
    >
      <span style={{ ...styles.tileName, textDecoration: state.cancelled ? 'line-through' : 'none' }}>
        {entry.name}
      </span>
      <span style={styles.tileMeta}>
        <span style={{ ...styles.tileMetaItem, color: type.color }} title={type.label}>
          <TypeIcon size={11} />
        </span>
        <span style={{ ...styles.tileMetaItem, color: state.planned ? '#C9D4DC' : state.accent }}>
          <StateIcon size={11} />
          {state.label}
        </span>
        {entry.isHappeningNow ? (
          <span style={{ ...styles.tileMetaItem, color: '#7FCBFF' }} title='Happening now'>
            <FiRadio size={11} />
          </span>
        ) : null}
        {isOverduePlan(entry) ? (
          <span style={{ ...styles.tileMetaItem, color: '#E7BE63' }} title='Did it happen?'>
            <FiHelpCircle size={11} />
          </span>
        ) : null}
        {media && MediaIcon ? (
          <span style={{ ...styles.tileMetaItem, color: media.color }} title={media.label}>
            <MediaIcon size={11} />
          </span>
        ) : null}
      </span>
    </button>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flex: 1,
    minHeight: 0,
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  titleBlock: { gap: 2 },
  title: { fontSize: 22, fontWeight: 700, color: t.colors.white },
  muted: { fontSize: 12, color: t.colors.dark05 },
  nav: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: t.borderRadius.default,
    border: 'none',
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.7),
  },
  weekdays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    paddingRight: t.spacing.m,
  },
  weekday: {
    padding: `0 ${t.spacing.s}px`,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  scroll: { flex: 1, minHeight: 0 },
  weeks: {
    minHeight: '100%',
    // The global `div { display: flex }` makes the scroll view a flex column
    // too, so without this the weeks were squeezed to the view's height and
    // spilled past it instead of scrolling.
    flexShrink: 0,
    // The border is inside the 100%, or it alone made the view scroll by 2px.
    boxSizing: 'border-box',
    marginRight: t.spacing.m,
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: t.colors.white + t.colorOpacity(0.06),
  },
  week: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    rowGap: ROW_GAP,
    // Grow into spare height but never below the content: with a zero basis the
    // weeks overflowed the scroll area instead of making it scroll.
    flex: '1 0 auto',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: t.colors.white + t.colorOpacity(0.06),
  },
  dayCell: {
    gridRow: '1 / -1',
    borderLeftStyle: 'solid',
    borderLeftColor: t.colors.white + t.colorOpacity(0.06),
    padding: `6px ${t.spacing.s}px`,
  },
  dayHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  moon: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 },
  moonValue: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 },
  moonPercent: {
    minWidth: 28,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: 600,
    color: '#ECE8D6',
    opacity: 0.85,
  },
  darkSky: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: t.colors.purple02,
    whiteSpace: 'nowrap',
  },
  dayNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
    color: t.colors.white,
  },
  today: { backgroundColor: t.colors.blue, color: t.colors.white },
  tile: {
    zIndex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 3,
    padding: '4px 8px',
    borderWidth: 1,
    cursor: 'pointer',
    textAlign: 'left',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
  },
  tileName: {
    maxWidth: '100%',
    fontSize: 12,
    fontWeight: 700,
    color: t.colors.white,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tileMeta: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  tileMetaItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
}));
