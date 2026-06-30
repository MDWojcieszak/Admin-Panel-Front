import { Route, Routes } from 'react-router-dom';
import { BlogNavigationRoute, BlogRouteType } from '~/navigation/types';
import { BlogCategories } from '~/routes/Blog/Categories';
import { BlogCollections } from '~/routes/Blog/Collections';
import { BlogCountries } from '~/routes/Blog/Countries';
import { BlogHome } from '~/routes/Blog/Home';
import { BlogPlaces } from '~/routes/Blog/Places';
import { BlogPosts } from '~/routes/Blog/Posts';
import { mkUseStyles } from '~/utils/theme';

export const blogNavigationRoutes: BlogRouteType[] = [
  { path: BlogNavigationRoute.POSTS, label: 'Posts', component: <BlogPosts />, permission: 'blog.read' },
  {
    path: BlogNavigationRoute.CATEGORIES,
    label: 'Categories',
    component: <BlogCategories />,
    permission: 'blog.category.manage',
  },
  { path: BlogNavigationRoute.PLACES, label: 'Places', component: <BlogPlaces />, permission: 'blog.place.manage' },
  {
    path: BlogNavigationRoute.COUNTRIES,
    label: 'Countries',
    component: <BlogCountries />,
    permission: 'blog.place.manage',
  },
  {
    path: BlogNavigationRoute.COLLECTIONS,
    label: 'Collections',
    component: <BlogCollections />,
    permission: 'blog.place.manage',
  },
  { path: BlogNavigationRoute.HOME, label: 'Home page', component: <BlogHome />, permission: 'blog.home.manage' },
];

/**
 * Blog section. Sub-navigation (Posts / Categories / …) lives in the sidebar
 * beneath the active item, so here we only route to the active sub-page.
 */
export const BlogNavigation = () => {
  const styles = useStyles();
  return (
    <div style={styles.content}>
      <Routes>
        {blogNavigationRoutes.map((r) =>
          r.path === BlogNavigationRoute.POSTS ? (
            <Route key='index' index element={r.component} />
          ) : (
            <Route key={r.path} path={r.path} element={r.component} />
          ),
        )}
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
