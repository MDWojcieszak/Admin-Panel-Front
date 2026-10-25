import { useNavigate } from 'react-router-dom';
import { FiCamera } from 'react-icons/fi';
import { PhotoEntryGearListResponse, ProjectPhotoEntryResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { MainNavigationRoute } from '~/navigation/types';
import { Checkbox, useProjectStyles } from '~/routes/Projects/components/shared';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

/**
 * The camera half of a trip's packing: the shoot's own gear list, ticked in
 * one place for both the trip and the shoot. Everything else to pack is a
 * task on the trip.
 */
export const TripPacking = ({ entry }: { entry: ProjectPhotoEntryResponse }) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const navigate = useNavigate();
  const toast = useToast();
  const can = useCan();
  const { photoEntryApi } = useApi();
  const manage = can('photoEntry.manage');

  const query = useAsync<PhotoEntryGearListResponse>(async () => {
    if (!photoEntryApi) return undefined;
    const { data } = await photoEntryApi.photoEntryGearControllerList({ id: entry.id });
    return data;
  }, [photoEntryApi, entry.id]);

  if (query.loading && !query.data) return <Loader />;
  const items = query.data?.items ?? [];
  const packed = items.filter((i) => i.packed).length;

  return (
    <div style={styles.container}>
      <div style={{ ...shared.row, justifyContent: 'space-between' }}>
        <span style={shared.muted}>
          Gear for {entry.name}: {packed} of {items.length} packed
        </span>
        <Button
          label='Open the shoot'
          variant='secondary'
          icon={<FiCamera size={14} />}
          onClick={() => navigate(`/${MainNavigationRoute.PHOTO_MANAGEMENT}?entry=${entry.id}`)}
        />
      </div>
      {items.length === 0 ? (
        <div style={shared.emptyRow}>The shoot has no gear list yet. Plan it on the shoot.</div>
      ) : (
        <div style={shared.list}>
          {items.map((item) => (
            <div key={item.gear.id} style={shared.listRow}>
              <Checkbox
                checked={item.packed}
                disabled={!manage}
                title={manage ? undefined : 'Ticking gear takes photoEntry.manage'}
                onChange={async () => {
                  if (!photoEntryApi) return;
                  try {
                    await photoEntryApi.photoEntryGearControllerPatch({
                      id: entry.id,
                      gearItemId: item.gear.id,
                      patchPhotoEntryGearDto: { packed: !item.packed },
                    });
                    query.reload();
                  } catch (e) {
                    toast(getApiErrorMessage(e, 'Could not tick it.'), 'error');
                  }
                }}
              />
              <span style={{ flex: 1, fontSize: 14 }}>
                {item.gear.brand} {item.gear.model}
              </span>
              {item.note ? <span style={{ ...shared.muted, fontSize: 12 }}>{item.note}</span> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.m, maxWidth: 760 },
}));
