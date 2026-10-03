import { useCallback, useEffect, useRef, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type StackLogsModalProps = { project: string } & Partial<InternalModalProps>;

const TAILS = ['100', '500', '2000'];

/** Recent output of every container in a stack, fetched on demand from the agent. */
export const StackLogsModal = ({ project }: StackLogsModalProps) => {
  const styles = useStyles();
  const { deployApi } = useApi();
  const [tail, setTail] = useState('500');
  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!deployApi) return;
    setLoading(true);
    setError(undefined);
    try {
      const { data } = await deployApi.deployControllerStackLogs({ project, tail: Number(tail) });
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
    endRef.current?.scrollIntoView();
  }, [lines]);

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <SegmentedTabs
          items={TAILS.map((value) => ({ value, label: `Last ${value}` }))}
          selected={tail}
          handleSelect={setTail}
          layoutId={`stack-logs-${project}`}
        />
        <Button label='Reload' variant='secondary' icon={<FiRefreshCw size={14} />} onClick={load} loading={loading} />
      </div>
      {error ? <span style={styles.error}>{error}</span> : null}
      {loading && !lines.length ? (
        <Loader />
      ) : (
        <div style={styles.terminal}>
          {lines.length ? lines.map((line, i) => <span key={i}>{line}</span>) : <span>No output.</span>}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.m, width: 'min(1100px, 90vw)', height: '70vh' },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.m },
  error: { color: t.colors.red, fontSize: 13 },
  terminal: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray05,
    color: t.colors.lightBlue,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12,
    lineHeight: 1.5,
    whiteSpace: 'pre',
  },
}));
