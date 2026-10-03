import { differenceInCalendarDays, format } from 'date-fns';
import { useMemo } from 'react';
import { MoonIcon } from '~/components/MoonIcon';
import { findNextPhase, getMoonInfo } from '~/utils/moon';
import { mkUseStyles } from '~/utils/theme';

/** Tonight's moon and the coming new and full moon — what decides a night out. */
export const MoonSummary = () => {
  const styles = useStyles();

  const moon = useMemo(() => {
    const today = new Date();
    return {
      today,
      tonight: getMoonInfo(today),
      nextNew: findNextPhase(today, 0),
      nextFull: findNextPhase(today, 0.5),
    };
  }, []);

  const inDays = (day: Date) => {
    const days = differenceInCalendarDays(day, moon.today);
    if (days === 0) return 'tonight';
    if (days === 1) return 'tomorrow';
    return `in ${days} days`;
  };

  return (
    <div style={styles.strip}>
      <div style={styles.item}>
        <MoonIcon phase={moon.tonight.phase} size={30} title={moon.tonight.name} />
        <div style={styles.text}>
          <span style={styles.label}>Tonight</span>
          <span style={styles.value}>
            {moon.tonight.name} · {Math.round(moon.tonight.illumination * 100)}%
          </span>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.item}>
        <MoonIcon phase={0} size={24} title='New moon' />
        <div style={styles.text}>
          <span style={styles.label}>New moon · dark sky</span>
          <span style={styles.value}>
            {format(moon.nextNew, 'd MMM')} <span style={styles.muted}>{inDays(moon.nextNew)}</span>
          </span>
        </div>
      </div>

      <div style={styles.item}>
        <MoonIcon phase={0.5} size={24} title='Full moon' />
        <div style={styles.text}>
          <span style={styles.label}>Full moon</span>
          <span style={styles.value}>
            {format(moon.nextFull, 'd MMM')} <span style={styles.muted}>{inDays(moon.nextFull)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: t.spacing.l,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
  text: { gap: 2 },
  label: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  value: { fontSize: 14, fontWeight: 600, color: t.colors.white, whiteSpace: 'nowrap' },
  muted: { fontWeight: 400, color: t.colors.dark05 },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: t.colors.white + t.colorOpacity(0.08),
  },
}));
