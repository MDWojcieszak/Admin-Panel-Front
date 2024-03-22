import { mkUseStyles, useTheme } from '~/utils/theme';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
const SCHEDULE_SIZE = 150;
const WIDTH = 12;
const RADIUS = SCHEDULE_SIZE / 2;

type CircularProgressProps = {
  progress: number;
  color?: string;
  icon?: ReactNode;
};

export const CircularProgress = ({ progress, ...p }: CircularProgressProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const innerRadius = RADIUS - WIDTH / 2;
  const progressColor = p.color || theme.colors.lightGreen;
  const circumfrence = 2 * Math.PI * innerRadius;

  const strokeDashoffset = ((100 - progress) / 100) * circumfrence;
  const backgroundStrokeWidth = WIDTH - 0.8;

  return (
    <div style={styles.timerContainer}>
      <div style={styles.circleContainer}>
        <motion.svg
          fill='none'
          height={SCHEDULE_SIZE}
          viewBox={`0 0 ${SCHEDULE_SIZE} ${SCHEDULE_SIZE}`}
          width={SCHEDULE_SIZE}
          style={{ rotate: 150 }}
        >
          <motion.circle
            cx={RADIUS}
            cy={RADIUS}
            r={innerRadius}
            stroke={theme.colors.gray01}
            strokeDasharray={circumfrence / 1.5}
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={backgroundStrokeWidth}
          />
          <motion.circle
            animate={{ strokeDashoffset: strokeDashoffset }}
            cx={RADIUS}
            cy={RADIUS}
            r={innerRadius}
            stroke={progressColor}
            strokeDasharray={circumfrence}
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={WIDTH}
          />
        </motion.svg>
      </div>
      {p.icon && <div style={styles.iconContainer}>{p.icon}</div>}
    </div>
  );
};

const useStyles = mkUseStyles(() => ({
  timerContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  circleContainer: {
    position: 'relative',
    width: RADIUS * 2,
    height: RADIUS * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
}));
