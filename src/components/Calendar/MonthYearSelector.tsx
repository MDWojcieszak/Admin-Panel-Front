import { useEffect, useState } from 'react';
import { TbPlayerPlayFilled } from 'react-icons/tb';
import { mkUseStyles } from '~/utils/theme';
import { AnimatePresence, motion } from 'framer-motion';
import { getMonth, getYear, isFuture, isSameMonth, startOfToday } from 'date-fns';
import { months } from '~/components/Calendar/types';

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '50%' : '-50%',
    opacity: 0,
  }),
  active: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-50%' : '50%',
    opacity: 0,
  }),
};

type MonthYearSelectorProps = {
  setDate: F1<Date>;
};

export const MonthYearSelector = (p: MonthYearSelectorProps) => {
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [direction, setDirection] = useState<number>();
  const [activeMonth, setActiveMonth] = useState<number>(getMonth(new Date()));
  const [activeYear, setActiveYear] = useState<number>(getYear(new Date()));
  const styles = useStyles();

  const handleMonthChange = (next?: boolean) => {
    if (next) {
      setDirection(1);
      if (activeMonth <= 10) return setActiveMonth((m) => m + 1);
      setActiveYear((y) => y + 1);
      return setActiveMonth(0);
    }
    setDirection(0);
    if (activeMonth >= 1) return setActiveMonth((m) => m - 1);
    setActiveYear((y) => y - 1);
    setActiveMonth(11);
  };

  useEffect(() => {
    const date = new Date(activeYear, activeMonth, 7);
    p.setDate(date);
    if (isSameMonth(date, startOfToday())) return setIsNextDisabled(true);
    setIsNextDisabled(false);
  }, [activeMonth, activeYear]);

  return (
    <div style={styles.container}>
      <AnimatePresence custom={direction}>
        <motion.div
          style={styles.actionContainer}
          key={activeMonth + activeYear}
          variants={variants}
          initial='enter'
          animate='active'
          exit='exit'
          custom={direction}
          transition={{ ease: 'easeOut', duration: 0.2 }}
        >
          {`${months[activeMonth]} ${activeYear}`}
        </motion.div>
      </AnimatePresence>
      <motion.button
        type='button'
        style={{ ...styles.button, cursor: 'pointer' }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleMonthChange()}
      >
        <TbPlayerPlayFilled size={16} style={{ rotate: '180deg' }} />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        type='button'
        style={{ ...styles.button, cursor: isNextDisabled ? 'default' : 'pointer' }}
        onClick={() => handleMonthChange(true)}
        disabled={isNextDisabled}
      >
        <TbPlayerPlayFilled size={16} />
      </motion.button>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flexDirection: 'row',
    position: 'relative',
    justifyContent: 'space-between',
  },
  actionContainer: {
    position: 'absolute',
    left: t.spacing.xxl,
    top: 0,
    right: t.spacing.xxl,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.m,
  },
  button: {
    zIndex: 2,
    padding: t.spacing.sm,
    backgroundColor: 'transparent',
    outline: 'none',
    border: 'none',
  },
}));
