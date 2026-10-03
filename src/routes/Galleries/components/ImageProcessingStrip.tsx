import { useEffect, useState } from 'react';
import { FiCheckCircle, FiCpu } from 'react-icons/fi';
import { ImageProcessingSummaryResponse, ReprocessTargetMode } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { ProgressBar } from '~/components/ProgressBar';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

type ImageProcessingStripProps = {
  /** Called when a run finishes, so the image grid can pick up new covers. */
  onFinished?: () => void;
};

/**
 * Processing lives with the images it is about: how many have their covers,
 * low-res and dimensions built from the originals, what is still running or
 * failed, and the two ways to rebuild — only the missing ones, or everything
 * (which also straightens photos uploaded before the EXIF orientation fix).
 */
export const ImageProcessingStrip = ({ onFinished }: ImageProcessingStripProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { imageApi } = useApi();
  const toast = useToast();
  const [starting, setStarting] = useState<ReprocessTargetMode>();

  const summaryQuery = useAsync<ImageProcessingSummaryResponse>(async () => {
    if (!imageApi) return undefined;
    const { data } = await imageApi.imageControllerProcessingSummary();
    return data;
  }, [imageApi]);

  const summary = summaryQuery.data;
  const inFlight = summary ? summary.pending + summary.processing : 0;

  // Poll while work is in flight; tell the grid once it drains.
  const [wasRunning, setWasRunning] = useState(false);
  useEffect(() => {
    if (!summary) return;
    if (inFlight > 0) {
      setWasRunning(true);
      const timer = window.setTimeout(() => summaryQuery.reload(), 3000);
      return () => window.clearTimeout(timer);
    }
    if (wasRunning) {
      setWasRunning(false);
      onFinished?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  const reprocess = async (mode: ReprocessTargetMode) => {
    if (!imageApi) return;
    setStarting(mode);
    try {
      const { data } = await imageApi.imageControllerReprocess({ reprocessDto: { mode } });
      toast(`Reprocessing ${data.total} image${data.total === 1 ? '' : 's'}`, 'success');
      await summaryQuery.reload();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not start reprocessing.'), 'error');
    } finally {
      setStarting(undefined);
    }
  };

  if (!summary) return null;

  const allDone = !inFlight && !summary.failed && summary.done >= summary.total;
  const percent = summary.total ? (summary.done / summary.total) * 100 : 100;

  return (
    <div style={styles.strip}>
      <div style={styles.main}>
        <span style={styles.title}>
          {allDone ? (
            <FiCheckCircle size={15} color={theme.colors.lightGreen} />
          ) : (
            <FiCpu size={15} color={theme.colors.blue04} />
          )}
          {allDone ? `All ${summary.total} images processed` : `${summary.done} / ${summary.total} images processed`}
        </span>
        {summary.processing ? <Badge label={`${summary.processing} processing`} tone='blue' /> : null}
        {summary.pending ? <Badge label={`${summary.pending} queued`} tone='yellow' /> : null}
        {summary.failed ? <Badge label={`${summary.failed} failed`} tone='red' /> : null}
      </div>

      <div style={styles.actions}>
        <Button
          label='Reprocess missing'
          variant='secondary'
          disabled={inFlight > 0}
          loading={starting === ReprocessTargetMode.Missing}
          onClick={() => reprocess(ReprocessTargetMode.Missing)}
        />
        <Button
          label='Reprocess all'
          variant='secondary'
          disabled={inFlight > 0}
          loading={starting === ReprocessTargetMode.All}
          onClick={() => reprocess(ReprocessTargetMode.All)}
        />
      </div>

      {allDone ? null : (
        <div style={styles.progress}>
          <ProgressBar progress={percent} />
        </div>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: t.spacing.m,
    padding: `${t.spacing.sm}px ${t.spacing.m}px`,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    border: `1px solid ${t.colors.gray01 + t.colorOpacity(0.5)}`,
  },
  main: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: t.spacing.s, flex: 1, minWidth: 0 },
  title: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    fontSize: 14,
    fontWeight: 600,
    color: t.colors.white,
  },
  actions: { flexDirection: 'row', gap: t.spacing.s, flexWrap: 'wrap' },
  progress: { flexBasis: '100%' },
}));
