import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiArrowUpCircle } from 'react-icons/fi';
import { ApplicationDetailResponse, AppSourceType, ContainerOrigin, ReleaseResponse } from '~/api/api';
import { Badge } from '~/components/Badge';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { PageHeader } from '~/components/PageHeader';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useUrlParams } from '~/hooks/useUrlParam';
import { DeployNavigationRoute, MainNavigationRoute } from '~/navigation/types';
import { ActivityTab } from '~/routes/Deploy/components/ActivityTab';
import { ComposeTab } from '~/routes/Deploy/components/ComposeTab';
import { DeployTab } from '~/routes/Deploy/components/DeployTab';
import { EnvTab } from '~/routes/Deploy/components/EnvTab';
import { ReleasesTab } from '~/routes/Deploy/components/ReleasesTab';
import { SettingsTab } from '~/routes/Deploy/components/SettingsTab';
import { useDeployStyles } from '~/routes/Deploy/components/shared';
import { SpecTab } from '~/routes/Deploy/components/SpecTab';
import { useDeployEvents } from '~/routes/Deploy/hooks/useDeployEvents';
import {
  ORIGIN_HINT,
  ORIGIN_LABEL,
  ORIGIN_TONE,
  RELEASE_LABEL,
  RELEASE_TONE,
  RUNTIME_LABEL,
  RUNTIME_TONE,
  shortDigest,
} from '~/routes/Deploy/utils';
import { useTheme } from '~/utils/theme';

const TABS = [
  { value: 'deploy', label: 'Deploy' },
  { value: 'compose', label: 'Compose' },
  { value: 'env', label: 'Environment' },
  { value: 'spec', label: 'Spec' },
  { value: 'releases', label: 'Releases' },
  { value: 'settings', label: 'Settings' },
  { value: 'activity', label: 'Activity' },
];

/** An own compose file replaces most of the spec; what remains are run options. */
const tabsFor = (sourceType?: AppSourceType) =>
  TABS.filter((t) => t.value !== 'compose' || sourceType === AppSourceType.Compose).map((t) =>
    t.value === 'spec' && sourceType === AppSourceType.Compose ? { ...t, label: 'Options' } : t,
  );

export const ApplicationDetail = () => {
  const shared = useDeployStyles();
  const theme = useTheme();
  const { id = '' } = useParams();
  const { deployApi } = useApi();
  const [params, setParams] = useUrlParams(['tab', 'process'] as const);

  const app = useAsync<ApplicationDetailResponse>(async () => {
    if (!deployApi || !id) return undefined;
    const { data } = await deployApi.deployControllerGetApplication({ id });
    return data;
  }, [deployApi, id]);

  const releases = useAsync<ReleaseResponse[]>(async () => {
    if (!deployApi || !id) return undefined;
    const { data } = await deployApi.deployControllerListReleases({ id });
    return data;
  }, [deployApi, id]);

  useDeployEvents({
    onReleaseStatus: (event) => {
      if (event.applicationId !== id) return;
      app.reload();
      releases.reload();
    },
    onRuntime: (event) => {
      if (event.applicationId !== id) return;
      app.setData((prev) =>
        prev ? { ...prev, runtimeStatus: event.runtimeStatus, runtimeMessage: event.message } : prev,
      );
    },
    onUpdateAvailable: (event) => event.applicationId === id && app.reload(),
  });

  const openProcess = (processId: string) => {
    setParams({ tab: 'releases', process: processId });
    releases.reload();
  };

  const application = app.data;
  const tabs = tabsFor(application?.sourceType);
  const tab = tabs.some((t) => t.value === params.tab) ? params.tab! : 'deploy';
  const backLink = `/${MainNavigationRoute.DEPLOY}/${DeployNavigationRoute.APPLICATIONS}`;

  if (app.loading && !application) return <Loader />;
  if (!application) {
    return (
      <EmptyState
        icon={<FiArrowLeft size={22} color={theme.colors.blue04} />}
        title='Application not found'
        description='It may have been deleted.'
      />
    );
  }

  const reloadAll = () => {
    app.reload();
    releases.reload();
  };

  return (
    <div style={shared.scroll}>
      <div style={shared.content}>
        <PageHeader
          leading={
            <Link to={backLink} style={{ color: theme.colors.blue04, display: 'flex' }} title='All applications'>
              <FiArrowLeft size={20} />
            </Link>
          }
          title={application.displayName || application.slug}
          badges={
            <>
              {application.origin !== ContainerOrigin.Managed ? (
                <Badge label={ORIGIN_LABEL[application.origin]} tone={ORIGIN_TONE[application.origin]} />
              ) : null}
              <Badge label={RUNTIME_LABEL[application.runtimeStatus]} tone={RUNTIME_TONE[application.runtimeStatus]} />
              {application.currentRelease ? (
                <Badge
                  label={`${application.currentRelease.version ?? shortDigest(application.currentRelease.digest)} · ${
                    RELEASE_LABEL[application.currentRelease.status]
                  }`}
                  tone={RELEASE_TONE[application.currentRelease.status]}
                />
              ) : null}
              {application.availableDigest ? (
                <Badge label='Update available' tone='blue' icon={<FiArrowUpCircle size={12} />} />
              ) : null}
            </>
          }
          meta={
            <span title={ORIGIN_HINT[application.origin]}>
              {application.slug} · {application.tier.toLowerCase()} · {application.sourceType.toLowerCase()}
              {application.runtimeMessage ? ` · ${application.runtimeMessage}` : ''}
            </span>
          }
        />

        <SegmentedTabs
          items={tabs}
          selected={tab}
          handleSelect={(value) => setParams({ tab: value, process: null })}
          layoutId='deploy-application-tabs'
        />

        {tab === 'deploy' ? <DeployTab application={application} onDeployed={openProcess} /> : null}
        {tab === 'compose' ? <ComposeTab application={application} onSaved={(next) => app.setData(next)} /> : null}
        {tab === 'env' ? <EnvTab applicationId={application.id} /> : null}
        {tab === 'spec' ? <SpecTab application={application} onSaved={(next) => app.setData(next)} /> : null}
        {tab === 'releases' ? (
          <ReleasesTab
            applicationId={application.id}
            releases={releases.data}
            loading={releases.loading}
            currentReleaseId={application.currentRelease?.id}
            selectedProcessId={params.process}
            onSelectProcess={(processId) => setParams({ process: processId ?? null })}
            onRolledBack={openProcess}
          />
        ) : null}
        {tab === 'settings' ? <SettingsTab application={application} onChanged={reloadAll} /> : null}
        {tab === 'activity' ? <ActivityTab applicationId={application.id} /> : null}
      </div>
    </div>
  );
};
