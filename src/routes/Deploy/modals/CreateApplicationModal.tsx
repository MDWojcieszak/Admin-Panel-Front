import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApplicationTier, AppSourceType, GitRepoResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { COMPOSE_HINT, ComposeEditor } from '~/routes/Deploy/components/ComposeEditor';
import { useDeployStyles } from '~/routes/Deploy/components/shared';
import { SLUG_PATTERN } from '~/routes/Deploy/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type CreateApplicationModalProps = {
  onCreated?: (id: string) => void;
} & Partial<InternalModalProps>;

const schema = z.object({
  slug: z.string().regex(SLUG_PATTERN, 'Lowercase letters, digits and dashes, 3–63 characters'),
  displayName: z.string().optional(),
  image: z.string().optional(),
  tier: z.nativeEnum(ApplicationTier),
  sourceType: z.nativeEnum(AppSourceType),
  gitRepoId: z.string().optional(),
});
type SchemaType = z.infer<typeof schema>;

const TIER_OPTIONS = [
  { value: ApplicationTier.Application, label: 'Application' },
  { value: ApplicationTier.Infrastructure, label: 'Infrastructure' },
];

const SOURCE_OPTIONS = [
  { value: AppSourceType.Compose, label: 'My own compose file (paste it)' },
  { value: AppSourceType.Rendered, label: 'Rendered from a spec' },
  { value: AppSourceType.Git, label: 'Compose from a git repository' },
];

/**
 * A new application: its own compose file pasted in, a spec the panel renders,
 * or a git repository. A running stack is not created here — it is adopted
 * from Containers and can then keep its own file.
 */
export const CreateApplicationModal = (p: CreateApplicationModalProps) => {
  const styles = useStyles();
  const shared = useDeployStyles();
  const { deployApi } = useApi();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [repos, setRepos] = useState<GitRepoResponse[]>([]);
  const [compose, setCompose] = useState('');
  const [composeError, setComposeError] = useState<string>();

  const form = useForm<SchemaType>({
    resolver: zodResolver(schema),
    defaultValues: { tier: ApplicationTier.Application, sourceType: AppSourceType.Compose },
  });
  const sourceType = form.watch('sourceType');
  const isCompose = sourceType === AppSourceType.Compose;

  useEffect(() => {
    if (!deployApi || sourceType !== AppSourceType.Git) return;
    deployApi
      .deployControllerListGitRepos()
      .then(({ data }) => setRepos(data))
      .catch(() => setRepos([]));
  }, [deployApi, sourceType]);

  const save = async (data: SchemaType) => {
    if (!deployApi) return;
    setSaving(true);
    try {
      const { data: created } = await deployApi.deployControllerCreateApplication({
        createApplicationDto: {
          slug: data.slug,
          displayName: data.displayName || undefined,
          image: isCompose ? undefined : data.image || undefined,
          tier: data.tier,
          sourceType: data.sourceType,
          gitRepoId: data.sourceType === AppSourceType.Git ? data.gitRepoId || undefined : undefined,
          compose: isCompose ? compose : undefined,
        },
      });
      p.handleClose?.();
      p.onCreated?.(created.id);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not create the application.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...form}>
      <div style={{ ...styles.container, width: isCompose ? 'min(760px, 90vw)' : 420 }}>
        <Select name='sourceType' label='Source' options={SOURCE_OPTIONS} control={form.control} />
        <Input name='slug' label='Slug' description='Compose project and URL name, e.g. photo-gallery-backend' />
        <Input name='displayName' label='Display name' description='Shown in the panel' />
        {!isCompose ? (
          <Input
            name='image'
            label='Image'
            description='Without a tag — the release picks the version, e.g. ghcr.io/owner/app'
          />
        ) : null}
        <Select name='tier' label='Tier' options={TIER_OPTIONS} control={form.control} />
        {sourceType === AppSourceType.Git ? (
          <Select
            name='gitRepoId'
            label='Repository'
            options={repos.map((r) => ({ value: r.id, label: `${r.name} (${r.repo}@${r.branch})` }))}
            control={form.control}
          />
        ) : null}
        {isCompose ? (
          <>
            <span style={shared.fieldLabel}>compose.yaml</span>
            <span style={shared.muted}>{COMPOSE_HINT}</span>
            <ComposeEditor
              value={compose}
              onChange={setCompose}
              rows={16}
              onCheck={(_, error) => setComposeError(error)}
            />
          </>
        ) : null}
        <Button
          label='Create application'
          onClick={form.handleSubmit(save)}
          loading={saving}
          disabled={isCompose && (!compose.trim() || !!composeError)}
        />
      </div>
    </FormProvider>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.s },
}));
