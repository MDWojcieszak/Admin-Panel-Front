import { Transition, motion } from 'framer-motion';
import { mkUseStyles } from '~/utils/theme';

const ContainerVariants = {
  initial: {
    transition: {
      staggerChildren: 0.2,
    },
  },
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const DotVariants = {
  initial: {
    y: '0%',
  },
  animate: {
    y: '100%',
  },
};

const DotTransition: Transition = {
  duration: 0.5,
  repeat: Infinity,
  repeatType: 'reverse',
  ease: 'easeInOut',
};

type LoaderProps = {
  size?: number;
};

export const Loader = ({ size = 40 }: LoaderProps) => {
  const styles = useStyles();
  const dotSize = Math.round(0.2 * size);
  const dotStyle = { ...styles.dot, width: dotSize, height: dotSize };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        style={{ ...styles.dotContainer, height: 2 * dotSize, width: size }}
        variants={ContainerVariants}
        initial='initial'
        animate='animate'
      >
        <motion.span style={dotStyle} variants={DotVariants} transition={DotTransition} />
        <motion.span
          style={{ ...styles.dot, width: dotSize, height: dotSize }}
          variants={DotVariants}
          transition={DotTransition}
        />
        <motion.span
          style={{ ...styles.dot, width: dotSize, height: dotSize }}
          variants={DotVariants}
          transition={DotTransition}
        />
      </motion.div>
    </motion.div>
  );
};

const useStyles = mkUseStyles((t) => ({
  dotContainer: {
    width: '10rem',
    height: '5rem',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    userSelect: 'none',
  },
  dot: {
    display: 'block',
    backgroundColor: t.colors.white,
    borderRadius: '50%',
  },
}));
