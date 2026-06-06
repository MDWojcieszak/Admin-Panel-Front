import { useState } from 'react';
import { MdEdit, MdPlayArrow, MdTune } from 'react-icons/md';
import { CommandResponseDto, CommandRuntimeStatus } from '~/api/api';
import { Button } from '~/components/Button';
import { ProgressBar } from '~/components/ProgressBar';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import { useCommands } from '~/routes/Servers/hooks/useCommands';
import { CommandEditModal } from '~/routes/Servers/modals/CommandEditModal';
import { CommandMarkersModal } from '~/routes/Servers/modals/CommandMarkersModal';
import { mkUseStyles, useTheme } from '~/utils/theme';

type CommandCardProps = {
  categoryId: string;
  serverOnline?: boolean;
  onCommandRun?: (commandId: string, name: string) => void;
};

const BUSY_STATES: CommandRuntimeStatus[] = [
  CommandRuntimeStatus.Starting,
  CommandRuntimeStatus.Running,
  CommandRuntimeStatus.Stopping,
];

const runtimeColor = (status: CommandRuntimeStatus | undefined, theme: ReturnType<typeof useTheme>) => {
  switch (status) {
    case CommandRuntimeStatus.Running:
      return theme.colors.lightGreen;
    case CommandRuntimeStatus.Starting:
    case CommandRuntimeStatus.Stopping:
      return theme.colors.yellow;
    case CommandRuntimeStatus.Error:
      return theme.colors.red;
    default:
      return theme.colors.dark05;
  }
};

export const CommandCard = ({ categoryId, serverOnline, onCommandRun }: CommandCardProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { commands, runtime, refresh } = useCommands(categoryId);
  const { serverApi } = useApi();
  const can = useCan();
  const canExecute = can('command.execute');
  const canManage = can('command.manage');
  const offline = serverOnline === false;

  const [runningId, setRunningId] = useState<string>();

  const markersModal = useModal(
    'command-markers',
    CommandMarkersModal,
    { title: 'Progress markers' },
    {
      handleClose: async () => {
        refresh();
        markersModal.hide();
      },
    },
  );
  const editModal = useModal(
    'command-edit',
    CommandEditModal,
    { title: 'Edit command' },
    {
      handleClose: async () => {
        refresh();
        editModal.hide();
      },
    },
  );

  const handleRun = async (command: CommandResponseDto) => {
    if (!serverApi || !canExecute || offline) return;
    onCommandRun?.(command.id, command.name || command.value);
    setRunningId(command.id);
    try {
      await serverApi.serverCommandsControllerStartServer({ id: command.id });
    } catch (e) {
      console.error('Error executing command:', e);
    } finally {
      setRunningId(undefined);
    }
  };

  const renderCommand = (command: CommandResponseDto) => {
    const rt = runtime[command.id];
    const runtimeStatus = rt?.runtimeStatus;
    const runningProgress = rt?.runningProgress ?? 0;
    const busy = runtimeStatus ? BUSY_STATES.includes(runtimeStatus) : false;
    const isRunning = runtimeStatus === CommandRuntimeStatus.Running;
    return (
      <div key={command.id} style={styles.commandRow}>
        <div style={styles.commandHeader}>
          <div style={styles.commandInfo}>
            <span style={styles.commandName}>{command.name || command.value}</span>
            <span style={{ ...styles.runtimeBadge, color: runtimeColor(runtimeStatus, theme) }}>
              {runtimeStatus ?? command.status}
            </span>
          </div>
          <div style={styles.actions}>
            {canManage ? (
              <>
                <div
                  style={styles.iconButton}
                  onClick={() => editModal.show({ commandId: command.id, commandName: command.name ?? '', canManage })}
                >
                  <MdEdit size={18} />
                </div>
                <div
                  style={styles.iconButton}
                  onClick={() =>
                    markersModal.show({ commandId: command.id, commandName: command.name || command.value, canManage })
                  }
                >
                  <MdTune size={18} />
                </div>
              </>
            ) : null}
            <Button
              label='Run'
              icon={<MdPlayArrow size={18} />}
              variant='secondary'
              onClick={() => handleRun(command)}
              loading={runningId === command.id}
              disabled={!canExecute || busy || offline}
            />
          </div>
        </div>
        {isRunning || runningProgress > 0 ? <ProgressBar progress={runningProgress} /> : null}
      </div>
    );
  };

  return commands?.length ? (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <span style={styles.header}>Commands</span>
        {offline ? <span style={styles.offlineHint}>server offline — start it to run commands</span> : null}
      </div>
      {commands.map(renderCommand)}
    </div>
  ) : (
    <div style={styles.empty}>No commands in this category.</div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    marginBottom: t.spacing.s,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    flexWrap: 'wrap',
  },
  header: {
    fontWeight: 600,
  },
  offlineHint: {
    fontSize: 12,
    color: t.colors.yellow,
  },
  commandRow: {
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.6),
  },
  commandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: t.spacing.m,
  },
  commandInfo: {
    gap: 2,
  },
  commandName: {
    fontWeight: 600,
  },
  runtimeBadge: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  iconButton: {
    backgroundColor: t.colors.gray05,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: t.colors.dark05,
    padding: t.spacing.m,
  },
}));
