import { differenceInCalendarDays, format } from 'date-fns';
import { useMemo } from 'react';
import { HiOutlineSparkles } from 'react-icons/hi';
import { Button } from '~/components/Button';
import { MoonIcon } from '~/components/MoonIcon';
import { PhotoSessionLibrary } from '~/routes/PhotoManagement/components/PhotoSessionLibrary';
import { findNextPhase, getMoonInfo } from '~/utils/moon';
import { mkUseStyles, useTheme } from '~/utils/theme';

/**
 * Everything astro in one place: the same board, list and calendar as the
 * library, locked to ASTRO sessions and filtered by target, with the moon —
 * the one thing that decides whether a night is worth going out — on top.
 */
export const Astro = () => (
  <PhotoSessionLibrary astro header={({ openNewTarget }) => <AstroHeader onNewTarget={openNewTarget} />} />
);

const AstroHeader = ({ onNewTarget }: { onNewTarget: () => void }) => {
  const styles = useStyles();
  const theme = useTheme();

  const moon = useMemo(() => {
    const today = new Date();
    const nextNew = findNextPhase(today, 0);
    const nextFull = findNextPhase(today, 0.5);
    return { today, tonight: getMoonInfo(today), nextNew, nextFull };
  }, []);

  const inDays = (day: Date) => {
    const days = differenceInCalendarDays(day, moon.today);
    if (days === 0) return 'tonight';
    if (days === 1) return 'tomorrow';
    return `in ${days} days`;
  };

  return (
    <div style={styles.header}>
      <div style={styles.titleBlock}>
        <span style={styles.title}>Astro</span>
        <span style={styles.subtitle}>Astro sessions only — filter by target, plan around the moon.</span>
      </div>

      <div style={styles.moonStrip}>
        <div style={styles.moonItem}>
          <MoonIcon phase={moon.tonight.phase} size={34} title={moon.tonight.name} />
          <div style={styles.moonText}>
            <span style={styles.moonLabel}>Tonight</span>
            <span style={styles.moonValue}>
              {moon.tonight.name} · {Math.round(moon.tonight.illumination * 100)}%
            </span>
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.moonItem}>
          <MoonIcon phase={0} size={26} title='New moon' />
          <div style={styles.moonText}>
            <span style={styles.moonLabel}>New moon · dark sky</span>
            <span style={styles.moonValue}>
              {format(moon.nextNew, 'd MMM')} <span style={styles.muted}>{inDays(moon.nextNew)}</span>
            </span>
          </div>
        </div>

        <div style={styles.moonItem}>
          <MoonIcon phase={0.5} size={26} title='Full moon' />
          <div style={styles.moonText}>
            <span style={styles.moonLabel}>Full moon</span>
            <span style={styles.moonValue}>
              {format(moon.nextFull, 'd MMM')} <span style={styles.muted}>{inDays(moon.nextFull)}</span>
            </span>
          </div>
        </div>

        <Button
          variant='secondary'
          label='New target'
          icon={<HiOutlineSparkles color={theme.colors.purple02} size={18} />}
          onClick={onNewTarget}
        />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
  },
  titleBlock: { gap: 2 },
  title: { fontSize: 22, fontWeight: 700, color: t.colors.white },
  subtitle: { fontSize: 13, color: t.colors.dark05 },
  moonStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: t.spacing.l,
  },
  moonItem: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
  moonText: { gap: 2 },
  moonLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  moonValue: { fontSize: 14, fontWeight: 600, color: t.colors.white, whiteSpace: 'nowrap' },
  muted: { fontWeight: 400, color: t.colors.dark05 },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: t.colors.white + t.colorOpacity(0.08),
  },
}));
