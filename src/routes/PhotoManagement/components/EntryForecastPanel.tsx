import { useEffect, useState } from 'react';
import { FiCloud, FiCloudRain, FiMoon, FiSunset, FiThermometer, FiWind } from 'react-icons/fi';
import { ForecastDayResponse, PhotoEntryForecastResponse } from '~/api/api';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { formatPlaceDay, formatPlaceTime, zoned } from '~/routes/PhotoManagement/utils/placeTime';
import { getApiErrorMessage, getApiErrorStatus } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

type EntryForecastPanelProps = {
  entryId: string;
  /** Changes whenever the location or the dates do, so the forecast is fetched again. */
  reloadKey: string;
};

const pct = (value?: number | null) => (value == null ? '—' : `${Math.round(value)}%`);

/** The three cloud layers and the rain chance, hour by hour, as rows of shaded cells. */
const ROWS: {
  key: 'cloudHigh' | 'cloudMid' | 'cloudLow' | 'precipitationProbability';
  label: string;
  color: string;
}[] = [
  { key: 'cloudHigh', label: 'High', color: '236, 232, 214' },
  { key: 'cloudMid', label: 'Mid', color: '236, 232, 214' },
  { key: 'cloudLow', label: 'Low', color: '236, 232, 214' },
  { key: 'precipitationProbability', label: 'Rain', color: '0, 157, 248' },
];

/**
 * Weather for the session's days at its location, from Open-Meteo. Cloud is
 * the number that matters: through the day, in the evening golden hour, and in
 * the astronomical night for astro.
 */
export const EntryForecastPanel = ({ entryId, reloadKey }: EntryForecastPanelProps) => {
  const styles = useStyles();
  const { photoEntryApi } = useApi();
  const [forecast, setForecast] = useState<PhotoEntryForecastResponse>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!photoEntryApi) return;
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    photoEntryApi
      .photoEntryPlanningControllerGetForecast({ id: entryId })
      .then(({ data }) => !cancelled && setForecast(data))
      .catch((e) => {
        if (cancelled) return;
        // 502: the weather service is down for a moment; say so, it is not our failure.
        setError(
          getApiErrorStatus(e) === 502
            ? 'The weather service is not answering right now — try again in a while.'
            : getApiErrorMessage(e, 'Could not load the forecast.'),
        );
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [photoEntryApi, entryId, reloadKey]);

  if (loading && !forecast) return <Loader />;
  if (error) return <span style={styles.muted}>{error}</span>;
  if (!forecast) return null;

  if (!forecast.available) {
    // A past trip has no forecast worth showing.
    if (forecast.reason === 'PAST') return null;
    return (
      <span style={styles.muted}>
        <FiCloud size={13} /> The forecast will be available from{' '}
        {forecast.availableFrom ? formatPlaceDay(forecast.availableFrom.slice(0, 10)) : 'closer to the trip'}.
      </span>
    );
  }

  return (
    <div style={styles.container}>
      {forecast.days.map((day) => (
        <ForecastDay key={day.date} day={day} timeZone={forecast.timezone} />
      ))}
      <span style={styles.attribution}>
        Weather data:{' '}
        <a href='https://open-meteo.com/' target='_blank' rel='noreferrer' style={styles.link}>
          {forecast.source}
        </a>{' '}
        (CC BY 4.0)
        {forecast.fetchedAt ? ` · updated ${formatPlaceTime(forecast.fetchedAt, forecast.timezone)}` : ''}
      </span>
    </div>
  );
};

const ForecastDay = ({ day, timeZone }: { day: ForecastDayResponse; timeZone: string }) => {
  const styles = useStyles();
  const theme = useTheme();
  const s = day.summary;
  const hours = day.hourly.map((hour) => ({ ...hour, local: zoned(hour.time, timeZone) }));

  return (
    <div style={styles.day}>
      <div style={styles.dayHead}>
        <span style={styles.dayLabel}>{formatPlaceDay(day.date)}</span>
        <span style={styles.fact} title='Mean cloud, sunrise to sunset'>
          <FiCloud size={13} color={theme.colors.dark05} /> Day {pct(s.cloudDay)}
        </span>
        <span style={styles.fact} title='Mean cloud in the evening golden hour'>
          <FiSunset size={13} color='#E8B348' /> Golden {pct(s.cloudGoldenEvening)}
        </span>
        <span style={styles.night} title='Mean cloud in the astronomical night starting this evening'>
          <FiMoon size={13} /> Night {pct(s.cloudNight)}
        </span>
        <span style={styles.fact} title='Highest chance of rain · total'>
          <FiCloudRain size={13} color={theme.colors.blue} /> {pct(s.precipitationProbabilityMax)}
          {s.precipitationSum ? ` · ${s.precipitationSum.toFixed(1)} mm` : ''}
        </span>
        {s.windGustMax != null ? (
          <span style={styles.fact} title='Strongest gust'>
            <FiWind size={13} color={theme.colors.dark05} /> {Math.round(s.windGustMax)} km/h
          </span>
        ) : null}
        {s.temperatureMin != null && s.temperatureMax != null ? (
          <span style={styles.fact}>
            <FiThermometer size={13} color={theme.colors.dark05} /> {Math.round(s.temperatureMin)}° /{' '}
            {Math.round(s.temperatureMax)}°
          </span>
        ) : null}
      </div>

      {hours.length ? (
        <div style={styles.chart}>
          {ROWS.map((row) => (
            <div key={row.key} style={styles.chartRow}>
              <span style={styles.rowLabel}>{row.label}</span>
              <div style={styles.cells}>
                {hours.map((hour) => {
                  const value = hour[row.key];
                  return (
                    <span
                      key={hour.time}
                      title={`${formatPlaceTime(hour.time, timeZone)} · ${row.label} ${pct(value)}`}
                      style={{
                        ...styles.cell,
                        backgroundColor:
                          value == null ? 'transparent' : `rgba(${row.color}, ${0.06 + (value / 100) * 0.8})`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          <div style={styles.chartRow}>
            <span style={styles.rowLabel} />
            <div style={styles.cells}>
              {hours.map((hour) => (
                <span key={hour.time} style={styles.hourLabel}>
                  {hour.local.minutes % 360 === 0 ? hour.local.minutes / 60 : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.s },
  muted: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, fontSize: 12, color: t.colors.dark05 },
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
  night: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    fontWeight: 700,
    color: '#B9A0FF',
    whiteSpace: 'nowrap',
  },
  chart: { gap: 2 },
  chartRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowLabel: { width: 30, fontSize: 9, color: t.colors.dark05, textAlign: 'right' },
  cells: { flex: 1, display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(0, 1fr)', gap: 1 },
  cell: { display: 'block', height: 8, borderRadius: 1 },
  hourLabel: { fontSize: 9, color: t.colors.dark05, textAlign: 'left' },
  attribution: { fontSize: 11, color: t.colors.dark05 },
  link: { color: t.colors.blue04 },
}));
