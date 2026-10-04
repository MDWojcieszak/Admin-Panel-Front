import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiRefreshCw, FiSearch, FiX } from 'react-icons/fi';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { Switch } from '~/components/Switch';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { LogLine, lineSeverity, stripAnsi } from '~/routes/Deploy/components/LogLine';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

type StackLogsModalProps = { project: string } & Partial<InternalModalProps>;

const TAILS = ['100', '500', '2000'];
/** Room for a few containers' worth of lines; the agent refuses more than MAX_TAIL. */
const FETCH_FACTOR = 4;
const MAX_TAIL = 5000;

/** The agent prefixes each line with its container when a stack has several: `name | line`. */
const CONTAINER_PREFIX = /^(\S+) \| ([\s\S]*)$/;

/**
 * The agent sends a stack's containers one after another, not interleaved
 * in time, so read together they look like one garbled log. Split them back
 * per container — only when every line carries a prefix, so a lone
 * container's own `x | y` lines are left alone.
 */
const splitByContainer = (lines: string[]) => {
  const groups = new Map<string, string[]>();
  for (const line of lines) {
    const match = line.match(CONTAINER_PREFIX);
    if (!match) return null;
    groups.set(match[1], [...(groups.get(match[1]) ?? []), match[2]]);
  }
  return groups.size ? groups : null;
};

/** Recent output of every container in a stack, fetched on demand from the agent. */
export const StackLogsModal = ({ project }: StackLogsModalProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { deployApi } = useApi();
  const [tail, setTail] = useState('500');
  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [filter, setFilter] = useState('');
  const [wrap, setWrap] = useState(true);
  const [container, setContainer] = useState<string>();
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!deployApi) return;
    setLoading(true);
    setError(undefined);
    try {
      // The agent trims the joined stack to `tail`, which drops whole containers;
      // ask for more and keep `tail` per container here.
      const { data } = await deployApi.deployControllerStackLogs({
        project,
        tail: Math.min(Number(tail) * FETCH_FACTOR, MAX_TAIL),
      });
      setLines(data.lines);
    } catch (e) {
      setError(getApiErrorMessage(e, 'The agent did not return the logs.'));
    } finally {
      setLoading(false);
    }
  }, [deployApi, project, tail]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [lines, container]);

  const groups = useMemo(() => splitByContainer(lines), [lines]);
  const names = groups ? [...groups.keys()] : [];
  const active = container && names.includes(container) ? container : names[0];
  const current = useMemo(
    () => (groups && active ? groups.get(active) ?? [] : lines).slice(-Number(tail)),
    [groups, active, lines, tail],
  );

  // Numbered before filtering, so a match keeps its place in the log.
  const shown = useMemo(() => {
    const term = filter.trim().toLowerCase();
    const numbered = current.map((line, i) => ({ line, n: i + 1 }));
    return term ? numbered.filter(({ line }) => stripAnsi(line).toLowerCase().includes(term)) : numbered;
  }, [current, filter]);
  const errors = useMemo(() => current.filter((line) => lineSeverity(line) === 'error').length, [current]);
  const gutter = String(current.length).length;

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <SegmentedTabs
          items={TAILS.map((value) => ({ value, label: `Last ${value}` }))}
          selected={tail}
          handleSelect={setTail}
          layoutId={`stack-logs-${project}`}
        />
        <label style={styles.searchBox}>
          <FiSearch size={14} />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder='Filter lines…'
            style={styles.searchInput}
          />
          {filter ? (
            <button type='button' style={styles.clear} onClick={() => setFilter('')} aria-label='Clear filter'>
              <FiX size={13} />
            </button>
          ) : null}
        </label>
        <div style={styles.switchBox}>
          <Switch checked={wrap} onChange={setWrap} label='Wrap' />
        </div>
        <Button label='Reload' variant='secondary' icon={<FiRefreshCw size={14} />} onClick={load} loading={loading} />
      </div>
      {names.length ? (
        <SegmentedTabs
          items={names.map((name) => ({ value: name, label: name }))}
          selected={active ?? ''}
          handleSelect={setContainer}
          layoutId={`stack-logs-container-${project}`}
          style={styles.containerTabs}
        />
      ) : null}
      <div style={styles.meta}>
        <span>
          {filter ? `${shown.length} of ${current.length} lines` : `${current.length} lines`}
          {errors ? (
            <span style={{ color: theme.colors.red }}>
              {' '}
              · {errors} error{errors === 1 ? '' : 's'}
            </span>
          ) : null}
        </span>
      </div>
      {error ? <span style={styles.error}>{error}</span> : null}
      {loading && !lines.length ? (
        <Loader />
      ) : (
        <div style={styles.terminal}>
          <Scrollbar style={styles.scroll}>
            {/* Unwrapped, the lines take their own width so the area scrolls sideways. */}
            <div style={{ ...styles.lines, ...(wrap ? styles.linesWrapped : styles.linesUnwrapped) }}>
              {shown.length ? (
                shown.map(({ line, n }) => {
                  const severity = lineSeverity(line);
                  return (
                    <div
                      key={n}
                      style={{
                        ...styles.line,
                        ...(severity === 'error' ? styles.lineError : severity === 'warn' ? styles.lineWarn : {}),
                      }}
                    >
                      <span style={{ ...styles.number, minWidth: `${gutter + 1}ch` }}>{n}</span>
                      <span style={styles.text}>
                        <LogLine line={line} />
                      </span>
                    </div>
                  );
                })
              ) : (
                <span style={styles.empty}>{current.length ? 'No line matches.' : 'No output.'}</span>
              )}
              {/* Scrolled to on load; unwrapped it is as tall as the sideways track, so the last line clears it. */}
              <div ref={endRef} style={{ height: wrap ? 0 : 16, flexShrink: 0 }} />
            </div>
          </Scrollbar>
        </div>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.s, width: 'min(1200px, 92vw)', height: '74vh' },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.m, flexWrap: 'wrap' },
  searchBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flex: 1,
    minWidth: 200,
    height: 40,
    padding: `0 ${t.spacing.m}px`,
    boxSizing: 'border-box',
    borderRadius: t.borderRadius.default,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
    cursor: 'text',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: t.colors.white,
    fontSize: 14,
    padding: 0,
  },
  clear: { display: 'flex', border: 'none', background: 'transparent', color: t.colors.dark05, cursor: 'pointer' },
  containerTabs: { alignSelf: 'flex-start', maxWidth: '100%', overflowX: 'auto' },
  meta: { flexDirection: 'row', fontSize: 12, color: t.colors.dark05 },
  error: { color: t.colors.red, fontSize: 13 },
  terminal: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray05,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.05)}`,
    overflow: 'hidden',
  },
  scroll: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  lines: {
    padding: `${t.spacing.s}px 14px ${t.spacing.s}px 0`,
    color: t.colors.lightBlue,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12,
    lineHeight: 1.6,
  },
  linesWrapped: { whiteSpace: 'pre-wrap' },
  linesUnwrapped: { whiteSpace: 'pre', width: 'max-content', minWidth: '100%' },
  switchBox: { height: 40, justifyContent: 'center' },
  line: { flexDirection: 'row', alignItems: 'flex-start', paddingRight: t.spacing.s },
  lineError: { backgroundColor: t.colors.red + t.colorOpacity(0.08) },
  lineWarn: { backgroundColor: t.colors.yellow + t.colorOpacity(0.06) },
  number: {
    flexShrink: 0,
    paddingRight: 12,
    marginRight: 12,
    textAlign: 'right',
    color: t.colors.dark04,
    borderRight: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
    userSelect: 'none',
  },
  text: { flex: 1, minWidth: 0, wordBreak: 'break-word' },
  empty: { padding: t.spacing.m, color: t.colors.dark05 },
}));
