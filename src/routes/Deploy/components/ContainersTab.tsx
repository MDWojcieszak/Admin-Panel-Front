import { MdOutlineViewInAr } from 'react-icons/md';
import { ApplicationDetailResponse, DiscoveredStackResponse } from '~/api/api';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { StackCard } from '~/routes/Deploy/Containers';
import { useToast } from '~/hooks/useToast';
import { stackActionFailure, useDeployEvents } from '~/routes/Deploy/hooks/useDeployEvents';
import { useTheme } from '~/utils/theme';

/**
 * The application's containers as the agent sees them, with logs and
 * start / restart / stop — the same card as on Containers, found by the
 * compose project, which is the application's slug.
 */
export const ContainersTab = ({ application }: { application: ApplicationDetailResponse }) => {
  const theme = useTheme();
  const { deployApi } = useApi();
  const toast = useToast();

  const stack = useAsync<DiscoveredStackResponse | null>(async () => {
    if (!deployApi) return undefined;
    try {
      const { data } = await deployApi.deployControllerGetContainerStack({ project: application.slug });
      return data;
    } catch {
      // Not running, or not reported yet: shown as no containers.
      return null;
    }
  }, [deployApi, application.slug]);

  useDeployEvents({
    onContainersChanged: () => stack.reload(),
    onStackActionResult: (event) => {
      if (event.project !== application.slug) return;
      const failure = stackActionFailure(event);
      if (failure) toast(failure, 'error');
    },
  });

  if (stack.loading && stack.data === undefined) return <Loader />;
  if (!stack.data) {
    return (
      <EmptyState
        icon={<MdOutlineViewInAr size={26} color={theme.colors.blue04} />}
        title='No containers on the host'
        description={`The agent reports nothing for the ${application.slug} project.`}
      />
    );
  }
  return <StackCard stack={stack.data} onChanged={() => stack.reload()} />;
};
