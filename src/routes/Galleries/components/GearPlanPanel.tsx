import { useMemo, useState } from 'react';
import { FiAlertTriangle, FiCalendar, FiExternalLink, FiPlus } from 'react-icons/fi';
import {
  GearCategory,
  GearItemAdminResponse,
  GearItemListResponse,
  GearItemsSort,
  GearOwnership,
  GearSystemResponse,
} from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { GearItemModal } from '~/routes/Galleries/modals/GearItemModal';
import { imgUrl } from '~/routes/Galleries/utils';
import { GEAR_CATEGORY_GROUPS, OWNERSHIP_LABELS, gearCategoryIcon, gearCategoryLabel, gearItemLabel } from '~/utils/gearCategory';
import { mkUseStyles, useTheme } from '~/utils/theme';

type GearPlanPanelProps = {
  systems: GearSystemResponse[];
  onChanged?: () => void | Promise<void>;
};

const OWNERSHIP_TABS = [
  { label: 'To buy', value: GearOwnership.Wishlist },
  { label: 'Owned', value: GearOwnership.Owned },
  { label: 'Retired', value: GearOwnership.Retired },
];

const CATEGORY_OPTIONS = [
  { label: 'All categories', value: '' },
  ...GEAR_CATEGORY_GROUPS.flatMap((group) =>
    group.categories.map((category) => ({ label: gearCategoryLabel(category), value: category as string })),
  ),
];

const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

/**
 * The flat planning view. `neededBy` means something different per ownership —
 * a buy-by date on the wishlist, the next use for owned gear, and a conflict to
 * resolve for something retired — so each tab labels it for itself.
 */
export const GearPlanPanel = ({ systems, onChanged }: GearPlanPanelProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { gearApi } = useApi();
  const toast = useToast();

  const [ownership, setOwnership] = useState<GearOwnership>(GearOwnership.Wishlist);
  const [category, setCategory] = useState<string>('');
  const [budgetWindow, setBudgetWindow] = useState(false);

  const itemsQuery = useAsync<GearItemListResponse>(async () => {
    if (!gearApi) return undefined;
    const { data } = await gearApi.gearControllerListItems({
      ownership,
      category: (category || undefined) as GearCategory | undefined,
      sort: GearItemsSort.NeededBy,
      neededWithinDays: budgetWindow ? 90 : undefined,
    });
    return data;
  }, [gearApi, ownership, category, budgetWindow]);

  const itemModal = useModal('gear-plan-item', GearItemModal, { title: 'Gear' });

  const reload = async () => {
    await itemsQuery.reload();
    await onChanged?.();
  };

  const openItem = (item?: GearItemAdminResponse) =>
    itemModal.show({
      item,
      systems,
      defaultOwnership: ownership,
      onSaved: reload,
    });

  const retire = async (item: GearItemAdminResponse) => {
    if (!gearApi) return;
    try {
      await gearApi.gearControllerUpdate({ id: item.id, updateGearDto: { ownership: GearOwnership.Retired } });
      await reload();
      toast('Moved to retired', 'success');
    } catch (e) {
      toast(getMessage(e), 'error');
    }
  };

  const items = itemsQuery.data?.items ?? [];

  const neededByLabel = useMemo(() => {
    switch (ownership) {
      case GearOwnership.Wishlist:
        return 'Buy by';
      case GearOwnership.Owned:
        return 'Next used';
      default:
        return 'Still planned for';
    }
  }, [ownership]);

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <SegmentedTabs
          layoutId='gear-plan-ownership'
          items={OWNERSHIP_TABS}
          selected={ownership}
          handleSelect={(value) => setOwnership(value as GearOwnership)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {ownership === GearOwnership.Wishlist ? (
          <Button
            label={budgetWindow ? 'Next 3 months' : 'All dates'}
            variant='secondary'
            icon={<FiCalendar size={14} />}
            onClick={() => setBudgetWindow((prev) => !prev)}
          />
        ) : null}

        <div style={styles.toolbarRight}>
          {ownership === GearOwnership.Wishlist && itemsQuery.data ? (
            <Badge label={`Budget ${itemsQuery.data.wishlistTotal}`} tone='yellow' />
          ) : null}
          <Button label='Add gear' variant='secondary' icon={<FiPlus size={14} />} onClick={() => openItem()} />
        </div>
      </div>

      {itemsQuery.loading && !itemsQuery.data ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState
          title={`Nothing ${OWNERSHIP_LABELS[ownership].toLowerCase()}`}
          description={
            ownership === GearOwnership.Wishlist
              ? 'Add something you plan to buy and it will show up here with its deadline.'
              : 'No items in this group.'
          }
        />
      ) : (
        <Scrollbar style={styles.scroll}>
          <div style={styles.list}>
            {items.map((item) => {
              const Icon = gearCategoryIcon(item.category);
              return (
                <div key={item.id} style={styles.row}>
                  <div style={styles.thumb}>
                    {item.coverUrl ? (
                      <img src={imgUrl(item.coverUrl)} alt={gearItemLabel(item)} style={styles.thumbImg} />
                    ) : (
                      <Icon size={18} color={theme.colors.blue04} />
                    )}
                  </div>

                  <div style={styles.rowText}>
                    <div style={styles.rowTitleLine}>
                      <span style={styles.name}>{gearItemLabel(item)}</span>
                      {item.priority === 0 ? <Badge label='Must have' tone='red' /> : null}
                      {item.missedFor.length ? (
                        <Badge label='Trip went without it' tone='yellow' icon={<FiAlertTriangle size={11} />} />
                      ) : null}
                    </div>

                    <span style={styles.meta}>
                      {gearCategoryLabel(item.category)}
                      {item.estimatedPrice != null ? ` · ${item.estimatedPrice}` : ''}
                      {item.neededBy ? ` · ${neededByLabel} ${formatDate(item.neededBy)}` : ''}
                      {item.neededFor ? ` (${item.neededFor.name})` : ''}
                    </span>

                    {item.missedFor.length ? (
                      <span style={styles.missed}>
                        Missed: {item.missedFor.map((entry) => entry.name).join(', ')} — still needed?
                      </span>
                    ) : null}
                  </div>

                  {item.purchaseUrl ? (
                    <a href={item.purchaseUrl} target='_blank' rel='noreferrer' style={styles.shopLink}>
                      <FiExternalLink size={13} /> Shop
                    </a>
                  ) : null}

                  <Button label='Edit' variant='secondary' onClick={() => openItem(item)} />

                  {item.ownership !== GearOwnership.Retired ? (
                    <Button label='Retire' variant='secondary' onClick={() => retire(item)} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </Scrollbar>
      )}
    </div>
  );
};

const getMessage = (e: unknown): string => {
  const raw = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  const message = Array.isArray(raw) ? raw.join(', ') : raw;
  return message || 'Could not update the gear item.';
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    minHeight: 0,
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    marginLeft: 'auto',
  },
  select: {
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.blue02 + t.colorOpacity(0.5)}`,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
    color: t.colors.white,
    outline: 'none',
    fontSize: 13,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    gap: t.spacing.s,
    paddingRight: t.spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
    flexWrap: 'wrap',
  },
  thumb: {
    width: 42,
    height: 42,
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    backgroundColor: t.colors.blue + t.colorOpacity(0.1),
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  rowText: {
    flex: 1,
    minWidth: 160,
    gap: 2,
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    flexWrap: 'wrap',
  },
  name: {
    fontWeight: 600,
    fontSize: 14,
  },
  meta: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  missed: {
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
}));
