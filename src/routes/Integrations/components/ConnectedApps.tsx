import { format, formatDistanceToNow } from 'date-fns';
import { FiPlus } from 'react-icons/fi';
import { IntegrationTokenListResponse, IntegrationTokenResponse } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { usePermissionCatalog } from '~/hooks/usePermissionCatalog';
import { useToast } from '~/hooks/useToast';
import {
  CREATE_INTEGRATION_TOKEN_MODAL_ID,
  CreateIntegrationTokenModal,
} from '~/routes/Integrations/modals/CreateIntegrationTokenModal';
import { getApiErrorMessage } from '~/utils/apiError';
import { PlatformIcon, platformLabel } from '~/utils/integrationPlatform';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** Matches the backend's write throttle on `lastUsedAt`. */
const LAST_USED_RESOLUTION_MS = 5 * 60 * 1000;
const EXPIRY_WARNING_MS = 30 * 24 * 60 * 60 * 1000;
/** Beyond this the descriptions crowd the row out; the rest are counted. */
const SCOPES_SHOWN = 2;

/**
 * `lastUsedAt` is only written every five minutes, so anything finer would put
 * a stale number on screen dressed up as a live one.
 */
const formatLastUsed = (value?: string | null): string => {
  if (!value) return 'never used';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'never used';
  const age = Date.now() - date.getTime();
  if (age < LAST_USED_RESOLUTION_MS) return 'used in the last 5 minutes';
  return `used ${formatDistanceToNow(date, { addSuffix: true })}`;
};

const formatDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : format(date, 'd MMM yyyy');
};

export const ConnectedApps = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { integrationsApi } = useApi();
  const { describe } = usePermissionCatalog();
  const toast = useToast();

  const tokensQuery = useAsync<IntegrationTokenListResponse>(async () => {
    if (!integrationsApi) return undefined;
    const { data } = await integrationsApi.integrationControllerListTokens();
    return data;
  }, [integrationsApi]);

  const confirmModal = useModal('connected-apps-confirm', ConfirmModal, { title: 'Revoke access' });

  // Closing is deliberate only: the created token is shown once, and a stray
  // backdrop click would throw away a value nothing can recover.
  const createModal = useModal(CREATE_INTEGRATION_TOKEN_MODAL_ID, CreateIntegrationTokenModal, {
    disableClose: true,
    showHeader: false,
  });

  const openCreate = () => {
    createModal.show({
      onDone: () => createModal.hide(),
      onCreated: async () => {
        await tokensQuery.reload();
      },
    });
  };

  const revoke = (token: IntegrationTokenResponse) => {
    confirmModal.show({
      message: `Revoke “${token.name}”?`,
      description:
        'The app loses access the next time it connects — a request already in flight may still finish. Reconnecting means authorizing it again.',
      danger: true,
      confirmLabel: 'Revoke',
      onConfirm: async () => {
        if (!integrationsApi) return;
        try {
          await integrationsApi.integrationControllerRevokeToken({ id: token.id });
          await tokensQuery.reload();
          toast('Access revoked', 'success');
        } catch (e) {
          toast(getApiErrorMessage(e, 'Could not revoke this integration.'), 'error');
          throw e;
        }
      },
    });
  };

  const renderExpiry = (token: IntegrationTokenResponse) => {
    if (!token.expiresAt) return <span style={styles.meta}>Never expires</span>;
    const remaining = new Date(token.expiresAt).getTime() - Date.now();
    if (remaining <= 0) return <Badge label='Expired' tone='red' />;
    if (remaining < EXPIRY_WARNING_MS) {
      return (
        <Badge label={`Expires ${formatDistanceToNow(new Date(token.expiresAt), { addSuffix: true })}`} tone='yellow' />
      );
    }
    return <span style={styles.meta}>Expires {formatDate(token.expiresAt)}</span>;
  };

  const renderScopes = (scopes: string[]) => {
    const shown = scopes.slice(0, SCOPES_SHOWN).map(describe);
    const rest = scopes.length - shown.length;
    return [...shown, ...(rest > 0 ? [`+${rest} more`] : [])].join(' · ');
  };

  const renderToken = (token: IntegrationTokenResponse) => {
    const revoked = Boolean(token.revokedAt);
    return (
      <div key={token.id} style={{ ...styles.row, opacity: revoked ? 0.55 : 1 }}>
        <div style={styles.platformIcon}>
          <PlatformIcon platform={token.platform} size={18} color={theme.colors.blue04} />
        </div>

        <div style={styles.info}>
          <div style={styles.topLine}>
            <span style={styles.name}>{token.name}</span>
            <span style={styles.lastFour}>…{token.lastFour}</span>
            {revoked ? <Badge label='Revoked' tone='red' /> : renderExpiry(token)}
          </div>
          <span style={styles.meta}>{renderScopes(token.scopes)}</span>
          <span style={styles.meta}>
            {platformLabel(token.platform)} · Added {formatDate(token.createdAt)} ·{' '}
            {revoked ? `Revoked ${formatDate(token.revokedAt as string)}` : formatLastUsed(token.lastUsedAt)}
          </span>
        </div>

        {revoked ? null : <Button label='Revoke' variant='secondary' onClick={() => revoke(token)} />}
      </div>
    );
  };

  const tokens = tokensQuery.data?.tokens ?? [];

  return (
    <div style={styles.block}>
      <div style={styles.blockHeader}>
        <div style={styles.blockHeading}>
          <span style={styles.blockTitle}>Connected apps</span>
          <span style={styles.meta}>Apps and scripts acting on your account.</span>
        </div>
        <Button label='Add manually' variant='secondary' icon={<FiPlus size={14} />} onClick={openCreate} />
      </div>

      {tokensQuery.loading && !tokensQuery.data ? (
        <Loader />
      ) : tokens.length === 0 ? (
        <EmptyState
          title='No connected apps'
          description='Click “Authorize” in a desktop app to connect it, or add a token manually for a script.'
        />
      ) : (
        // The backend sorts active first, newest within each group.
        <div style={styles.list}>{tokens.map(renderToken)}</div>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  block: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  blockHeading: {
    gap: 2,
  },
  blockTitle: {
    fontWeight: 700,
    fontSize: 16,
  },
  list: {
    gap: t.spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  platformIcon: {
    width: 38,
    height: 38,
    minWidth: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.medium,
    backgroundColor: t.colors.blue + t.colorOpacity(0.1),
    border: `1px solid ${t.colors.blue + t.colorOpacity(0.22)}`,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
  name: {
    fontWeight: 600,
  },
  lastFour: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: t.colors.dark05,
  },
  meta: {
    fontSize: 12,
    color: t.colors.dark05,
    wordBreak: 'break-word',
  },
}));
