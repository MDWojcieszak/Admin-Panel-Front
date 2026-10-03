import { ReactNode } from 'react';
import { mkUseStyles, useTheme } from '~/utils/theme';

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  /** Shown in place of a label where space is tight; pair it with `title`. */
  icon?: ReactNode;
  /** Tooltip and accessible name — required in practice for an icon-only switch. */
  title?: string;
  disabled?: boolean;
};

/** A themed on/off toggle. */
export const Switch = ({ checked, onChange, label, icon, title, disabled }: SwitchProps) => {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      aria-label={title ?? label}
      title={title}
      disabled={disabled}
      style={{ ...styles.row, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'default' : 'pointer' }}
      onClick={() => !disabled && onChange(!checked)}
    >
      <span
        style={{
          ...styles.track,
          backgroundColor: checked ? theme.colors.blue : theme.colors.gray02 + theme.colorOpacity(0.8),
        }}
      >
        <span style={{ ...styles.knob, transform: checked ? 'translateX(18px)' : 'translateX(0)' }} />
      </span>
      {icon ? (
        <span style={{ ...styles.icon, color: checked ? theme.colors.white : theme.colors.dark05 }}>{icon}</span>
      ) : null}
      {label ? <span style={styles.label}>{label}</span> : null}
    </button>
  );
};

const useStyles = mkUseStyles((t) => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: t.spacing.s,
    border: 0,
    background: 'transparent',
    padding: 0,
    width: 'fit-content',
    alignSelf: 'flex-start',
  },
  track: {
    width: 40,
    height: 22,
    minWidth: 40,
    borderRadius: 11,
    padding: 2,
    boxSizing: 'border-box',
    transition: 'background-color 0.15s ease',
    display: 'block',
  },
  knob: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: '#fff',
    display: 'block',
    transition: 'transform 0.15s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
  label: { fontSize: 14, color: t.colors.white },
  icon: { display: 'flex', alignItems: 'center', transition: 'color 0.15s ease' },
}));
