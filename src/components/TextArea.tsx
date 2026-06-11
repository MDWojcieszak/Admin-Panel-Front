import { CSSProperties, HTMLInputTypeAttribute, useState } from 'react';
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

/**
 * Multiline text field with a STATIC label above the box (not a floating-inside label) — for a textarea
 * a floating label fights the scrollable content, so the label lives above and the scrollbar spans the
 * full height cleanly.
 */
export const TextArea = <T extends FieldValues>({ label, description, rows = 6, ...p }: TextAreaProps<T>) => {
  const [focused, setFocused] = useState(false);
  const {
    field,
    formState: { errors },
  } = useController<T>({ name: p.name, control: p.control });
  const styles = useStyles();
  const error = errors[p.name];

  return (
    <div style={{ ...styles.container, ...p.style }}>
      <label style={styles.label}>{label}</label>
      <textarea
        {...field}
        className='app-textarea'
        style={styles.input}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={rows}
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
    marginBottom: t.spacing.l,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: t.colors.blue04,
    paddingLeft: 2,
  },
  input: {
    padding: t.spacing.m,
    minHeight: 130,
    boxSizing: 'border-box',
    color: t.colors.white,
    fontSize: '15px',
    lineHeight: 1.45,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray03,
    border: 0,
    outline: 'none',
    resize: 'none',
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
