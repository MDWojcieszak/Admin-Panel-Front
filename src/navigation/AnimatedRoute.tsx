import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { GlassCard } from '~/components/GlassCard';
import { useIsMobile } from '~/hooks/useBreakpoint';
import { mkUseStyles } from '~/utils/theme';
type AnimatedRouteProps = {
  children: ReactNode;
  /** When true, skip the full-screen glass card so the page can provide its own card. */
  bare?: boolean;
};
export const AnimatedRoute = ({ children, bare }: AnimatedRouteProps) => {
  const styles = useStyles();
  const isMobile = useIsMobile();

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
      style={isMobile ? styles.mobileContainer : styles.container}
      initial={{ scale: 0.98 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {bare ? (
        inner
      ) : (
        <GlassCard style={isMobile ? styles.mobileContent : styles.contentContainer}>{inner}</GlassCard>
      )}
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
  // Phone layout: the card fills the space under the top bar with a thin
  // margin — 16px of frame on each side is a tenth of a phone's width.
  mobileContainer: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    margin: t.spacing.xs,
    marginBottom: `calc(${t.spacing.xs}px + env(safe-area-inset-bottom, 0px))`,
  },
  mobileContent: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    position: 'relative',
    padding: t.spacing.sm,
    overflow: 'hidden',
  },
  motionContainer: {
    height: '100%',
    minWidth: 0,
    overflow: 'hidden',
  },
}));
