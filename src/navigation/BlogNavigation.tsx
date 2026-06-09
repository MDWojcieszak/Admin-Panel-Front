import { motion } from 'framer-motion';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { hasAccess } from '~/acl/permissions';
import { useCan } from '~/hooks/usePermissions';
import { BlogNavigationRoute, BlogRouteType } from '~/navigation/types';
import { BlogPosts } from '~/routes/Blog/Posts';
import { mkUseStyles, useTheme } from '~/utils/theme';

export const blogNavigationRoutes: BlogRouteType[] = [
  { path: BlogNavigationRoute.POSTS, label: 'Posts', component: <BlogPosts />, permission: 'blog.read' },
];

export const BlogNavigation = () => {
  const styles = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const can = useCan();

  const sub = location.pathname.split('/').filter(Boolean)[1] ?? '';
  const visible = blogNavigationRoutes.filter((r) => hasAccess(can, r.permission));

  return (
    <div style={styles.container}>
      {visible.length > 1 ? (
        <div style={styles.tabs}>
          {visible.map((r) => {
            const active = sub === r.path;
            return (
              <motion.div
                key={r.path}
                style={styles.tab}
                onClick={() => navigate('/blog' + (r.path ? '/' + r.path : ''))}
                animate={{ color: active ? theme.colors.blue : theme.colors.dark05 }}
              >
                {r.label}
              </motion.div>
            );
          })}
        </div>
      ) : null}
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
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    height: '100%',
    minHeight: 0,
    gap: t.spacing.m,
  },
  tabs: {
    flexDirection: 'row',
    gap: t.spacing.l,
  },
  tab: {
    cursor: 'pointer',
    fontWeight: 600,
    userSelect: 'none',
  },
  content: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
  },
}));
