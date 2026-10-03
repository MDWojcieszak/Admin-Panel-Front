import { Route, Routes } from 'react-router-dom';
import { DeployNavigationRoute } from '~/navigation/types';
import { ApplicationDetail } from '~/routes/Deploy/ApplicationDetail';
import { Applications } from '~/routes/Deploy/Applications';
import { Containers } from '~/routes/Deploy/Containers';
import { GitSources } from '~/routes/Deploy/GitSources';
import { Variables } from '~/routes/Deploy/Variables';
import { mkUseStyles } from '~/utils/theme';

/**
 * Homelab deployments. Containers is what the agent sees on the host; an
 * application is what the panel deploys, and opens at /deploy/applications/:id.
 */
export const DeployNavigation = () => {
  const styles = useStyles();
  return (
    <div style={styles.content}>
      <Routes>
        <Route index element={<Containers />} />
        <Route path={DeployNavigationRoute.APPLICATIONS} element={<Applications />} />
        <Route path={`${DeployNavigationRoute.APPLICATIONS}/:id`} element={<ApplicationDetail />} />
        <Route path={DeployNavigationRoute.VARIABLES} element={<Variables />} />
        <Route path={DeployNavigationRoute.GIT} element={<GitSources />} />
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
