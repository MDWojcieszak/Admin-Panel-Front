import { CSSProperties, HTMLInputTypeAttribute, useRef, useState } from 'react';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { AnimatePresence, motion } from 'framer-motion';
type InputProps = {
  label: string;
  description: string;
  error?: string; // New prop for error message
  type?: HTMLInputTypeAttribute;
  style?: CSSProperties;
};

export const Input = ({ label, description, error, type = 'text', ...p }: InputProps) => {
  const [showDescription, setShowDescription] = useState(false);
  const [showLabel, setShowLabel] = useState(true);
  const styles = useStyles();
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFocus = () => {
    setShowLabel(false);
    setShowDescription(true);
  };

  const handleBlur = () => {
    if (!inputRef.current?.value) setShowLabel(true);
    setShowDescription(false);
  };

  return (
    <div style={{ ...styles.inputContainer, ...p.style }}>
      <motion.label
        animate={{
          color: showLabel ? theme.colors.lightBlue : theme.colors.blue04,
          top: showLabel ? theme.spacing.m : 6,
          fontSize: showLabel ? '16px' : '12px',
        }}
        style={styles.label}
      >
        {label}
      </motion.label>
      <motion.input
        ref={inputRef}
        style={error ? { ...styles.input, borderColor: 'red' } : styles.input}
        onFocus={handleFocus}
        onBlur={handleBlur}
        type={type}
      />
      <AnimatePresence mode='wait'>
        {showDescription && (
          <motion.p
            initial={{ opacity: 0, translateY: -5 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -5 }}
            style={styles.description}
          >
            {description}
          </motion.p>
        )}
      </AnimatePresence>
      {/* {error && <p style={styles.error}>{error}</p>} */}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  inputContainer: {
    marginBottom: t.spacing.l,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: t.spacing.m,
    color: t.colors.blue04,
    pointerEvents: 'none',
  },
  input: {
    padding: t.spacing.m,
    color: t.colors.white,
    paddingTop: t.spacing.l + 4,
    fontSize: '16px',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
    border: 0,
    outline: 'none',
  },
  description: {
    position: 'absolute',
    left: t.spacing.m,
    top: 60,
    fontSize: '12px',
    margin: 0,
    color: t.colors.blue04,
    opacity: 0,
  },
  error: {
    fontSize: '14px',
    color: t.colors.red,
    marginTop: '8px',
  },
}));
