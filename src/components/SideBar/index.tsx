import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { GlassCard } from '~/components/GlassCard';
import { Item, SideBarItem } from '~/components/SideBar/Item';
import { mkUseStyles } from '~/utils/theme';

const WIDTH = 250;

type SideBarProps = {
  items: Omit<SideBarItem, 'isActive'>[];
};

export const SideBar = ({ items }: SideBarProps) => {
  const styles = useStyles();
  const location = useLocation();

  const renderItem = useCallback(
    (item: Omit<SideBarItem, 'isActive'>) => {
      console.log(location.pathname);
      return <Item {...item} key={item.path} isActive={location.pathname.split('/')[1] === item.path} />;
    },
    [location],
  );

  return <GlassCard style={styles.container}>{items.map(renderItem)}</GlassCard>;
};

const useStyles = mkUseStyles((t) => ({
  container: {
    width: WIDTH,
    margin: t.spacing.m,
    height: `calc(100% - ${t.spacing.m * 2}px)`,
  },
}));
