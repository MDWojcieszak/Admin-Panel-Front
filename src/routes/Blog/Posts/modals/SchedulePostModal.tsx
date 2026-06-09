import { useState } from 'react';
import { Button } from '~/components/Button';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles } from '~/utils/theme';

type SchedulePostModalProps = {
  postId?: string;
} & Partial<InternalModalProps>;

export const SchedulePostModal = (p: SchedulePostModalProps) => {
  const styles = useStyles();
  const { blogVersioningApi } = useApi();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const handleSchedule = async () => {
    if (!blogVersioningApi || !p.postId) return;
    if (!value) {
      setError('Pick a date and time');
      return;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
      setError('Pick a future date and time');
      return;
    }
    setError(undefined);
    setSaving(true);
    try {
      await blogVersioningApi.versionControllerSchedule({
        id: p.postId,
        scheduleDto: { scheduledFor: date.toISOString() },
      });
      p.handleClose?.();
    } catch (e) {
      console.error('Error scheduling post:', e);
      setError('Could not schedule the post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>Publish at</label>
      <input
        style={styles.input}
        type='datetime-local'
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {error ? <span style={styles.error}>{error}</span> : null}
      <Button label='Schedule' onClick={handleSchedule} loading={saving} />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    width: 360,
  },
  label: {
    fontSize: 12,
    color: t.colors.blue04,
  },
  input: {
    height: 44,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.m}px`,
    color: t.colors.white,
    fontSize: 15,
    colorScheme: 'dark',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    border: 0,
    outline: 'none',
  },
  error: {
    color: t.colors.red,
    fontSize: 13,
  },
}));
