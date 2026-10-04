import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiCopy, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { ApplicationDetailResponse, AppSourceType, ImportPreviewResponse, WebhookSecretResponse } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { useApi } from '~/hooks/useApi';
import { useModal } from '~/hooks/useModal';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { DeployNavigationRoute, MainNavigationRoute } from '~/navigation/types';
import { CodeBlock, Section, useDeployStyles } from '~/routes/Deploy/components/shared';
import { MoveToGitSection } from '~/routes/Deploy/components/MoveToGitSection';
import { TakeoverSection } from '~/routes/Deploy/components/TakeoverSection';
import { getApiErrorMessage } from '~/utils/apiError';

type SettingsTabProps = {
  application: ApplicationDetailResponse;
  onChanged: () => void;
};

export const SettingsTab = ({ application, onChanged }: SettingsTabProps) => {
  const shared = useDeployStyles();
  const { deployApi } = useApi();
  const can = useCan();
  const toast = useToast();
  const navigate = useNavigate();
  const [secret, setSecret] = useState<WebhookSecretResponse>();
  const [importPreview, setImportPreview] = useState<ImportPreviewResponse>();
  const [busy, setBusy] = useState<string>();
  const confirmModal = useModal(`deploy-settings-confirm-${application.id}`, ConfirmModal, { title: 'Confirm' });

  const run = async (key: string, action: () => Promise<void>, failure: string) => {
    setBusy(key);
    try {
      await action();
    } catch (e) {
      toast(getApiErrorMessage(e, failure), 'error');
    } finally {
      setBusy(undefined);
    }
  };

  const rotate = () =>
    run(
      'rotate',
      async () => {
        if (!deployApi) return;
        const { data } = await deployApi.deployControllerRotateWebhookSecret({ id: application.id });
        setSecret(data);
        onChanged();
      },
      'Could not issue a webhook secret.',
    );

  const disable = () =>
    run(
      'disable',
      async () => {
        if (!deployApi) return;
        await deployApi.deployControllerDisableWebhook({ id: application.id });
        setSecret(undefined);
        onChanged();
      },
      'Could not disable the webhook.',
    );

  const previewImport = () =>
    run(
      'import-preview',
      async () => {
        if (!deployApi) return;
        const { data } = await deployApi.deployControllerPreviewImport({ id: application.id });
        setImportPreview(data);
      },
      'The agent could not read the stack files.',
    );

  const applyImport = () =>
    run(
      'import-apply',
      async () => {
        if (!deployApi) return;
        await deployApi.deployControllerApplyImport({ id: application.id });
        setImportPreview(undefined);
        toast('Converted — fill in the secrets, then preview and deploy', 'success');
        onChanged();
      },
      'Conversion was refused.',
    );

  const remove = async () => {
    if (!deployApi) return;
    try {
      await deployApi.deployControllerDeleteApplication({ id: application.id });
      navigate(`/${MainNavigationRoute.DEPLOY}/${DeployNavigationRoute.APPLICATIONS}`);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not delete the application.'), 'error');
    }
  };

  // The API's address, always absolute: CI calls the backend, never the panel.
  // A relative VITE_API_URL (behind a proxy) is resolved against this origin.
  const apiBase = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const webhookUrl = `${apiBase.startsWith('http') ? apiBase : `${window.location.origin}${apiBase}`}/deploy/webhook/${
    application.slug
  }`;

  return (
    <>
      {application.sourceType === AppSourceType.Host && can('deploy.manage') ? (
        <TakeoverSection application={application} onChanged={onChanged} />
      ) : null}

      {application.sourceType !== AppSourceType.Git && application.tier !== 'BOOTSTRAP' && can('deploy.manage') ? (
        <MoveToGitSection application={application} onChanged={onChanged} />
      ) : null}

      {application.sourceType === AppSourceType.Host && can('deploy.manage') ? (
        <Section
          title='Convert to a spec instead'
          description='Translates the compose file into a spec the panel renders. Lossy — shows what would be kept and lost first. Nothing changes until you apply.'
          actions={
            <Button
              label='Preview conversion'
              variant='secondary'
              onClick={previewImport}
              loading={busy === 'import-preview'}
            />
          }
        >
          {importPreview ? (
            <>
              {importPreview.warnings.map((warning, i) => (
                <div key={i} style={shared.warning}>
                  <FiAlertTriangle size={14} />
                  <span>{warning}</span>
                </div>
              ))}
              <div style={shared.row}>
                <span style={shared.fieldLabel}>Service</span>
                <span style={shared.mono}>{importPreview.serviceName}</span>
                {importPreview.image ? (
                  <span style={{ ...shared.muted, ...shared.mono }}>{importPreview.image}</span>
                ) : null}
              </div>
              {importPreview.secretKeysToFill.length ? (
                <span style={shared.muted}>
                  Secrets to re-enter in Environment after converting:{' '}
                  <b>{importPreview.secretKeysToFill.join(', ')}</b>
                </span>
              ) : null}
              <span style={shared.fieldLabel}>Imported spec</span>
              <CodeBlock text={JSON.stringify(importPreview.spec, null, 2)} maxHeight={260} />
              <span style={shared.fieldLabel}>Current compose on the host (secrets masked)</span>
              <CodeBlock text={importPreview.currentCompose} maxHeight={320} />
              <div style={shared.row}>
                <Button
                  label={importPreview.recommended ? 'Apply conversion' : 'Apply anyway'}
                  variant={importPreview.recommended ? 'primary' : 'danger'}
                  onClick={applyImport}
                  loading={busy === 'import-apply'}
                />
                {!importPreview.recommended ? (
                  <span style={shared.muted}>
                    The warnings describe losses — keeping the stack as is may be better.
                  </span>
                ) : null}
              </div>
            </>
          ) : null}
        </Section>
      ) : null}

      <Section
        title={
          <span style={shared.row}>
            CI webhook
            <Badge
              label={application.webhookEnabled ? 'Enabled' : 'Disabled'}
              tone={application.webhookEnabled ? 'green' : 'neutral'}
            />
          </span>
        }
        actions={
          can('deploy.secrets') ? (
            <>
              <Button
                label={application.hasWebhookSecret ? 'Rotate secret' : 'Enable'}
                variant='secondary'
                icon={<FiRefreshCw size={13} />}
                onClick={() =>
                  application.hasWebhookSecret
                    ? confirmModal.show({
                        message: 'Rotate the webhook secret?',
                        description: 'CI keeps failing until it is given the new secret.',
                        confirmLabel: 'Rotate',
                        onConfirm: rotate,
                      })
                    : rotate()
                }
                loading={busy === 'rotate'}
              />
              {application.webhookEnabled ? (
                <Button label='Disable' variant='secondary' onClick={disable} loading={busy === 'disable'} />
              ) : null}
            </>
          ) : undefined
        }
      >
        <div style={shared.row}>
          <span style={{ ...shared.muted, ...shared.mono }}>POST {webhookUrl}</span>
          <Button
            label='Copy URL'
            variant='secondary'
            icon={<FiCopy size={13} />}
            onClick={() => navigator.clipboard?.writeText(webhookUrl).then(() => toast('Copied', 'success'))}
          />
        </div>
        {secret ? (
          <div style={shared.warning}>
            <FiAlertTriangle size={14} />
            <div style={{ gap: 6, minWidth: 0 }}>
              <span>{secret.note}</span>
              <span style={shared.mono}>
                {secret.header}: {secret.secret}
              </span>
              <div>
                <Button
                  label='Copy secret'
                  variant='secondary'
                  icon={<FiCopy size={13} />}
                  onClick={() => navigator.clipboard?.writeText(secret.secret).then(() => toast('Copied', 'success'))}
                />
              </div>
            </div>
          </div>
        ) : null}
      </Section>

      {can('deploy.manage') ? (
        <Section
          title='Delete application'
          actions={
            <Button
              label='Delete'
              variant='danger'
              icon={<FiTrash2 size={13} />}
              onClick={() =>
                confirmModal.show({
                  message: `Delete ${application.slug}?`,
                  description: 'The panel stops managing it. Containers keep running.',
                  confirmLabel: 'Delete',
                  danger: true,
                  onConfirm: remove,
                })
              }
            />
          }
        />
      ) : null}
    </>
  );
};
