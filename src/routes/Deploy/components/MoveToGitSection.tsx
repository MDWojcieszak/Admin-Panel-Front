import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiGitBranch } from 'react-icons/fi';
import { ApplicationDetailResponse, BuildMode } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { Switch } from '~/components/Switch';
import { ConfirmModal } from '~/components/ConfirmModal';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { DeployNavigationRoute, MainNavigationRoute } from '~/navigation/types';
import { Section, useDeployStyles } from '~/routes/Deploy/components/shared';
import { getApiErrorMessage } from '~/utils/apiError';

type MoveForm = { gitRepoId: string; gitRef: string; buildMode: BuildMode; composeFile: string; runDirectory: string };

const BUILD_OPTIONS = [
  { value: BuildMode.Compose, label: 'Build here from the clone' },
  { value: BuildMode.Registry, label: 'Pull — built elsewhere (CI)' },
  { value: BuildMode.None, label: 'None — third-party images' },
];

/** Relative, inside the clone — the backend's rule: no leading slash, no `..` segment. */
const INSIDE_CLONE = /^(?!\/)(?!(?:.*\/)?\.\.(?:\/|$))[\w./-]+$/;

/**
 * Moves any application onto a git repository: the repository's own compose
 * file then runs from its clone, and each deployment fetches it first.
 */
export const MoveToGitSection = ({
  application,
  onChanged,
}: {
  application: ApplicationDetailResponse;
  onChanged: () => void;
}) => {
  const shared = useDeployStyles();
  const { deployApi } = useApi();
  const can = useCan();
  const toast = useToast();
  const form = useForm<MoveForm>({
    defaultValues: {
      gitRepoId: '',
      gitRef: '',
      buildMode: BuildMode.Compose,
      composeFile: 'compose.yaml',
      runDirectory: '.',
    },
  });
  const { gitRepoId, gitRef, buildMode, composeFile, runDirectory } = form.watch();
  // Off: the backend's default, compose.yaml at the repository root.
  // False keeps the compose file stored in the panel; the agent puts it into the
  // clone on every deployment. Only possible once the panel holds a file.
  const hasStoredCompose = Boolean(application.compose?.trim());
  const [inRepository, setInRepository] = useState(true);
  const composeValid = !inRepository || INSIDE_CLONE.test(composeFile?.trim() ?? '');
  const directoryValid = !inRepository || INSIDE_CLONE.test(runDirectory?.trim() ?? '');
  const [open, setOpen] = useState(false);
  const confirmModal = useModal(`deploy-move-to-git-${application.id}`, ConfirmModal, { title: 'Move to git' });

  const repos = useAsync(async () => {
    if (!deployApi || !open || !can('deploy.git')) return undefined;
    const { data } = await deployApi.deployControllerListGitRepos();
    return data;
  }, [deployApi, open]);

  const repo = repos.data?.find((r) => r.id === gitRepoId);

  // The select shows its first option when nothing is chosen; make that the choice.
  useEffect(() => {
    if (repos.data?.length && !repos.data.some((r) => r.id === form.getValues('gitRepoId'))) {
      form.setValue('gitRepoId', repos.data[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repos.data]);

  const move = async () => {
    if (!deployApi) return;
    try {
      await deployApi.deployControllerMoveToGit({
        id: application.id,
        moveToGitDto: {
          gitRepoId,
          buildMode,
          gitRef: gitRef.trim() || undefined,
          composeInRepository: inRepository,
          ...(inRepository ? { composeFile: composeFile.trim(), runDirectory: runDirectory.trim() } : {}),
        },
      });
      toast('Moved to git — preview and deploy to run it from the repository', 'success');
      setOpen(false);
      onChanged();
    } catch (e) {
      toast(getApiErrorMessage(e, 'The move was refused.'), 'error');
    }
  };

  return (
    <Section
      title='Move to a git repository'
      actions={
        !open ? (
          <Button
            label='Choose a repository'
            variant='secondary'
            icon={<FiGitBranch size={13} />}
            onClick={() => setOpen(true)}
          />
        ) : undefined
      }
    >
      {open ? (
        !can('deploy.git') ? (
          <span style={shared.muted}>Choosing a repository needs the deploy.git permission.</span>
        ) : (
          <>
            {repos.data && !repos.data.length ? (
              <span style={shared.muted}>
                No repositories yet — add one in{' '}
                <Link to={`/${MainNavigationRoute.DEPLOY}/${DeployNavigationRoute.GIT}`}>Git</Link>.
              </span>
            ) : null}
            <FormProvider {...form}>
              <div style={shared.fieldGrid}>
                <Select
                  name='gitRepoId'
                  label='Repository'
                  control={form.control}
                  options={(repos.data ?? []).map((r) => ({ value: r.id, label: `${r.name} (${r.repo}@${r.branch})` }))}
                />
                <Input
                  name='gitRef'
                  label='Branch or tag'
                  description="Empty follows the repository's branch — v1 or main runs two versions side by side"
                />
              </div>
              <Select name='buildMode' label='Image source' control={form.control} options={BUILD_OPTIONS} />
              {hasStoredCompose ? (
                <Switch
                  checked={!inRepository}
                  onChange={(keep) => setInRepository(!keep)}
                  label="Keep the panel's compose file"
                />
              ) : null}
              {inRepository ? (
                <div style={shared.fieldGrid}>
                  <Input
                    name='composeFile'
                    label='Compose file'
                    description={
                      composeValid
                        ? 'Path in the repository, from the run directory'
                        : 'A relative path inside the clone'
                    }
                  />
                  <Input
                    name='runDirectory'
                    label='Run directory'
                    description={
                      directoryValid
                        ? 'Where compose runs; . is the repository root'
                        : 'A relative path inside the clone'
                    }
                  />
                </div>
              ) : null}
            </FormProvider>
            <div style={shared.warning}>
              <FiAlertTriangle size={14} />
              {inRepository ? (
                <span>
                  Relative paths in the repository&apos;s compose file (<span style={shared.mono}>./data</span>) resolve
                  against the clone{repo?.clonePath ? ` (${repo.clonePath})` : ''}, not the directory the stack runs
                  from today. Make data volumes absolute before deploying, or the application starts on empty data.
                </span>
              ) : (
                <span>
                  Relative build contexts and env files (<span style={shared.mono}>., ./server</span>) point at the
                  repository&apos;s code. Relative volumes (<span style={shared.mono}>./data</span>) are refused — a
                  reclone would wipe them; make them absolute first.
                </span>
              )}
            </div>
            <div style={shared.row}>
              <Button
                label='Move to git'
                disabled={!gitRepoId || !composeValid || !directoryValid}
                onClick={() =>
                  confirmModal.show({
                    message: `Move ${application.slug} to ${repo?.name ?? 'the repository'}?`,
                    description:
                      'Nothing is deployed now. The project name and the environment are kept; the next deployment ' +
                      'updates the running containers from the repository.',
                    confirmLabel: 'Move',
                    onConfirm: move,
                  })
                }
              />
              <Button label='Cancel' variant='secondary' onClick={() => setOpen(false)} />
            </div>
          </>
        )
      ) : null}
    </Section>
  );
};
