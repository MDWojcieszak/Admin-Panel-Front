import { CSSProperties, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FieldValues, UseControllerProps, useController } from 'react-hook-form';
import { FaChevronDown } from 'react-icons/fa6';
import { mkUseStyles, useTheme } from '~/utils/theme';

type Option = {
  label: string;
  value: string;
};

type SelectProps<T extends FieldValues> = {
  label: string;
  options: Option[];
  description?: string;
  style?: CSSProperties;
  variant?: 'primary' | 'secondary';
  onValueChange?: (value: string) => void;
} & UseControllerProps<T>;

export type SelectRef = {
  value?: Option['value'];
};

export const Select = <T extends FieldValues>(p: SelectProps<T>) => {
  const [isExtended, setIsExtended] = useState(false);
  const [isOnList, setIsOnList] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top?: number; bottom?: number; width: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    field,
    formState: { errors },
  } = useController<T>({
    name: p.name,
    control: p.control,
  });

  const styles = useStyles();
  const theme = useTheme();

  const variant = p.variant ?? 'primary';
  const error = errors[p.name];
  const hasBottomSpace = Boolean(error || p.description);

  const selectedValue = typeof field.value === 'string' ? field.value : '';

  const selectedOption = useMemo(() => {
    return p.options.find((option) => option.value === selectedValue) || p.options[0];
  }, [p.options, selectedValue]);

  const updateCoords = () => {
    const el = inputRef.current ?? containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    // Flip the list above the field when there isn't room below (e.g. near the bottom of the page).
    const openUp = spaceBelow < 260 && r.top > spaceBelow;
    setCoords({
      left: r.left,
      width: r.width,
      ...(openUp ? { bottom: window.innerHeight - r.top + theme.spacing.s } : { top: r.bottom + theme.spacing.s }),
    });
  };

  useLayoutEffect(() => {
    if (!isExtended) return;
    updateCoords();
    const close = () => setIsExtended(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExtended]);

  const handlePress = () => {
    if (!isExtended) updateCoords();
    setIsExtended((prev) => !prev);
  };

  const handleBlur = () => {
    if (!isOnList) setIsExtended(false);
  };

  const handleSelect = (value: string) => {
    field.onChange(value);
    p.onValueChange?.(value);
    setIsExtended(false);
  };

  const renderOption = (option: Option) => (
    <motion.li
      key={option.value}
      whileHover={{ backgroundColor: theme.colors.blue }}
      style={styles.option}
      onClick={() => handleSelect(option.value)}
    >
      {option.label}
    </motion.li>
  );

  const renderDescription = error ? <>{error?.message}</> : p.description;

  return (
    <div
      ref={containerRef}
      style={{
        ...styles.selectContainer,
        marginBottom: hasBottomSpace ? theme.spacing.l : 0,
        ...p.style,
      }}
    >
      {variant !== 'secondary' && <label style={styles.label}>{p.label}</label>}

      {createPortal(
        <AnimatePresence mode='wait'>
          {isExtended && coords && (
            <motion.ul
              onMouseEnter={() => setIsOnList(true)}
              onMouseLeave={() => setIsOnList(false)}
              initial={{ opacity: 0, translateY: -8 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -8 }}
              style={{
                ...styles.optionsContainer,
                position: 'fixed',
                left: coords.left,
                top: coords.top,
                bottom: coords.bottom,
                maxHeight: 280,
                overflowY: 'auto',
                width: coords.width,
                zIndex: 1000,
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              }}
            >
              <div>{p.options.map(renderOption)}</div>
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body,
      )}

      <input
        ref={inputRef}
        value={selectedOption?.label || ''}
        style={{
          ...styles.input,
          width: variant === 'secondary' ? '100%' : undefined,
          paddingTop: variant === 'secondary' ? theme.spacing.m : theme.spacing.l + 4,
        }}
        readOnly
        onClick={handlePress}
        onBlur={handleBlur}
      />

      <motion.div
        style={{
          ...styles.chevron,
          top: variant === 'secondary' ? theme.spacing.m : theme.spacing.m + 4,
        }}
        animate={{ rotate: isExtended ? '180deg' : 0 }}
        transition={{ duration: 0.15 }}
      >
        <FaChevronDown size={variant === 'secondary' ? 18 : 20} fill={theme.colors.blue} />
      </motion.div>

      <AnimatePresence mode='wait'>
        {(isExtended || error) && renderDescription && (
          <motion.p
            initial={{ opacity: 0, translateY: -5 }}
            animate={{
              opacity: 1,
              translateY: 0,
              color: error ? theme.colors.red : theme.colors.blue04,
            }}
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
  selectContainer: {
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: t.spacing.m,
    top: 6,
    fontSize: 12,
    color: t.colors.blue04,
    pointerEvents: 'none',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: t.spacing.m,
    cursor: 'pointer',
    fontSize: 16,
    border: 0,
    borderRadius: t.borderRadius.default,
    outline: 'none',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    userSelect: 'none',
    webkitUserSelect: 'none',
    boxSizing: 'border-box',
  },
  optionsContainer: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    margin: 0,
    padding: t.spacing.s,
    gap: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04,
    color: t.colors.white,
  },
  option: {
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    color: t.colors.white,
  },
  chevron: {
    position: 'absolute',
    right: t.spacing.m,
    pointerEvents: 'none',
  },
  description: {
    position: 'absolute',
    left: t.spacing.m,
    top: 60,
    fontSize: 12,
    margin: 0,
    opacity: 0,
    zIndex: 5,
  },
}));
