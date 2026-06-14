import { CSSProperties, HTMLInputTypeAttribute, useEffect, useRef, useState } from 'react';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { AnimatePresence, motion } from 'framer-motion';
import { FieldValues, UseControllerProps, useController } from 'react-hook-form';
import '~/components/TextArea.css';

type TextAreaProps<T extends FieldValues> = {
  label: string;
  name: string;
  description: string;
  type?: HTMLInputTypeAttribute;
  rows?: number;
  style?: CSSProperties;
} & UseControllerProps<T>;

const MAX_HEIGHT = 320;

/**
 * Multiline text field that mirrors Input: a floating label (sits in the box, animates up on focus/value)
 * and the same hint/error transition. The textarea auto-grows with its content; it only scrolls past
 * MAX_HEIGHT.
 */
export const TextArea = <T extends FieldValues>({ label, description, rows = 5, ...p }: TextAreaProps<T>) => {
  const [showLabel, setShowLabel] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const {
    field,
    formState: { errors },
  } = useController<T>({ name: p.name, control: p.control });
  const ref = useRef<HTMLTextAreaElement>(null);
  const styles = useStyles();
  const theme = useTheme();
  const error = errors[p.name];

  const autoSize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  };

  useEffect(() => {
    autoSize(ref.current);
    if (typeof field.value === 'string' && field.value.length > 0) setShowLabel(false);
  }, [field.value]);

  const handleFocus = () => {
    setShowLabel(false);
    setShowDescription(true);
  };
  const handleBlur = () => {
    if (!ref.current?.value) setShowLabel(true);
    setShowDescription(false);
  };

  return (
    <div style={{ ...styles.container, ...p.style }}>
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
      <textarea
        {...field}
        ref={(el) => {
          field.ref(el);
          ref.current = el;
        }}
        className='app-textarea'
        style={styles.input}
        rows={rows}
        onChange={(e) => {
          field.onChange(e);
          autoSize(e.currentTarget);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <AnimatePresence mode='wait'>
        {(showDescription || error) && (description || error) ? (
          <motion.p
            initial={{ opacity: 0, translateY: -5 }}
            animate={{ opacity: 1, translateY: 0, color: error ? theme.colors.red : theme.colors.blue04 }}
            exit={{ opacity: 0, translateY: -5 }}
            style={styles.hint}
          >
            {error ? `${error.message}` : description}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    // Reserve room for the absolutely-positioned hint (top:100%) so it can't overlap the field below.
    marginBottom: t.spacing.l,
  },
  label: {
    position: 'absolute',
    left: t.spacing.m,
    color: t.colors.blue04,
    pointerEvents: 'none',
  },
  input: {
    padding: t.spacing.m,
    paddingTop: t.spacing.l + 4,
    minHeight: 120,
    maxHeight: MAX_HEIGHT,
    boxSizing: 'border-box',
    color: t.colors.white,
    fontSize: '15px',
    lineHeight: 1.45,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    border: 0,
    outline: 'none',
    resize: 'none',
    overflowY: 'auto',
  },
  hint: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: t.spacing.m,
    margin: 0,
    fontSize: 12,
  },
}));
