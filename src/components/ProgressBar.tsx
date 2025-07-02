import { mkUseStyles } from '~/utils/theme';
import { motion } from 'framer-motion';
type ProgressBarProps = {
  progress: number;
};

const HEIGHT = 10;

export const ProgressBar = (p: ProgressBarProps) => {
  const styles = useStyles();
  return (
    <div style={styles.container}>
      <motion.div
        animate={{ width: `${p.progress}%` }}
        initial={{ width: '0%' }}
        transition={{ duration: 1, ease: 'easeInOut' }}
        style={{ ...styles.progress }}
      ></motion.div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    height: HEIGHT,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray01,
  },
  progress: {
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.lightGreen,
    height: HEIGHT,
  },
}));
