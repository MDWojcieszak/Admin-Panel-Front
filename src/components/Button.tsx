import { CSSProperties, ReactNode } from 'react';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader } from '~/components/Loader';

type ByttonVariant = 'primary' | 'secondary';

type ButtonProps = {
  label: string;
  onClick?: F0;
  style?: CSSProperties;
  variant?: ByttonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
};

export const Button = ({ label, onClick, variant = 'primary', ...p }: ButtonProps) => {
  const styles = useStyles();
  const theme = useTheme();

  const buttonColor = variant === 'primary' ? theme.colors.blue : theme.colors.gray02 + theme.colorOpacity(0.6);

  const handleClick = () => {
    if (p.disabled) return;
    onClick?.();
  };

  return (
    <motion.button
      whileTap={{ scaleY: 0.95, scaleX: 0.98 }}
      whileHover={{ scaleY: 1.05, scaleX: 1.02 }}
      onClick={handleClick}
      animate={{ opacity: p.disabled ? 0.2 : 1 }}
      style={{
        ...styles.button,
        ...p.style,
        backgroundColor: buttonColor,
      }}
    >
      <div style={styles.innerContainer}>
        {p.icon} {label}
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
    borderRadius: t.borderRadius.default,
    border: 0,
    outline: 'none',
    cursor: 'pointer',
    position: 'relative',
  },
  innerContainer: {
    alignItmes: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: t.spacing.s,
  },
  loaderContainer: {
    position: 'absolute',
    left: t.spacing.m,
    height: '100%',
    alignItems: 'center',
  },
}));
