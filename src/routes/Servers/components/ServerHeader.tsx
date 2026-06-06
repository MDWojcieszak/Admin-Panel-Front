import { MdPlayArrow, MdRefresh, MdStop } from 'react-icons/md';
import { ServerDetailsResponseDto, ServerStatus as ServerStatusEnum } from '~/api/api';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { GlassCard } from '~/components/GlassCard';
import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import { ServerStatus } from '~/routes/Servers/components/ServerStatus';
import { formatUptime } from '~/routes/Servers/utils';
import { mkUseStyles } from '~/utils/theme';

type ServerHeaderProps = {
  server?: ServerDetailsResponseDto;
  powerLoading?: boolean;
  onStart?: F0;
  onStop?: F0;
  onReboot?: F0;
};

const IN_PROGRESS_STATES: ServerStatusEnum[] = [
  ServerStatusEnum.WakeInProgress,
  ServerStatusEnum.ShutdownInProgress,
];

export const ServerHeader = ({ server, powerLoading, onStart, onStop, onReboot }: ServerHeaderProps) => {
  const styles = useStyles();
  const can = useCan();
  const canPower = can('server.power');

  const confirmModal = useModal(
    'server-power-confirm',
    ConfirmModal,
    { title: 'Confirm action' },
    {
      handleClose: async () => {
        confirmModal.hide();
      },
    },
  );

  const isOnline = server?.properties.isOnline;
  const status = server?.properties.status;
  const inProgress = !!status && IN_PROGRESS_STATES.includes(status);
  const name = server?.name ?? 'this server';
  const uptime = isOnline ? formatUptime(server?.properties.uptime) : undefined;

  const confirmStop = () =>
    confirmModal.show({
      message: `Shut down "${name}"?`,
      description: 'The machine will be powered off (shutdown). You will need to start it again to use it.',
      confirmLabel: 'Shut down',
      danger: true,
      onConfirm: onStop,
    });

  const confirmReboot = () =>
    confirmModal.show({
      message: `Reboot "${name}"?`,
      description: 'The machine will restart and be briefly unavailable.',
      confirmLabel: 'Reboot',
      danger: true,
      onConfirm: onReboot,
    });

  return (
    <GlassCard style={styles.container}>
      <div style={styles.leftGroup}>
        <div style={styles.identity}>
          <span style={styles.name}>{server?.name ?? '—'}</span>
          <span style={styles.ip}>{server?.ipAddress}</span>
        </div>

        <div style={styles.statusBlock}>
          <ServerStatus isOnline={isOnline} status={status} />
          {uptime ? <span style={styles.uptime}>up {uptime}</span> : null}
        </div>
      </div>

      {canPower ? (
        <div style={styles.actions}>
          <Button
            label='Start'
            icon={<MdPlayArrow size={18} />}
            variant='secondary'
            onClick={onStart}
            loading={powerLoading}
            disabled={powerLoading || inProgress || isOnline}
          />
          <Button
            label='Stop'
            icon={<MdStop size={18} />}
            variant='danger'
            onClick={confirmStop}
            disabled={powerLoading || inProgress || !isOnline}
          />
          <Button
            label='Reboot'
            icon={<MdRefresh size={18} />}
            variant='secondary'
            onClick={confirmReboot}
            disabled={powerLoading || inProgress || !isOnline}
          />
        </div>
      ) : null}
    </GlassCard>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.l,
    padding: t.spacing.m,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xl,
  },
  identity: {
    gap: 2,
  },
  name: {
    fontWeight: 700,
    fontSize: 18,
  },
  ip: {
    color: t.colors.blue04,
    fontSize: 14,
  },
  statusBlock: {
    alignItems: 'flex-start',
    gap: 2,
  },
  uptime: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  actions: {
    flexDirection: 'row',
    gap: t.spacing.s,
  },
}));
