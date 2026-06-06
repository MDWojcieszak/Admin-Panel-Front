import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { GlassCard } from '~/components/GlassCard';
import { mkUseStyles } from '~/utils/theme';
type AnimatedRouteProps = {
  children: ReactNode;
  /** When true, skip the full-screen glass card so the page can provide its own card. */
  bare?: boolean;
};
export const AnimatedRoute = ({ children, bare }: AnimatedRouteProps) => {
  const styles = useStyles();

  const inner = (
    <motion.div
      style={styles.motionContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );

  return (
    <motion.div
      style={styles.container}
      initial={{ scale: 0.98 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {bare ? inner : <GlassCard style={styles.contentContainer}>{inner}</GlassCard>}
    </motion.div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    width: '100%',
    minWidth: 0,
    margin: t.spacing.m,
    marginLeft: 0,
    height: `calc(100% - ${t.spacing.m * 2}px)`,
  },
  contentContainer: {
    width: `calc(100% - ${t.spacing.m * 2}px)`,
    minWidth: 0,
    position: 'relative',
    height: '100%',
    padding: t.spacing.m,
    overflow: 'hidden',
  },
  motionContainer: {
    height: '100%',
    minWidth: 0,
    overflow: 'hidden',
  },
}));
