import { CSSProperties, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FieldValues, UseControllerProps, useController } from 'react-hook-form';
import { IconType } from 'react-icons';
import { FaChevronDown } from 'react-icons/fa6';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** Kept in sync with the left inset applied to the input when an icon is present. */
const ICON_SIZE = 18;

type Option = {
  label: string;
  value: string;
  /** Shown on the list row and beside the selected value. Optional per option. */
  icon?: IconType;
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

/** Space the description/error line takes under the field, gap included. */
const DESCRIPTION_LINE = 20;

export const Select = <T extends FieldValues>(p: SelectProps<T>) => {
  const [isExtended, setIsExtended] = useState(false);
  const [isOnList, setIsOnList] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top?: number; bottom?: number; width: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

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

  const SelectedIcon = selectedOption?.icon;

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
      // Opening down, it starts below the description line shown under the
      // field while the list is open, instead of covering it.
      ...(openUp
        ? { bottom: window.innerHeight - r.top + theme.spacing.s }
        : { top: r.bottom + (hasBottomSpace ? DESCRIPTION_LINE : theme.spacing.s) }),
    });
  };

  useLayoutEffect(() => {
    if (!isExtended) return;
    updateCoords();
    const close = () => setIsExtended(false);
    const onScroll = (e: Event) => {
      // Scrolling inside the dropdown's own list shouldn't close it — only page/ancestor scrolls do.
      if (listRef.current && e.target instanceof Node && listRef.current.contains(e.target)) return;
      setIsExtended(false);
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
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

  const renderOption = (option: Option) => {
    const OptionIcon = option.icon;

    return (
      <motion.li
        key={option.value}
        whileHover={{ backgroundColor: theme.colors.blue }}
        style={styles.option}
        onClick={() => handleSelect(option.value)}
      >
        {OptionIcon ? <OptionIcon size={ICON_SIZE} color={theme.colors.blue04} /> : null}
        <span style={styles.optionLabel}>{option.label}</span>
      </motion.li>
    );
  };

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
              ref={listRef}
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

      {/* An icon cannot live inside an input, so it is overlaid on the value line
          and the text is inset to clear it. Aligned the same way as the chevron. */}
      {SelectedIcon ? (
        <div
          style={{
            ...styles.valueIcon,
            top: variant === 'secondary' ? theme.spacing.m : theme.spacing.l + 4,
          }}
        >
          <SelectedIcon size={ICON_SIZE} color={theme.colors.blue04} />
        </div>
      ) : null}

      <input
        ref={inputRef}
        value={selectedOption?.label || ''}
        style={{
          ...styles.input,
          width: variant === 'secondary' ? '100%' : undefined,
          paddingTop: variant === 'secondary' ? theme.spacing.m : theme.spacing.l + 4,
          // Always a concrete value: `undefined` here would clear the left side of
          // the `padding` shorthand set above, flattening the text against the edge.
          paddingLeft: SelectedIcon ? theme.spacing.m + ICON_SIZE + theme.spacing.s : theme.spacing.m,
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    color: t.colors.white,
  },
  // Only what the icon row needs; wrapping is left as it was for every other select.
  optionLabel: {
    minWidth: 0,
  },
  valueIcon: {
    position: 'absolute',
    left: t.spacing.m,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 2,
  },
  chevron: {
    position: 'absolute',
    right: t.spacing.m,
    pointerEvents: 'none',
  },
  description: {
    position: 'absolute',
    left: t.spacing.m,
    // 2 px below the 60 px field; at 60 it sat on the field's bottom edge.
    top: 62,
    fontSize: 12,
    margin: 0,
    opacity: 0,
    zIndex: 5,
  },
}));
