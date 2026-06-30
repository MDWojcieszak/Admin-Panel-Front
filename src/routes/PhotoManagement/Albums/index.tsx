import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiExternalLink, FiImage, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { MdPhotoLibrary } from 'react-icons/md';
import {
  AstroObjectListResponse,
  ImmichAlbumBrowseResponse,
  ImmichAlbumEntryLinkResponse,
  ImmichAlbumSource,
  ImmichAssetPreviewResponse,
  ImmichBrowseAlbumResponse,
  ImmichStatusResponse,
  PhotoEntryListResponse,
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
import { AlbumLinkModal } from '~/routes/PhotoManagement/Albums/AlbumLinkModal';
import { DetachConfirmModal } from '~/routes/PhotoManagement/Albums/DetachConfirmModal';
import { EmptyAlbumModal } from '~/routes/PhotoManagement/Albums/EmptyAlbumModal';
import { ImmichThumb } from '~/routes/PhotoManagement/components/ImmichThumb';
import { getApiErrorMessage, getApiErrorStatus } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

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

export const ImmichAlbums = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { immichApi, photoEntryApi, astroObjectApi } = useApi();
  const toast = useToast();
  const can = useCan();
  const canManage = can('photoEntry.manage');

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string>();

  const [detailAssets, setDetailAssets] = useState<ImmichAssetPreviewResponse[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const [busyId, setBusyId] = useState<string>();
  const detailReqId = useRef(0);

  const browseQuery = useAsync<ImmichAlbumBrowseResponse>(async () => {
    if (!immichApi) return undefined;
    const { data } = await immichApi.immichControllerBrowseAlbums();
    return data;
  }, [immichApi]);

  const statusQuery = useAsync<ImmichStatusResponse>(async () => {
    if (!immichApi) return undefined;
    const { data } = await immichApi.immichControllerGetStatus();
    return data;
  }, [immichApi]);

  const entriesQuery = useAsync<PhotoEntryListResponse>(async () => {
    if (!photoEntryApi) return undefined;
    const { data } = await photoEntryApi.photoEntryControllerList({});
    return data;
  }, [photoEntryApi]);

  const astroQuery = useAsync<AstroObjectListResponse>(async () => {
    if (!astroObjectApi) return undefined;
    const { data } = await astroObjectApi.astroObjectControllerList({});
    return data;
  }, [astroObjectApi]);

  const albums = browseQuery.data?.albums ?? [];
  const entries = entriesQuery.data?.photoEntries ?? [];
  const astroObjects = astroQuery.data?.astroObjects ?? [];
  const connected = statusQuery.data?.connected;
  const selected = albums.find((a) => a.albumId === selectedId);

  const entryName = (id: string) => entries.find((e) => e.id === id)?.name ?? id.slice(0, 8);

  const createModal = useModal('immich-album-create', AlbumLinkModal, { title: 'Create album' });
  const attachModal = useModal('immich-album-attach', AlbumLinkModal, { title: 'Add photo entry' });
  const detachModal = useModal('immich-album-detach', DetachConfirmModal, { title: 'Detach photo entry' });
  const emptyModal = useModal('immich-album-empty', EmptyAlbumModal, { title: 'New empty album' });
  const deleteAlbumModal = useModal('immich-album-delete', ConfirmModal, { title: 'Delete album' });

  const openCreate = (defaultEntryId?: string) => {
    createModal.show({
      mode: 'create',
      entries,
      astroObjects,
      defaultEntryId,
      onDone: async () => {
        await browseQuery.reload();
      },
    });
  };

  const openAttach = (album: ImmichBrowseAlbumResponse) => {
    attachModal.show({
      mode: 'attach',
      albumId: album.albumId,
      albumName: album.albumName,
      entries,
      astroObjects,
      onDone: async () => {
        await browseQuery.reload();
      },
    });
  };

  const openEmpty = () => {
    emptyModal.show({
      onDone: async () => {
        await browseQuery.reload();
      },
    });
  };

  const deleteAlbum = (album: ImmichBrowseAlbumResponse) => {
    deleteAlbumModal.show({
      message: `Delete album “${album.albumName}” in Immich?`,
      description: 'The album is deleted on the Immich server (the photos stay in your library) and all tracking links are removed.',
      danger: true,
      confirmLabel: 'Delete album',
      onConfirm: async () => {
        if (!immichApi) return;
        try {
          const { data } = await immichApi.immichControllerDeleteAlbum({ albumId: album.albumId });
          toast(`Album deleted (${data.removedLinks} link${data.removedLinks === 1 ? '' : 's'} removed)`, 'success');
          setSelectedId(undefined);
          await browseQuery.reload();
        } catch (e) {
          toast(immichError(e, 'Could not delete the album.'), 'error');
          throw e;
        }
      },
    });
  };

  // Deep link from the photo-entry modal: ?entry=<id> opens "Create album" prefilled.
  const handledEntryParam = useRef(false);
  useEffect(() => {
    const entryId = searchParams.get('entry');
    if (!entryId) {
      handledEntryParam.current = false; // re-arm for the next deep link
      return;
    }
    // Wait until entries AND the astro catalog have settled (data or error), so the
    // modal's snapshotted props aren't empty when an ASTRO entry is prefilled.
    const astroSettled = astroQuery.data !== undefined || astroQuery.error !== undefined;
    if (handledEntryParam.current || !entries.length || !astroSettled) return;
    handledEntryParam.current = true;
    openCreate(entryId);
    searchParams.delete('entry');
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, entries, astroQuery.data, astroQuery.error]);

  // Album photos = union of every linked entry's folder preview (no album-assets endpoint).
  const loadDetailAssets = async (album: ImmichBrowseAlbumResponse) => {
    if (!immichApi) return;
    const reqId = ++detailReqId.current;
    setDetailLoading(true);
    setDetailError(false);
    try {
      const results = await Promise.all(
        album.entries.map((link) =>
          immichApi
            .immichControllerPreviewAlbum({
              previewImmichAlbumDto: {
                photoEntryId: link.photoEntryId,
                source: link.source,
                astroObjectId: link.astroObjectId || undefined,
              },
            })
            .then((r) => ({ assets: r.data.assets ?? [], ok: true }))
            .catch(() => ({ assets: [] as ImmichAssetPreviewResponse[], ok: false })),
        ),
      );
      if (reqId !== detailReqId.current) return; // superseded by a newer load
      const map = new Map<string, ImmichAssetPreviewResponse>();
      results.flatMap((r) => r.assets).forEach((a) => map.set(a.id, a));
      setDetailAssets([...map.values()]);
      // Distinguish "genuinely empty" from "couldn't reach Immich".
      setDetailError(map.size === 0 && results.some((r) => !r.ok));
    } finally {
      if (reqId === detailReqId.current) setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (selected) loadDetailAssets(selected);
    else setDetailAssets([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, browseQuery.data]);

  const refreshLink = async (link: ImmichAlbumEntryLinkResponse) => {
    if (!immichApi) return;
    setBusyId(link.id);
    try {
      const { data } = await immichApi.immichControllerRefreshAlbum({ id: link.id });
      toast(`Added ${data.assetsAdded} new photo${data.assetsAdded === 1 ? '' : 's'}`, 'success');
      await browseQuery.reload();
    } catch (e) {
      toast(immichError(e, 'Could not refresh the link.'), 'error');
    } finally {
      setBusyId(undefined);
    }
  };

  const detachLink = async (link: ImmichAlbumEntryLinkResponse, removeAssets: boolean) => {
    if (!immichApi) return;
    try {
      const { data } = await immichApi.immichControllerDetachEntry({ id: link.id, removeAssets });
      toast(removeAssets ? `Detached — removed ${data.removedAssets} photos` : 'Detached — photos kept', 'success');
      await browseQuery.reload();
    } catch (e) {
      toast(immichError(e, 'Could not detach the entry.'), 'error');
      throw e; // keep the confirm modal open on failure
    }
  };

  const openDetach = (link: ImmichAlbumEntryLinkResponse) => {
    detachModal.show({
      entryName: entryName(link.photoEntryId),
      source: SOURCE_LABELS[link.source],
      onConfirm: (removeAssets: boolean) => detachLink(link, removeAssets),
    });
  };

  // ---- Album detail ---------------------------------------------------------
  if (selectedId && selected) {
    return (
      <div style={styles.scroll}>
        <div style={styles.content}>
          <div style={styles.detailHeader}>
            <Button label='Back' variant='secondary' icon={<FiArrowLeft size={14} />} onClick={() => setSelectedId(undefined)} />
            <div style={styles.detailTitleWrap}>
              <span style={styles.detailTitle}>{selected.albumName}</span>
              <span style={styles.detailMeta}>{selected.assetCount} photos · {selected.entries.length} linked entries</span>
            </div>
            <a href={selected.albumUrl} target='_blank' rel='noreferrer' style={styles.openLink}>
              Open in Immich <FiExternalLink size={13} />
            </a>
            {canManage ? (
              <Button label='Delete album' variant='danger' icon={<FiTrash2 size={14} />} onClick={() => deleteAlbum(selected)} />
            ) : null}
          </div>

          <div style={styles.block}>
            <div style={styles.blockHeader}>
              <span style={styles.blockTitle}>Linked photo entries</span>
              {canManage ? (
                <Button
                  label='Add photo entry'
                  variant='secondary'
                  icon={<FiPlus size={14} />}
                  onClick={() => openAttach(selected)}
                  disabled={!connected}
                />
              ) : null}
            </div>

            {selected.entries.length === 0 ? (
              <span style={styles.muted}>No photo entries linked.</span>
            ) : (
              <div style={styles.entryList}>
                {selected.entries.map((link) => (
                  <div key={link.id} style={styles.entryRow}>
                    <div style={styles.entryInfo}>
                      <div style={styles.entryTop}>
                        <span style={styles.entryName}>{entryName(link.photoEntryId)}</span>
                        <Badge label={SOURCE_LABELS[link.source]} tone='blue' />
                      </div>
                      <span style={styles.entryMeta}>
                        {link.lastAssetCount ?? 0} photos · synced {formatDateTime(link.lastSyncedAt)}
                      </span>
                    </div>
                    {canManage ? (
                      <div style={styles.entryActions}>
                        <Button
                          label='Refresh'
                          variant='secondary'
                          icon={<FiRefreshCw size={13} />}
                          onClick={() => refreshLink(link)}
                          loading={busyId === link.id}
                          disabled={!connected || busyId === link.id}
                        />
                        <Button label='Detach' variant='secondary' onClick={() => openDetach(link)} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.block}>
            <span style={styles.blockTitle}>Photos</span>
            {detailLoading ? (
              <div style={styles.stateBox}>
                <Loader />
              </div>
            ) : detailError ? (
              <div style={styles.stateBox}>
                <FiImage size={22} color={theme.colors.dark05} />
                <span style={styles.muted}>Couldn’t load photos — Immich may be unreachable.</span>
              </div>
            ) : detailAssets.length === 0 ? (
              <div style={styles.stateBox}>
                <FiImage size={22} color={theme.colors.dark05} />
                <span style={styles.muted}>No photos to preview.</span>
              </div>
            ) : (
              <div style={styles.photoGrid}>
                {detailAssets.map((asset) => (
                  <ImmichThumb key={asset.id} assetId={asset.id} fileName={asset.originalFileName} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- Album grid -----------------------------------------------------------
  return (
    <div style={styles.scroll}>
      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.titleWrap}>
            <h2 style={styles.heading}>Immich Albums</h2>
            <span style={styles.subheading}>Albums on your Immich server and the photo entries feeding them.</span>
          </div>
          <div style={styles.headerActions}>
            <Button
              label='Refresh'
              variant='secondary'
              icon={<FiRefreshCw size={14} />}
              onClick={() => browseQuery.reload()}
              loading={browseQuery.loading}
            />
            {canManage ? (
              <Button label='Empty album' variant='secondary' icon={<FiPlus size={14} />} onClick={openEmpty} disabled={!connected} />
            ) : null}
            {canManage ? <Button label='Create album' icon={<FiPlus size={14} />} onClick={() => openCreate()} disabled={!connected} /> : null}
          </div>
        </div>

        {statusQuery.data && !connected ? (
          <div style={styles.warning}>Connect Immich first (Integrations) to browse and manage albums.</div>
        ) : null}

        {browseQuery.loading && !browseQuery.data ? (
          <Loader />
        ) : albums.length === 0 ? (
          <EmptyState
            icon={<MdPhotoLibrary size={26} color={theme.colors.blue04} />}
            title='No albums yet'
            description={connected ? 'Create an album from a photo entry folder to get started.' : 'Connect Immich to see albums.'}
          />
        ) : (
          <div style={styles.albumGrid}>
            {albums.map((album) => (
              <div key={album.albumId} style={styles.albumCard} onClick={() => setSelectedId(album.albumId)}>
                <div style={styles.cover}>
                  <ImmichThumb path={album.thumbnailUrl || undefined} fileName={album.albumName} />
                </div>
                <div style={styles.albumInfo}>
                  <span style={styles.albumName} title={album.albumName}>
                    {album.albumName}
                  </span>
                  <span style={styles.albumMeta}>
                    {album.assetCount} photos · {album.entries.length} linked
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  scroll: {
    height: '100%',
    minHeight: 0,
    width: '100%',
    overflowY: 'auto',
  },
  content: {
    gap: t.spacing.l,
    paddingBottom: t.spacing.m,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  titleWrap: {
    gap: 2,
    minWidth: 0,
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
  },
  subheading: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  headerActions: {
    flexDirection: 'row',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
  warning: {
    fontSize: 13,
    color: t.colors.yellow,
    backgroundColor: t.colors.yellow + t.colorOpacity(0.1),
    border: `1px solid ${t.colors.yellow + t.colorOpacity(0.25)}`,
    borderRadius: t.borderRadius.default,
    padding: t.spacing.s,
  },
  albumGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: t.spacing.m,
  },
  albumCard: {
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    cursor: 'pointer',
    border: `1px solid ${t.colors.gray01 + t.colorOpacity(0.5)}`,
  },
  cover: {
    width: '100%',
  },
  albumInfo: {
    gap: 2,
    minWidth: 0,
  },
  albumName: {
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  albumMeta: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  // detail
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
  },
  detailTitleWrap: {
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  detailMeta: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  openLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    fontWeight: 600,
    fontSize: 13,
    color: t.colors.blue04,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
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
  entryList: {
    gap: t.spacing.s,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  entryInfo: {
    gap: 4,
    minWidth: 0,
    flex: 1,
  },
  entryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
  entryName: {
    fontWeight: 600,
  },
  entryMeta: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
    gap: t.spacing.s,
  },
  stateBox: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.s,
  },
  muted: {
    fontSize: 13,
    color: t.colors.dark05,
  },
}));
