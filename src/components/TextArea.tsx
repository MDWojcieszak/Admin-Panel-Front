import { CSSProperties, HTMLInputTypeAttribute, useEffect, useRef, useState } from 'react';
import { mkUseStyles } from '~/utils/theme';
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
 * Multiline text field with a STATIC label above the box. The textarea auto-grows with its content
 * (no scrollbar in normal use); it only scrolls past MAX_HEIGHT.
 */
export const TextArea = <T extends FieldValues>({ label, description, rows = 5, ...p }: TextAreaProps<T>) => {
  const [focused, setFocused] = useState(false);
  const {
    field,
    formState: { errors },
  } = useController<T>({ name: p.name, control: p.control });
  const ref = useRef<HTMLTextAreaElement>(null);
  const styles = useStyles();
  const error = errors[p.name];

  const autoSize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  };

  useEffect(() => {
    autoSize(ref.current);
  }, [field.value]);

  return (
    <div style={{ ...styles.container, ...p.style }}>
      <label style={styles.label}>{label}</label>
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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <AnimatePresence mode='wait'>
        {(focused || error) && (description || error) ? (
          <motion.span
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            style={styles.hint}
          >
            {error ? <span style={styles.errorText}>{`${error.message}`}</span> : description}
          </motion.span>
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
    gap: t.spacing.xs,
    marginBottom: t.spacing.s,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: t.colors.blue04,
    paddingLeft: 2,
  },
  input: {
    padding: t.spacing.m,
    minHeight: 120,
    maxHeight: MAX_HEIGHT,
    boxSizing: 'border-box',
    color: t.colors.white,
    fontSize: '15px',
    lineHeight: 1.45,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray03,
    border: 0,
    outline: 'none',
    resize: 'none',
    overflowY: 'auto',
  },
  hint: {
    position: 'absolute',
    top: '100%',
    left: 2,
    marginTop: 4,
    fontSize: 12,
    color: t.colors.blue04,
  },
  errorText: {
    color: t.colors.red,
  },
}));
