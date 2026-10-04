import { AnimatePresence, motion } from 'framer-motion';
import { ReactElement, createContext, useContext, useEffect, useState } from 'react';
import { HiX } from 'react-icons/hi';
import useMeasure from 'react-use-measure';
import { GlassCard } from '~/components/GlassCard';
import { Scrollbar } from '~/components/Scrollbar';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { mkUseStyles } from '~/utils/theme';

/** Title bar, card padding and a margin above and below the dialog. */
const MODAL_CHROME = 160;

type ModalProps = {
  children: ReactElement;
} & InternalModalProps;

/**
 * False while a side panel is still sliding in. Heavy content (lists that
 * fetch, maps) waits for it, so the slide is not fighting a mount on the same
 * frames. Outside a side panel it is always true.
 */
const SidePanelReadyContext = createContext(true);

export const useSidePanelReady = () => useContext(SidePanelReadyContext);

const SidePanel = (p: ModalProps) => {
  const styles = useStyles();
  const [ready, setReady] = useState(false);

  return (
    <div style={styles.container}>
      <motion.div
        style={styles.sideMask}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={p.handleClose}
      />
      <motion.div
        style={styles.sidePanel}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.32 }}
        onAnimationComplete={() => setReady(true)}
      >
        <GlassCard style={styles.sideCard}>
          {p.showHeader === false ? null : (
            <div style={styles.titleContainer}>
              <div>{p.title}</div>
              <HiX size={24} onClick={p.handleClose} style={styles.icon} />
            </div>
          )}
          <div style={styles.sideBody}>
            <SidePanelReadyContext.Provider value={ready}>{p.children}</SidePanelReadyContext.Provider>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export const Modal = (p: ModalProps) => {
  const styles = useStyles();
  const [ref, { height }] = useMeasure();
  // A tall dialog (a pasted compose file) scrolls inside instead of running off the screen.
  const [maxBody, setMaxBody] = useState(() => window.innerHeight - MODAL_CHROME);
  useEffect(() => {
    const onResize = () => setMaxBody(window.innerHeight - MODAL_CHROME);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // A panel docked to the right edge at full height, for content too large to
  // sit in a centred dialog. The page stays readable beside it — the mask only
  // dims, it does not blur the page away — so the panel reads as a closer look
  // at something on the page rather than a detour from it.
  if (p.type === 'side') {
    return (
      <AnimatePresence mode='wait' key={p.title}>
        {p.isVisible && <SidePanel {...p} />}
      </AnimatePresence>
    );
  }

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
              {p.showHeader === false ? null : (
                <div style={styles.titleContainer}>
                  <div>{p.title}</div>
                  <HiX size={24} onClick={p.handleClose} style={styles.icon} />
                </div>
              )}
              <motion.div
                className='flex flex-col gap-6'
                animate={{ height: Math.min(height, maxBody) }}
                transition={{ duration: 0.3 }}
                initial={{ height: 0 }}
                exit={{ height: 0 }}
              >
                <Scrollbar maxHeight={maxBody} horizontal={false}>
                  {/* Room for the track once it scrolls, so it never sits on a field. */}
                  <div ref={ref} style={{ paddingRight: height > maxBody ? 16 : 0 }}>
                    {p.children}
                  </div>
                </Scrollbar>
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
    zIndex: 200,
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
    flexShrink: 0,
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
    // Same light backdrop as the side card: the page stays readable behind
    // the dialog instead of dissolving into a 40px smear.
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.45),
    backdropFilter: 'blur(3px)',
    webkitBackdropFilter: 'blur(3px)',
  },
  sideMask: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.45),
    backdropFilter: 'blur(3px)',
    webkitBackdropFilter: 'blur(3px)',
  },
  sidePanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    width: 'min(1240px, 94vw)',
    padding: t.spacing.m,
    boxSizing: 'border-box',
    // Its own compositor layer, so the slide is a cheap transform.
    willChange: 'transform',
  },
  sideCard: {
    height: '100%',
    boxSizing: 'border-box',
    padding: t.spacing.m,
    gap: t.spacing.m,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.92),
    boxShadow: '-18px 0 48px rgba(0, 0, 0, 0.35)',
    // At 92% opacity the glass blur is all but invisible, yet a moving blurred
    // layer is re-blurred on every frame of the slide — the main cause of the
    // stutter. The panel goes without it.
    backdropFilter: 'none',
    webkitBackdropFilter: 'none',
  },
  sideBody: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
}));
