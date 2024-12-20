import { motion } from 'framer-motion';
import { Theme, useTheme } from '~/utils/theme';

type AnimatedTickProps = {
  size?: number;
  color?: keyof Theme['colors'];
};

export const AnimatedTick = ({ size = 24, color = 'white' }: AnimatedTickProps) => {
  const theme = useTheme();
  return (
    <motion.svg
      width={size}
      animate={{ width: size }}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={3}
      stroke={theme.colors[color]}
    >
      <motion.path
        strokeLinecap='round'
        strokeLinejoin='round'
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        d='M4.5 12.75l6 6 9-13.5'
      />
    </motion.svg>
  );
};
