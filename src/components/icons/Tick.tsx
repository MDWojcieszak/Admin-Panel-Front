import { motion } from 'framer-motion';

type AnimatedTickProps = {
  size?: number;
};

export const AnimatedTick = ({ size = 24 }: AnimatedTickProps) => {
  return (
    <motion.svg
      width={size}
      animate={{ width: size }}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={2}
      stroke='currentColor'
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
