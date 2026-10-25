import { AnimatePresence, motion } from 'framer-motion';
import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import { mkUseStyles, useTheme } from '~/utils/theme';

type PillOption = { value: string; label: string; color?: string };

type PillSelectProps = {
  value: string;
  options: PillOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Accessible name — the pill only shows the value. */
  label: string;
};

const MENU_WIDTH = 180;

/**
 * A status in a list row: a small tinted pill with the option's colour, opening
 * a short menu. A full-size select in every row made the list tall and loud.
 * Clicks stay inside, so picking does not also open the row.
 */
export const PillSelect = ({ value, options, onChange, disabled, label }: PillSelectProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const pillRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top?: number; bottom?: number }>();

  const current = options.find((o) => o.value === value) ?? options[0];
  const color = current?.color ?? theme.colors.dark05;

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = pillRef.current?.getBoundingClientRect();
      if (!r) return;
      const left = Math.max(8, Math.min(r.left, window.innerWidth - MENU_WIDTH - 8));
      const menuHeight = options.length * 36 + 12;
      setCoords(
        window.innerHeight - r.bottom < menuHeight + 8
          ? { left, bottom: window.innerHeight - r.top + 6 }
          : { left, top: r.bottom + 6 },
      );
    };
    place();
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || pillRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const close = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open, options.length]);

  return (
    <>
      <button
        ref={pillRef}
        type='button'
        aria-label={label}
        aria-haspopup='listbox'
        aria-expanded={open}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setOpen((o) => !o);
        }}
        style={{
          ...styles.pill,
          color: theme.colors.white,
          backgroundColor: color + theme.colorOpacity(0.14),
          borderColor: color + theme.colorOpacity(open ? 0.8 : 0.35),
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        <span style={{ ...styles.dot, backgroundColor: color }} />
        <span style={styles.pillLabel}>{current?.label}</span>
        {disabled ? null : <FiChevronDown size={13} style={{ opacity: 0.7, flexShrink: 0 }} />}
      </button>

      {createPortal(
        <AnimatePresence>
          {open && coords ? (
            <motion.div
              ref={menuRef}
              role='listbox'
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              style={{ ...styles.menu, left: coords.left, top: coords.top, bottom: coords.bottom }}
              onClick={(e) => e.stopPropagation()}
            >
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <button
                    key={option.value}
                    type='button'
                    role='option'
                    aria-selected={active}
                    style={{ ...styles.option, ...(active ? styles.optionActive : null) }}
                    onClick={() => {
                      setOpen(false);
                      if (!active) onChange(option.value);
                    }}
                  >
                    <span style={{ ...styles.dot, backgroundColor: option.color ?? theme.colors.dark05 }} />
                    <span style={{ flex: 1 }}>{option.label}</span>
                    {active ? <FiCheck size={14} color={theme.colors.blue} /> : null}
                  </button>
                );
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};

const useStyles = mkUseStyles((t) => ({
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 30,
    maxWidth: '100%',
    padding: '0 10px',
    boxSizing: 'border-box',
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
    font: 'inherit',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    transition: 'border-color 0.12s ease',
  },
  pillLabel: { overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 },
  dot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  menu: {
    position: 'fixed',
    zIndex: 1000,
    width: MENU_WIDTH,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: 6,
    boxSizing: 'border-box',
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.45)',
  },
  option: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    height: 34,
    padding: '0 10px',
    border: 'none',
    borderRadius: t.borderRadius.default,
    background: 'transparent',
    color: t.colors.white,
    font: 'inherit',
    fontSize: 14,
    textAlign: 'left',
    cursor: 'pointer',
  },
  optionActive: { backgroundColor: t.colors.blue + t.colorOpacity(0.14) },
}));
