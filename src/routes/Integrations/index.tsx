import { FiKey, FiPlus, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import {
  ApiKeyType,
  ConnectedServiceType,
  ImmichStatusResponse,
  TokenListResponseDto,
  TokenMetadataResponseDto,
} from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { ImmichCard } from '~/routes/Integrations/components/ImmichCard';
import { ImmichLibraries } from '~/routes/Integrations/components/ImmichLibraries';
import { GenerateTokenModal } from '~/routes/Integrations/modals/GenerateTokenModal';
import { ImmichConfigModal } from '~/routes/Integrations/modals/ImmichConfigModal';
import { ServiceTokenModal } from '~/routes/Integrations/modals/ServiceTokenModal';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, 'd MMM yyyy');
};

export const Integrations = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { tokenApi, immichApi } = useApi();
  const toast = useToast();
  const can = useCan();
  const canManage = can('token.manage');

  const tokensQuery = useAsync<TokenListResponseDto>(async () => {
    if (!tokenApi) return undefined;
    const { data } = await tokenApi.tokenControllerListTokens({ take: 20, skip: 0 });
    return data;
  }, [tokenApi]);

  const immichStatusQuery = useAsync<ImmichStatusResponse>(async () => {
    if (!immichApi) return undefined;
    const { data } = await immichApi.immichControllerGetStatus();
    return data;
  }, [immichApi]);

  const confirmModal = useModal('integrations-confirm', ConfirmModal, { title: 'Confirm' });

  const immichConfigModal = useModal('immich-config', ImmichConfigModal, { title: 'Connect Immich' });
  const serviceTokenModal = useModal('service-token', ServiceTokenModal, { title: 'Add service token' });
  const generateTokenModal = useModal('generate-token', GenerateTokenModal, { title: 'Generate token' });

  const openImmichConfig = () => {
    immichConfigModal.show({
      baseUrl: immichStatusQuery.data?.baseUrl,
      libraryPath: immichStatusQuery.data?.libraryPath,
      onSaved: async (status: ImmichStatusResponse) => {
        immichStatusQuery.setData(status);
        await tokensQuery.reload();
      },
    });
  };

  const openServiceToken = () => {
    serviceTokenModal.show({
      onSaved: async () => {
        await tokensQuery.reload();
      },
    });
  };

  const openGenerateToken = () => {
    generateTokenModal.show({
      onSaved: async () => {
        await tokensQuery.reload();
      },
    });
  };

  const disconnectImmich = () => {
    confirmModal.show({
      message: 'Disconnect Immich?',
      description: 'Removes the stored credentials. Albums already created stay in Immich.',
      danger: true,
      confirmLabel: 'Disconnect',
      onConfirm: async () => {
        if (!immichApi) return;
        try {
          await immichApi.immichControllerRemoveConfig();
          await Promise.all([immichStatusQuery.reload(), tokensQuery.reload()]);
          toast('Immich disconnected', 'success');
        } catch (e) {
          toast(getApiErrorMessage(e, 'Could not disconnect Immich.'), 'error');
          throw e;
        }
      },
    });
  };

  const deleteToken = (token: TokenMetadataResponseDto) => {
    confirmModal.show({
      message: `Delete "${token.name}"?`,
      description: 'This revokes the token and cannot be undone.',
      danger: true,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        if (!tokenApi) return;
        try {
          await tokenApi.tokenControllerDeleteToken({ id: token.id });
          await tokensQuery.reload();
          toast('Token deleted', 'success');
        } catch (e) {
          toast(getApiErrorMessage(e, 'Could not delete the token.'), 'error');
          throw e;
        }
      },
    });
  };

  const tokens = tokensQuery.data?.tokens ?? [];
  const serviceTokens = tokens.filter((t) => t.type === ApiKeyType.External);
  const personalTokens = tokens.filter((t) => t.type === ApiKeyType.Internal || t.type === ApiKeyType.Ai);

  const renderTokenRow = (token: TokenMetadataResponseDto, opts?: { hideDelete?: boolean }) => (
    <div key={token.id} style={styles.tokenRow}>
      <div style={styles.tokenInfo}>
        <div style={styles.tokenTopLine}>
          <span style={styles.tokenName}>{token.name}</span>
          <Badge label={token.service} tone={token.service === ConnectedServiceType.Immich ? 'green' : 'blue'} />
          {token.type !== ApiKeyType.External ? <Badge label={token.type} tone='purple' /> : null}
        </div>
        <span style={styles.tokenMeta}>
          {[
            token.baseUrl,
            `Added ${formatDate(token.createdAt)}`,
            token.expiresAt ? `Expires ${formatDate(token.expiresAt)}` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </div>
      {canManage && !opts?.hideDelete ? (
        <div style={styles.deleteBtn} onClick={() => deleteToken(token)} title='Delete token'>
          <FiTrash2 size={15} color={theme.colors.red} />
        </div>
      ) : null}
    </div>
  );

  return (
    <div style={styles.scroll}>
      <div style={styles.content}>
        <h2 style={styles.heading}>Integrations</h2>

      <ImmichCard
        status={immichStatusQuery.data}
        loading={immichStatusQuery.loading}
        checking={immichStatusQuery.loading}
        canManage={canManage}
        onConnect={openImmichConfig}
        onCheck={() => immichStatusQuery.reload()}
        onDisconnect={disconnectImmich}
      />

      {can('photoEntry.read') && immichStatusQuery.data?.connected ? <ImmichLibraries /> : null}

      <div style={styles.block}>
        <div style={styles.blockHeader}>
          <span style={styles.blockTitle}>Connected services</span>
          {canManage ? (
            <Button label='Add service token' variant='secondary' icon={<FiPlus size={14} />} onClick={openServiceToken} />
          ) : null}
        </div>

        {tokensQuery.loading && !tokensQuery.data ? (
          <Loader />
        ) : serviceTokens.length === 0 ? (
          <EmptyState
            title='No service tokens'
            description='Connect Immich above, or add a token for another service.'
          />
        ) : (
          <div style={styles.tokenList}>
            {serviceTokens.map((token) =>
              renderTokenRow(token, { hideDelete: token.service === ConnectedServiceType.Immich }),
            )}
          </div>
        )}
      </div>

      <div style={styles.block}>
        <div style={styles.blockHeader}>
          <span style={styles.blockTitle}>Personal access tokens</span>
          {canManage ? (
            <Button label='Generate token' variant='secondary' icon={<FiKey size={14} />} onClick={openGenerateToken} />
          ) : null}
        </div>

        {tokensQuery.loading && !tokensQuery.data ? (
          <Loader />
        ) : personalTokens.length === 0 ? (
          <EmptyState title='No personal tokens' description='Generate a write-once token for scripts or integrations.' />
        ) : (
          <div style={styles.tokenList}>{personalTokens.map((token) => renderTokenRow(token))}</div>
        )}
        </div>
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  scroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
  },
  content: {
    width: '100%',
    maxWidth: 760,
    marginLeft: 'auto',
    marginRight: 'auto',
    gap: t.spacing.l,
    paddingBottom: t.spacing.m,
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
  },
  block: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  blockTitle: {
    fontWeight: 700,
    fontSize: 16,
  },
  tokenList: {
    gap: t.spacing.s,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  tokenInfo: {
    gap: 4,
    minWidth: 0,
    flex: 1,
  },
  tokenTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
  tokenName: {
    fontWeight: 600,
  },
  tokenMeta: {
    fontSize: 12,
    color: t.colors.dark05,
    wordBreak: 'break-word',
  },
  deleteBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    backgroundColor: t.colors.red + t.colorOpacity(0.1),
    border: `1px solid ${t.colors.red + t.colorOpacity(0.22)}`,
  },
}));
