import { useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { ImageProcessingSummaryResponse, ReprocessTargetMode } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { ProgressBar } from '~/components/ProgressBar';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

export const ProcessingView = () => {
  const styles = useStyles();
  const { imageApi } = useApi();
  const toast = useToast();

  const summaryQuery = useAsync<ImageProcessingSummaryResponse>(async () => {
    if (!imageApi) return undefined;
    const { data } = await imageApi.imageControllerProcessingSummary();
    return data;
  }, [imageApi]);

  // Auto-poll while there's work in flight.
  useEffect(() => {
    const s = summaryQuery.data;
    if (!s || s.pending + s.processing <= 0) return;
    const t = setTimeout(() => summaryQuery.reload(), 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryQuery.data]);

  const reprocess = async (mode: ReprocessTargetMode) => {
    if (!imageApi) return;
    try {
      const { data } = await imageApi.imageControllerReprocess({ reprocessDto: { mode } });
      toast(`Reprocessing started (${data.total} image${data.total === 1 ? '' : 's'})`, 'success');
      await summaryQuery.reload();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not start reprocessing.'), 'error');
    }
  };

  const summary = summaryQuery.data;
  const processed = summary ? summary.done : 0;
  const totalImages = summary ? summary.total : 0;

  return (
    <div style={styles.scroll}>
      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.titleWrap}>
            <h2 style={styles.heading}>Image processing</h2>
            <span style={styles.subheading}>Rebuild covers, low-res and dimensions from the originals.</span>
          </div>
          <Button
            label='Refresh'
            variant='secondary'
            icon={<FiRefreshCw size={14} />}
            onClick={() => summaryQuery.reload()}
            loading={summaryQuery.loading}
          />
        </div>

        <div style={styles.block}>
          {summary ? (
            <>
              <div style={styles.summaryRow}>
                <span style={styles.summaryMain}>
                  {processed} / {totalImages} processed
                </span>
                <div style={styles.summaryBadges}>
                  {summary.processing > 0 ? <Badge label={`${summary.processing} processing`} tone='blue' /> : null}
                  {summary.pending > 0 ? <Badge label={`${summary.pending} pending`} tone='yellow' /> : null}
                  {summary.failed > 0 ? <Badge label={`${summary.failed} failed`} tone='red' /> : null}
                </div>
              </div>
              <ProgressBar progress={totalImages ? (processed / totalImages) * 100 : 100} />
              <div style={styles.reprocessActions}>
                <Button
                  label='Reprocess missing'
                  variant='secondary'
                  onClick={() => reprocess(ReprocessTargetMode.Missing)}
                  disabled={summary.processing + summary.pending > 0}
                />
                <Button
                  label='Reprocess all'
                  variant='secondary'
                  onClick={() => reprocess(ReprocessTargetMode.All)}
                  disabled={summary.processing + summary.pending > 0}
                />
              </div>
            </>
          ) : (
            <Loader />
          )}
        </div>
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  scroll: {
    height: '100%',
    minHeight: 0,
    width: '100%',
    overflowY: 'auto',
  },
  content: {
    gap: t.spacing.l,
    paddingBottom: t.spacing.m,
    maxWidth: 760,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  titleWrap: {
    gap: 2,
    minWidth: 0,
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
  },
  subheading: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  block: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    flexWrap: 'wrap',
  },
  summaryMain: {
    fontWeight: 600,
  },
  summaryBadges: {
    flexDirection: 'row',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
  reprocessActions: {
    flexDirection: 'row',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
}));
