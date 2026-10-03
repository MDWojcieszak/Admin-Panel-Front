import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AstroObjectListResponse,
  PhotoEntryDetailsResponse,
  PhotoEntryListResponse,
  PhotoEntryPostStage,
  PhotoEntryResponse,
  PhotoEntryStatus,
  PhotoEntryType,
} from '~/api/api';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { PhotoEntryCalendarView } from '~/routes/PhotoManagement/components/PhotoEntryCalendarView';
import { PhotoEntryKanban } from '~/routes/PhotoManagement/components/PhotoEntryKanban';
import { PhotoEntryListView } from '~/routes/PhotoManagement/components/PhotoEntryListView';
import { PhotoLibraryToolbar, PhotoLibraryView } from '~/routes/PhotoManagement/components/PhotoLibraryToolbar';
import { CreateAstroObjectModal } from '~/routes/PhotoManagement/modals/CreateAstroObjectModal';
import { CreatePhotoEntryModal } from '~/routes/PhotoManagement/modals/CreatePhotoEntryModal';
import { PhotoEntryDetailsModal } from '~/routes/PhotoManagement/modals/PhotoEntryDetailsModal';
import { KanbanColumn, planColumnMove } from '~/routes/PhotoManagement/utils/kanban';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

/** The chosen view is a per-browser convenience; storage may be unavailable. */
const readStoredView = (key: string): PhotoLibraryView => {
  try {
    const stored = localStorage.getItem(key);
    if (stored === 'list' || stored === 'calendar' || stored === 'board') return stored;
  } catch {
    // Private window or blocked storage — fall back to the board.
  }
  return 'board';
};

type PhotoSessionLibraryProps = {
  /** Astro mode: only ASTRO sessions, filtered by target. */
  astro?: boolean;
  /** Shown above the toolbar; as a function it can offer the page's own actions. */
  header?: ReactNode | ((actions: { openNewTarget: () => void }) => ReactNode);
};

/**
 * The session library — board, list and calendar over one filtered query,
 * all opening the same session card. The Library and Astro pages are both
 * this, the latter locked to ASTRO with a target filter in place of the type.
 */
export const PhotoSessionLibrary = ({ astro, header }: PhotoSessionLibraryProps) => {
  const styles = useStyles();
  const viewStorageKey = astro ? 'astro-library-view' : 'photo-library-view';
  const modalPrefix = astro ? 'astro-' : '';
  const navigate = useNavigate();
  const { photoEntryApi, astroObjectApi } = useApi();
  const toast = useToast();

  const [view, setView] = useState<PhotoLibraryView>(() => readStoredView(viewStorageKey));

  const changeView = (next: PhotoLibraryView) => {
    setView(next);
    try {
      localStorage.setItem(viewStorageKey, next);
    } catch {
      // Not remembered, but the switch itself still works.
    }
  };

  const [filters, setFilters] = useState<{
    search: string;
    status?: PhotoEntryStatus;
    postStage?: PhotoEntryPostStage;
    type?: PhotoEntryType;
    astroObjectId?: string;
  }>({
    search: '',
  });

  const photoEntriesQuery = useAsync<PhotoEntryListResponse>(async () => {
    if (!photoEntryApi) return undefined;

    const response = await photoEntryApi.photoEntryControllerList({
      search: filters.search || undefined,
      status: filters.status,
      postStage: filters.postStage,
      type: astro ? PhotoEntryType.Astro : filters.type,
      astroObjectId: filters.astroObjectId,
    });

    return response.data;
  }, [
    photoEntryApi,
    filters.search,
    filters.status,
    filters.postStage,
    filters.type,
    filters.astroObjectId,
    astro,
  ]);

  const astroObjectsQuery = useAsync<AstroObjectListResponse>(async () => {
    if (!astroObjectApi) return undefined;

    const response = await astroObjectApi.astroObjectControllerList({});
    return response.data;
  }, [astroObjectApi]);

  const photoEntryDetailsQuery = useAsync<PhotoEntryDetailsResponse, [string]>(
    async (id) => {
      if (!photoEntryApi) return undefined;

      const response = await photoEntryApi.photoEntryControllerGetById({ id });
      return response.data;
    },
    [photoEntryApi],
    { immediate: false },
  );

  const refreshAll = async () => {
    await Promise.all([photoEntriesQuery.reload(), astroObjectsQuery.reload()]);
  };

  const createPhotoEntryModal = useModal(
    `${modalPrefix}create-photo-entry`,
    CreatePhotoEntryModal,
    { title: 'New Session' },
    {
      handleClose: async () => {
        await refreshAll();
        createPhotoEntryModal.hide();
      },
    },
  );

  const photoEntryDetailsModal = useModal(
    `${modalPrefix}photo-entry-details`,
    PhotoEntryDetailsModal,
    { title: astro ? 'Astro Session' : 'Session', type: 'side' },
    {
      handleClose: async () => {
        await refreshAll();
        photoEntryDetailsModal.hide();
      },
      onSaved: async () => {
        await refreshAll();
      },
      onFoldersCreated: async () => {
        await refreshAll();
        photoEntryDetailsModal.hide();
      },
      onAddToAlbum: (entryId: string) => {
        photoEntryDetailsModal.hide();
        navigate(`/photo-management/albums?entry=${entryId}`);
      },
    },
  );

  const createAstroObjectModal = useModal(
    `${modalPrefix}create-astro-object`,
    CreateAstroObjectModal,
    { title: 'New Astro Target' },
    {
      handleClose: async () => {
        await refreshAll();
        createAstroObjectModal.hide();
      },
    },
  );

  /**
   * The two axes are separate endpoints and the backend rejects inconsistent
   * pairs, so the steps are applied strictly in the order the planner returned
   * them — status before stage when leaving `PLANNED`. The first failure stops
   * the sequence and the board rolls its optimistic move back.
   */
  const handleRequestColumnChange = async (entry: PhotoEntryResponse, column: KanbanColumn) => {
    if (!photoEntryApi) return;

    const move = planColumnMove(entry, column);
    if (move.kind !== 'allowed') return;

    try {
      for (const step of move.steps) {
        if (step.op === 'status') {
          await photoEntryApi.photoEntryControllerPatchStatus({
            id: entry.id,
            patchPhotoEntryStatusDto: { status: step.status },
          });
        } else {
          await photoEntryApi.photoEntryControllerPatchPostStage({
            id: entry.id,
            patchPhotoEntryPostStageDto: { postStage: step.postStage },
          });
        }
      }
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not move this session.'), 'error');
      throw e;
    } finally {
      await photoEntriesQuery.reload();
    }
  };

  const handleOpenEntryDetails = async (entry: PhotoEntryResponse) => {
    const details = await photoEntryDetailsQuery.reload(entry.id);

    if (!details) return;

    photoEntryDetailsModal.show({
      entry: details,
      astroObjects: astroObjectsQuery.data?.astroObjects || [],
      onSaved: async () => {
        const refreshedDetails = await photoEntryDetailsQuery.reload(entry.id);
        await refreshAll();

        if (!refreshedDetails) return;

        photoEntryDetailsModal.show({
          entry: refreshedDetails,
          astroObjects: astroObjectsQuery.data?.astroObjects || [],
          onSaved: async () => {
            await refreshAll();
          },
          onFoldersCreated: async () => {
            await refreshAll();
            photoEntryDetailsModal.hide();
          },
        });
      },
      onFoldersCreated: async () => {
        await refreshAll();
        photoEntryDetailsModal.hide();
      },
    });
  };

  const astroObjects = astroObjectsQuery.data?.astroObjects || [];
  const entries = photoEntriesQuery.data?.photoEntries || [];

  return (
    <div style={styles.container}>
      {typeof header === 'function' ? header({ openNewTarget: () => createAstroObjectModal.show() }) : header}

      <PhotoLibraryToolbar
        astroTargets={astro ? astroObjects : undefined}
        astroObjectId={filters.astroObjectId}
        onAstroObjectChange={(astroObjectId) => setFilters((prev) => ({ ...prev, astroObjectId }))}
        view={view}
        onViewChange={changeView}
        search={filters.search}
        status={filters.status}
        postStage={filters.postStage}
        type={filters.type}
        onSearchChange={(search) => setFilters((prev) => ({ ...prev, search }))}
        onStatusChange={(status) => setFilters((prev) => ({ ...prev, status }))}
        onPostStageChange={(postStage) => setFilters((prev) => ({ ...prev, postStage }))}
        onTypeChange={(type) => setFilters((prev) => ({ ...prev, type }))}
        onResetFilters={() =>
          setFilters({
            search: '',
            status: undefined,
            postStage: undefined,
            type: undefined,
            astroObjectId: undefined,
          })
        }
        onAddEntry={() =>
          createPhotoEntryModal.show({
            astroObjects,
            defaultType: astro ? PhotoEntryType.Astro : undefined,
          })
        }
      />

      <div style={styles.kanbanCard}>
        {view === 'list' ? (
          <PhotoEntryListView entries={entries} onRowClick={handleOpenEntryDetails} />
        ) : view === 'calendar' ? (
          <PhotoEntryCalendarView entries={entries} onEntryClick={handleOpenEntryDetails} />
        ) : (
          <PhotoEntryKanban
            entries={entries}
            onRequestColumnChange={handleRequestColumnChange}
            onForbiddenMove={(reason) => toast(reason, 'error')}
            onCardClick={handleOpenEntryDetails}
          />
        )}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles(() => ({
  container: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxSizing: 'border-box',
  },

  kanbanCard: {
    flex: 1,
    minHeight: 0,
    padding: 1,
    overflow: 'hidden',
  },
}));
