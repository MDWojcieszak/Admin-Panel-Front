import { motion } from 'framer-motion';
import { useLayoutEffect, useRef } from 'react';
import { MdMenu } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { hasAccess } from '~/acl/permissions';
import { useInquiryUnread } from '~/hooks/useInquiryUnread';
import { useCan } from '~/hooks/usePermissions';
import { MainNavigationRoute, MainRouteType } from '~/navigation/types';
import { mkUseStyles, useTheme } from '~/utils/theme';

type MobileTopBarProps = {
  /** Every route the bar may have to name — the sidebar's items and the footer pages. */
  items: MainRouteType[];
  onMenu: () => void;
};

/**
 * The phone layout's header: the menu button, the section's name and — where
 * the sidebar would list sub-pages under the active item — those sub-pages as
 * a row of tabs, so moving between them does not mean opening the menu.
 */
export const MobileTopBar = ({ items, onMenu }: MobileTopBarProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const can = useCan();
  const unread = useInquiryUnread();

  const [, current = '', currentSub = ''] = location.pathname.split('/');
  const section = items.find((item) => item.path === current);
  // A desktop-only section shows its notice, not sub-pages to switch between.
  const subs = section?.desktopOnly ? [] : (section?.subItems ?? []).filter((s) => hasAccess(can, s.permission));
  const activeTab = useRef<HTMLDivElement>(null);

  // Keep the active tab in view when the row is wider than the screen.
  useLayoutEffect(() => {
    activeTab.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [currentSub, current]);

  return (
    <div style={styles.bar}>
      <div style={styles.row}>
        <button type='button' style={styles.menu} onClick={onMenu} aria-label='Open menu'>
          <MdMenu size={24} />
          {unread > 0 && current !== MainNavigationRoute.INQUIRIES ? <span style={styles.dot} /> : null}
        </button>
        <span style={styles.title}>{section?.label ?? 'Applogy'}</span>
        <img src='/logo.png' alt='' style={styles.logo} />
      </div>

      {subs.length > 1 ? (
        <div style={styles.tabs} className='no-scrollbar'>
          {subs.map((sub) => {
            const active = currentSub === sub.path;
            return (
              <div
                key={sub.path || 'index'}
                ref={active ? activeTab : undefined}
                style={{ ...styles.tab, color: active ? theme.colors.white : theme.colors.dark05 }}
                onClick={() => navigate('/' + current + (sub.path ? '/' + sub.path : ''))}
              >
                {sub.label}
                {active ? <motion.span layoutId='mobile-subtab' style={styles.underline} /> : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  bar: {
    flexShrink: 0,
    paddingTop: 'env(safe-area-inset-top, 0px)',
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.7),
    backdropFilter: 'blur(23px) saturate(161%)',
    WebkitBackdropFilter: 'blur(23px) saturate(161%)',
    borderBottom: `1px solid ${t.colors.blue02 + t.colorOpacity(0.25)}`,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    height: 52,
    paddingLeft: t.spacing.xxs,
    paddingRight: t.spacing.m,
  },
  menu: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    border: 0,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
    borderRadius: t.borderRadius.large,
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: t.colors.blue,
    boxShadow: `0 0 0 2px ${t.colors.gray05}`,
  },
  title: { flex: 1, minWidth: 0, fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logo: { width: 26, height: 26, objectFit: 'contain', opacity: 0.9 },
  tabs: {
    flexDirection: 'row',
    gap: t.spacing.l,
    overflowX: 'auto',
    paddingLeft: t.spacing.m,
    paddingRight: t.spacing.m,
    scrollbarWidth: 'none',
  },
  tab: {
    position: 'relative',
    flexShrink: 0,
    paddingTop: t.spacing.xs,
    paddingBottom: t.spacing.sm,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  },
  underline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: t.colors.blue,
  },
}));
