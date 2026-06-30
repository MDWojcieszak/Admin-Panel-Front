import { useState } from 'react';
import { FiExternalLink, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { MdPhotoLibrary } from 'react-icons/md';
import { ImmichAlbumItemResponse, ImmichAlbumListResponse, ImmichAlbumSource, ImmichStatusResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage, getApiErrorStatus } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

type ImmichAlbumsSectionProps = {
  photoEntryId: string;
  /** Jump to the Immich Albums tab (prefilled for this entry) — the create/attach UI lives there. */
  onAddToAlbum: () => void;
};

const SOURCE_LABELS: Record<ImmichAlbumSource, string> = {
  EXPORT: 'Export',
  EDIT: 'Edit',
  SELECTS: 'Selects',
  SOURCE: 'Source',
  DELIVERY: 'Delivery',
  ENTIRE: 'Entire',
};

const immichError = (e: unknown, fallback: string): string =>
  getApiErrorStatus(e) === 502 ? 'Immich is unreachable — check the integration configuration.' : getApiErrorMessage(e, fallback);

const formatDateTime = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

export const ImmichAlbumsSection = ({ photoEntryId, onAddToAlbum }: ImmichAlbumsSectionProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { immichApi } = useApi();
  const toast = useToast();
  const can = useCan();
  const canManage = can('photoEntry.manage');

  const [busyId, setBusyId] = useState<string>();

  const albumsQuery = useAsync<ImmichAlbumListResponse>(async () => {
    if (!immichApi) return undefined;
    const { data } = await immichApi.immichControllerListAlbums({ photoEntryId });
    return data;
  }, [immichApi, photoEntryId]);

  const statusQuery = useAsync<ImmichStatusResponse>(async () => {
    if (!immichApi) return undefined;
    const { data } = await immichApi.immichControllerGetStatus();
    return data;
  }, [immichApi]);

  const connected = statusQuery.data?.connected;

  const handleRefresh = async (album: ImmichAlbumItemResponse) => {
    if (!immichApi) return;
    setBusyId(album.id);
    try {
      const { data } = await immichApi.immichControllerRefreshAlbum({ id: album.id });
      toast(`Added ${data.assetsAdded} new photo${data.assetsAdded === 1 ? '' : 's'}`, 'success');
      await albumsQuery.reload();
    } catch (e) {
      toast(immichError(e, 'Could not refresh the album.'), 'error');
    } finally {
      setBusyId(undefined);
    }
  };

  const albums = albumsQuery.data?.albums ?? [];

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <div style={styles.iconWrap}>
          <MdPhotoLibrary size={14} color={theme.colors.blue04} />
        </div>
        <div style={styles.headerText}>
          <span style={styles.title}>Immich albums</span>
          <span style={styles.description}>Albums fed by this entry&apos;s folders.</span>
        </div>
        {canManage ? (
          <Button label='Add to album' variant='secondary' icon={<FiPlus size={14} />} onClick={onAddToAlbum} />
        ) : null}
      </div>

      {statusQuery.data && !connected ? (
        <div style={styles.warning}>Connect Immich first (Integrations) to manage albums.</div>
      ) : null}

      {albumsQuery.loading && !albumsQuery.data ? (
        <Loader />
      ) : albums.length === 0 ? (
        <span style={styles.empty}>Not in any album yet.</span>
      ) : (
        <div style={styles.list}>
          {albums.map((album) => (
            <div key={album.id} style={styles.row}>
              <div style={styles.rowInfo}>
                <a href={album.albumUrl} target='_blank' rel='noreferrer' style={styles.albumLink}>
                  {album.albumName}
                  <FiExternalLink size={12} />
                </a>
                <span style={styles.rowMeta}>
                  {SOURCE_LABELS[album.source]} · {album.lastAssetCount ?? 0} photos · synced {formatDateTime(album.lastSyncedAt)}
                </span>
              </div>
              {canManage ? (
                <div style={styles.rowActions}>
                  <Button
                    label='Refresh'
                    variant='secondary'
                    icon={<FiRefreshCw size={13} />}
                    onClick={() => handleRefresh(album)}
                    loading={busyId === album.id}
                    disabled={!connected || busyId === album.id}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  section: {
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: 12,
    border: `1px solid ${t.colors.gray01}`,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  iconWrap: {
    width: 28,
    height: 28,
    minWidth: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.blue + t.colorOpacity(0.12),
    border: `1px solid ${t.colors.blue + t.colorOpacity(0.2)}`,
  },
  headerText: {
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: 600,
  },
  description: {
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
  list: {
    gap: t.spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  rowInfo: {
    gap: 4,
    minWidth: 0,
    flex: 1,
  },
  albumLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    fontWeight: 600,
    color: t.colors.blue04,
    textDecoration: 'none',
    width: 'fit-content',
  },
  rowMeta: {
    fontSize: 12,
    color: t.colors.dark05,
    wordBreak: 'break-word',
  },
  rowActions: {
    flexDirection: 'row',
    gap: t.spacing.s,
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  empty: {
    fontSize: 13,
    color: t.colors.dark05,
  },
}));
