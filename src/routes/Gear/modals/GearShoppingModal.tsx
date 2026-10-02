import { useMemo } from 'react';
import { FiAlertTriangle, FiExternalLink } from 'react-icons/fi';
import { GearItemAdminResponse, GearItemsSort, GearOwnership } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { gearCategoryIcon, gearCategoryLabel, gearItemLabel } from '~/utils/gearCategory';
import { mkUseStyles, useTheme } from '~/utils/theme';

type GearShoppingModalProps = {
  onEdit?: (item: GearItemAdminResponse) => void;
} & Partial<InternalModalProps>;

const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

const daysUntil = (value?: string | null): number | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
};

/**
 * "What do I need to buy, and by when." Deliberately a modal rather than a tab:
 * it answers a question you ask occasionally, and as a tab it competed with the
 * inventory you actually work in.
 */
export const GearShoppingModal = (p: GearShoppingModalProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { gearApi } = useApi();

  const query = useAsync(async () => {
    if (!gearApi) return undefined;
    const { data } = await gearApi.gearControllerListItems({
      ownership: GearOwnership.Wishlist,
      sort: GearItemsSort.NeededBy,
    });
    return data;
  }, [gearApi]);

  const items = query.data?.items ?? [];

  // Dated first (soonest to latest), then everything with no trip pinned to it.
  // The backend already sorts this way; the split is so the UI can label both.
  const { dated, undated } = useMemo(
    () => ({
      dated: items.filter((item) => item.neededBy),
      undated: items.filter((item) => !item.neededBy),
    }),
    [items],
  );

  if (query.loading && !query.data) {
    return (
      <div style={styles.container}>
        <Loader />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerText}>
          <span style={styles.heading}>Still to buy</span>
          <span style={styles.hint}>Everything on the wishlist, soonest deadline first.</span>
        </div>
        {query.data ? <Badge label={`Budget ${query.data.wishlistTotal}`} tone='yellow' /> : null}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title='Nothing on the wishlist'
          description='Add an item with its ownership set to Wishlist and it will show up here.'
        />
      ) : (
        <Scrollbar style={styles.scroll}>
          <div style={styles.list}>
            {dated.length ? <span style={styles.sectionLabel}>Has a deadline</span> : null}
            {dated.map((item) => (
              <Row key={item.id} item={item} onEdit={p.onEdit} theme={theme} />
            ))}

            {undated.length ? <span style={styles.sectionLabel}>No trip needs it yet</span> : null}
            {undated.map((item) => (
              <Row key={item.id} item={item} onEdit={p.onEdit} theme={theme} />
            ))}
          </div>
        </Scrollbar>
      )}

      <div style={styles.actions}>
        <Button label='Close' variant='secondary' onClick={() => p.handleClose?.()} />
      </div>
    </div>
  );
};

type RowProps = {
  item: GearItemAdminResponse;
  onEdit?: (item: GearItemAdminResponse) => void;
  theme: ReturnType<typeof useTheme>;
};

const Row = ({ item, onEdit, theme }: RowProps) => {
  const styles = useStyles();
  const Icon = gearCategoryIcon(item.category);
  const left = daysUntil(item.neededBy);

  return (
    <div style={styles.row}>
      <Icon size={18} color={theme.colors.blue04} />

      <div style={styles.rowText}>
        <div style={styles.rowTitle}>
          <span style={styles.name}>{gearItemLabel(item)}</span>
          {item.priority === 0 ? <Badge label='Must have' tone='red' /> : null}
          {left != null && left < 0 ? <Badge label='Overdue' tone='red' /> : null}
        </div>

        <span style={styles.meta}>
          {gearCategoryLabel(item.category)}
          {item.estimatedPrice != null ? ` · ${item.estimatedPrice}` : ''}
          {item.neededBy ? ` · by ${formatDate(item.neededBy)}` : ''}
          {left != null && left >= 0 ? ` (${left}d)` : ''}
        </span>

        {item.neededFor ? <span style={styles.meta}>For {item.neededFor.name}</span> : null}

        {item.missedFor.length ? (
          <span style={styles.missed}>
            <FiAlertTriangle size={11} /> {item.missedFor.map((entry) => entry.name).join(', ')} went without it —
            still needed?
          </span>
        ) : null}
      </div>

      {item.purchaseUrl ? (
        <a href={item.purchaseUrl} target='_blank' rel='noreferrer' style={styles.shopLink}>
          <FiExternalLink size={13} /> Shop
        </a>
      ) : null}

      {onEdit ? <Button label='Edit' variant='secondary' onClick={() => onEdit(item)} /> : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.s, width: 'min(620px, 92vw)' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  headerText: { gap: 2, minWidth: 0 },
  heading: { fontSize: 18, fontWeight: 700 },
  hint: { fontSize: 12, color: t.colors.dark05 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: t.colors.blue04,
    marginTop: t.spacing.xs,
  },
  scroll: { height: 'min(420px, 60vh)' },
  list: { gap: t.spacing.s, paddingRight: t.spacing.s },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
    flexWrap: 'wrap',
  },
  rowText: { flex: 1, minWidth: 140, gap: 2 },
  rowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    flexWrap: 'wrap',
  },
  name: { fontWeight: 600, fontSize: 14 },
  meta: { fontSize: 12, color: t.colors.dark05 },
  missed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: t.colors.yellow,
  },
  shopLink: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: t.colors.blue,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.m,
    marginTop: t.spacing.s,
  },
}));
