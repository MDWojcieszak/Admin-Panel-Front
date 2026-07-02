import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TbPlayerPlayFilled } from 'react-icons/tb';
import { AnimatePresence, motion } from 'framer-motion';
import { getMonth, getYear, isSameMonth, startOfToday } from 'date-fns';
import { months } from '~/components/Calendar/types';
import { mkUseStyles } from '~/utils/theme';

type MonthYearSelectorProps = {
  setDate: F1<Date>;
  defaultDate?: Date;
};

const YEARS_BACK = 80;

export const MonthYearSelector = (p: MonthYearSelectorProps) => {
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [activeMonth, setActiveMonth] = useState<number>(getMonth(new Date()));
  const [activeYear, setActiveYear] = useState<number>(getYear(new Date()));
  const [open, setOpen] = useState<'month' | 'year' | null>(null);
  const [coords, setCoords] = useState<{ left: number; top: number; width: number } | null>(null);
  const monthRef = useRef<HTMLButtonElement>(null);
  const yearRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const styles = useStyles();

  const handleMonthChange = (next?: boolean) => {
    if (next) {
      if (activeMonth <= 10) return setActiveMonth((m) => m + 1);
      setActiveYear((y) => y + 1);
      return setActiveMonth(0);
    }
    if (activeMonth >= 1) return setActiveMonth((m) => m - 1);
    setActiveYear((y) => y - 1);
    setActiveMonth(11);
  };

  useEffect(() => {
    const date = new Date(activeYear, activeMonth, 7);
    p.setDate(date);
    setIsNextDisabled(isSameMonth(date, startOfToday()));
  }, [activeMonth, activeYear]);

  useEffect(() => {
    if (p.defaultDate) {
      setActiveMonth(getMonth(p.defaultDate));
      setActiveYear(getYear(p.defaultDate));
    }
  }, [p.defaultDate]);

  const openPicker = (which: 'month' | 'year') => {
    const el = (which === 'month' ? monthRef : yearRef).current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({ left: r.left, top: r.bottom + 6, width: which === 'year' ? 120 : 240 });
    setOpen((prev) => (prev === which ? null : which));
  };

  useLayoutEffect(() => {
    if (!open) return;
    const close = () => setOpen(null);
    // Scrolling inside the dropdown (e.g. the year list) shouldn't close it.
    const onScroll = (e: Event) => {
      if (dropdownRef.current && e.target instanceof Node && dropdownRef.current.contains(e.target)) return;
      setOpen(null);
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const currentYear = getYear(new Date());
  const years = Array.from({ length: YEARS_BACK + 1 }, (_, i) => currentYear - i);

  return (
    <div style={styles.container}>
      <motion.button
        type='button'
        style={styles.arrow}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleMonthChange()}
      >
        <TbPlayerPlayFilled size={16} style={{ rotate: '180deg' }} />
      </motion.button>

      <div style={styles.center}>
        <button ref={monthRef} type='button' style={styles.pick} onClick={() => openPicker('month')}>
          {months[activeMonth]}
        </button>
        <button ref={yearRef} type='button' style={styles.pick} onClick={() => openPicker('year')}>
          {activeYear}
        </button>
      </div>

      <motion.button
        type='button'
        style={{ ...styles.arrow, opacity: isNextDisabled ? 0.35 : 1, cursor: isNextDisabled ? 'default' : 'pointer' }}
        whileTap={{ scale: isNextDisabled ? 1 : 0.9 }}
        onClick={() => handleMonthChange(true)}
        disabled={isNextDisabled}
      >
        <TbPlayerPlayFilled size={16} />
      </motion.button>

      {createPortal(
        <AnimatePresence>
          {open && coords ? (
            <>
              <div style={styles.backdrop} onClick={() => setOpen(null)} />
              <motion.div
                ref={dropdownRef}
                style={{ ...styles.dropdown, left: coords.left, top: coords.top, width: coords.width }}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                {open === 'month' ? (
                  <div style={styles.monthGrid}>
                    {months.map((m, i) => (
                      <div
                        key={m}
                        style={{ ...styles.cell, ...(i === activeMonth ? styles.cellActive : {}) }}
                        onClick={() => {
                          setActiveMonth(i);
                          setOpen(null);
                        }}
                      >
                        {m.slice(0, 3)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.yearList}>
                    {years.map((y) => (
                      <div
                        key={y}
                        style={{ ...styles.cell, ...(y === activeYear ? styles.cellActive : {}) }}
                        onClick={() => {
                          setActiveYear(y);
                          setOpen(null);
                        }}
                      >
                        {y}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.s,
  },
  arrow: {
    zIndex: 2,
    padding: t.spacing.s,
    backgroundColor: 'transparent',
    outline: 'none',
    border: 'none',
    color: t.colors.white,
    cursor: 'pointer',
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.s,
    flex: 1,
  },
  pick: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
    color: t.colors.white,
    padding: `${t.spacing.xs}px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
  },
  dropdown: {
    position: 'fixed',
    zIndex: 1001,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04,
    border: `1px solid ${t.colors.gray01}`,
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
  },
  monthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: t.spacing.xs,
  },
  yearList: {
    maxHeight: 240,
    overflowY: 'auto',
    gap: t.spacing.xxs,
  },
  cell: {
    padding: `${t.spacing.s}px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    textAlign: 'center',
    fontSize: 13,
    color: t.colors.white,
  },
  cellActive: {
    backgroundColor: t.colors.blue,
    color: t.colors.white,
  },
}));
