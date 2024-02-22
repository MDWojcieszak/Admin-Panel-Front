import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthService } from '~/api/Auth';
import { Button } from '~/components/Button';
import { GlassCard } from '~/components/GlassCard';
import { Item, SideBarItem } from '~/components/SideBar/Item';
import { useAuth } from '~/hooks/useAuth';
import { mkUseStyles } from '~/utils/theme';

const WIDTH = 250;

type SideBarProps = {
  items: Omit<SideBarItem, 'isActive'>[];
};

export const SideBar = ({ items }: SideBarProps) => {
  const styles = useStyles();
  const location = useLocation();
  const auth = useAuth();
  const handleLogout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch (error: any) {
      console.log(error.message);
    }
    auth.removeTokens();
  }, []);

  const renderItem = useCallback(
    (item: Omit<SideBarItem, 'isActive'>) => {
      return <Item {...item} key={item.path} isActive={location.pathname.split('/')[1] === item.path} />;
    },
    [location],
  );

  return (
    <GlassCard style={styles.container}>
      <div style={styles.itemContainer}>{items.map(renderItem)}</div>
      <Button style={styles.button} label='Log out' variant='secondary' onClick={handleLogout} />
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
  itemContainer: {
    marginTop: t.spacing.l,
  },
  button: {
    margin: t.spacing.m,
  },
}));
