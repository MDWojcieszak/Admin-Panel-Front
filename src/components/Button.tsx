import { CSSProperties, ReactNode } from 'react';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader } from '~/components/Loader';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
  label: string;
  onClick?: F0;
  style?: CSSProperties;
  variant?: ButtonVariant;
  type?: HTMLButtonElement['type'];
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  /** Tooltip and accessible name; an icon-only button needs one. */
  title?: string;
};

export const Button = ({ label, onClick, variant = 'primary', ...p }: ButtonProps) => {
  const styles = useStyles();
  const theme = useTheme();

  const buttonColor =
    variant === 'primary'
      ? theme.colors.blue
      : variant === 'danger'
        ? theme.colors.red
        : theme.colors.gray01 + theme.colorOpacity(0.6);

  const handleClick = () => {
    if (p.disabled) return;
    onClick?.();
  };

  return (
    <motion.button
      type={p.type}
      title={p.title}
      aria-label={p.title ?? (label || undefined)}
      whileTap={p.disabled ? undefined : { filter: 'brightness(0.9)' }}
      whileHover={p.disabled ? undefined : { filter: 'brightness(1.15)' }}
      transition={{ duration: 0.12 }}
      onClick={handleClick}
      animate={{ opacity: p.disabled ? 0.2 : 1 }}
      style={{
        ...styles.button,
        ...p.style,
        backgroundColor: buttonColor,
      }}
    >
      <div style={styles.innerContainer}>
        {p.icon}
        {/* An icon-only button has no label; a stray space beside the icon pushed it off centre. */}
        {label ? <span>{label}</span> : null}
      </div>
      <div style={styles.loaderContainer}>
        <AnimatePresence> {p.loading && <Loader />}</AnimatePresence>
      </div>
    </motion.button>
  );
};

const useStyles = mkUseStyles((t) => ({
  button: {
    padding: t.spacing.sm,
    color: t.colors.white,
    scale: 1,
    fontSize: '16px',
    // Same radius as the cards, sections and bars buttons sit on.
    borderRadius: t.borderRadius.large,
    border: 0,
    outline: 'none',
    cursor: 'pointer',
    position: 'relative',
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: t.spacing.s,
  },
  loaderContainer: {
    position: 'absolute',
    left: t.spacing.m,
    top: 0,
    height: '100%',
    justifyContent: 'center',
  },
}));
