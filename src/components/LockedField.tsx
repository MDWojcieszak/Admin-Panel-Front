import { CSSProperties, useState } from 'react';
import { MdLock } from 'react-icons/md';
import { mkUseStyles } from '~/utils/theme';

type LockedFieldProps = {
  label: string;
  value?: string | null;
  hint?: string;
  style?: CSSProperties;
};

/** Read-only field for values that can't be edited — label always shows, padlock on hover. */
export const LockedField = ({ label, value, hint, style }: LockedFieldProps) => {
  const styles = useStyles();
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{ ...styles.container, ...style }}
      title={hint ?? 'Locked'}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value || '—'}</span>
      <div style={{ ...styles.lock, opacity: hover ? 1 : 0.35 }}>
        <MdLock size={13} />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    position: 'relative',
    justifyContent: 'center',
    gap: 2,
    minHeight: 52,
    padding: `${t.spacing.s}px ${t.spacing.m}px`,
    paddingRight: 40,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.5),
    border: `1px dashed ${t.colors.white + t.colorOpacity(0.1)}`,
    cursor: 'not-allowed',
  },
  label: {
    fontSize: 12,
    color: t.colors.blue04,
  },
  value: {
    fontSize: 15,
    color: t.colors.dark05,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  lock: {
    position: 'absolute',
    right: t.spacing.m,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
}));
