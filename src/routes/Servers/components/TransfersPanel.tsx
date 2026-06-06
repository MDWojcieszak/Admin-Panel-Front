import { FaPlus } from 'react-icons/fa6';
import { MdArrowRightAlt } from 'react-icons/md';
import { ServerTransferResponse, ServerTransferStatus } from '~/api/api';
import { Button } from '~/components/Button';
import { ActionButtons } from '~/components/Table/ActionButtons';
import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import { useTransfers } from '~/routes/Servers/hooks/useTransfers';
import { TransferModal } from '~/routes/Servers/modals/TransferModal';
import { mkUseStyles, Theme, useTheme } from '~/utils/theme';

type TransfersPanelProps = {
  categoryId: string;
};

const STATUS_COLOR: Record<ServerTransferStatus, keyof Theme['colors']> = {
  IDLE: 'dark05',
  RUNNING: 'yellow',
  SUCCESS: 'lightGreen',
  FAILED: 'red',
};

export const TransfersPanel = ({ categoryId }: TransfersPanelProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const can = useCan();
  const canManage = can('transfer.manage');
  const { transfers, refresh } = useTransfers(categoryId);

  const transferModal = useModal(
    'server-transfer',
    TransferModal,
    { title: 'Transfer' },
    {
      handleClose: async () => {
        refresh();
        transferModal.hide();
      },
    },
  );

  const renderTransfer = (transfer: ServerTransferResponse) => (
    <div key={transfer.id} style={styles.row}>
      <div style={styles.info}>
        <div style={styles.titleRow}>
          <span style={styles.name}>{transfer.name}</span>
          <span style={styles.mode}>{transfer.mode}</span>
        </div>
        <div style={styles.pathRow}>
          <span style={styles.path}>{transfer.originPath}</span>
          <MdArrowRightAlt size={16} />
          <span style={styles.path}>{transfer.targetPath}</span>
        </div>
      </div>
      <span style={{ ...styles.status, color: theme.colors[STATUS_COLOR[transfer.status] ?? 'dark05'] }}>
        {transfer.status}
      </span>
      {canManage ? (
        <ActionButtons id={transfer.id} onEdit={() => transferModal.show({ transfer, categoryId, canManage })} />
      ) : null}
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.heading}>Transfers</span>
        {canManage ? (
          <Button
            label='New transfer'
            icon={<FaPlus />}
            variant='secondary'
            onClick={() => transferModal.show({ categoryId, canManage, transfer: undefined })}
          />
        ) : null}
      </div>
      <div style={styles.list}>
        {transfers.map(renderTransfer)}
        {transfers.length === 0 ? <span style={styles.empty}>No transfers in this category.</span> : null}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontWeight: 600,
  },
  list: {
    gap: t.spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.6),
  },
  info: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  name: {
    fontWeight: 600,
  },
  mode: {
    fontSize: 12,
    color: t.colors.blue04,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  path: {
    fontSize: 12,
    color: t.colors.dark05,
    fontFamily: 'monospace',
  },
  status: {
    fontSize: 13,
  },
  empty: {
    color: t.colors.dark05,
  },
}));
