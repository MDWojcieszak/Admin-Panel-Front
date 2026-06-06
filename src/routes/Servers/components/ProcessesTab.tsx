import { MdTerminal } from 'react-icons/md';
import { Loader } from '~/components/Loader';
import { ProcessTerminal } from '~/routes/Servers/components/ProcessTerminal';
import { ProcessesPanel } from '~/routes/Servers/components/ProcessesPanel';
import { mkUseStyles, useTheme } from '~/utils/theme';

type ProcessesTabProps = {
  selectedProcessId?: string;
  selectedProcessName?: string;
  starting?: boolean;
  onSelect: (processId: string, name?: string) => void;
  onClose?: () => void;
  onDeleted?: (processId: string) => void;
};

export const ProcessesTab = ({
  selectedProcessId,
  selectedProcessName,
  starting,
  onSelect,
  onClose,
  onDeleted,
}: ProcessesTabProps) => {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <div style={styles.container}>
      <div style={styles.list}>
        <ProcessesPanel onOpen={onSelect} onClose={onClose} onDeleted={onDeleted} selectedId={selectedProcessId} />
      </div>
      <div style={styles.terminalArea}>
        {selectedProcessId ? (
          <ProcessTerminal embedded processId={selectedProcessId} name={selectedProcessName} />
        ) : (
          <div style={styles.placeholder}>
            {starting ? (
              <>
                <Loader />
                <span style={styles.placeholderText}>Starting command…</span>
              </>
            ) : (
              <>
                <MdTerminal size={48} color={theme.colors.dark04} />
                <span style={styles.placeholderText}>Select a process to view its terminal.</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flexDirection: 'row',
    gap: t.spacing.m,
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  list: {
    width: 320,
    minWidth: 280,
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    paddingRight: t.spacing.s,
  },
  terminalArea: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  placeholder: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.4),
    border: `1px dashed ${t.colors.gray01}`,
  },
  placeholderText: {
    color: t.colors.dark05,
  },
}));
