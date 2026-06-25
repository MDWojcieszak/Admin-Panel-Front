import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MdInfoOutline, MdKeyboardCommandKey, MdTerminal } from 'react-icons/md';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { useCan } from '~/hooks/usePermissions';
import useWebSocket from '~/hooks/useWebSocket';
import { CommandsTab } from '~/routes/Servers/components/CommandsTab';
import { ProcessesTab } from '~/routes/Servers/components/ProcessesTab';
import { ServerHeader } from '~/routes/Servers/components/ServerHeader';
import { ServerOverview } from '~/routes/Servers/components/ServerOverview';
import { useServerDetails } from '~/routes/Servers/hooks/useServerDetails';
import { ProcessCreatedPayload } from '~/routes/Servers/types';
import { mkUseStyles } from '~/utils/theme';

type Tab = 'overview' | 'commands' | 'processes';

export const ManageServer = () => {
  const styles = useStyles();
  const { serverId } = useParams();
  const can = useCan();
  const { serverDetails, powerLoading, wakeTimeoutMs, refresh, start, stop, reboot } = useServerDetails({
    id: serverId,
  });

  const categories = serverDetails?.categories ?? [];
  const canReadCommand = can('command.read') || can('server.category.manage');
  const canReadProcess = can('process.read');

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [activeProcess, setActiveProcess] = useState<{ id: string; name?: string }>();
  const [starting, setStarting] = useState(false);
  // Maps a commandId to its friendly name so a spawned process is labelled by the
  // command's display name rather than the raw command value.
  const commandNamesRef = useRef<Record<string, string>>({});

  // Running a command spins up a process — jump to the terminal automatically.
  useWebSocket<ProcessCreatedPayload>('process.created', (payload) => {
    if (!canReadProcess) return;
    const name = commandNamesRef.current[payload.commandId] || payload.name;
    setActiveProcess({ id: payload.processId, name });
    setActiveTab('processes');
    setStarting(false);
  });

  const tabs = useMemo(() => {
    const items: { label: string; value: Tab; icon: JSX.Element }[] = [
      { label: 'Overview', value: 'overview', icon: <MdInfoOutline size={18} /> },
    ];
    if (canReadCommand) items.push({ label: 'Commands', value: 'commands', icon: <MdKeyboardCommandKey size={18} /> });
    if (canReadProcess) items.push({ label: 'Processes', value: 'processes', icon: <MdTerminal size={18} /> });
    return items;
  }, [canReadCommand, canReadProcess]);

  return (
    <div style={styles.container}>
      <ServerHeader
        server={serverDetails}
        powerLoading={powerLoading}
        wakeTimeoutMs={wakeTimeoutMs}
        onStart={start}
        onStop={stop}
        onReboot={reboot}
      />

      <SegmentedTabs
        layoutId='server-tabs'
        items={tabs}
        selected={activeTab}
        handleSelect={(value) => setActiveTab(value as Tab)}
      />

      <div style={styles.content}>
        {activeTab === 'overview' ? <ServerOverview server={serverDetails} /> : null}
        {activeTab === 'commands' ? (
          <CommandsTab
            serverId={serverId}
            categories={categories}
            serverOnline={serverDetails?.properties.isOnline}
            onCategoryChanged={refresh}
            onCommandRun={(commandId, name) => {
              commandNamesRef.current[commandId] = name;
              // Jump to the terminal immediately; the spawned process auto-selects on process.created.
              if (canReadProcess) {
                setActiveProcess(undefined);
                setStarting(true);
                setActiveTab('processes');
              }
            }}
          />
        ) : null}
        {activeTab === 'processes' ? (
          <ProcessesTab
            selectedProcessId={activeProcess?.id}
            selectedProcessName={activeProcess?.name}
            starting={starting}
            onSelect={(id, name) => {
              setStarting(false);
              setActiveProcess({ id, name });
            }}
            onClose={() => setActiveProcess(undefined)}
            onDeleted={(id) => setActiveProcess((prev) => (prev?.id === id ? undefined : prev))}
          />
        ) : null}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    height: '100%',
    width: '100%',
    minWidth: 0,
    gap: t.spacing.l,
    minHeight: 0,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
  },
}));
