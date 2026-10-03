import { useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { ApplicationDetailResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { COMPOSE_HINT, ComposeEditor } from '~/routes/Deploy/components/ComposeEditor';
import { Section } from '~/routes/Deploy/components/shared';
import { getApiErrorMessage } from '~/utils/apiError';

/** The application's own compose file, edited in place. Applied by the next deployment. */
export const ComposeTab = ({
  application,
  onSaved,
}: {
  application: ApplicationDetailResponse;
  onSaved: (next: ApplicationDetailResponse) => void;
}) => {
  const { deployApi } = useApi();
  const can = useCan();
  const toast = useToast();
  const canManage = can('deploy.manage');
  const [text, setText] = useState(application.compose ?? '');
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => setText(application.compose ?? ''), [application.compose]);

  const envs = useAsync(async () => {
    if (!deployApi) return undefined;
    const { data } = await deployApi.deployControllerListEnv({ id: application.id });
    return data;
  }, [deployApi, application.id]);

  const save = async () => {
    if (!deployApi) return;
    setSaving(true);
    try {
      const { data } = await deployApi.deployControllerUpdateApplication({
        id: application.id,
        updateApplicationDto: { compose: text },
      });
      onSaved(data);
      await envs.reload();
      toast('Saved — preview and deploy to apply it', 'success');
    } catch (e) {
      toast(getApiErrorMessage(e, 'The compose file was rejected.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section
      title='compose.yaml'
      description={COMPOSE_HINT}
      actions={
        canManage ? (
          <Button
            label='Save'
            icon={<FiSave size={14} />}
            onClick={save}
            loading={saving}
            disabled={text === (application.compose ?? '') || !text.trim() || !!error}
          />
        ) : undefined
      }
    >
      <ComposeEditor
        value={text}
        onChange={setText}
        readOnly={!canManage}
        definedKeys={(envs.data ?? []).map((e) => e.key)}
        onCheck={(_, message) => setError(message)}
      />
    </Section>
  );
};
