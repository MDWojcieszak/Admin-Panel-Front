import { ResolvedSectionResponse } from '~/api/api';
import { mkUseStyles, useTheme } from '~/utils/theme';

type SectionListProps = {
  sections: ResolvedSectionResponse[];
};

const snippet = (s: ResolvedSectionResponse): string => {
  if (s.body) return s.body.length > 160 ? s.body.slice(0, 160) + '…' : s.body;
  if (s.items.length) return s.items.map((i) => i.content).join(' · ');
  if (s.images.length) return `${s.images.length} image(s)`;
  if (s.pois.length) return `${s.pois.length} place(s)`;
  if (s.embedUrl) return s.embedUrl;
  return '';
};

export const SectionList = ({ sections }: SectionListProps) => {
  const styles = useStyles();
  const theme = useTheme();

  if (!sections.length) {
    return <span style={styles.empty}>No sections yet. Block editing (markdown, media, layout) lands next.</span>;
  }

  return (
    <div style={styles.list}>
      {[...sections]
        .sort((a, b) => a.order - b.order)
        .map((s) => (
          <div key={s.id} style={styles.section}>
            <div style={styles.head}>
              <span style={styles.type}>{s.type}</span>
              {s.untranslated ? <span style={{ fontSize: 11, color: theme.colors.yellow }}>not translated</span> : null}
            </div>
            {s.title ? <span style={styles.title}>{s.title}</span> : null}
            {snippet(s) ? <span style={styles.snippet}>{snippet(s)}</span> : null}
          </div>
        ))}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  list: {
    gap: t.spacing.m,
  },
  section: {
    gap: 4,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.05)}`,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  type: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: t.colors.blue04,
  },
  title: {
    fontWeight: 700,
  },
  snippet: {
    fontSize: 14,
    color: t.colors.dark05,
    whiteSpace: 'pre-wrap',
  },
  empty: {
    color: t.colors.dark05,
  },
}));
