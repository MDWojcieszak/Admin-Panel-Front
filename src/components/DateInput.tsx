import { CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { addDays, addMonths, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { FieldValues, UseControllerProps, useController } from 'react-hook-form';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { mkUseStyles, useTheme } from '~/utils/theme';

type DateInputProps<T extends FieldValues> = {
  label: string;
  description?: string;
  style?: CSSProperties;
  /** Earliest selectable day, as `YYYY-MM-DD`; earlier days are shown but inert. */
  min?: string;
  /** Latest selectable day, as `YYYY-MM-DD`. */
  max?: string;
} & UseControllerProps<T>;

const POPOVER_WIDTH = 296;
const POPOVER_HEIGHT = 372;
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * `YYYY-MM-DD` read as a local calendar day. `new Date('2026-09-12')` would be
 * UTC midnight, which is the previous day in any zone west of Greenwich and
 * would make the highlighted cell disagree with the text in the field.
 */
const parseDay = (value?: string | null): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '');
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
};

const toValue = (date: Date): string => format(date, 'yyyy-MM-dd');

/**
 * A date field with its own calendar, replacing the browser's `type='date'`
 * control. The value stays a `YYYY-MM-DD` string — exactly what the native
 * input produced — so forms and their submit handlers need no changes.
 */
export const DateInput = <T extends FieldValues>(p: DateInputProps<T>) => {
  const styles = useStyles();
  const theme = useTheme();

  const {
    field,
    formState: { errors },
  } = useController<T>({ name: p.name, control: p.control });

  const selected = useMemo(() => parseDay(typeof field.value === 'string' ? field.value : ''), [field.value]);
  const min = useMemo(() => parseDay(p.min), [p.min]);
  const max = useMemo(() => parseDay(p.max), [p.max]);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() => startOfMonth(selected ?? new Date()));
  const [coords, setCoords] = useState<{ left: number; top?: number; bottom?: number } | null>(null);

  const fieldRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const error = errors[p.name];
  const hasBottomSpace = Boolean(error || p.description);

  const updateCoords = () => {
    const el = fieldRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    // Flip above the field when the calendar would run off the bottom of the page.
    const openUp = spaceBelow < POPOVER_HEIGHT && r.top > spaceBelow;
    const left = Math.max(8, Math.min(r.left, window.innerWidth - POPOVER_WIDTH - 8));
    setCoords({
      left,
      ...(openUp ? { bottom: window.innerHeight - r.top + theme.spacing.s } : { top: r.bottom + theme.spacing.s }),
    });
  };

  const openCalendar = () => {
    // Always reopen on the month of the current value, not wherever it was left.
    setView(startOfMonth(selected ?? new Date()));
    updateCoords();
    setOpen(true);
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateCoords();

    const close = () => setOpen(false);
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target) || fieldRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onScroll = (e: Event) => {
      if (popoverRef.current && e.target instanceof Node && popoverRef.current.contains(e.target)) return;
      setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', close);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the visible month in step when the value is changed from outside.
  useEffect(() => {
    if (selected && !open) setView(startOfMonth(selected));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value]);

  const days = useMemo(() => {
    const first = startOfWeek(startOfMonth(view), { weekStartsOn: 1 });
    // Always six weeks, so the popover keeps one height as months change.
    return Array.from({ length: 42 }, (_, index) => addDays(first, index));
  }, [view]);

  const isDisabled = (day: Date) => Boolean((min && day < min) || (max && day > max));

  const pick = (day: Date) => {
    if (isDisabled(day)) return;
    field.onChange(toValue(day));
    setOpen(false);
  };

  const today = new Date();

  return (
    <div
      style={{
        ...styles.container,
        marginBottom: hasBottomSpace ? theme.spacing.l : 0,
        ...p.style,
      }}
    >
      <label style={styles.label}>{p.label}</label>

      <div
        ref={fieldRef}
        role='button'
        tabIndex={0}
        style={{ ...styles.field, boxShadow: open ? `inset 0 0 0 1px ${theme.colors.blue}` : undefined }}
        onClick={() => (open ? setOpen(false) : openCalendar())}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          if (open) setOpen(false);
          else openCalendar();
        }}
      >
        <span style={selected ? styles.value : styles.placeholder}>
          {selected ? format(selected, 'd MMM yyyy') : 'Pick a date'}
        </span>
        <FiCalendar size={18} color={theme.colors.blue} />
      </div>

      {createPortal(
        <AnimatePresence>
          {open && coords ? (
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, translateY: -6 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -6 }}
              transition={{ duration: 0.14 }}
              style={{ ...styles.popover, left: coords.left, top: coords.top, bottom: coords.bottom }}
            >
              <div style={styles.header}>
                <NavButton title='Previous year' onClick={() => setView((prev) => addMonths(prev, -12))}>
                  <FiChevronsLeft size={16} />
                </NavButton>
                <NavButton title='Previous month' onClick={() => setView((prev) => addMonths(prev, -1))}>
                  <FiChevronLeft size={16} />
                </NavButton>
                <span style={styles.monthLabel}>{format(view, 'LLLL yyyy')}</span>
                <NavButton title='Next month' onClick={() => setView((prev) => addMonths(prev, 1))}>
                  <FiChevronRight size={16} />
                </NavButton>
                <NavButton title='Next year' onClick={() => setView((prev) => addMonths(prev, 12))}>
                  <FiChevronsRight size={16} />
                </NavButton>
              </div>

              <div style={styles.grid}>
                {WEEKDAYS.map((weekday) => (
                  <span key={weekday} style={styles.weekday}>
                    {weekday}
                  </span>
                ))}

                {days.map((day) => {
                  const isSelected = Boolean(selected && isSameDay(day, selected));
                  const isToday = isSameDay(day, today);
                  const outside = !isSameMonth(day, view);
                  const disabled = isDisabled(day);

                  return (
                    <button
                      key={day.toISOString()}
                      type='button'
                      disabled={disabled}
                      onClick={() => pick(day)}
                      style={{
                        ...styles.day,
                        ...(outside ? styles.dayOutside : {}),
                        ...(isToday ? styles.dayToday : {}),
                        ...(isSelected ? styles.daySelected : {}),
                        ...(disabled ? styles.dayDisabled : {}),
                      }}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              <div style={styles.footer}>
                <button
                  type='button'
                  style={styles.footerButton}
                  onClick={() => {
                    field.onChange('');
                    setOpen(false);
                  }}
                >
                  Clear
                </button>
                <button
                  type='button'
                  style={{ ...styles.footerButton, color: theme.colors.blue, opacity: isDisabled(today) ? 0.35 : 1 }}
                  disabled={isDisabled(today)}
                  onClick={() => pick(today)}
                >
                  Today
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}

      <AnimatePresence mode='wait'>
        {(open || error) && (error?.message || p.description) ? (
          <motion.p
            initial={{ opacity: 0, translateY: -5 }}
            animate={{ opacity: 1, translateY: 0, color: error ? theme.colors.red : theme.colors.blue04 }}
            exit={{ opacity: 0, translateY: -5 }}
            style={styles.description}
          >
            {error ? <>{error.message}</> : p.description}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const NavButton = ({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) => {
  const styles = useStyles();
  return (
    <button type='button' title={title} aria-label={title} onClick={onClick} style={styles.navButton}>
      {children}
    </button>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    position: 'relative',
    minWidth: 0,
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
  // Same box as Input and Select, so the three sit in a row without a seam.
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.s,
    padding: t.spacing.m,
    paddingTop: t.spacing.l + 4,
    cursor: 'pointer',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    userSelect: 'none',
    outline: 'none',
  },
  value: { fontSize: 16, color: t.colors.white, whiteSpace: 'nowrap' },
  placeholder: { fontSize: 16, color: t.colors.dark05, whiteSpace: 'nowrap' },
  popover: {
    position: 'fixed',
    zIndex: 1000,
    width: POPOVER_WIDTH,
    boxSizing: 'border-box',
    gap: t.spacing.s,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04,
    border: `1px solid ${t.colors.gray01 + t.colorOpacity(0.7)}`,
    boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
    color: t.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 700,
    fontSize: 14,
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    padding: 0,
    border: 0,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    color: t.colors.blue04,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 2,
  },
  weekday: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: t.colors.dark05,
    padding: '4px 0',
  },
  day: {
    height: 34,
    padding: 0,
    border: '1px solid transparent',
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 13,
    color: t.colors.white,
    backgroundColor: 'transparent',
  },
  dayOutside: { color: t.colors.dark04 },
  dayToday: { borderColor: t.colors.blue + t.colorOpacity(0.6) },
  daySelected: { backgroundColor: t.colors.blue, color: t.colors.white, fontWeight: 700 },
  dayDisabled: { opacity: 0.25, cursor: 'not-allowed' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: t.spacing.xs,
    borderTop: `1px solid ${t.colors.gray01 + t.colorOpacity(0.6)}`,
  },
  footerButton: {
    padding: `${t.spacing.xs}px ${t.spacing.s}px`,
    border: 0,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 13,
    fontWeight: 600,
    color: t.colors.dark05,
    backgroundColor: 'transparent',
  },
  description: {
    position: 'absolute',
    left: t.spacing.m,
    top: 60,
    fontSize: 12,
    margin: 0,
    zIndex: 5,
  },
}));
