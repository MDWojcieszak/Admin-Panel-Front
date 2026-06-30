import { useState } from 'react';
import { Button } from '~/components/Button';
import { Switch } from '~/components/Switch';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { mkUseStyles } from '~/utils/theme';

type DetachConfirmModalProps = {
  entryName?: string;
  source?: string;
  onConfirm: (removeAssets: boolean) => Promise<void> | void;
} & Partial<InternalModalProps>;

export const DetachConfirmModal = (p: DetachConfirmModalProps) => {
  const styles = useStyles();
  const [removeAssets, setRemoveAssets] = useState(true);
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    try {
      await p.onConfirm(removeAssets);
      await p.handleClose?.();
    } catch {
      // onConfirm surfaces its own error toast; keep the modal open on failure.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <span style={styles.message}>
        Detach{p.entryName ? ` “${p.entryName}”` : ' this entry'}
        {p.source ? ` (${p.source})` : ''} from the album?
      </span>

      <div style={styles.toggleRow}>
        <Switch checked={removeAssets} onChange={setRemoveAssets} label='Also remove these photos from the Immich album' />
      </div>
      <span style={styles.description}>
        {removeAssets
          ? 'This entry’s photos are removed from the Immich album and the tracking link is deleted. Photos also contributed by other linked entries are kept.'
          : 'Only the tracking link is removed — the photos stay in the Immich album.'}
      </span>

      <div style={styles.actions}>
        <Button label='Cancel' variant='secondary' onClick={() => p.handleClose?.()} />
        <Button label='Detach' variant='danger' onClick={confirm} loading={loading} />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    width: 420,
  },
  message: {
    fontSize: 16,
  },
  toggleRow: {
    marginTop: t.spacing.xs,
  },
  description: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.m,
    marginTop: t.spacing.s,
  },
}));
