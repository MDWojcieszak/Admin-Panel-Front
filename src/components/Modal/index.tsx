import { AnimatePresence, motion } from 'framer-motion';
import { ReactElement } from 'react';
import { HiX } from 'react-icons/hi';
import useMeasure from 'react-use-measure';
import { GlassCard } from '~/components/GlassCard';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { mkUseStyles } from '~/utils/theme';

type ModalProps = {
  children: ReactElement;
} & InternalModalProps;

export const Modal = (p: ModalProps) => {
  const styles = useStyles();
  const [ref, { height }] = useMeasure();

  return (
    <AnimatePresence mode='wait' key={p.title}>
      {p.isVisible && (
        <div style={styles.container}>
          <motion.div
            style={styles.modalMask}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={p.handleClose}
          />
          <motion.div
            style={styles.modalContainer}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GlassCard style={styles.glassCard}>
              <div style={styles.titleContainer}>
                <div>{p.title}</div>
                <HiX size={24} onClick={p.handleClose} style={styles.icon} />
              </div>
              <motion.div
                className='flex flex-col gap-6'
                animate={{ height: height }}
                transition={{ duration: 0.3 }}
                initial={{ height: 0 }}
                exit={{ height: 0 }}
              >
                <div ref={ref}>{p.children}</div>
              </motion.div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    position: 'absolute',
    zIndex: 20,
    overflowY: 'hidden',
  },
  glassCard: {
    padding: t.spacing.m,
    gap: t.spacing.m,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 18,
  },
  icon: {
    cursor: 'pointer',
  },
  modalMask: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 10,

    backgroundColor: t.colors.gray02 + t.colorOpacity(0.15),
    backdropFilter: 'blur(40px) saturate(135%)',
    webkitBackdropFilter: 'blur(40px) saturate(135%)',
  },
}));
