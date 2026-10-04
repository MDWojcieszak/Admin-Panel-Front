import { FiEdit2, FiLock, FiPlus, FiTrash2 } from 'react-icons/fi';
import { MdOutlineDataObject } from 'react-icons/md';
import { VariableResponse } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { PageHeader } from '~/components/PageHeader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { DeployPage, useDeployStyles } from '~/routes/Deploy/components/shared';
import { EnvValueInput, EnvValueModal } from '~/routes/Deploy/modals/EnvValueModal';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** Global variables, referenced from any application's env as [[KEY]]. */
export const Variables = () => {
  const styles = useStyles();
  const shared = useDeployStyles();
  const theme = useTheme();
  const { deployApi } = useApi();
  const can = useCan();
  const toast = useToast();
  const canManage = can('deploy.manage');

  const query = useAsync<VariableResponse[]>(async () => {
    if (!deployApi) return undefined;
    const { data } = await deployApi.deployControllerListVariables();
    return data;
  }, [deployApi]);

  const editModal = useModal('deploy-variable-edit', EnvValueModal, { title: 'Variable' });
  const deleteModal = useModal('deploy-variable-delete', ConfirmModal, { title: 'Delete variable' });

  const save = async (input: EnvValueInput) => {
    if (!deployApi) return;
    await deployApi.deployControllerUpsertVariable({ upsertVariableDto: input });
    await query.reload();
  };

  const remove = async (variable: VariableResponse) => {
    if (!deployApi) return;
    try {
      await deployApi.deployControllerDeleteVariable({ id: variable.id });
      await query.reload();
    } catch (e) {
      toast(getApiErrorMessage(e, `Could not delete ${variable.key}.`), 'error');
    }
  };

  const variables = query.data ?? [];

  return (
    <DeployPage
      header={
        <>
          <PageHeader
            title='Variables'
            meta={
              variables.length
                ? `${variables.length} shared · ${variables.filter((v) => v.isSecret).length} secret`
                : undefined
            }
            actions={
              canManage ? (
                <Button
                  label='New variable'
                  icon={<FiPlus size={14} />}
                  onClick={() => editModal.show({ withDescription: true, onSave: save })}
                />
              ) : undefined
            }
          />
        </>
      }
    >
      {query.loading && !query.data ? (
        <Loader />
      ) : variables.length === 0 ? (
        <EmptyState
          icon={<MdOutlineDataObject size={26} color={theme.colors.blue04} />}
          title='No variables'
          description='Values used by several applications — DB_HOST, TZ, a domain suffix — belong here.'
        />
      ) : (
        <div style={shared.panel}>
          <div style={shared.list}>
            {variables.map((variable) => (
              <div key={variable.id} style={shared.listRow}>
                <div style={styles.main}>
                  <div style={shared.row}>
                    <span style={{ ...styles.key, ...shared.mono }}>{variable.key}</span>
                    {variable.isSecret ? <Badge label='Secret' tone='purple' icon={<FiLock size={11} />} /> : null}
                    {!variable.isSet ? <Badge label='Empty' tone='yellow' /> : null}
                  </div>
                  {variable.description ? <span style={shared.muted}>{variable.description}</span> : null}
                </div>
                <span style={{ ...styles.value, ...shared.mono }}>
                  {variable.isSecret ? (variable.isSet ? '••••••••' : '') : variable.value}
                </span>
                {canManage ? (
                  <div style={shared.row}>
                    <Button
                      label='Edit'
                      variant='secondary'
                      icon={<FiEdit2 size={13} />}
                      onClick={() => editModal.show({ initial: variable, withDescription: true, onSave: save })}
                    />
                    <Button
                      label='Delete'
                      variant='secondary'
                      icon={<FiTrash2 size={13} />}
                      onClick={() =>
                        deleteModal.show({
                          message: `Delete ${variable.key}?`,
                          description: 'Applications that reference it will fail to render until it is defined again.',
                          confirmLabel: 'Delete',
                          danger: true,
                          onConfirm: () => remove(variable),
                        })
                      }
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </DeployPage>
  );
};

const useStyles = mkUseStyles((t) => ({
  main: { flex: 1, minWidth: 0, gap: 2 },
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
