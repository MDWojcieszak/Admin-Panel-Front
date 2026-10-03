import { FiEdit2, FiLock, FiPlus, FiTrash2 } from 'react-icons/fi';
import { ApplicationEnvResponse } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { Section, useDeployStyles } from '~/routes/Deploy/components/shared';
import { EnvValueInput, EnvValueModal } from '~/routes/Deploy/modals/EnvValueModal';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

/** The application's own env file entries; [[KEY]] pulls in a global variable. */
export const EnvTab = ({ applicationId }: { applicationId: string }) => {
  const styles = useStyles();
  const shared = useDeployStyles();
  const { deployApi } = useApi();
  const can = useCan();
  const toast = useToast();
  const canManage = can('deploy.manage');

  const query = useAsync<ApplicationEnvResponse[]>(async () => {
    if (!deployApi) return undefined;
    const { data } = await deployApi.deployControllerListEnv({ id: applicationId });
    return data;
  }, [deployApi, applicationId]);

  const editModal = useModal(`deploy-env-edit-${applicationId}`, EnvValueModal, { title: 'Environment variable' });
  const deleteModal = useModal(`deploy-env-delete-${applicationId}`, ConfirmModal, { title: 'Remove variable' });

  const save = async ({ key, value, isSecret }: EnvValueInput) => {
    if (!deployApi) return;
    await deployApi.deployControllerUpsertEnv({
      id: applicationId,
      key,
      upsertApplicationEnvDto: { value, isSecret },
    });
    await query.reload();
  };

  const remove = async (key: string) => {
    if (!deployApi) return;
    try {
      await deployApi.deployControllerDeleteEnv({ id: applicationId, key });
      await query.reload();
    } catch (e) {
      toast(getApiErrorMessage(e, `Could not remove ${key}.`), 'error');
    }
  };

  const envs = query.data ?? [];

  return (
    <Section
      title='Environment'
      actions={
        canManage ? (
          <Button label='Add variable' icon={<FiPlus size={14} />} onClick={() => editModal.show({ onSave: save })} />
        ) : undefined
      }
    >
      {query.loading && !query.data ? (
        <Loader />
      ) : envs.length === 0 ? (
        <span style={shared.muted}>No variables.</span>
      ) : (
        <div style={shared.list}>
          {envs.map((env) => (
            <div key={env.key} style={shared.listRow}>
              <div style={{ ...shared.row, ...styles.keyCell }}>
                <span style={{ ...styles.key, ...shared.mono }}>{env.key}</span>
                {env.isSecret ? <Badge label='Secret' tone='purple' icon={<FiLock size={11} />} /> : null}
                {!env.isSet ? <Badge label='To fill in' tone='yellow' /> : null}
              </div>
              <span style={{ ...styles.value, ...shared.mono }}>
                {env.isSecret ? (env.isSet ? '••••••••' : '') : env.value}
              </span>
              {canManage ? (
                <div style={shared.row}>
                  <Button
                    label='Edit'
                    variant='secondary'
                    icon={<FiEdit2 size={13} />}
                    onClick={() => editModal.show({ initial: env, onSave: save })}
                  />
                  <Button
                    label='Remove'
                    variant='secondary'
                    icon={<FiTrash2 size={13} />}
                    onClick={() =>
                      deleteModal.show({
                        message: `Remove ${env.key}?`,
                        confirmLabel: 'Remove',
                        danger: true,
                        onConfirm: () => remove(env.key),
                      })
                    }
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Section>
  );
};

const useStyles = mkUseStyles((t) => ({
  keyCell: { width: 280, flexShrink: 0, flexWrap: 'nowrap' },
  key: { fontSize: 13, fontWeight: 700, color: t.colors.white },
  value: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: t.colors.lightBlue,
  },
}));
