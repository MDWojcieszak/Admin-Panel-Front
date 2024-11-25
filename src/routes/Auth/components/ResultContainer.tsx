import { useState } from 'react';
import { Button } from '~/components/Button';
import { AnimatedCancel } from '~/components/icons/Cancel';
import { AnimatedTick } from '~/components/icons/Tick';
import { mkUseStyles } from '~/utils/theme';

type ResultContainerProps = {
  success?: boolean;
  message?: string;
  subMessage?: string;
  onSuccess?: F0;
  successLabel?: string;
  onCancel?: F0;
  cancelLabel?: string;
};

export const ResultContainer = ({ success = true, ...p }: ResultContainerProps) => {
  const [loading, setLoading] = useState(false);

  const handleSuccess = () => {
    setLoading(true);
    p.onSuccess?.();
  };
  const handleCancel = () => {
    setLoading(true);
    p.onCancel?.();
  };
  const styles = useStyles();
  return (
    <>
      <div style={styles.center}>
        <div style={styles.circle}>
          {success ? <AnimatedTick size={30} color='lightGreen' /> : <AnimatedCancel size={30} color='red' />}
        </div>
        {p.message && <p style={styles.instruction}>{p.message}</p>}
        {p.subMessage && <p style={styles.instruction}>{p.subMessage}</p>}
      </div>
      {p.onSuccess && (
        <Button onClick={handleSuccess} label={p.successLabel || ''} loading={loading} style={styles.button} />
      )}
      {p.onCancel && (
        <Button
          variant='secondary'
          onClick={handleCancel}
          label={p.cancelLabel || ''}
          loading={loading}
          style={styles.button}
        />
      )}
    </>
  );
};

const useStyles = mkUseStyles((t) => ({
  center: {
    alignItems: 'center',
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: t.colors.gray02,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: t.spacing.m,
  },
  instruction: {
    alignSelf: 'center',
    textAlign: 'center',
    width: 350 - t.spacing.m * 2,
    marginBottom: t.spacing.l,
    color: t.colors.lightBlue,
  },
  button: {
    marginTop: t.spacing.m,
  },
}));
