import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { GitAccountResponse, GitRepoResponse, UpsertGitAccountDto, UpsertGitRepoDto } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type GitAccountModalProps = {
  account?: GitAccountResponse;
  onSave?: (dto: UpsertGitAccountDto) => Promise<void>;
} & Partial<InternalModalProps>;

type GitAccountForm = { name: string; provider: string; username: string; token: string };

export const GitAccountModal = (p: GitAccountModalProps) => {
  const styles = useStyles();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const form = useForm<GitAccountForm>({
    defaultValues: {
      name: p.account?.name ?? '',
      provider: p.account?.provider ?? 'github.com',
      username: p.account?.username ?? '',
      token: '',
    },
  });
  const [name, username] = form.watch(['name', 'username']);

  const save = async ({ name, provider, username, token }: GitAccountForm) => {
    if (!p.onSave) return;
    setSaving(true);
    try {
      // An empty token on edit keeps the stored one.
      await p.onSave({ name, provider, username, token: token || undefined });
      p.handleClose?.();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save the account.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...form}>
      <div style={styles.container}>
        <Input name='name' label='Name' description='Local label, e.g. github-mdwojcieszak' />
        <Input name='provider' label='Provider' description='Host of the git service' />
        <Input name='username' label='Username' description='The account the token belongs to' />
        <Input
          name='token'
          label='Access token'
          type='password'
          description={
            p.account?.hasToken
              ? 'A token is stored. Leave empty to keep it; it is never shown.'
              : 'Stored encrypted and never returned.'
          }
        />
        <Button
          label={p.account ? 'Save' : 'Add account'}
          onClick={form.handleSubmit(save)}
          loading={saving}
          disabled={!name?.trim() || !username?.trim()}
        />
      </div>
    </FormProvider>
  );
};

type GitRepoModalProps = {
  repo?: GitRepoResponse;
  accounts: GitAccountResponse[];
  onSave?: (dto: UpsertGitRepoDto) => Promise<void>;
} & Partial<InternalModalProps>;

type GitRepoForm = { name: string; repo: string; branch: string; clonePath: string; accountId: string };

export const GitRepoModal = (p: GitRepoModalProps) => {
  const styles = useStyles();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const form = useForm<GitRepoForm>({
    defaultValues: {
      name: p.repo?.name ?? '',
      repo: p.repo?.repo ?? '',
      branch: p.repo?.branch ?? 'main',
      clonePath: p.repo?.clonePath ?? '',
      accountId: p.repo?.account?.id ?? '',
    },
  });
  const [name, repo] = form.watch(['name', 'repo']);

  const save = async ({ name, repo, branch, clonePath, accountId }: GitRepoForm) => {
    if (!p.onSave) return;
    setSaving(true);
    try {
      await p.onSave({ name, repo, branch, clonePath: clonePath || null, accountId: accountId || null });
      p.handleClose?.();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save the repository.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...form}>
      <div style={styles.container}>
        <Input name='name' label='Name' description='Local label, unique' />
        <Input name='repo' label='Repository' description='owner/repo' />
        <Input name='branch' label='Branch' description='Deployed when no commit or tag is pinned' />
        <Input
          name='clonePath'
          label='Clone path'
          description='Optional; defaults to REPOS_DIR/owner/repo on the host'
        />
        <Select
          name='accountId'
          label='Account'
          description='None for a public repository'
          control={form.control}
          options={[
            { value: '', label: 'Public — no account' },
            ...p.accounts.map((account) => ({ value: account.id, label: `${account.name} (${account.username})` })),
          ]}
        />
        <Button
          label={p.repo ? 'Save' : 'Add repository'}
          onClick={form.handleSubmit(save)}
          loading={saving}
          disabled={!name?.trim() || !repo?.trim()}
        />
      </div>
    </FormProvider>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.s, width: 440 },
}));
