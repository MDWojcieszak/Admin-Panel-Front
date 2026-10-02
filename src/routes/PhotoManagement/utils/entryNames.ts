import { format } from 'date-fns';

export type QualifiableEntry = {
  id: string;
  name: string;
  startDate?: string | null;
};

/**
 * Escalates only as far as it must: the month on its own reads best, the year
 * is added when two trips share a month, and the day only when they share both.
 */
const PATTERNS = ['MMMM', 'MMMM yyyy', 'd MMMM yyyy'];

const NO_DATE = 'No date';

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatWith = (entry: QualifiableEntry, pattern: string): string => {
  const date = parseDate(entry.startDate);
  return date ? format(date, pattern) : NO_DATE;
};

/**
 * Two trips both called "Bieszczady" are impossible to tell apart in a list, so
 * the ones whose names collide get a date qualifier for display. Entries with a
 * unique name get nothing, which keeps the common case clean.
 *
 * This is presentation only — the stored name is never touched, so it works for
 * entries that already exist rather than only for ones created from now on.
 */
export const buildNameQualifiers = (entries: QualifiableEntry[]): Map<string, string> => {
  const groups = new Map<string, QualifiableEntry[]>();

  entries.forEach((entry) => {
    const key = entry.name.trim().toLowerCase();
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  });

  const qualifiers = new Map<string, string>();

  groups.forEach((group) => {
    if (group.length < 2) return;

    const distinguishes = (pattern: string) => {
      const seen = new Set<string>();
      return group.every((entry) => {
        const label = formatWith(entry, pattern);
        if (seen.has(label)) return false;
        seen.add(label);
        return true;
      });
    };

    // Falls through to the most specific pattern when even the day collides —
    // at that point there is nothing left in the data to tell them apart with.
    const pattern = PATTERNS.find(distinguishes) ?? PATTERNS[PATTERNS.length - 1];

    group.forEach((entry) => qualifiers.set(entry.id, formatWith(entry, pattern)));
  });

  return qualifiers;
};
