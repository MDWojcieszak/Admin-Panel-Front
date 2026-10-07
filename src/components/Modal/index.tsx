import { AnimatePresence, DragControls, motion, useDragControls } from 'framer-motion';
import { ReactElement, createContext, useContext, useEffect, useState } from 'react';
import { HiX } from 'react-icons/hi';
import useMeasure from 'react-use-measure';
import { GlassCard } from '~/components/GlassCard';
import { Scrollbar } from '~/components/Scrollbar';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useIsMobile } from '~/hooks/useBreakpoint';
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
  const isMobile = useIsMobile();
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
        // On a phone the panel is the whole screen: a narrower strip beside a
        // page nobody can read at that width would only waste the room.
        style={isMobile ? { ...styles.sidePanel, ...styles.sidePanelMobile } : styles.sidePanel}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.32 }}
        onAnimationComplete={() => setReady(true)}
      >
        <GlassCard style={isMobile ? { ...styles.sideCard, ...styles.sideCardMobile } : styles.sideCard}>
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

/**
 * The phone layout's dialog: a sheet from the bottom edge, full width, closed
 * by the X, a tap on the dimmed page or a swipe down on its header.
 */
const BottomSheet = (p: ModalProps) => {
  const styles = useStyles();
  const drag = useDragControls();

  return (
    <div style={styles.sheetContainer}>
      <motion.div
        style={styles.modalMask}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={p.handleClose}
      />
      <motion.div
        style={styles.sheet}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
        drag={p.handleClose ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        // Only the header starts a swipe; the body has to scroll.
        dragListener={false}
        dragControls={drag}
        onDragEnd={(_, info) => (info.offset.y > 100 || info.velocity.y > 600) && p.handleClose?.()}
      >
        <SheetHeader {...p} drag={drag} />
        <div style={styles.sheetBody} className='modal-sheet-body'>
          {p.children}
        </div>
      </motion.div>
    </div>
  );
};

const SheetHeader = (p: ModalProps & { drag: DragControls }) => {
  const styles = useStyles();
  return (
    <div style={styles.sheetHeader} onPointerDown={(e) => p.drag.start(e)}>
      <div style={styles.sheetHandle} />
      {p.showHeader === false ? null : (
        <div style={styles.titleContainer}>
          <div style={styles.sheetTitle}>{p.title}</div>
          {p.handleClose ? <HiX size={24} onClick={p.handleClose} style={styles.icon} /> : null}
        </div>
      )}
    </div>
  );
};

export const Modal = (p: ModalProps) => {
  const styles = useStyles();
  const isMobile = useIsMobile();
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

  if (isMobile) {
    return (
      <AnimatePresence mode='wait' key={p.title}>
        {p.isVisible && <BottomSheet {...p} />}
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
                {/* No shrinking while the dialog animates open from 0: the library decides on its track once, at mount. */}
                <Scrollbar maxHeight={maxBody} horizontal={false} style={{ flexShrink: 0 }}>
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
  sidePanelMobile: { width: '100vw', padding: 0 },
  sideCardMobile: {
    borderRadius: 0,
    borderWidth: 0,
    padding: t.spacing.sm,
    paddingTop: `calc(${t.spacing.sm}px + env(safe-area-inset-top, 0px))`,
    paddingBottom: `calc(${t.spacing.sm}px + env(safe-area-inset-bottom, 0px))`,
    gap: t.spacing.sm,
    boxShadow: 'none',
  },
  sheetContainer: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  sheet: {
    position: 'relative',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100dvh - 40px - env(safe-area-inset-top, 0px))',
    backgroundColor: t.colors.gray045,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTop: `1px solid ${t.colors.blue02 + t.colorOpacity(0.3)}`,
    boxShadow: '0 -12px 40px rgba(0, 0, 0, 0.45)',
  },
  sheetHeader: { flexShrink: 0, touchAction: 'none', paddingLeft: t.spacing.m, paddingRight: t.spacing.m, paddingBottom: t.spacing.s },
  sheetHandle: {
    width: 38,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: t.spacing.s,
    marginBottom: t.spacing.s,
    backgroundColor: t.colors.dark05 + t.colorOpacity(0.4),
  },
  sheetTitle: { fontWeight: 700 },
  sheetBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    paddingLeft: t.spacing.m,
    paddingRight: t.spacing.m,
    paddingBottom: `calc(${t.spacing.m}px + env(safe-area-inset-bottom, 0px))`,
  },
  sideBody: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
}));
