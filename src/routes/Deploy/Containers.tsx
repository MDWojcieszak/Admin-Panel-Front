import { ReactNode, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { FiDownload, FiFileText, FiPlay, FiRefreshCw, FiRotateCw, FiSquare } from 'react-icons/fi';
import { MdOutlineViewInAr } from 'react-icons/md';
import {
  ContainerOrigin,
  ContainerOverviewResponse,
  DiscoveredContainerResponse,
  DiscoveredStackResponse,
  StackActionKind,
} from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { PageHeader } from '~/components/PageHeader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { DeployNavigationRoute, MainNavigationRoute } from '~/navigation/types';
import { DeployPage, AgentStatus, Section, useDeployStyles } from '~/routes/Deploy/components/shared';
import { stackActionFailure, useDeployEvents } from '~/routes/Deploy/hooks/useDeployEvents';
import { StackLogsModal } from '~/routes/Deploy/modals/StackLogsModal';
import {
  containerTone,
  ORIGIN_HINT,
  ORIGIN_LABEL,
  ORIGIN_TONE,
  RUNTIME_LABEL,
  RUNTIME_TONE,
} from '~/routes/Deploy/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

const ORIGIN_ORDER: ContainerOrigin[] = [
  ContainerOrigin.Managed,
  ContainerOrigin.Adoptable,
  ContainerOrigin.Truenas,
  ContainerOrigin.Standalone,
];

type LifecycleAction = 'start' | 'restart' | 'stop';

export const applicationPath = (id: string) =>
  `/${MainNavigationRoute.DEPLOY}/${DeployNavigationRoute.APPLICATIONS}/${id}`;

/** Everything the agent sees on the host, managed by this panel or not. */
export const Containers = () => {
  const styles = useDeployStyles();
  const theme = useTheme();
  const { deployApi } = useApi();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const overview = useAsync<ContainerOverviewResponse>(async () => {
    if (!deployApi) return undefined;
    const { data } = await deployApi.deployControllerListContainers();
    return data;
  }, [deployApi]);

  const applications = useAsync(async () => {
    if (!deployApi) return undefined;
    const { data } = await deployApi.deployControllerListApplications();
    return data;
  }, [deployApi]);

  useDeployEvents({
    onContainersChanged: () => overview.reload(),
    onAgentHealth: (agent) => overview.setData((prev) => (prev ? { ...prev, agent } : prev)),
    onStackActionResult: (event) => {
      const failure = stackActionFailure(event);
      if (failure) toast(failure, 'error');
    },
  });

  const refresh = async () => {
    if (!deployApi) return;
    setRefreshing(true);
    try {
      await deployApi.deployControllerRefreshContainers();
      // The snapshot arrives over the socket; reload anyway in case it is quick.
      window.setTimeout(() => overview.reload(), 1500);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not reach the agent.'), 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const data = overview.data;
  const appBySlug = new Map((applications.data ?? []).map((a) => [a.slug, a.id]));
  const groups = ORIGIN_ORDER.map((origin) => ({
    origin,
    stacks: (data?.stacks ?? []).filter((s) => s.origin === origin).sort((a, b) => a.project.localeCompare(b.project)),
  })).filter((g) => g.stacks.length);

  return (
    <DeployPage
      header={
        <>
          <PageHeader
            title='Containers'
            meta={
              data?.receivedAt
                ? `Reported ${formatDistanceToNow(new Date(data.receivedAt), { addSuffix: true })}`
                : undefined
            }
            actions={
              <>
                <Button
                  label='Refresh'
                  variant='secondary'
                  icon={<FiRefreshCw size={14} />}
                  onClick={refresh}
                  loading={refreshing}
                />
              </>
            }
          />
          <AgentStatus agent={data?.agent} />
        </>
      }
    >
      {overview.loading && !data ? (
        <Loader />
      ) : !data?.known ? (
        <EmptyState
          icon={<MdOutlineViewInAr size={26} color={theme.colors.blue04} />}
          title='Waiting for the agent'
          description='The agent has not reported its containers yet. This is not the same as nothing running.'
        />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<MdOutlineViewInAr size={26} color={theme.colors.blue04} />}
          title='No containers'
          description='The agent reports no containers on the host.'
        />
      ) : (
        groups.map((group) => (
          <Section
            key={group.origin}
            title={
              <span style={styles.row} title={ORIGIN_HINT[group.origin]}>
                {ORIGIN_LABEL[group.origin]} <Badge label={group.stacks.length} tone={ORIGIN_TONE[group.origin]} />
              </span>
            }
          >
            {group.stacks.map((stack) => (
              <StackCard
                key={stack.project}
                stack={stack}
                applicationId={stack.slug ? appBySlug.get(stack.slug) : undefined}
                onChanged={() => overview.reload()}
              />
            ))}
          </Section>
        ))
      )}
    </DeployPage>
  );
};

/** One compose stack (or lone container) with the actions the agent allows on it. */
export const StackCard = ({
  stack,
  applicationId,
  onChanged,
}: {
  stack: DiscoveredStackResponse;
  /** Links the title to the application; left out on the application's own page. */
  applicationId?: string;
  onChanged: () => void;
}) => {
  const styles = useStyles();
  const shared = useDeployStyles();
  const { deployApi } = useApi();
  const can = useCan();
  const toast = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string>();

  const logsModal = useModal(`stack-logs-${stack.project}`, StackLogsModal, {
    title: `Logs · ${stack.project}`,
  });
  const confirmModal = useModal(`stack-confirm-${stack.project}`, ConfirmModal, { title: 'Stop stack' });

  const allowed = (action: StackActionKind) => stack.allowedActions.includes(action);
  const canExecute = can('deploy.execute');

  const runOne = async (container: DiscoveredContainerResponse, action: LifecycleAction) => {
    if (!deployApi) return;
    setBusy(`${container.id}:${action}`);
    try {
      const { data } = await deployApi.deployControllerRunContainerAction({
        project: stack.project,
        containerId: container.id,
        action,
      });
      if (data.accepted) toast(`${container.name}: ${action} sent`, 'success');
      else toast(data.message ?? `The agent refused to ${action} ${container.name}.`, 'error');
      onChanged();
    } catch (e) {
      toast(getApiErrorMessage(e, `Could not ${action} ${container.name}.`), 'error');
    } finally {
      setBusy(undefined);
    }
  };

  // With a single container the stack's own buttons already do this.
  const perContainer = canExecute && stack.containers.length > 1;

  const run = async (action: LifecycleAction) => {
    if (!deployApi) return;
    setBusy(action);
    try {
      const { data } = await deployApi.deployControllerRunStackAction({ project: stack.project, action });
      if (data.accepted) toast(`${stack.project}: ${action} sent`, 'success');
      else toast(data.message ?? `The agent refused to ${action} ${stack.project}.`, 'error');
      onChanged();
    } catch (e) {
      toast(getApiErrorMessage(e, `Could not ${action} ${stack.project}.`), 'error');
    } finally {
      setBusy(undefined);
    }
  };

  const adopt = async () => {
    if (!deployApi) return;
    setBusy('adopt');
    try {
      const { data } = await deployApi.deployControllerAdoptStack({ project: stack.project });
      toast(`${stack.project} is now managed by the panel`, 'success');
      // Straight to the choice of keeping its compose file or converting it.
      navigate(`${applicationPath(data.id)}?tab=settings`);
    } catch (e) {
      toast(getApiErrorMessage(e, `Could not adopt ${stack.project}.`), 'error');
    } finally {
      setBusy(undefined);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.titleBlock}>
          <div style={shared.row}>
            {applicationId ? (
              <Link to={applicationPath(applicationId)} style={styles.titleLink}>
                {stack.project}
              </Link>
            ) : (
              <span style={styles.title}>{stack.project}</span>
            )}
            <Badge label={RUNTIME_LABEL[stack.runtimeStatus]} tone={RUNTIME_TONE[stack.runtimeStatus]} />
          </div>
          {stack.workingDir ? <span style={{ ...shared.muted, ...shared.mono }}>{stack.workingDir}</span> : null}
        </div>
        <div style={shared.row}>
          {allowed(StackActionKind.Logs) ? (
            <Button
              label='Logs'
              variant='secondary'
              icon={<FiFileText size={14} />}
              onClick={() => logsModal.show({ project: stack.project })}
            />
          ) : null}
          {canExecute && allowed(StackActionKind.Start) ? (
            <Button
              label='Start'
              variant='secondary'
              icon={<FiPlay size={14} />}
              onClick={() => run('start')}
              loading={busy === 'start'}
              disabled={!!busy}
            />
          ) : null}
          {canExecute && allowed(StackActionKind.Restart) ? (
            <Button
              label='Restart'
              variant='secondary'
              icon={<FiRotateCw size={14} />}
              onClick={() => run('restart')}
              loading={busy === 'restart'}
              disabled={!!busy}
            />
          ) : null}
          {canExecute && allowed(StackActionKind.Stop) ? (
            <Button
              label='Stop'
              variant='secondary'
              icon={<FiSquare size={14} />}
              onClick={() =>
                confirmModal.show({
                  message: `Stop ${stack.project}?`,
                  description: 'Its containers stop until started again. Nothing is removed.',
                  confirmLabel: 'Stop',
                  danger: true,
                  onConfirm: () => run('stop'),
                })
              }
              loading={busy === 'stop'}
              disabled={!!busy}
            />
          ) : null}
          {can('deploy.manage') && allowed(StackActionKind.Adopt) ? (
            <Button
              label='Adopt'
              icon={<FiDownload size={14} />}
              onClick={adopt}
              loading={busy === 'adopt'}
              disabled={!!busy}
            />
          ) : null}
        </div>
      </div>
      <div style={shared.list}>
        {stack.containers.map((container) => (
          <div key={container.id} style={shared.listRow}>
            <div style={styles.containerName}>
              <span style={styles.name}>{container.name}</span>
              <span style={{ ...shared.muted, ...shared.mono }}>{container.image}</span>
            </div>
            <Badge
              label={container.health ? `${container.state} · ${container.health}` : container.state}
              tone={containerTone(container.state, container.health)}
            />
            {container.state === 'exited' && container.exitCode != null ? (
              <span style={shared.muted}>exit {container.exitCode}</span>
            ) : null}
            {perContainer ? (
              <div style={styles.rowActions}>
                {container.state !== 'running' && allowed(StackActionKind.Start) ? (
                  <IconAction
                    title={`Start ${container.name}`}
                    icon={<FiPlay size={14} />}
                    busy={busy === `${container.id}:start`}
                    disabled={!!busy}
                    onClick={() => runOne(container, 'start')}
                  />
                ) : null}
                {container.state === 'running' && allowed(StackActionKind.Restart) ? (
                  <IconAction
                    title={`Restart ${container.name}`}
                    icon={<FiRotateCw size={14} />}
                    busy={busy === `${container.id}:restart`}
                    disabled={!!busy}
                    onClick={() => runOne(container, 'restart')}
                  />
                ) : null}
                {container.state === 'running' && allowed(StackActionKind.Stop) ? (
                  <IconAction
                    title={`Stop ${container.name}`}
                    icon={<FiSquare size={14} />}
                    busy={busy === `${container.id}:stop`}
                    disabled={!!busy}
                    onClick={() =>
                      confirmModal.show({
                        message: `Stop ${container.name}?`,
                        description:
                          'Only this container stops; the rest of the stack keeps running. The next deployment starts it again.',
                        confirmLabel: 'Stop',
                        danger: true,
                        onConfirm: () => runOne(container, 'stop'),
                      })
                    }
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

/** A compact, icon-only action for one container's row. */
const IconAction = ({
  title,
  icon,
  busy,
  disabled,
  onClick,
}: {
  title: string;
  icon: ReactNode;
  busy?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) => {
  const styles = useStyles();
  return (
    <button
      type='button'
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      style={{ ...styles.iconAction, opacity: disabled && !busy ? 0.4 : busy ? 0.6 : 1 }}
    >
      {icon}
    </button>
  );
};

const useStyles = mkUseStyles((t) => ({
  // Fixed width so the state badges line up whatever actions a row has.
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    width: 64,
    flexShrink: 0,
  },
  iconAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    padding: 0,
    border: 'none',
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    color: t.colors.lightBlue,
    backgroundColor: t.colors.white + t.colorOpacity(0.06),
  },
  card: {
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.35),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    flexWrap: 'wrap',
  },
  titleBlock: { gap: 2, minWidth: 0 },
  title: { fontSize: 15, fontWeight: 700, color: t.colors.white },
  titleLink: { fontSize: 15, fontWeight: 700, color: t.colors.blue04, textDecoration: 'none' },
  containerName: { flex: 1, minWidth: 0, gap: 0 },
  name: { fontSize: 14, fontWeight: 600, color: t.colors.white },
}));
