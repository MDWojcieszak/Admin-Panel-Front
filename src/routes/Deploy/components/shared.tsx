import { CSSProperties, ReactNode, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FiCpu } from 'react-icons/fi';
import { AgentHealthResponse } from '~/api/api';
import { Scrollbar } from '~/components/Scrollbar';
import { Badge } from '~/components/Badge';
import { diffLines } from '~/routes/Deploy/utils';
import { mkUseStyles, useTheme } from '~/utils/theme';

/**
 * A Deploy page: the header (and tabs) stay put, the body scrolls in the
 * app's own scrollbar rather than the browser's.
 */
export const DeployPage = ({ header, children }: { header: ReactNode; children: ReactNode }) => {
  const styles = useStyles();
  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>{header}</div>
      <div style={styles.pageBody}>
        <Scrollbar style={styles.pageScroll} horizontal={false}>
          <div style={styles.pageContent}>{children}</div>
        </Scrollbar>
      </div>
    </div>
  );
};

/** A titled block, the page's basic unit. */
export const Section = ({
  title,
  description,
  actions,
  children,
  style,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}) => {
  const styles = useStyles();
  return (
    <div style={{ ...styles.section, ...style }}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionTitleBlock}>
          <span style={styles.sectionTitle}>{title}</span>
          {description ? <span style={styles.sectionDescription}>{description}</span> : null}
        </div>
        {actions ? <div style={styles.sectionActions}>{actions}</div> : null}
      </div>
      {children}
    </div>
  );
};

export const CodeBlock = ({ text, maxHeight = 420 }: { text: string; maxHeight?: number }) => {
  const styles = useStyles();
  return <pre style={{ ...styles.code, maxHeight }}>{text}</pre>;
};

/** Unified line diff; unchanged runs longer than a few lines are folded. */
export const DiffView = ({ before, after, maxHeight = 520 }: { before: string; after: string; maxHeight?: number }) => {
  const styles = useStyles();
  const theme = useTheme();
  const lines = useMemo(() => diffLines(before, after), [before, after]);
  const CONTEXT = 3;

  const changedAt = lines.map((l) => l.kind !== 'same');
  const near = (i: number) => {
    for (let d = -CONTEXT; d <= CONTEXT; d++) if (changedAt[i + d]) return true;
    return false;
  };

  const rows: ReactNode[] = [];
  let folded = 0;
  const flushFold = (key: string) => {
    if (!folded) return;
    rows.push(
      <div key={key} style={styles.diffFold}>
        ··· {folded} unchanged line{folded === 1 ? '' : 's'}
      </div>,
    );
    folded = 0;
  };

  lines.forEach((line, i) => {
    if (line.kind === 'same' && !near(i)) {
      folded++;
      return;
    }
    flushFold(`fold-${i}`);
    const color =
      line.kind === 'added'
        ? theme.colors.lightGreen
        : line.kind === 'removed'
          ? theme.colors.red
          : theme.colors.dark05;
    const background = line.kind === 'same' ? 'transparent' : color + theme.colorOpacity(0.1);
    rows.push(
      <div key={i} style={{ ...styles.diffLine, color, backgroundColor: background }}>
        <span style={styles.diffMark}>{line.kind === 'added' ? '+' : line.kind === 'removed' ? '−' : ' '}</span>
        <span>{line.text || ' '}</span>
      </div>,
    );
  });
  flushFold('fold-end');

  if (!lines.some((l) => l.kind !== 'same')) {
    return <span style={styles.muted}>No changes against the running release.</span>;
  }

  return <div style={{ ...styles.code, ...styles.diff, maxHeight }}>{rows}</div>;
};

export const AgentStatus = ({ agent }: { agent?: AgentHealthResponse }) => {
  const styles = useStyles();
  const theme = useTheme();
  if (!agent) return null;
  const color = agent.online ? theme.colors.lightGreen : theme.colors.red;
  return (
    <div style={styles.agent}>
      <FiCpu size={18} color={color} />
      <div style={styles.agentText}>
        <span style={styles.agentTitle}>
          Agent {agent.online ? 'online' : 'offline'}
          {agent.version ? <span style={styles.muted}> · v{agent.version}</span> : null}
        </span>
        <span style={styles.muted}>
          {agent.lastSeenAt
            ? `Last heartbeat ${formatDistanceToNow(new Date(agent.lastSeenAt), { addSuffix: true })}`
            : 'No heartbeat yet'}
          {agent.containerCount != null ? ` · ${agent.containerCount} containers` : ''}
        </span>
      </div>
      {agent.dockerReachable === false ? <Badge label='Docker unreachable' tone='red' /> : null}
    </div>
  );
};

/** Label + value pair for compact fact lists. */
export const Fact = ({ label, value }: { label: string; value: ReactNode }) => {
  const styles = useStyles();
  return (
    <div style={styles.fact}>
      <span style={styles.factLabel}>{label}</span>
      <span style={styles.factValue}>{value}</span>
    </div>
  );
};

export const useDeployStyles = mkUseStyles((t) => ({
  scroll: { height: '100%', minHeight: 0, width: '100%', overflowY: 'auto' },
  content: { gap: t.spacing.l, paddingBottom: t.spacing.m },
  muted: { fontSize: 13, color: t.colors.dark05 },
  // display set here too: it is also put on spans, which the global div rule does not reach.
  row: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexWrap: 'wrap' },
  /** A list's empty state, in the list's own row so it lines up with the rows it stands for. */
  emptyRow: {
    padding: `${t.spacing.m}px ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    fontSize: 13,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.35),
  },
  /** App inputs two to a row, wrapping on a narrow screen. */
  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', columnGap: t.spacing.m },
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 12 },
  textInput: {
    height: 38,
    padding: `0 ${t.spacing.sm}px`,
    boxSizing: 'border-box',
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.1)}`,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    fontSize: 14,
    outline: 'none',
  },
  textArea: {
    padding: t.spacing.sm,
    boxSizing: 'border-box',
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.1)}`,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.8),
    color: t.colors.white,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12,
    lineHeight: 1.55,
    outline: 'none',
    resize: 'vertical',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.s,
    padding: '10px 12px',
    borderRadius: t.borderRadius.default,
    fontSize: 13,
    color: t.colors.yellow,
    backgroundColor: t.colors.yellow + t.colorOpacity(0.1),
  },
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.s,
    padding: '10px 12px',
    borderRadius: t.borderRadius.default,
    fontSize: 13,
    color: t.colors.red,
    backgroundColor: t.colors.red + t.colorOpacity(0.1),
  },
  list: { gap: 1, borderRadius: t.borderRadius.default, overflow: 'hidden' },
  /** The card a page-level list sits in, as Section draws one. */
  panel: {
    padding: t.spacing.s,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: `${t.spacing.s}px ${t.spacing.m}px`,
    minHeight: 48,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.35),
  },
}));

const useStyles = mkUseStyles((t) => ({
  page: { width: '100%', height: '100%', minHeight: 0, gap: t.spacing.m },
  pageHeader: { gap: t.spacing.m, flexShrink: 0 },
  pageBody: { flex: 1, minHeight: 0, position: 'relative' },
  pageScroll: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  // Room on the right for the scrollbar track, so it never sits on a card.
  pageContent: { gap: t.spacing.l, paddingRight: 16, paddingBottom: t.spacing.m },
  section: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.m },
  sectionTitleBlock: { gap: 2, minWidth: 0 },
  sectionTitle: { fontWeight: 700, fontSize: 16, color: t.colors.white },
  sectionDescription: { fontSize: 13, color: t.colors.dark05 },
  sectionActions: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexWrap: 'wrap' },
  code: {
    margin: 0,
    padding: t.spacing.sm,
    overflow: 'auto',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.8),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
    color: t.colors.lightBlue,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12,
    lineHeight: 1.55,
    whiteSpace: 'pre',
  },
  diff: { padding: `${t.spacing.s}px 0`, display: 'block' },
  diffLine: { flexDirection: 'row', padding: `0 ${t.spacing.sm}px`, whiteSpace: 'pre' },
  diffMark: { width: 16, flexShrink: 0, userSelect: 'none' },
  diffFold: { padding: `2px ${t.spacing.sm}px`, color: t.colors.dark04, fontStyle: 'italic', userSelect: 'none' },
  muted: { fontSize: 13, color: t.colors.dark05 },
  agent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    padding: `${t.spacing.s}px ${t.spacing.m}px`,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  agentText: { gap: 0, flex: 1, minWidth: 0 },
  agentTitle: { fontWeight: 600, color: t.colors.white, fontSize: 14 },
  fact: { gap: 2, minWidth: 120 },
  factLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  factValue: { fontSize: 14, color: t.colors.white, wordBreak: 'break-all' },
}));
