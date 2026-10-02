import { useState } from 'react';
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
import { AstroObjectSidebar } from '~/routes/PhotoManagement/components/AstroObjectSidebar';
import { PhotoEntryKanban } from '~/routes/PhotoManagement/components/PhotoEntryKanban';
import { PhotoLibraryToolbar } from '~/routes/PhotoManagement/components/PhotoLibraryToolbar';
import { CreateAstroObjectModal } from '~/routes/PhotoManagement/modals/CreateAstroObjectModal';
import { CreatePhotoEntryModal } from '~/routes/PhotoManagement/modals/CreatePhotoEntryModal';
import { PhotoEntryDetailsModal } from '~/routes/PhotoManagement/modals/PhotoEntryDetailsModal';
import { KanbanColumn, planColumnMove } from '~/routes/PhotoManagement/utils/kanban';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';
import { colors } from '~/utils/theme/colors';

export const PhotoManagement = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { photoEntryApi, astroObjectApi } = useApi();
  const toast = useToast();

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
  }, [
    photoEntryApi,
    filters.search,
    filters.status,
    filters.postStage,
    filters.type,
    filters.astroObjectId,
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

  const createAstroObjectModal = useModal(
    'create-astro-object',
    CreateAstroObjectModal,
    { title: 'New Astro Object' },
    {
      handleClose: async () => {
        await refreshAll();
        createAstroObjectModal.hide();
      },
    },
  );

  const photoEntryDetailsModal = useModal(
    'photo-entry-details',
    PhotoEntryDetailsModal,
    { title: 'Photo Entry Details' },
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

  return (
    <div style={styles.container}>
      <PhotoLibraryToolbar
        search={filters.search}
        status={filters.status}
        postStage={filters.postStage}
        type={filters.type}
        astroObjectId={filters.astroObjectId}
        astroObjects={astroObjects}
        onSearchChange={(search) => setFilters((prev) => ({ ...prev, search }))}
        onStatusChange={(status) => setFilters((prev) => ({ ...prev, status }))}
        onPostStageChange={(postStage) => setFilters((prev) => ({ ...prev, postStage }))}
        onTypeChange={(type) => setFilters((prev) => ({ ...prev, type }))}
        onAstroObjectChange={(astroObjectId) => setFilters((prev) => ({ ...prev, astroObjectId }))}
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
          })
        }
      />

      <div style={styles.mainGrid}>
        <div style={styles.kanbanSection}>
          <div style={styles.kanbanCard}>
            <PhotoEntryKanban
              entries={photoEntriesQuery.data?.photoEntries || []}
              onRequestColumnChange={handleRequestColumnChange}
              onForbiddenMove={(reason) => toast(reason, 'error')}
              onCardClick={handleOpenEntryDetails}
            />
          </div>
        </div>

        <div style={styles.sidebarSection}>
          <AstroObjectSidebar
            astroObjects={astroObjects}
            total={astroObjectsQuery.data?.total || 0}
            selectedAstroObjectId={filters.astroObjectId}
            onObjectClick={(astroObject) =>
              setFilters((prev) => ({
                ...prev,
                astroObjectId: prev.astroObjectId === astroObject.id ? undefined : astroObject.id,
              }))
            }
            onAddAstroObject={() => createAstroObjectModal.show()}
          />
        </div>
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

  mainGrid: {
    flex: 1,
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 330px',
    gap: 16,
  },
  kanbanSection: {
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '0 4px',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.white,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.dark05,
  },
  kanbanCard: {
    flex: 1,
    minHeight: 0,
    padding: 1,
    overflow: 'hidden',
  },

  sidebarSection: {
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
}));
