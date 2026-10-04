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
        <div style={shared.panel}>
          <div style={shared.list}>
            {applications.map((app) => (
              <button
                key={app.id}
                type='button'
                style={{ ...styles.row, ...(hovered === app.id ? styles.rowHover : {}) }}
                onMouseEnter={() => setHovered(app.id)}
                onMouseLeave={() => setHovered((h) => (h === app.id ? undefined : h))}
                onClick={() => navigate(applicationPath(app.id))}
              >
                <div style={styles.main}>
                  <div style={shared.row}>
                    <span style={styles.name}>{app.displayName || app.slug}</span>
                    {app.origin !== ContainerOrigin.Managed ? (
                      <Badge label={ORIGIN_LABEL[app.origin]} tone={ORIGIN_TONE[app.origin]} />
                    ) : null}
                    <Badge label={RUNTIME_LABEL[app.runtimeStatus]} tone={RUNTIME_TONE[app.runtimeStatus]} />
                    {app.availableDigest ? (
                      <Badge label='Update available' tone='blue' icon={<FiArrowUpCircle size={12} />} />
                    ) : null}
                  </div>
                  <span style={{ ...shared.muted, ...shared.mono }}>
                    {app.slug}
                    {app.image ? ` · ${app.image}` : ''}
                  </span>
                </div>
                <div style={styles.release}>
                  {app.currentRelease ? (
                    <>
                      <span style={styles.version}>
                        {app.currentRelease.version ?? shortDigest(app.currentRelease.digest)}
                      </span>
                      <span style={shared.row}>
                        <Badge
                          label={RELEASE_LABEL[app.currentRelease.status]}
                          tone={RELEASE_TONE[app.currentRelease.status]}
                        />
                        {app.currentRelease.deployedAt ? (
                          <span style={shared.muted}>
                            {formatDistanceToNow(new Date(app.currentRelease.deployedAt), { addSuffix: true })}
                          </span>
                        ) : null}
                      </span>
                    </>
                  ) : (
                    <span style={shared.muted}>Never deployed</span>
                  )}
                </div>
                <FiChevronRight size={16} color={theme.colors.dark05} style={{ flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </DeployPage>
  );
};

const useStyles = mkUseStyles((t) => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: `${t.spacing.sm}px ${t.spacing.m}px`,
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    color: 'inherit',
    font: 'inherit',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.35),
    transition: 'background-color 0.12s ease',
  },
  rowHover: { backgroundColor: t.colors.gray02 + t.colorOpacity(0.6) },
  main: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontSize: 15, fontWeight: 700, color: t.colors.white },
  release: { alignItems: 'flex-end', gap: 2, flexShrink: 0 },
  version: { fontSize: 14, fontWeight: 600, color: t.colors.white },
}));
