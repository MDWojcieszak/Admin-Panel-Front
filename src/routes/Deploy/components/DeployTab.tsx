import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { FiAlertTriangle, FiEye, FiUploadCloud } from 'react-icons/fi';
import { ApplicationDetailResponse, RenderPreviewResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { CodeBlock, DiffView, Fact, Section, useDeployStyles } from '~/routes/Deploy/components/shared';
import { shortCommit, shortDigest } from '~/routes/Deploy/utils';
import { getApiErrorMessage } from '~/utils/apiError';

type DeployTabProps = {
  application: ApplicationDetailResponse;
  onDeployed: (processId: string) => void;
};

/**
 * Preview first, then deploy exactly what was previewed: the release carries
 * the preview's compose hash, and the backend refuses it if anything changed
 * in between.
 */
export const DeployTab = ({ application, onDeployed }: DeployTabProps) => {
  const shared = useDeployStyles();
  const { deployApi } = useApi();
  const can = useCan();
  const toast = useToast();
  const [preview, setPreview] = useState<RenderPreviewResponse>();
  const [rendering, setRendering] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const form = useForm<{ version: string; digest: string; gitRef: string }>({
    defaultValues: { version: application.currentRelease?.version ?? '', digest: '', gitRef: '' },
  });
  const { version, digest, gitRef } = form.watch();
  const [showEnv, setShowEnv] = useState(false);

  const isHost = application.sourceType === 'HOST';
  // Only a rendered application has one image the release can pin.
  const pinsImage = application.sourceType === 'RENDERED';
  const isGit = application.sourceType === 'GIT';
  const isBootstrap = application.tier === 'BOOTSTRAP';
  const canDeploy =
    can('deploy.execute') && !isBootstrap && (application.tier !== 'INFRASTRUCTURE' || can('deploy.infrastructure'));

  const render = async () => {
    if (!deployApi) return;
    setRendering(true);
    try {
      const { data } = await deployApi.deployControllerRenderApplication({ id: application.id });
      setPreview(data);
    } catch (e) {
      setPreview(undefined);
      toast(getApiErrorMessage(e, 'Could not render the application.'), 'error');
    } finally {
      setRendering(false);
    }
  };

  const deploy = async () => {
    if (!deployApi || !preview?.composeHash) return;
    setDeploying(true);
    try {
      const { data } = await deployApi.deployControllerCreateRelease({
        id: application.id,
        createReleaseDto: {
          composeHash: preview.composeHash,
          version: pinsImage ? version || undefined : undefined,
          digest: pinsImage ? digest || undefined : undefined,
          ref: isGit ? gitRef.trim() || undefined : undefined,
        },
      });
      setPreview(undefined);
      toast('Deployment started', 'success');
      onDeployed(data.processId);
    } catch (e) {
      toast(getApiErrorMessage(e, 'The deployment was refused.'), 'error');
      // A changed hash means the preview is stale; show the current one.
      await render();
    } finally {
      setDeploying(false);
    }
  };

  if (isHost) {
    return (
      <Section title='Deploy'>
        <span style={shared.muted}>
          This stack was adopted and its compose file still lives on the host. Take the file over in Settings — it is
          kept as it is — to deploy it from here; until then it can be started, restarted and stopped in the Containers tab.
        </span>
      </Section>
    );
  }

  return (
    <>
      <Section
        title='Release'
        actions={
          <Button
            label={preview ? 'Render again' : 'Preview'}
            variant={preview ? 'secondary' : 'primary'}
            icon={<FiEye size={14} />}
            onClick={render}
            loading={rendering}
          />
        }
      >
        <FormProvider {...form}>
          {pinsImage ? (
            <div style={shared.fieldGrid}>
              <Input name='version' label='Version' description='Image tag' />
              <Input name='digest' label='Digest' description='Optional — sha256:… pins the exact image' />
            </div>
          ) : null}
          {isGit ? (
            <Input
              name='gitRef'
              label='Commit or tag'
              description='Optional — the branch head when empty, or v1.4.0, a1b2c3d'
            />
          ) : null}
        </FormProvider>
        {application.currentRelease ? (
          <div style={shared.row}>
            <Fact
              label='Running'
              value={application.currentRelease.version ?? shortDigest(application.currentRelease.digest)}
            />
            {isGit ? <Fact label='Commit' value={shortCommit(application.currentRelease.commit)} /> : null}
            <Fact label='Digest' value={shortDigest(application.currentRelease.digest)} />
            {application.availableDigest ? (
              <Fact label='Available' value={shortDigest(application.availableDigest)} />
            ) : null}
          </div>
        ) : null}
        {isBootstrap ? (
          <div style={shared.warning}>
            <FiAlertTriangle size={14} />
            <span>Bootstrap applications are updated through the agent, never from the panel.</span>
          </div>
        ) : null}
      </Section>

      {preview ? (
        <>
          {preview.missingKeys.length ? (
            <div style={shared.error}>
              <FiAlertTriangle size={14} />
              <span>
                Undefined variables: <b>{preview.missingKeys.join(', ')}</b>. Define them in Environment or Variables
                before deploying.
              </span>
            </div>
          ) : null}

          {preview.compose ? (
            <Section
              title='compose.yaml'
              description={
                preview.previousCompose
                  ? preview.changed
                    ? 'Changes against the running release'
                    : 'Identical to the running release'
                  : 'First deployment — the whole file is new'
              }
              actions={
                canDeploy ? (
                  <Button
                    label='Deploy'
                    icon={<FiUploadCloud size={14} />}
                    onClick={deploy}
                    loading={deploying}
                    disabled={!preview.composeHash || preview.missingKeys.length > 0}
                  />
                ) : undefined
              }
            >
              {preview.previousCompose ? (
                <DiffView before={preview.previousCompose} after={preview.compose} />
              ) : (
                <CodeBlock text={preview.compose} />
              )}
            </Section>
          ) : null}

          {preview.env ? (
            <Section
              title='.env'
              description={`${preview.envKeys.length} keys · secrets masked`}
              actions={
                <Button label={showEnv ? 'Hide' : 'Show'} variant='secondary' onClick={() => setShowEnv((v) => !v)} />
              }
            >
              {showEnv ? <CodeBlock text={preview.env} maxHeight={300} /> : null}
            </Section>
          ) : null}
        </>
      ) : null}
    </>
  );
};
