import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdHub, MdMonitorHeart, MdSettings } from 'react-icons/md';
import { GlassCard } from '~/components/GlassCard';
import { Item } from '~/components/SideBar/Item';
import { useAuth } from '~/hooks/useAuth';
import { useCan, usePermissions } from '~/hooks/usePermissions';
import { hasAccess } from '~/acl/permissions';
import { MainNavigationRoute, MainRouteType } from '~/navigation/types';
import { mkUseStyles, useTheme } from '~/utils/theme';

const WIDTH = 250;

type SideBarProps = {
  items: MainRouteType[];
};

export const SideBar = ({ items }: SideBarProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const can = useCan();
  const { role } = usePermissions();
  const email = auth.userData?.email;

  const current = location.pathname.split('/')[1];
  const currentSub = location.pathname.split('/')[2] ?? '';

  const visibleItems = items.filter((item) => hasAccess(can, item.permission));
  const settingsActive = current === MainNavigationRoute.SETTINGS;
  const accountActive = current === MainNavigationRoute.ACCOUNT;
  const systemStatusActive = current === MainNavigationRoute.SYSTEM_STATUS;
  const integrationsActive = current === MainNavigationRoute.INTEGRATIONS;
  const canSystemStatus = can('system.read');
  const canIntegrations = can('token.read');

  return (
    <GlassCard style={styles.container}>
      <div style={styles.top}>
        <img
          src='/full_logo.png'
          alt='Applogy'
          title='About Applogy'
          style={styles.logo}
          onClick={() => navigate('/' + MainNavigationRoute.ABOUT)}
        />
        <div style={styles.itemContainer}>
          {visibleItems.map((item) => {
            const active = current === item.path;
            const subs = (item.subItems ?? []).filter((s) => hasAccess(can, s.permission));
            return (
              <div key={item.path} style={styles.itemGroup}>
                <Item label={item.label} path={item.path} permission={item.permission} isActive={active} />
                <AnimatePresence initial={false}>
                  {active && subs.length > 1 ? (
                    <motion.div
                      key='subitems'
                      style={styles.subItemsWrap}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <div style={styles.subItems}>
                        {subs.map((sub, i) => {
                          const subActive = currentSub === sub.path;
                          return (
                            <motion.div
                              key={sub.path || 'index'}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.06 + i * 0.06, duration: 0.2, ease: 'easeOut' }}
                              whileHover={{ x: 3 }}
                              style={{ ...styles.subItem, color: subActive ? theme.colors.blue : theme.colors.dark05 }}
                              onClick={() => navigate('/' + item.path + (sub.path ? '/' + sub.path : ''))}
                            >
                              {sub.label}
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.footer}>
        {canSystemStatus ? (
          <div
            style={{ ...styles.settingsRow, color: systemStatusActive ? theme.colors.blue : theme.colors.dark05 }}
            onClick={() => navigate('/' + MainNavigationRoute.SYSTEM_STATUS)}
          >
            <MdMonitorHeart size={20} />
            <span>System Status</span>
          </div>
        ) : null}

        {canIntegrations ? (
          <div
            style={{ ...styles.settingsRow, color: integrationsActive ? theme.colors.blue : theme.colors.dark05 }}
            onClick={() => navigate('/' + MainNavigationRoute.INTEGRATIONS)}
          >
            <MdHub size={20} />
            <span>Integrations</span>
          </div>
        ) : null}

        <div
          style={{ ...styles.settingsRow, color: settingsActive ? theme.colors.blue : theme.colors.dark05 }}
          onClick={() => navigate('/' + MainNavigationRoute.SETTINGS)}
        >
          <MdSettings size={20} />
          <span>User Settings</span>
        </div>

        <div
          style={{
            ...styles.userChip,
            borderColor: accountActive ? theme.colors.blue : 'transparent',
          }}
          onClick={() => navigate('/' + MainNavigationRoute.ACCOUNT)}
          title='Account'
        >
          <div style={styles.avatar}>{(email?.[0] ?? '?').toUpperCase()}</div>
          <div style={styles.userInfo}>
            <span style={styles.userEmail}>{email ?? 'Account'}</span>
            {role ? <span style={styles.userRole}>{role}</span> : null}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    width: WIDTH,
    margin: t.spacing.m,
    height: `calc(100% - ${t.spacing.m * 2}px)`,
    justifyContent: 'space-between',
  },
  top: {
    gap: t.spacing.l,
  },
  logo: {
    display: 'block',
    width: 150,
    maxWidth: '85%',
    height: 'auto',
    objectFit: 'contain',
    alignSelf: 'center',
    cursor: 'pointer',
    marginTop: t.spacing.m,
    marginBottom: t.spacing.s,
  },
  itemContainer: {},
  itemGroup: {},
  subItemsWrap: {
    overflow: 'hidden',
  },
  subItems: {
    paddingLeft: t.spacing.l,
    paddingTop: t.spacing.xxs,
    paddingBottom: t.spacing.s,
    gap: t.spacing.xs,
  },
  subItem: {
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: 13,
    fontWeight: 600,
    paddingTop: t.spacing.xs,
    paddingBottom: t.spacing.xs,
  },
  footer: {
    gap: t.spacing.s,
    padding: t.spacing.m,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    userSelect: 'none',
    fontWeight: 600,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: 'pointer',
  },
  avatar: {
    width: 34,
    height: 34,
    minWidth: 34,
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    color: t.colors.white,
    backgroundColor: t.colors.blue,
  },
  userInfo: {
    gap: 1,
    minWidth: 0,
    flex: 1,
  },
  userEmail: {
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: 11,
    color: t.colors.dark05,
  },
}));
