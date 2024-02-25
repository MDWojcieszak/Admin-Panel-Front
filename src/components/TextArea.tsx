import { CSSProperties, HTMLInputTypeAttribute, useRef, useState } from 'react';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { AnimatePresence, motion } from 'framer-motion';
import { FieldValues, UseControllerProps, useController } from 'react-hook-form';
import useMeasure from 'react-use-measure';

type TextAreaProps<T extends FieldValues> = {
  label: string;
  name: string;
  description: string;
  type?: HTMLInputTypeAttribute;
  style?: CSSProperties;
} & UseControllerProps<T>;

export const TextArea = <T extends FieldValues>({ label, description, type = 'text', ...p }: TextAreaProps<T>) => {
  const [showDescription, setShowDescription] = useState(false);
  const [showLabel, setShowLabel] = useState(true);

  const [ref, { height }] = useMeasure();
  const {
    field,
    formState: { errors },
  } = useController<T>({ name: p.name, control: p.control });
  const styles = useStyles();
  const theme = useTheme();
  const inputRef = useRef<HTMLTextAreaElement>(null); // Use HTMLTextAreaElement for multiline input
  const handleFocus = () => {
    setShowLabel(false);
    setShowDescription(true);
  };
  const handleBlur = () => {
    if (!inputRef?.current?.value) setShowLabel(true);
    setShowDescription(false);
  };

  const renderDescription = errors[p.name] ? <>{errors[p.name]?.message}</> : description;

  return (
    <div style={{ ...styles.inputContainer, ...p.style }} ref={ref}>
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
      <motion.textarea
        {...field}
        ref={inputRef}
        style={styles.input}
        onFocus={handleFocus}
        onBlur={handleBlur}
        rows={4} // Set the number of visible rows
      />
      <AnimatePresence mode='wait'>
        {(showDescription || errors[p.name]) && (
          <motion.p
            initial={{ opacity: 0, translateY: -5 }}
            animate={{ opacity: 1, translateY: 0, color: errors[p.name] ? theme.colors.red : theme.colors.blue04 }}
            exit={{ opacity: 0, translateY: -5 }}
            style={{ ...styles.description, top: height }}
          >
            {renderDescription}
          </motion.p>
        )}
      </AnimatePresence>
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
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    border: 0,
    outline: 'none',
    resize: 'none',
  },
  description: {
    position: 'absolute',
    left: t.spacing.m,
    fontSize: '12px',
    margin: 0,
    opacity: 0,
  },
  error: {
    fontSize: '14px',
    color: t.colors.red,
    marginTop: '8px',
  },
}));
