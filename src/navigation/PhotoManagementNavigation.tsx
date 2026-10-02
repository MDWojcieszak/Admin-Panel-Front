import { Navigate, Route, Routes } from 'react-router-dom';
import { useCan } from '~/hooks/usePermissions';
import { ProtectedRoute } from '~/navigation/ProtectedRoute';
import { PhotoNavigationRoute } from '~/navigation/types';
import { ImmichAlbums } from '~/routes/PhotoManagement/Albums';
import { Astro } from '~/routes/PhotoManagement/Astro';
import { GearView } from '~/routes/Gear';
import { PhotoManagement } from '~/routes/PhotoManagement';
import { mkUseStyles } from '~/utils/theme';

/**
 * Photo Library section. The sub-navigation (Library / Astro / Gear / Albums) is
 * rendered in the sidebar beneath the active item, so here we only route to the
 * active sub-page.
 *
 * Gear is the odd one out: it is shared with the blog and the galleries rather
 * than belonging to the photo library, and its endpoints check gallery.manage,
 * so it is gated separately from everything else here.
 */
export const PhotoManagementNavigation = () => {
  const styles = useStyles();
  const can = useCan();

  // Someone who only has gallery.manage is here for gear alone; sending them to
  // the library index would bounce them out of the section before they could
  // reach the sub-navigation that offers it.
  const gearOnly = !can('photoEntry.read') && can('gallery.manage');

  return (
    <div style={styles.content}>
      <Routes>
        <Route
          index
          element={
            gearOnly ? (
              <Navigate replace to={PhotoNavigationRoute.GEAR} />
            ) : (
              <ProtectedRoute permission='photoEntry.read'>
                <PhotoManagement />
              </ProtectedRoute>
            )
          }
        />
        <Route
          path={PhotoNavigationRoute.ASTRO}
          element={
            <ProtectedRoute permission='photoEntry.read'>
              <Astro />
            </ProtectedRoute>
          }
        />
        <Route
          path={PhotoNavigationRoute.GEAR}
          element={
            <ProtectedRoute permission='gallery.manage'>
              <GearView />
            </ProtectedRoute>
          }
        />
        <Route
          path={PhotoNavigationRoute.ALBUMS}
          element={
            <ProtectedRoute permission='photoEntry.read'>
              <ImmichAlbums />
            </ProtectedRoute>
          }
        />
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
