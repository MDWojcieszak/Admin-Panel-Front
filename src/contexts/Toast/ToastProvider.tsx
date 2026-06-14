import { ReactNode, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MdCheckCircle, MdClose, MdErrorOutline, MdInfoOutline } from 'react-icons/md';
import { ShowToast, ToastContext, ToastType } from '~/contexts/Toast/ToastContext';
import { mkUseStyles, useTheme } from '~/utils/theme';

type Toast = { id: number; message: string; type: ToastType };

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const styles = useStyles();
  const theme = useTheme();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const remove = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const show = useCallback<ShowToast>(
    (message, type = 'info') => {
      const id = ++counter.current;
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => remove(id), 5000);
    },
    [remove],
  );

  const colorOf = (type: ToastType) =>
    type === 'error' ? theme.colors.red : type === 'success' ? theme.colors.mainGreen : theme.colors.blue;
  const iconOf = (type: ToastType) =>
    type === 'error' ? <MdErrorOutline size={18} /> : type === 'success' ? <MdCheckCircle size={18} /> : <MdInfoOutline size={18} />;

  return (
    <ToastContext.Provider value={show}>
      {children}
      {createPortal(
        <div style={styles.container}>
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ type: 'spring', stiffness: 340, damping: 32 }}
                style={{ ...styles.toast, borderLeft: `3px solid ${colorOf(t.type)}` }}
              >
                <span style={{ ...styles.icon, color: colorOf(t.type) }}>{iconOf(t.type)}</span>
                <span style={styles.message}>{t.message}</span>
                <button style={styles.close} onClick={() => remove(t.id)} title='Dismiss'>
                  <MdClose size={15} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    position: 'fixed',
    right: t.spacing.l,
    bottom: t.spacing.l,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.s,
    maxWidth: 380,
    pointerEvents: 'none',
  },
  toast: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.s,
    padding: `${t.spacing.s}px ${t.spacing.sm}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02,
    color: t.colors.white,
    boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
    pointerEvents: 'auto',
  },
  icon: { display: 'flex', alignItems: 'center', marginTop: 1 },
  message: { flex: 1, minWidth: 0, fontSize: 13, lineHeight: 1.4 },
  close: {
    border: 0,
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    marginTop: 1,
  },
}));
