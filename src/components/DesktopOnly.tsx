import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { FiCamera, FiCheck, FiChevronLeft, FiImage, FiInbox, FiLink, FiMonitor, FiSend, FiSmartphone } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Permission, hasAccess } from '~/acl/permissions';
import { useIsMobile } from '~/hooks/useBreakpoint';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { MainNavigationRoute } from '~/navigation/types';
import { mkUseStyles, useTheme } from '~/utils/theme';

type DesktopOnlyProps = {
  /** The section's name, as the menu shows it. */
  label: string;
  /** The page itself — rendered as usual on a computer, or on a phone after "Show it anyway". */
  children: ReactNode;
  /**
   * For a page outside the app's frame (the post editor has no top bar or card):
   * the notice brings its own backdrop and a way back.
   */
  back?: { label: string; path: string };
};

const SHORTCUTS: { label: string; path: string; icon: ReactNode; permission?: Permission }[] = [
  { label: 'Library', path: MainNavigationRoute.PHOTO_MANAGEMENT, icon: <FiCamera size={15} />, permission: 'photoEntry.read' },
  { label: 'Gallery', path: MainNavigationRoute.GALLERIES, icon: <FiImage size={15} />, permission: 'gallery.manage' },
  { label: 'Inbox', path: MainNavigationRoute.INQUIRIES, icon: <FiInbox size={15} />, permission: 'inquiry.read' },
];

const shownAnyway = (label: string) => {
  try {
    return sessionStorage.getItem('desktop-only:' + label) === '1';
  } catch {
    return false;
  }
};

/**
 * Sections built for a big screen — editors, logs, wide tables — say so on a
 * phone instead of rendering squeezed and half-usable. The way out is to get
 * the link onto a computer; "Show it anyway" stays for the odd emergency
 * (restarting a server from the road), remembered until the tab is closed.
 */
export const DesktopOnly = ({ label, children, back }: DesktopOnlyProps) => {
  const isMobile = useIsMobile();
  const [anyway, setAnyway] = useState(() => shownAnyway(label));

  if (!isMobile || anyway) return <>{children}</>;

  return (
    <DesktopOnlyNotice
      label={label}
      back={back}
      onShowAnyway={() => {
        try {
          sessionStorage.setItem('desktop-only:' + label, '1');
        } catch {
          // Not remembered; it still opens now.
        }
        setAnyway(true);
      }}
    />
  );
};

const DesktopOnlyNotice = ({
  label,
  back,
  onShowAnyway,
}: {
  label: string;
  back?: DesktopOnlyProps['back'];
  onShowAnyway: () => void;
}) => {
  const styles = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const can = useCan();
  const [copied, setCopied] = useState(false);

  const url = window.location.href;
  const canShare = typeof navigator.share === 'function';
  const shortcuts = SHORTCUTS.filter((s) => hasAccess(can, s.permission));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast('Link copied — open it on your computer.', 'success');
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      toast('Could not copy the link.', 'error');
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: `${label} · Applogy`, url });
    } catch {
      // Closing the share sheet is not an error worth a toast.
    }
  };

  return (
    <motion.div
      style={back ? { ...styles.wrap, ...styles.standalone } : styles.wrap}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {back ? (
        <button type='button' style={styles.back} onClick={() => navigate(back.path)}>
          <FiChevronLeft size={18} />
          {back.label}
        </button>
      ) : null}

      <div style={styles.art}>
        <div style={styles.glow} />
        <motion.div
          style={styles.monitor}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <FiMonitor size={46} strokeWidth={1.4} />
        </motion.div>
        <motion.div
          style={styles.phone}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 320, damping: 18 }}
        >
          <FiSmartphone size={18} />
        </motion.div>
      </div>

      <div style={styles.text}>
        <span style={styles.eyebrow}>Best on a computer</span>
        <h2 style={styles.title}>{label} needs a bigger screen</h2>
        <p style={styles.body}>
          This part of the panel is built for a desktop — on a phone it would only be squeezed. Open the same page on
          your computer and pick up right where you are.
        </p>
      </div>

      <div style={styles.actions}>
        {canShare ? (
          <button type='button' style={{ ...styles.button, ...styles.primary }} onClick={share}>
            <FiSend size={16} />
            Send to my computer
          </button>
        ) : null}
        <button
          type='button'
          style={{ ...styles.button, ...(canShare ? styles.secondary : styles.primary) }}
          onClick={copy}
        >
          {copied ? <FiCheck size={16} /> : <FiLink size={16} />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>

      {shortcuts.length ? (
        <div style={styles.shortcuts}>
          <span style={styles.shortcutsLabel}>Works great on your phone</span>
          <div style={styles.shortcutRow}>
            {shortcuts.map((s) => (
              <button key={s.path} type='button' style={styles.shortcut} onClick={() => navigate('/' + s.path)}>
                <span style={{ color: theme.colors.blue }}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button type='button' style={styles.anyway} onClick={onShowAnyway}>
        Show it anyway
      </button>
    </motion.div>
  );
};

const useStyles = mkUseStyles((t) => ({
  wrap: {
    flex: 1,
    minHeight: '100%',
    overflowY: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.l,
    padding: `${t.spacing.xl}px ${t.spacing.m}px`,
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  standalone: {
    position: 'relative',
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.88),
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
  back: {
    position: 'absolute',
    top: `calc(${t.spacing.s}px + env(safe-area-inset-top, 0px))`,
    left: t.spacing.s,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 40,
    padding: '0 10px 0 4px',
    border: 'none',
    background: 'transparent',
    color: t.colors.blue,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  art: {
    position: 'relative',
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  glow: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: `radial-gradient(circle at 35% 30%, ${t.colors.blue}55, ${t.colors.purple01}33 55%, transparent 72%)`,
    filter: 'blur(6px)',
  },
  monitor: {
    position: 'relative',
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    color: t.colors.white,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.85),
    border: `1px solid ${t.colors.blue02 + t.colorOpacity(0.6)}`,
    boxShadow: '0 18px 40px rgba(0, 0, 0, 0.35)',
  },
  phone: {
    position: 'absolute',
    right: 10,
    bottom: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    color: t.colors.white,
    backgroundColor: t.colors.purple01,
    boxShadow: `0 0 0 4px ${t.colors.gray05}`,
  },
  text: { gap: t.spacing.s, maxWidth: 360, alignItems: 'center' },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: t.colors.blue,
  },
  title: { margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.25, color: t.colors.white },
  body: { margin: 0, fontSize: 14, lineHeight: 1.55, color: t.colors.dark05 },
  actions: { width: '100%', maxWidth: 340, gap: t.spacing.s },
  button: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.s,
    height: 50,
    borderRadius: t.borderRadius.large,
    border: 'none',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    color: t.colors.white,
  },
  primary: { backgroundColor: t.colors.blue },
  secondary: { backgroundColor: t.colors.gray01 + t.colorOpacity(0.6) },
  shortcuts: {
    width: '100%',
    maxWidth: 340,
    gap: t.spacing.s,
    paddingTop: t.spacing.m,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
    alignItems: 'center',
  },
  shortcutsLabel: { fontSize: 12, color: t.colors.dark05 },
  shortcutRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: t.spacing.s },
  shortcut: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    padding: '0 14px',
    borderRadius: 999,
    border: `1px solid ${t.colors.dark04 + t.colorOpacity(0.5)}`,
    background: 'transparent',
    color: t.colors.white,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  anyway: {
    border: 'none',
    background: 'transparent',
    color: t.colors.dark05,
    fontSize: 13,
    textDecoration: 'underline',
    textUnderlineOffset: 3,
    cursor: 'pointer',
    padding: t.spacing.s,
  },
}));
