import { FiAlertTriangle, FiHelpCircle } from 'react-icons/fi';
import { MdSdCard } from 'react-icons/md';
import { PendingMediaResponse, PhotoEntryDetailsResponse } from '~/api/api';
import { Badge } from '~/components/Badge';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useCan } from '~/hooks/usePermissions';
import { PhotoEntryDetailsModal } from '~/routes/PhotoManagement/modals/PhotoEntryDetailsModal';
import { buildNameQualifiers } from '~/routes/PhotoManagement/utils/entryNames';
import { gearItemLabel } from '~/utils/gearCategory';
import { mkUseStyles, useTheme } from '~/utils/theme';

const formatDate = (value?: string | null): string => {
  if (!value) return 'No date';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'No date' : date.toLocaleDateString();
};

/**
 * Cards and rolls that came back from a shoot and never got offloaded. Thresholds
 * are the backend's (a week for cards and computers, three months for film), so
 * `overdue` is taken as given rather than recomputed here.
 */
export const PendingMediaCard = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { photoEntryApi } = useApi();
  const can = useCan();
  const canRead = can('photoEntry.read');

  const query = useAsync<PendingMediaResponse>(async () => {
    if (!photoEntryApi || !canRead) return undefined;
    const { data } = await photoEntryApi.photoEntryGearControllerPendingMedia();
    return data;
  }, [photoEntryApi, canRead]);

  const detailsModal = useModal(
    'dashboard-entry-gear',
    PhotoEntryDetailsModal,
    { title: 'Session', type: 'side' },
    {
      handleClose: async () => {
        await query.reload();
        detailsModal.hide();
      },
    },
  );

  const openGear = async (entryId: string) => {
    if (!photoEntryApi) return;
    const { data } = await photoEntryApi.photoEntryControllerGetById({ id: entryId });
    detailsModal.show({
      entry: data as PhotoEntryDetailsResponse,
      onSaved: async () => {
        await query.reload();
      },
    });
  };

  if (!canRead) return null;

  const unsecured = query.data?.unsecured ?? [];
  const undeclared = query.data?.undeclared ?? [];

  // Both lists name entries, and a repeated trip name is just as confusing here.
  const qualifiers = buildNameQualifiers(
    [...unsecured, ...undeclared].map((entry) => ({
      id: entry.photoEntryId,
      name: entry.name,
      startDate: entry.startDate,
    })),
  );

  if (!unsecured.length && !undeclared.length) return null;

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>
        <MdSdCard size={16} /> Material still on the gear
      </div>

      {unsecured.map((entry) => (
        <div key={entry.photoEntryId} style={styles.entry}>
          <div
            role='button'
            tabIndex={0}
            style={styles.entryHead}
            onClick={() => openGear(entry.photoEntryId)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              e.preventDefault();
              openGear(entry.photoEntryId);
            }}
          >
            <span style={styles.entryName}>
              {entry.name}
              {qualifiers.get(entry.photoEntryId) ? (
                <span style={{ opacity: 0.55, fontWeight: 400 }}> · {qualifiers.get(entry.photoEntryId)}</span>
              ) : null}
            </span>
            <span style={styles.muted}>{formatDate(entry.startDate)}</span>
            {entry.overdue ? (
              <Badge label='Overdue' tone='red' icon={<FiAlertTriangle size={11} />} />
            ) : (
              <Badge label='Waiting' tone='yellow' />
            )}
          </div>

          <div style={styles.items}>
            {entry.items.map((item) => (
              <div key={item.gear.id} style={styles.item}>
                <span style={{ ...styles.itemName, color: item.overdue ? theme.colors.red : theme.colors.white }}>
                  {gearItemLabel(item.gear)}
                </span>
                <span style={styles.muted}>
                  {item.secureAction} · {item.daysPending}d of {item.reminderDays}d
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {undeclared.length ? (
        <div style={styles.undeclared}>
          <div style={styles.undeclaredTitle}>
            <FiHelpCircle size={13} /> Gear never declared
          </div>
          {/* Not an alarm: after the migration every old session lands here. */}
          <span style={styles.muted}>
            These shoots have no gear list, so nothing can be chased for its material.
          </span>

          <div style={styles.undeclaredList}>
            {undeclared.map((entry) => (
              <div
                key={entry.photoEntryId}
                role='button'
                tabIndex={0}
                style={styles.undeclaredItem}
                onClick={() => openGear(entry.photoEntryId)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  e.preventDefault();
                  openGear(entry.photoEntryId);
                }}
              >
                {entry.name}
                {qualifiers.get(entry.photoEntryId) ? (
                  <span style={{ opacity: 0.55 }}> · {qualifiers.get(entry.photoEntryId)}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  card: {
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    fontWeight: 700,
    fontSize: 15,
  },
  entry: {
    gap: t.spacing.xs,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  entryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    cursor: 'pointer',
    flexWrap: 'wrap',
  },
  entryName: {
    fontWeight: 600,
    fontSize: 14,
  },
  items: {
    gap: 2,
    paddingLeft: t.spacing.s,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
  itemName: {
    fontSize: 13,
  },
  muted: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  undeclared: {
    gap: t.spacing.xs,
    paddingTop: t.spacing.s,
    borderTop: `1px solid ${t.colors.dark04 + t.colorOpacity(0.3)}`,
  },
  undeclaredTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    fontWeight: 700,
    fontSize: 13,
    color: t.colors.blue04,
  },
  undeclaredList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.xs,
    marginTop: t.spacing.xs,
  },
  undeclaredItem: {
    padding: `${t.spacing.xs}px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    fontSize: 12,
    cursor: 'pointer',
  },
}));
