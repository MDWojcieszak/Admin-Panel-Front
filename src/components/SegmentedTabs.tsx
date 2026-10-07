import { CSSProperties, ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { useIsMobile } from '~/hooks/useBreakpoint';

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

export const SegmentedTabs = ({
  items,
  selected,
  handleSelect,
  style,
  layoutId = 'segmented-tabs',
}: SegmentedTabsProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const isMobile = useIsMobile();
  // Hover is driven from state rather than whileHover: switching whileHover off
  // on the item that became active left its hover colour behind once it was
  // inactive again, until the pointer passed over it once more.
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    // Phone layout: the full width, one line, swiped sideways if it does not fit.
    <div
      style={{ ...styles.container, ...(isMobile ? styles.containerMobile : null), ...style }}
      className={isMobile ? 'no-scrollbar' : undefined}
    >
      {items.map((item) => {
        const isActive = item.value === selected;
        return (
          <motion.div
            key={item.value}
            style={isMobile ? { ...styles.item, ...styles.itemMobile } : styles.item}
            onClick={() => handleSelect(item.value)}
            onHoverStart={() => setHovered(item.value)}
            onHoverEnd={() => setHovered((prev) => (prev === item.value ? null : prev))}
            initial={false}
            animate={{
              backgroundColor:
                !isActive && hovered === item.value
                  ? theme.colors.gray02 + theme.colorOpacity(0.6)
                  : theme.colors.gray02 + theme.colorOpacity(0),
            }}
            transition={{ duration: 0.12 }}
            whileTap={{ scale: 0.97 }}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                style={styles.activeBackground}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <div
              style={{
                ...styles.content,
                ...(isMobile ? styles.contentMobile : null),
                color: isActive ? theme.colors.white : theme.colors.dark05,
              }}
            >
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
  containerMobile: { width: '100%', boxSizing: 'border-box', flexWrap: 'nowrap', overflowX: 'auto', scrollbarWidth: 'none' },
  itemMobile: { flex: '1 0 auto' },
  contentMobile: { justifyContent: 'center', paddingLeft: t.spacing.sm, paddingRight: t.spacing.sm, fontSize: 14 },
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
