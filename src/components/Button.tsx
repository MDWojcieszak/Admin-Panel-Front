import { CSSProperties } from 'react';
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
};

export const Button = ({ label, onClick, variant = 'primary', ...p }: ButtonProps) => {
  const styles = useStyles();
  const theme = useTheme();

  const buttonColor = variant === 'primary' ? theme.colors.blue : theme.colors.gray02 + theme.colorOpacity(0.6);

  return (
    <motion.button
      whileTap={{ scaleY: 0.95, scaleX: 0.98 }}
      whileHover={{ scaleY: 1.05, scaleX: 1.02 }}
      onClick={onClick}
      style={{
        ...styles.button,
        ...p.style,
        backgroundColor: buttonColor,
      }}
    >
      <div style={styles.loaderContainer}>
        <AnimatePresence> {p.loading && <Loader />}</AnimatePresence>
      </div>
      {label}
    </motion.button>
  );
};

const useStyles = mkUseStyles((t) => ({
  button: {
    padding: `${t.spacing.m}px ${t.spacing.l}px`,
    color: t.colors.white,
    scale: 1,
    fontSize: '16px',
    borderRadius: t.borderRadius.default,
    border: 0,
    outline: 'none',
    cursor: 'pointer',
    position: 'relative',
  },
  loaderContainer: {
    position: 'absolute',
    left: t.spacing.m,
    height: '100%',
    alignItems: 'center',
  },
}));
