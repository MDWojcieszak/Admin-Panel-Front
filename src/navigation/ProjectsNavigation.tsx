import { Route, Routes } from 'react-router-dom';
import { ProjectsNavigationRoute } from '~/navigation/types';
import { MyWork } from '~/routes/Projects/MyWork';
import { ProjectDetail } from '~/routes/Projects/ProjectDetail';
import { Projects } from '~/routes/Projects/Projects';
import { mkUseStyles } from '~/utils/theme';

/**
 * Projects and their tasks, shared per project. No permission gates them:
 * membership decides what each account sees (D1).
 */
export const ProjectsNavigation = () => {
  const styles = useStyles();
  return (
    <div style={styles.content}>
      <Routes>
        <Route index element={<Projects />} />
        <Route path={ProjectsNavigationRoute.MY_WORK} element={<MyWork />} />
        <Route path=':id' element={<ProjectDetail />} />
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
