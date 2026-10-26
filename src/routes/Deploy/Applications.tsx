import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { MdOutlineRocketLaunch } from 'react-icons/md';
import { ApplicationResponse, ReleaseResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { PageHeader } from '~/components/PageHeader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useCan } from '~/hooks/usePermissions';
import { applicationPath } from '~/routes/Deploy/Containers';
import { ApplicationTile, IN_FLIGHT } from '~/routes/Deploy/components/ApplicationTile';
import { DeployPage } from '~/routes/Deploy/components/shared';
import { useDeployEvents } from '~/routes/Deploy/hooks/useDeployEvents';
import { CreateApplicationModal } from '~/routes/Deploy/modals/CreateApplicationModal';
import { mkUseStyles, useTheme } from '~/utils/theme';

export const Applications = () => {
  const styles = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const { deployApi } = useApi();
  const can = useCan();
  // The newest release of each application: the list itself only carries the
  // running one, and a deployment under way is a newer release than that.
  const [latest, setLatest] = useState<Record<string, ReleaseResponse | undefined>>({});

  const loadLatest = async (applicationId: string) => {
    if (!deployApi) return;
    try {
      const { data } = await deployApi.deployControllerListReleases({ id: applicationId });
      setLatest((prev) => ({ ...prev, [applicationId]: data[0] }));
    } catch {
      // The tile just shows what is running.
    }
  };

  const query = useAsync<ApplicationResponse[]>(async () => {
    if (!deployApi) return undefined;
    const { data } = await deployApi.deployControllerListApplications();
    // Newest first, as the backend lists them; one small request per application.
    data.forEach((app) => loadLatest(app.id));
    return data;
  }, [deployApi]);

  useDeployEvents({
    onReleaseStatus: (event) => {
      // The event says only the status: the version and the process come with the list.
      loadLatest(event.applicationId);
      if (!IN_FLIGHT.includes(event.status)) query.reload();
    },
    onUpdateAvailable: () => query.reload(),
    onRuntime: (event) =>
      query.setData(
        (prev) => prev?.map((a) => (a.id === event.applicationId ? { ...a, runtimeStatus: event.runtimeStatus } : a)),
      ),
  });

  const createModal = useModal('deploy-application-create', CreateApplicationModal, { title: 'New application' });

  const applications = query.data ?? [];
  const deploying = applications.filter((a) => {
    const release = latest[a.id];
    return release && IN_FLIGHT.includes(release.status);
  }).length;

  return (
    <DeployPage
      header={
        <PageHeader
          title='Applications'
          meta={
            applications.length
              ? `${applications.length} managed${deploying ? ` · ${deploying} deploying now` : ''}`
              : undefined
          }
          actions={
            can('deploy.manage') ? (
              <Button
                label='New application'
                icon={<FiPlus size={14} />}
                onClick={() =>
                  createModal.show({
                    onCreated: (id: string) => navigate(applicationPath(id)),
                  })
                }
              />
            ) : undefined
          }
        />
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
          {applications.map((app) => (
            <ApplicationTile
              key={app.id}
              app={app}
              latest={latest[app.id]}
              onOpen={() => navigate(applicationPath(app.id))}
            />
          ))}
        </div>
      )}
    </DeployPage>
  );
};

const useStyles = mkUseStyles((t) => ({
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: t.spacing.m },
}));
