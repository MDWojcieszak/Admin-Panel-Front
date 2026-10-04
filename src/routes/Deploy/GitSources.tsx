import { formatDistanceToNow } from 'date-fns';
import { FiEdit2, FiGitBranch, FiKey, FiPlus, FiTrash2 } from 'react-icons/fi';
import { GitAccountResponse, GitRepoResponse } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { Loader } from '~/components/Loader';
import { PageHeader } from '~/components/PageHeader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { DeployPage, Section, useDeployStyles } from '~/routes/Deploy/components/shared';
import { GitAccountModal, GitRepoModal } from '~/routes/Deploy/modals/GitModals';
import { shortCommit } from '~/routes/Deploy/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

/** Accounts hold the credentials; repositories are what GIT applications build from. */
export const GitSources = () => {
  const styles = useStyles();
  const shared = useDeployStyles();
  const { deployApi } = useApi();
  const toast = useToast();

  const accounts = useAsync<GitAccountResponse[]>(async () => {
    if (!deployApi) return undefined;
    const { data } = await deployApi.deployControllerListGitAccounts();
    return data;
  }, [deployApi]);

  const repos = useAsync<GitRepoResponse[]>(async () => {
    if (!deployApi) return undefined;
    const { data } = await deployApi.deployControllerListGitRepos();
    return data;
  }, [deployApi]);

  const accountModal = useModal('deploy-git-account', GitAccountModal, { title: 'Git account' });
  const repoModal = useModal('deploy-git-repo', GitRepoModal, { title: 'Repository' });
  const deleteModal = useModal('deploy-git-delete', ConfirmModal, { title: 'Delete' });

  const reloadAll = () => Promise.all([accounts.reload(), repos.reload()]);

  const confirmDelete = (label: string, action: () => Promise<unknown>) =>
    deleteModal.show({
      message: `Delete ${label}?`,
      description: 'Refused while anything still uses it.',
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        try {
          await action();
          await reloadAll();
        } catch (e) {
          toast(getApiErrorMessage(e, `Could not delete ${label}.`), 'error');
        }
      },
    });

  if (!deployApi) return null;

  return (
    <DeployPage
      header={
        <>
          <PageHeader
            title='Git'
            meta={
              accounts.data && repos.data
                ? `${accounts.data.length} account${accounts.data.length === 1 ? '' : 's'} · ${repos.data.length} ${
                    repos.data.length === 1 ? 'repository' : 'repositories'
                  }`
                : undefined
            }
          />
        </>
      }
    >
      <Section
        title='Accounts'
        actions={
          <Button
            label='Add account'
            icon={<FiPlus size={14} />}
            onClick={() =>
              accountModal.show({
                onSave: async (dto) => {
                  await deployApi.deployControllerCreateGitAccount({ upsertGitAccountDto: dto });
                  await reloadAll();
                },
              })
            }
          />
        }
      >
        {accounts.loading && !accounts.data ? (
          <Loader />
        ) : !accounts.data?.length ? (
          <span style={shared.muted}>No accounts — public repositories need none.</span>
        ) : (
          <div style={shared.list}>
            {accounts.data.map((account) => (
              <div key={account.id} style={shared.listRow}>
                <div style={styles.main}>
                  <div style={shared.row}>
                    <span style={styles.name}>{account.name}</span>
                    {account.hasToken ? (
                      <Badge label='Token' tone='green' icon={<FiKey size={11} />} />
                    ) : (
                      <Badge label='No token' tone='yellow' />
                    )}
                  </div>
                  <span style={shared.muted}>
                    {account.username}@{account.provider} · {account.repoCount} repositor
                    {account.repoCount === 1 ? 'y' : 'ies'}
                  </span>
                </div>
                <Button
                  label='Edit'
                  variant='secondary'
                  icon={<FiEdit2 size={13} />}
                  onClick={() =>
                    accountModal.show({
                      account,
                      onSave: async (dto) => {
                        await deployApi.deployControllerUpdateGitAccount({
                          id: account.id,
                          upsertGitAccountDto: dto,
                        });
                        await reloadAll();
                      },
                    })
                  }
                />
                <Button
                  label='Delete'
                  variant='secondary'
                  icon={<FiTrash2 size={13} />}
                  onClick={() =>
                    confirmDelete(account.name, () => deployApi.deployControllerDeleteGitAccount({ id: account.id }))
                  }
                />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title='Repositories'
        actions={
          <Button
            label='Add repository'
            icon={<FiPlus size={14} />}
            onClick={() =>
              repoModal.show({
                accounts: accounts.data ?? [],
                onSave: async (dto) => {
                  await deployApi.deployControllerCreateGitRepo({ upsertGitRepoDto: dto });
                  await reloadAll();
                },
              })
            }
          />
        }
      >
        {repos.loading && !repos.data ? (
          <Loader />
        ) : !repos.data?.length ? (
          <span style={shared.muted}>No repositories yet.</span>
        ) : (
          <div style={shared.list}>
            {repos.data.map((repo) => (
              <div key={repo.id} style={shared.listRow}>
                <FiGitBranch size={16} />
                <div style={styles.main}>
                  <div style={shared.row}>
                    <span style={styles.name}>{repo.name}</span>
                    <span style={{ ...shared.muted, ...shared.mono }}>
                      {repo.repo}@{repo.branch}
                    </span>
                  </div>
                  <span style={shared.muted}>
                    {repo.account ? `via ${repo.account.name}` : 'public'}
                    {repo.lastCommit ? ` · ${shortCommit(repo.lastCommit)}` : ''}
                    {repo.lastFetchedAt
                      ? ` fetched ${formatDistanceToNow(new Date(repo.lastFetchedAt), { addSuffix: true })}`
                      : ''}
                    {repo.applications.length ? ` · used by ${repo.applications.map((a) => a.slug).join(', ')}` : ''}
                  </span>
                </div>
                <Button
                  label='Edit'
                  variant='secondary'
                  icon={<FiEdit2 size={13} />}
                  onClick={() =>
                    repoModal.show({
                      repo,
                      accounts: accounts.data ?? [],
                      onSave: async (dto) => {
                        await deployApi.deployControllerUpdateGitRepo({ id: repo.id, upsertGitRepoDto: dto });
                        await reloadAll();
                      },
                    })
                  }
                />
                <Button
                  label='Delete'
                  variant='secondary'
                  icon={<FiTrash2 size={13} />}
                  onClick={() =>
                    confirmDelete(repo.name, () => deployApi.deployControllerDeleteGitRepo({ id: repo.id }))
                  }
                />
              </div>
            ))}
          </div>
        )}
      </Section>
    </DeployPage>
  );
};

const useStyles = mkUseStyles((t) => ({
  main: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontSize: 14, fontWeight: 700, color: t.colors.white },
}));
