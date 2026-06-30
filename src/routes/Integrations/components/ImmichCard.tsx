import { FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { MdPhotoLibrary } from 'react-icons/md';
import { ImmichStatusResponse } from '~/api/api';
import { Badge, BadgeTone } from '~/components/Badge';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { mkUseStyles, useTheme } from '~/utils/theme';

type ImmichCardProps = {
  status?: ImmichStatusResponse;
  loading: boolean;
  checking: boolean;
  canManage: boolean;
  onConnect: () => void;
  onCheck: () => void;
  onDisconnect: () => void;
};

const statusBadge = (status?: ImmichStatusResponse): { label: string; tone: BadgeTone } => {
  if (!status?.configured) return { label: 'Not connected', tone: 'neutral' };
  if (status.connected) return { label: 'Connected', tone: 'green' };
  return { label: 'Configured · offline', tone: 'yellow' };
};

export const ImmichCard = ({
  status,
  loading,
  checking,
  canManage,
  onConnect,
  onCheck,
  onDisconnect,
}: ImmichCardProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const badge = statusBadge(status);
  const configured = !!status?.configured;

  return (
    <div style={styles.block}>
      <div style={styles.header}>
        <div style={styles.titleWrap}>
          <div style={styles.iconWrap}>
            <MdPhotoLibrary size={18} color={theme.colors.blue04} />
          </div>
          <div style={styles.titleText}>
            <span style={styles.title}>Immich</span>
            <span style={styles.subtitle}>Create photo albums from your library folders.</span>
          </div>
        </div>
        <Badge label={badge.label} tone={badge.tone} />
      </div>

      {loading && !status ? (
        <Loader />
      ) : (
        <>
          {configured ? (
            <>
              <div style={styles.metaCard}>
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Server</span>
                  <span style={styles.metaValue}>{status?.baseUrl || '—'}</span>
                </div>
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Version</span>
                  <span style={styles.metaValue}>
                    {status?.connected ? status?.serverVersion || 'Unknown' : 'Unreachable'}
                  </span>
                </div>
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Library path</span>
                  <span style={styles.metaValue}>{status?.libraryPath || 'Not set'}</span>
                </div>
              </div>
              {!status?.libraryPath ? (
                <span style={styles.warning}>Set a library path to enable album creation from photo entries.</span>
              ) : null}
            </>
          ) : (
            <span style={styles.muted}>
              Connect your Immich server to enable album creation from photo entries.
            </span>
          )}

          <div style={styles.actions}>
            {configured ? (
              <Button
                label='Check connection'
                variant='secondary'
                icon={<FiRefreshCw size={14} />}
                onClick={onCheck}
                loading={checking}
              />
            ) : null}
            {canManage ? (
              <Button
                label={configured ? 'Edit' : 'Connect'}
                icon={configured ? undefined : <FiCheckCircle size={14} />}
                onClick={onConnect}
              />
            ) : null}
            {canManage && configured ? <Button label='Disconnect' variant='danger' onClick={onDisconnect} /> : null}
          </div>
        </>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    minWidth: 0,
  },
  iconWrap: {
    width: 34,
    height: 34,
    minWidth: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.blue + t.colorOpacity(0.12),
    border: `1px solid ${t.colors.blue + t.colorOpacity(0.22)}`,
  },
  titleText: {
    gap: 2,
    minWidth: 0,
  },
  title: {
    fontWeight: 700,
    fontSize: 16,
  },
  subtitle: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  metaCard: {
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    alignItems: 'flex-start',
  },
  metaLabel: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: 500,
    maxWidth: '70%',
    textAlign: 'right',
    wordBreak: 'break-word',
  },
  muted: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  warning: {
    fontSize: 13,
    color: t.colors.yellow,
    backgroundColor: t.colors.yellow + t.colorOpacity(0.1),
    border: `1px solid ${t.colors.yellow + t.colorOpacity(0.25)}`,
    borderRadius: t.borderRadius.default,
    padding: t.spacing.s,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.s,
  },
}));
