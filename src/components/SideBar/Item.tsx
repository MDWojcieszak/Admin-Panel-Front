import { useNavigate } from 'react-router-dom';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MdArticle,
  MdCollections,
  MdGroup,
  MdInbox,
  MdPhotoCamera,
  MdSettings,
  MdShield,
  MdSpaceDashboard,
} from 'react-icons/md';

import { Permission } from '~/acl/permissions';
import { MainNavigationRoute } from '~/navigation/types';
import { FaCodeBranch, FaServer } from 'react-icons/fa6';
import { FiMonitor } from 'react-icons/fi';

const ICON_SIZE = 20;

export type SideBarItem = {
  label: string;
  path: MainNavigationRoute;
  isActive: boolean;
  permission?: Permission | Permission[];
  /** A count shown beside the label, e.g. unread inquiries. Hidden at 0. */
  badge?: number;
  /** Marks a section that only shows "open it on a computer" on this device. */
  desktopHint?: boolean;
};

export const Item = (p: SideBarItem) => {
  const styles = useStyles();
  const theme = useTheme();

  const color = p.isActive ? theme.colors.blue : theme.colors.dark05;
  const navigate = useNavigate();
  const handlePress = () => {
    navigate(p.path);
  };

  const iconProps = { fill: color, size: ICON_SIZE };
  const renderIcon = () => {
    switch (p.path) {
      case MainNavigationRoute.DASHBOARD:
        return <MdSpaceDashboard {...iconProps} />;
      case MainNavigationRoute.SERVERS:
        return <FaServer {...iconProps} />;
      case MainNavigationRoute.DEPLOY:
        return <FaCodeBranch {...iconProps} />;
      case MainNavigationRoute.PHOTO_MANAGEMENT:
        return <MdPhotoCamera {...iconProps} />;
      case MainNavigationRoute.GALLERIES:
        return <MdCollections {...iconProps} />;
      case MainNavigationRoute.INQUIRIES:
        return <MdInbox {...iconProps} />;
      case MainNavigationRoute.BLOG:
        return <MdArticle {...iconProps} />;
      case MainNavigationRoute.ACCOUNTS:
        return <MdGroup {...iconProps} />;
      case MainNavigationRoute.ACCESS_CONTROL:
        return <MdShield {...iconProps} />;
      case MainNavigationRoute.SETTINGS:
        return <MdSettings {...iconProps} />;
    }
  };
  return (
    <div style={styles.container} onClick={handlePress}>
      <AnimatePresence mode='sync' key={'menu-item' + p.path}>
        {p.isActive && (
          <motion.div
            key={p.path + p.label}
            initial={{ opacity: 0, width: 0 }}
            animate={{ backgroundColor: color, opacity: 1, width: 4 }}
            exit={{ opacity: 0, width: 0 }}
            style={styles.box}
          />
        )}
      </AnimatePresence>
      <motion.p animate={{ color }} style={styles.label}>
        {p.label}
        {p.badge ? <span style={styles.badge}>{p.badge > 99 ? '99+' : p.badge}</span> : null}
        {p.desktopHint ? (
          <span style={styles.desktopHint} title='Best on a computer'>
            <FiMonitor size={13} />
          </span>
        ) : null}
      </motion.p>
      {renderIcon()}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    cursor: 'pointer',
    flexDirection: 'row',
    userSelect: 'none',
    alignItems: 'center',
    paddingRight: t.spacing.l,
    height: 50,
  },
  box: {
    height: '25px',
    borderTopRightRadius: t.borderRadius.medium,
    borderBottomRightRadius: t.borderRadius.medium,
    width: '4px',
  },
  label: { marginLeft: t.spacing.m, flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 },
  desktopHint: { display: 'flex', color: t.colors.dark05, opacity: 0.7 },
  badge: {
    minWidth: 18,
    height: 18,
    padding: '0 6px',
    boxSizing: 'border-box',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    lineHeight: '18px',
    textAlign: 'center',
    color: t.colors.white,
    backgroundColor: t.colors.blue,
  },
}));
