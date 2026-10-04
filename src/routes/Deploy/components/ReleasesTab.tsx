import { format } from 'date-fns';
import { FiRotateCcw, FiTerminal, FiXCircle } from 'react-icons/fi';
import { ReleaseResponse, ReleaseStatus } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useModal } from '~/hooks/useModal';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { ProcessTerminal } from '~/routes/Servers/components/ProcessTerminal';
import { DeploySteps } from '~/routes/Deploy/components/DeploySteps';
import { Section, useDeployStyles } from '~/routes/Deploy/components/shared';
import {
  RELEASE_LABEL,
  RELEASE_TONE,
  TRIGGER_LABEL,
  isReleaseRunning,
  releaseLabel,
  shortCommit,
  shortDigest,
} from '~/routes/Deploy/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

type ReleasesTabProps = {
  applicationId: string;
  releases?: ReleaseResponse[];
  loading: boolean;
  currentReleaseId?: string;
  selectedProcessId?: string;
  onSelectProcess: (processId?: string) => void;
  onRolledBack: (processId: string) => void;
};

/** A rollback redeploys the stored bytes of that release — not the current spec. */
const canRollBackTo = (release: ReleaseResponse, currentReleaseId?: string) =>
  release.id !== currentReleaseId &&
  (release.status === ReleaseStatus.Superseded ||
    release.status === ReleaseStatus.RolledBack ||
    release.status === ReleaseStatus.Active);

export const ReleasesTab = (p: ReleasesTabProps) => {
  const styles = useStyles();
  const shared = useDeployStyles();
  const theme = useTheme();
  const { deployApi } = useApi();
  const can = useCan();
  const toast = useToast();
  const confirmModal = useModal(`deploy-rollback-${p.applicationId}`, ConfirmModal, { title: 'Roll back' });
  const cancelModal = useModal(`deploy-cancel-${p.applicationId}`, ConfirmModal, { title: 'Cancel deployment' });

  const cancel = async (release: ReleaseResponse) => {
    if (!deployApi) return;
    try {
      await deployApi.deployControllerCancelRelease({ id: release.id });
      toast('Deployment cancelled', 'success');
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not cancel the deployment.'), 'error');
    }
  };

  const askCancel = (release: ReleaseResponse) =>
    cancelModal.show({
      message: `Cancel the deployment of ${releaseLabel(release)}?`,
      description:
        'The step running now is stopped and the application is free to deploy again. Containers already ' +
        'recreated keep running as they are.',
      confirmLabel: 'Cancel deployment',
      cancelLabel: 'Keep it running',
      danger: true,
      onConfirm: () => cancel(release),
    });

  const rollback = async (release: ReleaseResponse) => {
    if (!deployApi) return;
    try {
      const { data } = await deployApi.deployControllerRollback({ id: release.id });
      toast('Rollback started', 'success');
      p.onRolledBack(data.processId);
    } catch (e) {
      toast(getApiErrorMessage(e, 'The rollback was refused.'), 'error');
    }
  };

  const releases = p.releases ?? [];
  const selectedRelease = releases.find((r) => r.processId === p.selectedProcessId);

  return (
    <>
      {p.selectedProcessId ? (
        <Section
          title='Deployment log'
          actions={
            <>
              {/* Where a running deployment is watched, it can be stopped too. */}
              {selectedRelease && can('deploy.execute') && isReleaseRunning(selectedRelease.status) ? (
                <Button
                  label='Cancel'
                  variant='danger'
                  icon={<FiXCircle size={13} />}
                  onClick={() => askCancel(selectedRelease)}
                />
              ) : null}
              <Button label='Close' variant='secondary' onClick={() => p.onSelectProcess(undefined)} />
            </>
          }
        >
          {can('process.read') ? (
            <DeploySteps processId={p.selectedProcessId} releaseStatus={selectedRelease?.status} />
          ) : null}
          <div style={styles.terminal}>
            {can('process.read') ? (
              <ProcessTerminal embedded processId={p.selectedProcessId} />
            ) : (
              <span style={shared.muted}>Reading deployment logs needs the process.read permission.</span>
            )}
          </div>
        </Section>
      ) : null}

      <Section title='Releases'>
        {p.loading && !p.releases ? (
          <Loader />
        ) : releases.length === 0 ? (
          <div style={shared.emptyRow}>Nothing deployed yet.</div>
        ) : (
          <div style={shared.list}>
            {releases.map((release) => {
              const current = release.id === p.currentReleaseId;
              return (
                <div
                  key={release.id}
                  style={{
                    ...shared.listRow,
                    ...(current ? { boxShadow: `inset 3px 0 0 ${theme.colors.lightGreen}` } : {}),
                  }}
                >
                  <div style={styles.main}>
                    <div style={shared.row}>
                      <span style={styles.version}>{releaseLabel(release)}</span>
                      <Badge label={RELEASE_LABEL[release.status]} tone={RELEASE_TONE[release.status]} />
                      {current ? <Badge label='Current' tone='green' /> : null}
                      <span style={shared.muted}>{TRIGGER_LABEL[release.trigger]}</span>
                    </div>
                    <span style={shared.muted}>
                      {format(new Date(release.createdAt), 'd MMM yyyy, HH:mm')}
                      {release.triggeredBy ? ` · ${release.triggeredBy.email}` : ''}
                      {release.digest ? ` · ${shortDigest(release.digest)}` : ''}
                      {/* Named by its commit already when it has no version. */}
                      {release.commit && release.version ? ` · commit ${shortCommit(release.commit)}` : ''}
                      {release.homelabCommit ? ` · homelab ${shortCommit(release.homelabCommit)}` : ''}
                    </span>
                    {release.failureReason ? <span style={styles.failure}>{release.failureReason}</span> : null}
                  </div>
                  {release.processId ? (
                    <Button
                      label='Log'
                      variant='secondary'
                      icon={<FiTerminal size={13} />}
                      onClick={() => p.onSelectProcess(release.processId ?? undefined)}
                    />
                  ) : null}
                  {can('deploy.execute') && isReleaseRunning(release.status) ? (
                    <Button
                      label='Cancel'
                      variant='danger'
                      icon={<FiXCircle size={13} />}
                      onClick={() => askCancel(release)}
                    />
                  ) : null}
                  {can('deploy.execute') && canRollBackTo(release, p.currentReleaseId) ? (
                    <Button
                      label='Roll back'
                      variant='secondary'
                      icon={<FiRotateCcw size={13} />}
                      onClick={() =>
                        confirmModal.show({
                          message: `Roll back to ${releaseLabel(release)}?`,
                          description: 'The compose file stored with that release is deployed again, as it was.',
                          confirmLabel: 'Roll back',
                          onConfirm: () => rollback(release),
                        })
                      }
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
};

const useStyles = mkUseStyles((t) => ({
  // ProcessTerminal (embedded) fills its box absolutely; without this it covered the page.
  terminal: { position: 'relative', height: 380, minHeight: 0 },
  main: { flex: 1, minWidth: 0, gap: 2 },
  version: { fontSize: 14, fontWeight: 700, color: t.colors.white },
  failure: { fontSize: 13, color: t.colors.red },
}));
