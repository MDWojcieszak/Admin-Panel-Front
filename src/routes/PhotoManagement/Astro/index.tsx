import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineSparkles } from 'react-icons/hi';
import { TbGalaxy } from 'react-icons/tb';
import {
  AstroObjectListResponse,
  AstroObjectResponse,
  PhotoEntryDetailsResponse,
  PhotoEntryListResponse,
  PhotoEntryResponse,
  PhotoEntryType,
} from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { CreateAstroObjectModal } from '~/routes/PhotoManagement/modals/CreateAstroObjectModal';
import { PhotoEntryDetailsModal } from '~/routes/PhotoManagement/modals/PhotoEntryDetailsModal';
import { buildNameQualifiers } from '~/routes/PhotoManagement/utils/entryNames';
import { getEntryColumn } from '~/routes/PhotoManagement/utils/kanban';
import { mkUseStyles, useTheme } from '~/utils/theme';

const COLUMN_LABELS: Record<string, string> = {
  PLANNED: 'Planned',
  AFTER_SHOOT: 'After shoot',
  SELECTING: 'Selecting',
  EDITING: 'Editing',
  FINISHED: 'Finished',
};

/**
 * Everything astro in one place. The targets used to sit in a narrow sidebar on
 * the main library, where they competed with sessions of every other type for
 * attention and had no room to say anything useful about themselves.
 */
export const Astro = () => {
  const styles = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const { astroObjectApi, photoEntryApi } = useApi();

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>();

  const astroObjectsQuery = useAsync<AstroObjectListResponse>(async () => {
    if (!astroObjectApi) return undefined;
    const { data } = await astroObjectApi.astroObjectControllerList({});
    return data;
  }, [astroObjectApi]);

  const sessionsQuery = useAsync<PhotoEntryListResponse>(async () => {
    if (!photoEntryApi) return undefined;
    const { data } = await photoEntryApi.photoEntryControllerList({
      type: PhotoEntryType.Astro,
      astroObjectId: selectedId,
    });
    return data;
  }, [photoEntryApi, selectedId]);

  const detailsQuery = useAsync<PhotoEntryDetailsResponse, [string]>(
    async (id) => {
      if (!photoEntryApi) return undefined;
      const { data } = await photoEntryApi.photoEntryControllerGetById({ id });
      return data;
    },
    [photoEntryApi],
    { immediate: false },
  );

  const refreshAll = async () => {
    await Promise.all([astroObjectsQuery.reload(), sessionsQuery.reload()]);
  };

  const createAstroObjectModal = useModal(
    'astro-create-object',
    CreateAstroObjectModal,
    { title: 'New Astro Target' },
    {
      handleClose: async () => {
        await refreshAll();
        createAstroObjectModal.hide();
      },
    },
  );

  const detailsModal = useModal(
    'astro-entry-details',
    PhotoEntryDetailsModal,
    { title: 'Astro Session' },
    {
      handleClose: async () => {
        await refreshAll();
        detailsModal.hide();
      },
      onSaved: async () => {
        await refreshAll();
      },
      onFoldersCreated: async () => {
        await refreshAll();
        detailsModal.hide();
      },
    },
  );

  const openSession = async (entry: PhotoEntryResponse) => {
    const details = await detailsQuery.reload(entry.id);
    if (!details) return;

    detailsModal.show({
      entry: details,
      astroObjects: astroObjectsQuery.data?.astroObjects ?? [],
      onSaved: async () => {
        await refreshAll();
      },
      onAddToAlbum: (entryId: string) => {
        detailsModal.hide();
        navigate(`/photo-management/albums?entry=${entryId}`);
      },
    });
  };

  const astroObjects = astroObjectsQuery.data?.astroObjects ?? [];

  const visibleObjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return astroObjects;
    return astroObjects.filter((item) =>
      [item.code, item.name].filter(Boolean).some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [astroObjects, search]);

  const sessions = sessionsQuery.data?.photoEntries ?? [];
  const sessionQualifiers = useMemo(() => buildNameQualifiers(sessions), [sessions]);
  const selected = astroObjects.find((item) => item.id === selectedId);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerText}>
          <span style={styles.title}>Astro</span>
          <span style={styles.subtitle}>
            {astroObjectsQuery.data?.total ?? 0} targets · {sessions.length} session(s)
            {selected ? ` for ${selected.code || selected.name}` : ''}
          </span>
        </div>

        <Button
          variant='secondary'
          label='New target'
          icon={<HiOutlineSparkles color={theme.colors.purple02} />}
          onClick={() => createAstroObjectModal.show()}
        />
      </div>

      <div style={styles.grid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>Targets</span>
            {selectedId ? (
              <Button label='Clear filter' variant='secondary' onClick={() => setSelectedId(undefined)} />
            ) : null}
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search targets…'
            style={styles.searchInput}
          />

          {astroObjectsQuery.loading && !astroObjectsQuery.data ? (
            <Loader />
          ) : visibleObjects.length === 0 ? (
            <EmptyState
              title={astroObjects.length ? 'No match' : 'No targets yet'}
              description={
                astroObjects.length ? 'Nothing matches that search.' : 'Add your first target to get started.'
              }
            />
          ) : (
            <Scrollbar style={styles.panelScroll}>
              <div style={styles.targetList}>
                {visibleObjects.map((item) => (
                  <TargetCard
                    key={item.id}
                    item={item}
                    selected={item.id === selectedId}
                    onClick={() => setSelectedId((prev) => (prev === item.id ? undefined : item.id))}
                  />
                ))}
              </div>
            </Scrollbar>
          )}
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>{selected ? `Sessions · ${selected.code || selected.name}` : 'All astro sessions'}</span>
          </div>

          {sessionsQuery.loading && !sessionsQuery.data ? (
            <Loader />
          ) : sessions.length === 0 ? (
            <EmptyState
              title='No astro sessions'
              description={
                selected
                  ? 'Nothing has been shot for this target yet.'
                  : 'Astro sessions created in the library show up here.'
              }
            />
          ) : (
            <Scrollbar style={styles.panelScroll}>
              <div style={styles.sessionList}>
                {sessions.map((entry) => {
                  const column = getEntryColumn(entry);
                  return (
                    <div
                      key={entry.id}
                      role='button'
                      tabIndex={0}
                      style={styles.sessionRow}
                      onClick={() => openSession(entry)}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter' && e.key !== ' ') return;
                        e.preventDefault();
                        openSession(entry);
                      }}
                    >
                      <div style={styles.sessionText}>
                        <span style={styles.sessionName}>
                          {entry.name}
                          {sessionQualifiers.get(entry.id) ? (
                            <span style={{ opacity: 0.55, fontWeight: 400 }}> · {sessionQualifiers.get(entry.id)}</span>
                          ) : null}
                        </span>
                        <span style={styles.sessionMeta}>
                          {entry.startDate ? new Date(entry.startDate).toLocaleDateString() : 'No date'}
                        </span>
                      </div>

                      {entry.isHappeningNow ? <Badge label='Now' tone='blue' /> : null}
                      <Badge
                        label={column ? COLUMN_LABELS[column] ?? column : 'Cancelled'}
                        tone={column === 'FINISHED' ? 'green' : column ? 'neutral' : 'red'}
                      />
                    </div>
                  );
                })}
              </div>
            </Scrollbar>
          )}
        </div>
      </div>
    </div>
  );
};

const TargetCard = ({
  item,
  selected,
  onClick,
}: {
  item: AstroObjectResponse;
  selected: boolean;
  onClick: () => void;
}) => {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <button
      type='button'
      onClick={onClick}
      style={{
        ...styles.targetCard,
        borderColor: selected ? theme.colors.purple02 : 'transparent',
        backgroundColor: selected
          ? theme.colors.purple02 + theme.colorOpacity(0.12)
          : theme.colors.gray04 + theme.colorOpacity(0.5),
      }}
    >
      <div style={styles.targetThumb}>
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.name} style={styles.targetImg} />
        ) : (
          <TbGalaxy size={20} color={theme.colors.purple02} />
        )}
      </div>

      <div style={styles.targetText}>
        <span style={styles.targetTitle}>{item.code || item.name}</span>
        {item.code ? <span style={styles.targetSubtitle}>{item.name}</span> : null}
      </div>
    </button>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    height: '100%',
    minHeight: 0,
    gap: t.spacing.m,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
  },
  headerText: {
    gap: 2,
    minWidth: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  grid: {
    flex: 1,
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 380px) minmax(0, 1fr)',
    gap: t.spacing.m,
  },
  panel: {
    minWidth: 0,
    minHeight: 0,
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.s,
  },
  panelTitle: {
    fontWeight: 700,
    fontSize: 15,
    minWidth: 0,
    wordBreak: 'break-word',
  },
  panelScroll: {
    flex: 1,
    minHeight: 0,
  },
  searchInput: {
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.blue02 + t.colorOpacity(0.5)}`,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
    color: t.colors.white,
    outline: 'none',
    fontSize: 13,
  },
  targetList: {
    gap: t.spacing.xs,
    paddingRight: t.spacing.s,
  },
  targetCard: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: 'pointer',
    textAlign: 'left',
  },
  targetThumb: {
    width: 40,
    height: 40,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    backgroundColor: t.colors.purple02 + t.colorOpacity(0.1),
  },
  targetImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  targetText: {
    minWidth: 0,
    gap: 2,
  },
  targetTitle: {
    fontWeight: 600,
    fontSize: 14,
    color: t.colors.white,
  },
  targetSubtitle: {
    fontSize: 12,
    color: t.colors.dark05,
    wordBreak: 'break-word',
  },
  sessionList: {
    gap: t.spacing.xs,
    paddingRight: t.spacing.s,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
    cursor: 'pointer',
  },
  sessionText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  sessionName: {
    fontWeight: 600,
    fontSize: 14,
  },
  sessionMeta: {
    fontSize: 12,
    color: t.colors.dark05,
  },
}));
