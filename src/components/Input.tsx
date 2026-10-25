import { CSSProperties, HTMLInputTypeAttribute, useEffect, useRef, useState } from 'react';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { AnimatePresence, motion } from 'framer-motion';
import { FieldValues, UseControllerProps, useController } from 'react-hook-form';

type InputProps<T extends FieldValues> = {
  label: string;
  name: string;
  /** Shown under the field while it has focus; without it no room is kept under the field. */
  description?: string;
  type?: HTMLInputTypeAttribute;
  style?: CSSProperties;
  disableAutofill?: boolean;
  /** Shown in the empty field while it has focus — the label sits above it by then. */
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  /** Rewrites what is typed before it is stored (upper case, digits only…). */
  transform?: (value: string) => string;
  /** Every change, for fields that save as they go. */
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
  /** Enter pressed in the field. */
  onEnter?: () => void;
} & UseControllerProps<T>;

/** Types whose empty control shows its own mask (dd.mm.yyyy, --:--): the label stays up. */
const MASKED_TYPES: HTMLInputTypeAttribute[] = ['date', 'datetime-local', 'time', 'month'];

export const Input = <T extends FieldValues>({
  label,
  description,
  type = 'text',
  disableAutofill = true,
  placeholder,
  transform,
  onValueChange,
  onEnter,
  ...p
}: InputProps<T>) => {
  const masked = MASKED_TYPES.includes(type);
  const [showDescription, setShowDescription] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showLabel, setShowLabel] = useState(!masked);
  const {
    field,
    formState: { errors },
  } = useController<T>({ name: p.name, control: p.control });
  const styles = useStyles();
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFocus = () => {
    setFocused(true);
    setShowLabel(false);
    setShowDescription(true);
  };
  const handleBlur = () => {
    setFocused(false);
    if (!inputRef?.current?.value && !masked) setShowLabel(true);
    setShowDescription(false);
    field.onBlur();
    p.onBlur?.();
  };

  useEffect(() => {
    if (typeof field.value === 'string' && field.value.length > 0) setShowLabel(false);
  }, [field]);

  useEffect(() => {
    if (!p.defaultValue || !inputRef.current) return;
    if (p.defaultValue?.length > 0) setShowLabel(false);
    inputRef.current.value = p.defaultValue;
    field.onChange(p.defaultValue);
  }, [p.defaultValue]);

  const renderDescription = errors[p.name] ? <>{errors[p.name]?.message}</> : description;

  return (
    <div
      style={{
        ...styles.inputContainer,
        // Room for the line under the field only when there is one to show.
        marginBottom: description || errors[p.name] ? theme.spacing.l : 0,
        ...(p.disabled ? { opacity: 0.6 } : null),
        ...p.style,
      }}
    >
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
        {...field}
        ref={inputRef}
        autoComplete={disableAutofill ? 'off' : 'on'}
        data-lpignore={disableAutofill ? 'true' : undefined}
        data-form-type={disableAutofill ? 'other' : undefined}
        style={styles.input}
        onChange={(e) => {
          const value = transform ? transform(e.target.value) : e.target.value;
          field.onChange(value);
          onValueChange?.(value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        type={type}
        placeholder={focused ? placeholder : undefined}
        disabled={p.disabled}
        autoFocus={p.autoFocus}
        maxLength={p.maxLength}
        inputMode={p.inputMode}
      />
      <AnimatePresence mode='wait'>
        {(showDescription || errors[p.name]) && renderDescription && (
          <motion.p
            initial={{ opacity: 0, translateY: -5 }}
            animate={{ opacity: 1, translateY: 0, color: errors[p.name] ? theme.colors.red : theme.colors.blue04 }}
            exit={{ opacity: 0, translateY: -5 }}
            style={styles.description}
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
    position: 'relative',
    minWidth: 0,
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
    width: '100%',
    boxSizing: 'border-box',
    // Native date and time controls draw their icons for a dark page.
    colorScheme: 'dark',
  },
  description: {
    position: 'absolute',
    left: t.spacing.m,
    // 2 px below the 60 px field; at 60 it sat on the field's bottom edge.
    top: 62,
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
