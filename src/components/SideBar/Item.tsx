import { useNavigate } from 'react-router-dom';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MdArticle,
  MdChecklist,
  MdCollections,
  MdFolder,
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
const COMPACT_HEIGHT = 40;

export type SideBarItem = {
  label: string;
  path: MainNavigationRoute;
  isActive: boolean;
  permission?: Permission | Permission[];
  /** A count shown beside the label, e.g. unread inquiries. Hidden at 0. */
  badge?: number;
  /** Marks a section that only shows "open it on a computer" on this device. */
  desktopHint?: boolean;
  /** Shorter rows, for a screen too low to show the whole menu at full size. */
  compact?: boolean;
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
      case MainNavigationRoute.PROJECTS:
        return <MdChecklist {...iconProps} />;
      case MainNavigationRoute.DOCUMENTS:
        return <MdFolder {...iconProps} />;
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
    <motion.div
      style={p.compact ? { ...styles.container, height: COMPACT_HEIGHT } : styles.container}
      onClick={handlePress}
      initial={false}
      whileHover={{ backgroundColor: theme.colors.white + theme.colorOpacity(0.05) }}
      transition={{ duration: 0.12 }}
    >
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
      {/* Icon first: the row reads like the footer links and starts where the eye lands. */}
      <span style={styles.icon}>{renderIcon()}</span>
      <motion.p animate={{ color }} style={styles.label}>
        {p.label}
        {p.badge ? <span style={styles.badge}>{p.badge > 99 ? '99+' : p.badge}</span> : null}
        {p.desktopHint ? (
          <span style={styles.desktopHint} title='Best on a computer'>
            <FiMonitor size={13} />
          </span>
        ) : null}
      </motion.p>
    </motion.div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    position: 'relative',
    cursor: 'pointer',
    flexDirection: 'row',
    userSelect: 'none',
    alignItems: 'center',
    paddingRight: t.spacing.m,
    height: 50,
    // The hover animates from here; framer-motion cannot animate from 'transparent'.
    backgroundColor: t.colors.white + t.colorOpacity(0),
  },
  // The active marker hugs the edge without pushing the icon and label along.
  box: {
    position: 'absolute',
    left: 0,
    top: 12.5,
    height: '25px',
    borderTopRightRadius: t.borderRadius.medium,
    borderBottomRightRadius: t.borderRadius.medium,
    width: '4px',
  },
  icon: { display: 'flex', alignItems: 'center', marginLeft: t.spacing.l, flexShrink: 0 },
  label: { marginLeft: t.spacing.sm, flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 },
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
