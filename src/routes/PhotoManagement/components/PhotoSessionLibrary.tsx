import { useState } from 'react';
import { HiOutlineSparkles } from 'react-icons/hi';
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
import { PageHeader } from '~/components/PageHeader';
import { Button } from '~/components/Button';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { PhotoEntryCalendarView } from '~/routes/PhotoManagement/components/PhotoEntryCalendarView';
import { PhotoEntryKanban } from '~/routes/PhotoManagement/components/PhotoEntryKanban';
import { MoonSummary } from '~/routes/PhotoManagement/components/MoonSummary';
import { PhotoEntryListView } from '~/routes/PhotoManagement/components/PhotoEntryListView';
import { PhotoLibraryToolbar, PhotoLibraryView } from '~/routes/PhotoManagement/components/PhotoLibraryToolbar';
import { CreateAstroObjectModal } from '~/routes/PhotoManagement/modals/CreateAstroObjectModal';
import { CreatePhotoEntryModal } from '~/routes/PhotoManagement/modals/CreatePhotoEntryModal';
import { PhotoEntryDetailsModal } from '~/routes/PhotoManagement/modals/PhotoEntryDetailsModal';
import { KanbanColumn, planColumnMove } from '~/routes/PhotoManagement/utils/kanban';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

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

const VIEW_STORAGE_KEY = 'photo-library-view';

/**
 * The session library — board, list and calendar over one filtered query,
 * all opening the same session card. Astro is a filter here rather than a page
 * of its own: picking the Astro type brings up the target filter, and the moon
 * sits on top for every kind of night shoot.
 */
export const PhotoSessionLibrary = () => {
  const styles = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const { photoEntryApi, astroObjectApi } = useApi();
  const toast = useToast();

  const [view, setView] = useState<PhotoLibraryView>(() => readStoredView(VIEW_STORAGE_KEY));

  const changeView = (next: PhotoLibraryView) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next);
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
      type: filters.type,
      astroObjectId: filters.astroObjectId,
    });

    return response.data;
  }, [photoEntryApi, filters.search, filters.status, filters.postStage, filters.type, filters.astroObjectId]);

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
    'create-photo-entry',
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
    'photo-entry-details',
    PhotoEntryDetailsModal,
    { title: 'Session', type: 'side' },
    {
      handleClose: async () => {
        await refreshAll();
        photoEntryDetailsModal.hide();
      },
      onSaved: async () => {
        await refreshAll();
      },
      onAddToAlbum: (entryId: string) => {
        photoEntryDetailsModal.hide();
        navigate(`/photo-management/albums?entry=${entryId}`);
      },
    },
  );

  const createAstroObjectModal = useModal(
    'create-astro-object',
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
        });
      },
    });
  };

  const astroObjects = astroObjectsQuery.data?.astroObjects || [];
  const entries = photoEntriesQuery.data?.photoEntries || [];

  return (
    <div style={styles.container}>
      <PageHeader
        title='Library'
        meta={`${entries.length} session${entries.length === 1 ? '' : 's'} · ${astroObjects.length} astro target${
          astroObjects.length === 1 ? '' : 's'
        }`}
        aside={<MoonSummary />}
        actions={
          <Button
            variant='secondary'
            label='New target'
            icon={<HiOutlineSparkles color={theme.colors.purple02} size={18} />}
            onClick={() => createAstroObjectModal.show()}
          />
        }
      />

      <PhotoLibraryToolbar
        astroTargets={astroObjects}
        astroObjectId={filters.astroObjectId}
        onAstroObjectChange={(astroObjectId) => setFilters((prev) => ({ ...prev, astroObjectId }))}
        view={view}
        onViewChange={changeView}
        search={filters.search}
        status={filters.status}
        postStage={filters.postStage}
        type={filters.type}
        onSearchChange={(search) => setFilters((prev) => ({ ...prev, search }))}
        // A stage only exists once a session is shot, so leaving for Planned or
        // Cancelled drops it rather than filter down to nothing.
        onStatusChange={(status) =>
          setFilters((prev) => ({
            ...prev,
            status,
            postStage:
              status === PhotoEntryStatus.Planned || status === PhotoEntryStatus.Cancelled ? undefined : prev.postStage,
          }))
        }
        onPostStageChange={(postStage) => setFilters((prev) => ({ ...prev, postStage }))}
        // Targets belong to astro sessions only; another type clears the pick.
        onTypeChange={(type) =>
          setFilters((prev) => ({
            ...prev,
            type,
            astroObjectId: type === PhotoEntryType.Astro ? prev.astroObjectId : undefined,
          }))
        }
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
            // Filtering by a type makes it the likely one for the next session too.
            defaultType: filters.type,
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
