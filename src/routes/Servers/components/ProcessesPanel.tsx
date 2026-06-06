import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { MdDelete, MdTerminal } from 'react-icons/md';
import { ProcessResponseDto } from '~/api/api';
import { ConfirmModal } from '~/components/ConfirmModal';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import useWebSocket from '~/hooks/useWebSocket';
import { ProcessDeletedPayload } from '~/routes/Servers/types';
import { mkUseStyles, useTheme } from '~/utils/theme';

type ProcessesPanelProps = {
  onOpen: (processId: string, name?: string) => void;
  onClose?: () => void;
  onDeleted?: (processId: string) => void;
  selectedId?: string;
};

const PAGE_SIZE = 20;

export const ProcessesPanel = ({ onOpen, onClose, onDeleted, selectedId }: ProcessesPanelProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { serverApi } = useApi();
  const can = useCan();
  const canDelete = can('process.delete');
  const [processes, setProcesses] = useState<ProcessResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!serverApi) return;
    setLoading(true);
    try {
      const { data } = await serverApi.serverProcessControllerGetAll({ take: PAGE_SIZE, skip: 0 });
      setProcesses(data.processes ?? []);
    } catch (e) {
      console.error('Error loading processes:', e);
    } finally {
      setLoading(false);
    }
  }, [serverApi]);

  const confirmModal = useModal(
    'process-delete-confirm',
    ConfirmModal,
    { title: 'Delete process' },
    {
      handleClose: async () => {
        confirmModal.hide();
      },
    },
  );

  useWebSocket('process.created', refresh);
  useWebSocket('process.status', refresh);
  useWebSocket<ProcessDeletedPayload>('process.deleted', (payload) => {
    setProcesses((prev) => prev.filter((p) => p.id !== payload.processId));
    onDeleted?.(payload.processId);
  });

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = (process: ProcessResponseDto) => {
    if (!canDelete) return;
    confirmModal.show({
      message: `Delete process "${process.name || process.id}"?`,
      description: 'This removes the process and its logs. This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        if (!serverApi) return;
        await serverApi.serverProcessControllerDelete({ id: process.id });
        setProcesses((prev) => prev.filter((p) => p.id !== process.id));
        onDeleted?.(process.id);
      },
    });
  };

  if (loading && processes.length === 0) return <Loader />;
  if (processes.length === 0) return <div style={styles.empty}>No processes yet.</div>;

  return (
    <div style={styles.container}>
      {processes.map((process) => (
        <div
          key={process.id}
          style={{
            ...styles.row,
            backgroundColor:
              process.id === selectedId
                ? theme.colors.blue + theme.colorOpacity(0.22)
                : theme.colors.gray03 + theme.colorOpacity(0.6),
          }}
          onClick={() => onOpen(process.id, process.name)}
        >
          <div style={styles.info}>
            <span style={styles.name}>{process.name || process.id}</span>
            <span style={styles.meta}>
              {process.category?.name ? `${process.category.name} · ` : ''}
              {format(new Date(process.startedAt), 'd MMM HH:mm:ss')}
            </span>
          </div>
          <span style={styles.status}>{process.status}</span>
          <div
            style={{
              ...styles.open,
              backgroundColor: process.id === selectedId ? theme.colors.blue : theme.colors.gray05,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (process.id === selectedId) onClose?.();
              else onOpen(process.id, process.name);
            }}
            title={process.id === selectedId ? 'Close terminal' : 'Open terminal'}
          >
            <MdTerminal size={18} color={process.id === selectedId ? theme.colors.white : theme.colors.blue04} />
          </div>
          {canDelete ? (
            <div
              style={styles.delete}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(process);
              }}
              title='Delete process'
            >
              <MdDelete size={18} color={theme.colors.red} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.6),
    cursor: 'pointer',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontWeight: 600,
  },
  meta: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  status: {
    fontSize: 13,
    color: t.colors.blue04,
  },
  open: {
    backgroundColor: t.colors.gray05,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
  },
  delete: {
    backgroundColor: t.colors.gray05,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
  },
  empty: {
    color: t.colors.dark05,
    padding: t.spacing.m,
  },
}));
