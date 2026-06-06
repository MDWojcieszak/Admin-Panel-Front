import { useState } from 'react';
import { Button } from '~/components/Button';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { mkUseStyles } from '~/utils/theme';

type ConfirmModalProps = {
  message?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm?: () => void | Promise<void>;
} & Partial<InternalModalProps>;

export const ConfirmModal = (p: ConfirmModalProps) => {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await p.onConfirm?.();
      p.handleClose?.();
    } catch (e) {
      console.error('Confirm action failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <span style={styles.message}>{p.message ?? 'Are you sure?'}</span>
      {p.description ? <span style={styles.description}>{p.description}</span> : null}
      <div style={styles.actions}>
        <Button label={p.cancelLabel ?? 'Cancel'} variant='secondary' onClick={() => p.handleClose?.()} />
        <Button
          label={p.confirmLabel ?? 'Confirm'}
          variant={p.danger ? 'danger' : 'primary'}
          onClick={handleConfirm}
          loading={loading}
        />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    width: 380,
  },
  message: {
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    color: t.colors.blue04,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.m,
    marginTop: t.spacing.s,
  },
}));
