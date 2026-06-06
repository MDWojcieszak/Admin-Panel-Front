import { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '~/components/GlassCard';
import { mkUseStyles } from '~/utils/theme';

type CenteredCardProps = {
  children: ReactNode;
  /** Max width of the card in px. */
  maxWidth?: number;
  style?: CSSProperties;
};

/** A horizontally centered, animated card used for focused single-column pages. */
export const CenteredCard = ({ children, maxWidth = 560, style }: CenteredCardProps) => {
  const styles = useStyles();
  return (
    <div style={styles.page}>
      <motion.div
        style={{ ...styles.wrap, maxWidth }}
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <GlassCard style={{ ...styles.card, ...style }}>{children}</GlassCard>
      </motion.div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  page: {
    height: '100%',
    overflowY: 'auto',
    alignItems: 'center',
    paddingTop: t.spacing.m,
    paddingBottom: t.spacing.m,
  },
  wrap: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  card: {
    gap: t.spacing.l,
    padding: t.spacing.l,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.88),
  },
}));
