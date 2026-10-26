import { Navigate, Route, Routes } from 'react-router-dom';
import { DeployNavigationRoute } from '~/navigation/types';
import { ApplicationDetail } from '~/routes/Deploy/ApplicationDetail';
import { Applications } from '~/routes/Deploy/Applications';
import { Containers } from '~/routes/Deploy/Containers';
import { GitSources } from '~/routes/Deploy/GitSources';
import { Variables } from '~/routes/Deploy/Variables';
import { mkUseStyles } from '~/utils/theme';

/**
 * Homelab deployments. An application is what the panel deploys — the section
 * opens on them, one at /deploy/applications/:id; Containers is what the agent
 * sees on the host.
 */
export const DeployNavigation = () => {
  const styles = useStyles();
  return (
    <div style={styles.content}>
      <Routes>
        {/* Applications are what the panel deploys, so the section opens on them. */}
        <Route index element={<Navigate replace to={DeployNavigationRoute.APPLICATIONS} />} />
        <Route path={DeployNavigationRoute.CONTAINERS} element={<Containers />} />
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
