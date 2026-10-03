import { ReactNode } from 'react';
import { mkUseStyles } from '~/utils/theme';

type PageHeaderProps = {
  title: ReactNode;
  /** Before the title — a Back button on a detail page. */
  leading?: ReactNode;
  /** Right after the title on its line — a status badge, a saving hint. */
  badges?: ReactNode;
  /** A short factual line under the title: counts, not explanations. */
  meta?: ReactNode;
  /** Between the title and the actions — e.g. the moon strip on the library. */
  aside?: ReactNode;
  actions?: ReactNode;
};

/**
 * The one header every page of a section uses: title on the left, actions on
 * the right, the same size and spacing everywhere. Pages used to each build
 * their own, and no two matched.
 */
export const PageHeader = ({ title, leading, badges, meta, aside, actions }: PageHeaderProps) => {
  const styles = useStyles();

  return (
    <div style={styles.header}>
      <div style={styles.left}>
        {leading}
        <div style={styles.titleBlock}>
          <div style={styles.titleRow}>
            <h2 style={styles.title}>{title}</h2>
            {badges}
          </div>
          {meta ? <span style={styles.meta}>{meta}</span> : null}
        </div>
      </div>
      {aside || actions ? (
        <div style={styles.right}>
          {aside}
          {actions ? <div style={styles.actions}>{actions}</div> : null}
        </div>
      ) : null}
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
    minHeight: 48,
    flexShrink: 0,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.m, minWidth: 0 },
  titleBlock: { gap: 2, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexWrap: 'wrap' },
  title: { margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.2, color: t.colors.white },
  meta: { fontSize: 13, color: t.colors.dark05 },
  right: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.l, flexWrap: 'wrap', marginLeft: 'auto' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexWrap: 'wrap' },
}));
