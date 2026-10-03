import { Route, Routes } from 'react-router-dom';
import { GalleryNavigationRoute } from '~/navigation/types';
import { GalleriesList } from '~/routes/Galleries';
import { GalleryEditor } from '~/routes/Galleries/GalleryEditor';
import { GalleryImagesView } from '~/routes/Galleries/GalleryImagesView';
import { HeroView } from '~/routes/Galleries/HeroView';
import { mkUseStyles } from '~/utils/theme';

/**
 * Galleries CMS. Sub-navigation (Galleries / Images / Home / Processing) lives in the sidebar;
 * a gallery opens its editor at /galleries/:id.
 */
export const GalleriesNavigation = () => {
  const styles = useStyles();
  return (
    <div style={styles.content}>
      <Routes>
        <Route index element={<GalleriesList />} />
        <Route path={GalleryNavigationRoute.IMAGES} element={<GalleryImagesView />} />
        <Route path={GalleryNavigationRoute.HERO} element={<HeroView />} />
        <Route path=':id' element={<GalleryEditor />} />
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
