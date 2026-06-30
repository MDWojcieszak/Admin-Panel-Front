import { Route, Routes } from 'react-router-dom';
import { PhotoNavigationRoute } from '~/navigation/types';
import { ImmichAlbums } from '~/routes/PhotoManagement/Albums';
import { PhotoManagement } from '~/routes/PhotoManagement';
import { mkUseStyles } from '~/utils/theme';

/**
 * Photo Library section. The sub-navigation (Library / Albums) is rendered in the
 * sidebar beneath the active item, so here we only route to the active sub-page.
 */
export const PhotoManagementNavigation = () => {
  const styles = useStyles();
  return (
    <div style={styles.content}>
      <Routes>
        <Route index element={<PhotoManagement />} />
        <Route path={PhotoNavigationRoute.ALBUMS} element={<ImmichAlbums />} />
      </Routes>
    </div>
  );
};

const useStyles = mkUseStyles(() => ({
  content: {
    flex: 1,
    minHeight: 0,
    height: '100%',
    display: 'flex',
  },
}));
