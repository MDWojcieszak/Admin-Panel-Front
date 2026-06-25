import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdMonitorHeart, MdSettings } from 'react-icons/md';
import { GlassCard } from '~/components/GlassCard';
import { Item, SideBarItem } from '~/components/SideBar/Item';
import { useAuth } from '~/hooks/useAuth';
import { useCan, usePermissions } from '~/hooks/usePermissions';
import { hasAccess } from '~/acl/permissions';
import { MainNavigationRoute } from '~/navigation/types';
import { mkUseStyles, useTheme } from '~/utils/theme';

const WIDTH = 250;

type SideBarProps = {
  items: Omit<SideBarItem, 'isActive'>[];
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

  const renderItem = useCallback(
    (item: Omit<SideBarItem, 'isActive'>) => {
      return <Item {...item} key={item.path} isActive={current === item.path} />;
    },
    [current],
  );

  const visibleItems = items.filter((item) => hasAccess(can, item.permission));
  const settingsActive = current === MainNavigationRoute.SETTINGS;
  const accountActive = current === MainNavigationRoute.ACCOUNT;
  const systemStatusActive = current === MainNavigationRoute.SYSTEM_STATUS;
  const canSystemStatus = can('system.read');

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
        <div style={styles.itemContainer}>{visibleItems.map(renderItem)}</div>
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
