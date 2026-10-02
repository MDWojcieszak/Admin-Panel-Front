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
import { GearCategoryChip } from '~/routes/Gear/components/GearCategoryChip';
import { GearThumb } from '~/routes/Gear/components/GearThumb';
import { formatAmount } from '~/utils/formatAmount';
import { mkUseStyles } from '~/utils/theme';

type GearShoppingModalProps = Partial<InternalModalProps>;

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

const describeDays = (days: number): string => {
  if (days < 0) return `${Math.abs(days)} days late`;
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
};

/**
 * "What do I need to buy, and by when." Deliberately a modal rather than a tab:
 * it answers a question you ask occasionally, and as a tab it competed with the
 * inventory you actually work in. Read-only on purpose — it is a summary, and
 * changing an item belongs to that item's own details.
 */
export const GearShoppingModal = (p: GearShoppingModalProps) => {
  const styles = useStyles();
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
          <span style={styles.hint}>{items.length} item(s) on the wishlist, soonest deadline first.</span>
        </div>
        {query.data ? (
          <div style={styles.budget}>
            <span style={styles.budgetLabel}>BUDGET</span>
            <span style={styles.budgetValue}>{formatAmount(query.data.wishlistTotal)}</span>
          </div>
        ) : null}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title='Nothing on the wishlist'
          description='Add an item with its ownership set to Wishlist and it will show up here.'
        />
      ) : (
        // Grows with the list and only scrolls past the cap, so two items do not
        // sit in a tall empty box; the right padding keeps rows off the track.
        <Scrollbar maxHeight='min(460px, 60vh)'>
          <div style={styles.list}>
            {dated.length ? <span style={styles.sectionLabel}>Has a deadline</span> : null}
            {dated.map((item) => (
              <Row key={item.id} item={item} />
            ))}

            {undated.length ? <span style={styles.sectionLabel}>No trip needs it yet</span> : null}
            {undated.map((item) => (
              <Row key={item.id} item={item} />
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

const Row = ({ item }: { item: GearItemAdminResponse }) => {
  const styles = useStyles();
  const left = daysUntil(item.neededBy);
  const late = left != null && left < 0;

  return (
    <div style={styles.row}>
      <GearThumb gear={item} size={56} />

      <div style={styles.rowText}>
        <span style={styles.brand}>{item.brand}</span>
        <span style={styles.name}>{item.model}</span>

        <div style={styles.chips}>
          <GearCategoryChip category={item.category} />
          {item.priority === 0 ? <Badge label='Must have' tone='red' /> : null}
        </div>

        {item.neededFor ? <span style={styles.meta}>For {item.neededFor.name}</span> : null}

        {item.missedFor.length ? (
          <span style={styles.missed}>
            <FiAlertTriangle size={11} /> {item.missedFor.map((entry) => entry.name).join(', ')} went without it
          </span>
        ) : null}
      </div>

      <div style={styles.rowSide}>
        {item.estimatedPrice != null ? <span style={styles.price}>{formatAmount(item.estimatedPrice)}</span> : null}

        {item.neededBy ? (
          <>
            <span style={late ? styles.deadlineLate : styles.deadline}>{formatDate(item.neededBy)}</span>
            {left != null ? <span style={late ? styles.daysLate : styles.meta}>{describeDays(left)}</span> : null}
          </>
        ) : (
          <span style={styles.meta}>no deadline</span>
        )}

        {item.purchaseUrl ? (
          <a href={item.purchaseUrl} target='_blank' rel='noreferrer' style={styles.shopLink}>
            <FiExternalLink size={12} /> Shop
          </a>
        ) : null}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.m, width: 'min(600px, 92vw)' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  headerText: { gap: 2, minWidth: 0 },
  heading: { fontSize: 18, fontWeight: 700 },
  hint: { fontSize: 12, color: t.colors.dark05 },
  budget: {
    alignItems: 'flex-end',
    padding: `${t.spacing.xs}px ${t.spacing.sm}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.yellow + t.colorOpacity(0.1),
    border: `1px solid ${t.colors.yellow + t.colorOpacity(0.28)}`,
  },
  budgetLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 0.4, color: t.colors.yellow },
  budgetValue: { fontSize: 18, fontWeight: 700, color: t.colors.white, lineHeight: 1.1 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: t.colors.blue04,
    marginTop: t.spacing.xs,
  },
  list: { gap: t.spacing.s, paddingRight: t.spacing.l },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.medium,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  rowText: { flex: 1, minWidth: 0, gap: 2 },
  brand: { fontSize: 11, color: t.colors.dark05 },
  name: {
    fontWeight: 600,
    fontSize: 14,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chips: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs, flexWrap: 'wrap', marginTop: 2 },
  meta: { fontSize: 12, color: t.colors.dark05 },
  missed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: t.colors.yellow,
  },
  rowSide: { alignItems: 'flex-end', gap: 1, minWidth: 96 },
  price: { fontSize: 15, fontWeight: 700 },
  deadline: { fontSize: 12, fontWeight: 600, color: t.colors.blue04 },
  deadlineLate: { fontSize: 12, fontWeight: 600, color: t.colors.red },
  daysLate: { fontSize: 12, color: t.colors.red },
  shopLink: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    fontSize: 12,
    color: t.colors.blue,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.m,
  },
}));
