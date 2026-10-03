import { useEffect, useMemo, useState } from 'react';
import { FiAlertTriangle, FiSun, FiSunrise, FiSunset } from 'react-icons/fi';
import { PhotoEntrySkyResponse, SkyDayResponse, SkyEclipseResponse, TimeWindowResponse } from '~/api/api';
import { Loader } from '~/components/Loader';
import { MoonIcon } from '~/components/MoonIcon';
import { useApi } from '~/hooks/useApi';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

type EntrySkyPanelProps = {
  entryId: string;
  /** Changes whenever the location or the dates do, so the sky is fetched again. */
  reloadKey: string;
};

type SegmentKind = 'day' | 'darkness' | 'darkSky' | 'blue' | 'golden' | 'milkyWay';

type Segment = { kind: SegmentKind; from: number; to: number };

const DAY_MINUTES = 24 * 60;

/** Drawn bottom to top, so dark sky sits on the night and the hours on the day. */
const LAYER_ORDER: SegmentKind[] = ['day', 'darkness', 'darkSky', 'blue', 'golden', 'milkyWay'];

const LEGEND: { kind: SegmentKind; label: string }[] = [
  { kind: 'golden', label: 'Golden hour' },
  { kind: 'blue', label: 'Blue hour' },
  { kind: 'darkSky', label: 'Dark sky' },
  { kind: 'milkyWay', label: 'Milky Way core' },
];

const PHASE_BASE: Record<string, { waxing: boolean; label: string }> = {
  NEW: { waxing: true, label: 'New moon' },
  WAXING_CRESCENT: { waxing: true, label: 'Waxing crescent' },
  FIRST_QUARTER: { waxing: true, label: 'First quarter' },
  WAXING_GIBBOUS: { waxing: true, label: 'Waxing gibbous' },
  FULL: { waxing: false, label: 'Full moon' },
  WANING_GIBBOUS: { waxing: false, label: 'Waning gibbous' },
  LAST_QUARTER: { waxing: false, label: 'Last quarter' },
  WANING_CRESCENT: { waxing: false, label: 'Waning crescent' },
};

/** The icon wants a 0–1 cycle position; the API gives a phase name and a lit percentage. */
const moonCyclePosition = (phase: string, illuminationPercent: number) => {
  const lit = Math.min(1, Math.max(0, illuminationPercent / 100));
  const half = Math.acos(1 - 2 * lit) / (2 * Math.PI);
  return PHASE_BASE[phase]?.waxing === false ? 1 - half : half;
};

/** The date and minute of day of an instant, in the place's time zone. */
const zoned = (iso: string, timeZone: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
};

/** All times arrive in UTC and are shown in the place's own zone, not the browser's. */
const formatTime = (iso: string | null | undefined, timeZone: string) =>
  iso ? new Date(iso).toLocaleTimeString('pl-PL', { timeZone, hour: '2-digit', minute: '2-digit' }) : '—';

const formatDuration = (minutes: number) => {
  if (minutes <= 0) return 'none';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
};

const formatDay = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

/**
 * Every window of every day as segments on the local days they cover. A night
 * that starts on one evening runs into the next morning, so it is split across
 * the two bars rather than cut off at midnight.
 */
const buildSegments = (days: SkyDayResponse[], timeZone: string) => {
  const byDate = new Map<string, Segment[]>();
  const add = (
    kind: SegmentKind,
    window?: TimeWindowResponse | { start?: string | null; end?: string | null } | null,
  ) => {
    if (!window?.start || !window?.end) return;
    const from = zoned(window.start, timeZone);
    const to = zoned(window.end, timeZone);
    const push = (date: string, a: number, b: number) => {
      if (b <= a) return;
      byDate.set(date, [...(byDate.get(date) ?? []), { kind, from: a, to: b }]);
    };
    if (from.date === to.date) push(from.date, from.minutes, to.minutes);
    else {
      push(from.date, from.minutes, DAY_MINUTES);
      push(to.date, 0, to.minutes);
    }
  };

  days.forEach((day) => {
    add('day', { start: day.sun.rise, end: day.sun.set });
    add('golden', day.goldenHour.morning);
    add('golden', day.goldenHour.evening);
    add('blue', day.blueHour.morning);
    add('blue', day.blueHour.evening);
    if (day.night) {
      add('darkness', day.night.darkness);
      day.night.darkSkyWindows.forEach((window) => add('darkSky', window));
      add('milkyWay', day.night.milkyWayCore);
    }
  });
  return byDate;
};

/**
 * Sun, moon and darkness for each day of the session, at its location — the
 * golden and blue hours for landscape, the real dark-sky minutes and the Milky
 * Way core for astro, and any eclipse on top.
 */
export const EntrySkyPanel = ({ entryId, reloadKey }: EntrySkyPanelProps) => {
  const styles = useStyles();
  const { photoEntryApi } = useApi();
  const [sky, setSky] = useState<PhotoEntrySkyResponse>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!photoEntryApi) return;
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    photoEntryApi
      .photoEntryPlanningControllerGetSky({ id: entryId })
      .then(({ data }) => !cancelled && setSky(data))
      .catch((e) => !cancelled && setError(getApiErrorMessage(e, 'Could not work out the sky for this session.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [photoEntryApi, entryId, reloadKey]);

  const segments = useMemo(() => (sky ? buildSegments(sky.days, sky.timezone) : new Map()), [sky]);

  if (loading && !sky) return <Loader />;
  if (error) return <span style={styles.muted}>{error}</span>;
  if (!sky) return null;

  const tz = sky.timezone;

  return (
    <div style={styles.container}>
      {sky.eclipses.map((eclipse) => (
        <EclipseBanner key={`${eclipse.body}-${eclipse.peak}`} eclipse={eclipse} timeZone={tz} />
      ))}

      <div style={styles.legend}>
        {LEGEND.map((item) => (
          <span key={item.kind} style={styles.legendItem}>
            <span style={{ ...styles.legendSwatch, ...SEGMENT_STYLE[item.kind] }} />
            {item.label}
          </span>
        ))}
        <span style={{ ...styles.muted, marginLeft: 'auto' }}>Times in {tz}</span>
      </div>

      {sky.days.map((day) => (
        <DayRow key={day.date} day={day} timeZone={tz} segments={segments.get(day.date) ?? []} />
      ))}

      {sky.truncated ? <span style={styles.muted}>Showing the first 14 days of the session.</span> : null}
    </div>
  );
};

const SEGMENT_STYLE: Record<SegmentKind, React.CSSProperties> = {
  day: { backgroundColor: 'rgba(236, 232, 214, 0.14)' },
  darkness: { backgroundColor: 'rgba(16, 20, 40, 0.9)' },
  darkSky: { backgroundColor: 'rgba(160, 120, 255, 0.55)' },
  blue: { backgroundColor: 'rgba(0, 157, 248, 0.6)' },
  golden: { backgroundColor: 'rgba(232, 179, 72, 0.85)' },
  milkyWay: { backgroundColor: '#ECE8D6' },
};

const DayRow = ({ day, timeZone, segments }: { day: SkyDayResponse; timeZone: string; segments: Segment[] }) => {
  const styles = useStyles();
  const theme = useTheme();
  const phase = PHASE_BASE[day.moon.phase];
  const darkSky = day.night?.darkSkyMinutes ?? 0;

  return (
    <div style={styles.day}>
      <div style={styles.dayHead}>
        <span style={styles.dayLabel}>{formatDay(day.date)}</span>
        <span style={styles.fact} title='Sunrise · sunset'>
          <FiSunrise size={13} color={theme.colors.yellow} />
          {formatTime(day.sun.rise, timeZone)}
          <FiSunset size={13} color={theme.colors.yellow} />
          {formatTime(day.sun.set, timeZone)}
        </span>
        {day.goldenHour.evening ? (
          <span style={styles.fact} title='Evening golden hour'>
            <FiSun size={13} color='#E8B348' />
            {formatTime(day.goldenHour.evening.start, timeZone)}–{formatTime(day.goldenHour.evening.end, timeZone)}
          </span>
        ) : null}
        <span
          style={styles.fact}
          title={`${phase?.label ?? day.moon.phase} · rises ${formatTime(day.moon.rise, timeZone)}, sets ${formatTime(
            day.moon.set,
            timeZone,
          )}`}
        >
          <MoonIcon phase={moonCyclePosition(day.moon.phase, day.moon.illumination)} size={15} />
          {Math.round(day.moon.illumination)}%
        </span>
        <span style={{ ...styles.darkSky, opacity: darkSky ? 1 : 0.5 }} title='Astronomical night with the moon down'>
          Dark sky {day.night ? formatDuration(darkSky) : '— no astronomical night'}
        </span>
        {day.night?.milkyWayCore ? (
          <span style={styles.fact} title='Galactic core above 10° in dark sky'>
            Milky Way {formatTime(day.night.milkyWayCore.start, timeZone)}–
            {formatTime(day.night.milkyWayCore.end, timeZone)}
          </span>
        ) : null}
      </div>

      <div style={styles.bar}>
        {LAYER_ORDER.flatMap((kind) =>
          segments
            .filter((segment) => segment.kind === kind)
            .map((segment, i) => (
              <span
                key={`${kind}-${i}`}
                style={{
                  ...styles.segment,
                  ...SEGMENT_STYLE[kind],
                  left: `${(segment.from / DAY_MINUTES) * 100}%`,
                  width: `${((segment.to - segment.from) / DAY_MINUTES) * 100}%`,
                  ...(kind === 'milkyWay' ? styles.milkyWay : {}),
                }}
              />
            )),
        )}
        {[6, 12, 18].map((hour) => (
          <span key={hour} style={{ ...styles.tick, left: `${(hour / 24) * 100}%` }}>
            <span style={styles.tickLabel}>{hour}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const EclipseBanner = ({ eclipse, timeZone }: { eclipse: SkyEclipseResponse; timeZone: string }) => {
  const styles = useStyles();
  const what = `${eclipse.kind.charAt(0).toUpperCase()}${eclipse.kind.slice(1)} ${
    eclipse.body === 'SUN' ? 'solar' : 'lunar'
  } eclipse`;
  const contacts = eclipse.contacts;

  return (
    <div style={{ ...styles.eclipse, opacity: eclipse.visible ? 1 : 0.7 }}>
      <FiAlertTriangle size={16} />
      <div style={styles.eclipseText}>
        <span style={styles.eclipseTitle}>
          {what} · peak {formatTime(eclipse.peak, timeZone)}
          {eclipse.obscuration != null ? ` · ${Math.round(eclipse.obscuration * 100)}% covered` : ''}
        </span>
        <span>
          {eclipse.visible
            ? `Visible from here, ${Math.round(eclipse.altitudeAtPeak)}° above the horizon at peak`
            : 'Below the horizon from here at peak'}
          {contacts?.partialBegin
            ? ` · partial ${formatTime(contacts.partialBegin, timeZone)}–${formatTime(contacts.partialEnd, timeZone)}`
            : ''}
          {contacts?.totalBegin
            ? ` · total ${formatTime(contacts.totalBegin, timeZone)}–${formatTime(contacts.totalEnd, timeZone)}`
            : ''}
        </span>
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.s },
  muted: { fontSize: 12, color: t.colors.dark05 },
  legend: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: t.spacing.m },
  legendItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    color: t.colors.dark05,
  },
  legendSwatch: { display: 'block', width: 12, height: 8, borderRadius: 2 },
  day: {
    gap: 6,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.25),
  },
  dayHead: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: t.spacing.m, rowGap: 4 },
  dayLabel: { fontSize: 13, fontWeight: 700, color: t.colors.white, minWidth: 92 },
  fact: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: t.colors.white,
    whiteSpace: 'nowrap',
  },
  darkSky: { fontSize: 12, fontWeight: 700, color: '#B9A0FF', whiteSpace: 'nowrap' },
  bar: {
    position: 'relative',
    height: 14,
    borderRadius: 4,
    overflow: 'visible',
    backgroundColor: 'rgba(30, 36, 60, 0.7)',
    marginBottom: 12,
  },
  segment: { position: 'absolute', top: 0, bottom: 0, display: 'block' },
  milkyWay: { top: 'auto', bottom: -4, height: 3, borderRadius: 2 },
  tick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  tickLabel: { position: 'absolute', top: 16, left: -4, fontSize: 9, color: t.colors.dark05 },
  eclipse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.large,
    fontSize: 13,
    color: '#F2C66D',
    backgroundColor: 'rgba(232, 179, 72, 0.1)',
    border: '1px solid rgba(232, 179, 72, 0.35)',
  },
  eclipseText: { gap: 2 },
  eclipseTitle: { fontWeight: 700 },
}));
