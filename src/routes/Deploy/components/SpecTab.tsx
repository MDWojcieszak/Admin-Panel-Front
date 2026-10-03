import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { FiSave } from 'react-icons/fi';
import { ApplicationDetailResponse, ApplicationTier } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { Section, useDeployStyles } from '~/routes/Deploy/components/shared';
import { getApiErrorMessage } from '~/utils/apiError';

const pretty = (spec: object) => JSON.stringify(spec ?? {}, null, 2);

type IdentityForm = { displayName: string; description: string; image: string; tier: ApplicationTier };

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
  });
  const form = useForm<IdentityForm>({ defaultValues: identity(application) });
  const { displayName, description, image, tier } = form.watch();
  const [specText, setSpecText] = useState(pretty(application.spec));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSpecText(pretty(application.spec));
  }, [application.spec]);

  // A save returns the stored application; the fields follow it.
  useEffect(() => {
    form.reset(identity(application));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application.displayName, application.description, application.image, application.tier]);

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
    (parsed !== undefined && JSON.stringify(parsed) !== JSON.stringify(application.spec ?? {}));

  const save = async () => {
    if (!deployApi || !parsed) return;
    setSaving(true);
    try {
      const { data } = await deployApi.deployControllerUpdateApplication({
        id: application.id,
        updateApplicationDto: { displayName, description, image, tier, spec: parsed },
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
          <Input name='image' label='Image' description='Without a tag — the release picks the version' />
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
