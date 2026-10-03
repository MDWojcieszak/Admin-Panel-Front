/**
 * Times from the planning endpoints arrive in UTC and are shown in the
 * place's own zone, not the browser's: a trip to Iceland viewed from Poland
 * shows Icelandic time.
 */

/** The local date and minute of day of an instant at the place. */
export const zoned = (iso: string, timeZone: string) => {
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

export const formatPlaceTime = (iso: string | null | undefined, timeZone: string) =>
  iso ? new Date(iso).toLocaleTimeString('pl-PL', { timeZone, hour: '2-digit', minute: '2-digit' }) : '—';

/** "Sat 10 Oct" for a YYYY-MM-DD local date. */
export const formatPlaceDay = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
