/**
 * Moon phase from a mean synodic month — accurate to well under a day, which is
 * all an astro planner needs to see dark-sky windows. No API, no network.
 */

const SYNODIC_MONTH = 29.530588853;
// A known new moon: 2000-01-06 18:14 UTC.
const REFERENCE_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
const DAY_MS = 86_400_000;

export type MoonInfo = {
  /** 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter. */
  phase: number;
  /** Lit share of the disc, 0–1. */
  illumination: number;
  name: string;
};

const phaseName = (phase: number): string => {
  if (phase < 0.0339 || phase >= 0.9661) return 'New moon';
  if (phase < 0.2161) return 'Waxing crescent';
  if (phase < 0.2839) return 'First quarter';
  if (phase < 0.4661) return 'Waxing gibbous';
  if (phase < 0.5339) return 'Full moon';
  if (phase < 0.7161) return 'Waning gibbous';
  if (phase < 0.7839) return 'Last quarter';
  return 'Waning crescent';
};

/** The moon for a calendar day, taken at local midnight of the night that follows (22:00). */
export const getMoonInfo = (day: Date): MoonInfo => {
  const evening = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 22).getTime();
  const age = (evening - REFERENCE_NEW_MOON) / DAY_MS / SYNODIC_MONTH;
  const phase = ((age % 1) + 1) % 1;
  return {
    phase,
    illumination: (1 - Math.cos(2 * Math.PI * phase)) / 2,
    name: phaseName(phase),
  };
};

/** Nights darker than this count as a dark-sky window. */
export const DARK_SKY_ILLUMINATION = 0.12;

/**
 * The day within the coming cycle (from `from`, inclusive) on which the moon is
 * closest to the given phase — 0 for new, 0.5 for full. The whole cycle is
 * searched: stopping at the first turn picked "tonight" whenever the phase was
 * moving away from the target.
 */
export const findNextPhase = (from: Date, target: 0 | 0.5): Date => {
  let best = from;
  let bestDistance = Infinity;
  for (let i = 0; i < 30; i += 1) {
    const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const { phase } = getMoonInfo(day);
    const raw = Math.abs(phase - target);
    const distance = Math.min(raw, 1 - raw);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = day;
    }
  }
  return best;
};
