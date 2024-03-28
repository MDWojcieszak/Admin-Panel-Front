import { CSSProperties, ReactNode } from 'react';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { motion } from 'framer-motion';

type Item = {
  label: string;
  value: string;
  icon?: ReactNode;
  action?: boolean;
};

type CardSelectProps = {
  items: Item[];
  selected: string;
  handleSelect: F1<string>;
  style?: CSSProperties;
};

export const CardSelect = ({ items, selected, handleSelect, style }: CardSelectProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const selectedIndex = items.findIndex((i) => i.value === selected);

  const renderItem = (item: Item, index: number) => {
    const isSelected = selectedIndex === index;
    return (
      <div style={styles.itemContainer}>
        <motion.div
          onClick={() => handleSelect(item.value)}
          style={styles.innerItemContainer}
          animate={{
            backgroundColor: isSelected
              ? theme.colors.gray04 + theme.colorOpacity(0)
              : theme.colors.gray04 + theme.colorOpacity(0.7),
            borderRadius: `${theme.borderRadius.large}px ${theme.borderRadius.large}px ${
              selectedIndex - 1 === index ? theme.borderRadius.large : 0
            }px ${selectedIndex + 1 === index ? theme.borderRadius.large : 0}px`,
            color: isSelected ? theme.colors.blue : theme.colors.dark04,
          }}
        >
          {item.icon && <div style={styles.iconContainer}>{item.icon}</div>}
          {item.label}
        </motion.div>
      </div>
    );
  };

  return (
    <div style={{ ...styles.container, ...style }}>
      {items.map(renderItem)}
      <motion.div
        animate={{
          borderRadius: `0 0 0 ${selectedIndex === items.length - 1 ? theme.borderRadius.large : 0}px`,
        }}
        style={styles.separator}
      />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flexDirection: 'row',
  },
  itemContainer: {
    overflow: 'hidden',
    userSelect: 'none',
  },
  innerItemContainer: {
    boxShadow: `${t.colors.gray04 + t.colorOpacity(0.7)} 0px -40px 0px 20px`,
    padding: t.spacing.m,
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 600,
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    flex: 1,
    height: '100%',
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
  },
  iconContainer: {
    marginRight: t.spacing.m,
  },
}));
