import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { FiSave } from 'react-icons/fi';
import { ApplicationDetailResponse, ApplicationTier, AppSourceType, BuildMode } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { Section, useDeployStyles } from '~/routes/Deploy/components/shared';
import { getApiErrorMessage } from '~/utils/apiError';

const pretty = (spec: object) => JSON.stringify(spec ?? {}, null, 2);

type IdentityForm = {
  displayName: string;
  description: string;
  image: string;
  tier: ApplicationTier;
  gitRepoId: string;
  gitRef: string;
  buildMode: BuildMode;
};

const BUILD_OPTIONS = [
  { value: BuildMode.Registry, label: 'Pull — the image is built elsewhere (CI)' },
  { value: BuildMode.Compose, label: 'Build here — the agent runs compose build' },
  { value: BuildMode.None, label: 'None — a third-party image' },
];

const SPEC_HINT =
  'port, health, healthCommand, domain, publishPort, network, volumes [{host, path, readOnly}], depends, ' +
  'resources {memory, cpus}, build {context, dockerfile, target, args}, pollForUpdates … ' +
  'Use [[KEY]] only for non-secret variables: the spec is written into compose.yaml in plain text.';

/** The application's identity and its AppSpec, edited as JSON. */
export const SpecTab = ({
  application,
  onSaved,
}: {
  application: ApplicationDetailResponse;
  onSaved: (next: ApplicationDetailResponse) => void;
}) => {
  const shared = useDeployStyles();
  const { deployApi } = useApi();
  const can = useCan();
  const toast = useToast();
  const canManage = can('deploy.manage');

  const identity = (app: ApplicationDetailResponse): IdentityForm => ({
    displayName: app.displayName ?? '',
    description: app.description ?? '',
    image: app.image ?? '',
    tier: app.tier,
    gitRepoId: app.gitRepoId ?? '',
    gitRef: app.gitRef ?? '',
    buildMode: app.buildMode,
  });
  const form = useForm<IdentityForm>({ defaultValues: identity(application) });
  const { displayName, description, image, tier, gitRepoId, gitRef, buildMode } = form.watch();
  const isGit = application.sourceType === AppSourceType.Git;
  // An own compose file decides this itself: it builds when a service has build:.
  const choosesBuild = application.sourceType !== AppSourceType.Compose;

  const repos = useAsync(async () => {
    if (!deployApi || !isGit || !can('deploy.git')) return undefined;
    const { data } = await deployApi.deployControllerListGitRepos();
    return data;
  }, [deployApi, isGit]);
  const [specText, setSpecText] = useState(pretty(application.spec));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSpecText(pretty(application.spec));
  }, [application.spec]);

  // A save returns the stored application; the fields follow it.
  useEffect(() => {
    form.reset(identity(application));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    application.displayName,
    application.description,
    application.image,
    application.tier,
    application.gitRepoId,
    application.gitRef,
    application.buildMode,
  ]);

  let specError: string | undefined;
  let parsed: object | undefined;
  try {
    const value = JSON.parse(specText);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) specError = 'The spec must be an object.';
    else parsed = value;
  } catch (e) {
    specError = (e as Error).message;
  }

  const dirty =
    displayName !== (application.displayName ?? '') ||
    description !== (application.description ?? '') ||
    image !== (application.image ?? '') ||
    tier !== application.tier ||
    (isGit && gitRepoId !== (application.gitRepoId ?? '')) ||
    (isGit && gitRef.trim() !== (application.gitRef ?? '')) ||
    (choosesBuild && buildMode !== application.buildMode) ||
    (parsed !== undefined && JSON.stringify(parsed) !== JSON.stringify(application.spec ?? {}));

  const save = async () => {
    if (!deployApi || !parsed) return;
    setSaving(true);
    try {
      const { data } = await deployApi.deployControllerUpdateApplication({
        id: application.id,
        updateApplicationDto: {
          displayName,
          description,
          image,
          tier,
          spec: parsed,
          ...(isGit ? { gitRepoId: gitRepoId || null, gitRef: gitRef.trim() || null } : {}),
          ...(choosesBuild ? { buildMode } : {}),
        },
      });
      onSaved(data);
      toast('Saved — preview and deploy to apply it', 'success');
    } catch (e) {
      toast(getApiErrorMessage(e, 'The spec was rejected.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Section
        title='Application'
        actions={
          canManage ? (
            <Button
              label='Save'
              icon={<FiSave size={14} />}
              onClick={save}
              loading={saving}
              disabled={!dirty || !!specError}
            />
          ) : undefined
        }
      >
        <FormProvider {...form}>
          <div style={shared.fieldGrid}>
            <Input name='displayName' label='Display name' description='Shown in the panel' />
            <Select
              name='tier'
              label='Tier'
              control={form.control}
              options={[
                { value: ApplicationTier.Application, label: 'Application' },
                { value: ApplicationTier.Infrastructure, label: 'Infrastructure' },
                ...(application.tier === ApplicationTier.Bootstrap
                  ? [{ value: ApplicationTier.Bootstrap, label: 'Bootstrap' }]
                  : []),
              ]}
            />
          </div>
          {isGit ? (
            <Select
              name='gitRepoId'
              label='Repository'
              description='Cloned into REPOS_DIR on the host; its own compose file runs from the clone'
              control={form.control}
              options={(repos.data ?? []).map((r) => ({ value: r.id, label: `${r.name} (${r.repo}@${r.branch})` }))}
            />
          ) : null}
          {isGit ? (
            <Input
              name='gitRef'
              label='Branch or tag'
              description="What this application follows. Empty follows the repository's branch — set v1 or main to run two versions side by side"
            />
          ) : null}
          {choosesBuild ? (
            <Select name='buildMode' label='Image source' control={form.control} options={BUILD_OPTIONS} />
          ) : null}
          {application.sourceType === AppSourceType.Rendered ? (
            <Input name='image' label='Image' description='Without a tag — the release picks the version' />
          ) : null}
          <Input name='description' label='Description' description='A line about what it is' />
        </FormProvider>
      </Section>

      <Section title='Spec' description={SPEC_HINT}>
        <textarea
          value={specText}
          onChange={(e) => setSpecText(e.target.value)}
          rows={Math.min(36, Math.max(12, specText.split('\n').length + 2))}
          spellCheck={false}
          readOnly={!canManage}
          style={shared.textArea}
        />
        {specError ? <div style={shared.error}>{specError}</div> : null}
      </Section>
    </>
  );
};
