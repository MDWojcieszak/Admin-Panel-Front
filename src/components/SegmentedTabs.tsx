import { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { mkUseStyles, useTheme } from '~/utils/theme';

type SegmentedItem = {
  label: string;
  value: string;
  icon?: ReactNode;
};

type SegmentedTabsProps = {
  items: SegmentedItem[];
  selected: string;
  handleSelect: (value: string) => void;
  style?: CSSProperties;
  /** Unique id for the animated active indicator (set when several selectors share a screen). */
  layoutId?: string;
};

export const SegmentedTabs = ({ items, selected, handleSelect, style, layoutId = 'segmented-tabs' }: SegmentedTabsProps) => {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <div style={{ ...styles.container, ...style }}>
      {items.map((item) => {
        const isActive = item.value === selected;
        return (
          <motion.div
            key={item.value}
            style={styles.item}
            onClick={() => handleSelect(item.value)}
            whileHover={isActive ? undefined : { backgroundColor: theme.colors.gray02 + theme.colorOpacity(0.6) }}
            whileTap={{ scale: 0.97 }}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                style={styles.activeBackground}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <div style={{ ...styles.content, color: isActive ? theme.colors.white : theme.colors.dark05 }}>
              {item.icon}
              <span style={styles.label}>{item.label}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: t.spacing.xs,
    padding: t.spacing.xs,
    width: 'fit-content',
    maxWidth: '100%',
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
  },
  item: {
    position: 'relative',
    cursor: 'pointer',
    userSelect: 'none',
    borderRadius: t.borderRadius.medium,
  },
  activeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: t.borderRadius.medium,
    backgroundColor: t.colors.blue,
  },
  content: {
    position: 'relative',
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    paddingTop: t.spacing.s,
    paddingBottom: t.spacing.s,
    paddingLeft: t.spacing.m,
    paddingRight: t.spacing.m,
    fontWeight: 600,
    fontSize: 15,
    whiteSpace: 'nowrap',
  },
  label: {
    lineHeight: 1,
  },
}));
