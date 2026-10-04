import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FiArrowUpCircle, FiChevronRight, FiPlus } from 'react-icons/fi';
import { MdOutlineRocketLaunch } from 'react-icons/md';
import { ApplicationResponse, ContainerOrigin } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { PageHeader } from '~/components/PageHeader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useCan } from '~/hooks/usePermissions';
import { applicationPath } from '~/routes/Deploy/Containers';
import { DeployPage, useDeployStyles } from '~/routes/Deploy/components/shared';
import { useDeployEvents } from '~/routes/Deploy/hooks/useDeployEvents';
import { CreateApplicationModal } from '~/routes/Deploy/modals/CreateApplicationModal';
import {
  ORIGIN_LABEL,
  ORIGIN_TONE,
  RELEASE_LABEL,
  RELEASE_TONE,
  RUNTIME_LABEL,
  RUNTIME_TONE,
  shortDigest,
} from '~/routes/Deploy/utils';
import { mkUseStyles, useTheme } from '~/utils/theme';

export const Applications = () => {
  const styles = useStyles();
  const shared = useDeployStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const { deployApi } = useApi();
  const can = useCan();
  const [hovered, setHovered] = useState<string>();

  const query = useAsync<ApplicationResponse[]>(async () => {
    if (!deployApi) return undefined;
    const { data } = await deployApi.deployControllerListApplications();
    return data;
  }, [deployApi]);

  useDeployEvents({
    onReleaseStatus: () => query.reload(),
    onUpdateAvailable: () => query.reload(),
    onRuntime: (event) =>
      query.setData(
        (prev) => prev?.map((a) => (a.id === event.applicationId ? { ...a, runtimeStatus: event.runtimeStatus } : a)),
      ),
  });

  const createModal = useModal('deploy-application-create', CreateApplicationModal, { title: 'New application' });

  const applications = query.data ?? [];

  return (
    <DeployPage
      header={
        <>
          <PageHeader
            title='Applications'
            meta={applications.length ? `${applications.length} managed` : undefined}
            actions={
              can('deploy.manage') ? (
                <>
                  <Button
                    label='New application'
                    icon={<FiPlus size={14} />}
                    onClick={() =>
                      createModal.show({
                        onCreated: (id: string) => navigate(applicationPath(id)),
                      })
                    }
                  />
                </>
              ) : undefined
            }
          />
        </>
      }
    >
      {query.loading && !query.data ? (
        <Loader />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={<MdOutlineRocketLaunch size={26} color={theme.colors.blue04} />}
          title='No applications yet'
          description='Adopt a running stack from Containers, or create one from a spec.'
        />
      ) : (
        <div style={styles.grid}>
          {applications.map((app) => {
            const release = app.currentRelease;
            const hover = hovered === app.id;
            return (
              <button
                key={app.id}
                type='button'
                style={{ ...styles.tile, ...(hover ? styles.tileHover : {}) }}
                onMouseEnter={() => setHovered(app.id)}
                onMouseLeave={() => setHovered((h) => (h === app.id ? undefined : h))}
                onClick={() => navigate(applicationPath(app.id))}
              >
                <div style={styles.tileTop}>
                  <span style={styles.name}>{app.displayName || app.slug}</span>
                  <Badge label={RUNTIME_LABEL[app.runtimeStatus]} tone={RUNTIME_TONE[app.runtimeStatus]} />
                </div>
                <span style={{ ...shared.muted, ...shared.mono, ...styles.ellipsis }}>
                  {app.slug}
                  {app.image ? ` · ${app.image}` : ''}
                </span>
                {app.origin !== ContainerOrigin.Managed || app.availableDigest ? (
                  <div style={shared.row}>
                    {app.origin !== ContainerOrigin.Managed ? (
                      <Badge label={ORIGIN_LABEL[app.origin]} tone={ORIGIN_TONE[app.origin]} />
                    ) : null}
                    {app.availableDigest ? (
                      <Badge label='Update available' tone='blue' icon={<FiArrowUpCircle size={12} />} />
                    ) : null}
                  </div>
                ) : null}
                <div style={styles.tileFooter}>
                  {release ? (
                    <>
                      <div style={styles.releaseBlock}>
                        <span style={styles.version}>{release.version ?? shortDigest(release.digest)}</span>
                        <Badge label={RELEASE_LABEL[release.status]} tone={RELEASE_TONE[release.status]} />
                      </div>
                      {release.deployedAt ? (
                        <span style={shared.muted}>
                          {formatDistanceToNow(new Date(release.deployedAt), { addSuffix: true })}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span style={shared.muted}>Never deployed</span>
                  )}
                  <FiChevronRight
                    size={16}
                    color={hover ? theme.colors.white : theme.colors.dark05}
                    style={{ flexShrink: 0, marginLeft: 'auto' }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </DeployPage>
  );
};

const useStyles = mkUseStyles((t) => ({
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: t.spacing.m },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.s,
    padding: t.spacing.m,
    textAlign: 'left',
    cursor: 'pointer',
    color: 'inherit',
    font: 'inherit',
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    border: 'none',
    transition: 'background-color 0.12s ease',
  },
  tileHover: { backgroundColor: t.colors.gray02 + t.colorOpacity(0.75) },
  tileTop: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.s,
  },
  name: {
    fontSize: 16,
    fontWeight: 700,
    color: t.colors.white,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  ellipsis: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  tileFooter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    marginTop: 'auto',
    paddingTop: t.spacing.s,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  releaseBlock: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
  version: { fontSize: 14, fontWeight: 700, color: t.colors.white },
}));
