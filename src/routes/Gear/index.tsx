import { DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import { FiEye, FiEyeOff, FiImage, FiLayers, FiMove, FiPlus, FiShoppingCart } from 'react-icons/fi';
import { MdCameraAlt } from 'react-icons/md';
import {
  GearCategory,
  GearItemAdminResponse,
  GearItemResponse,
  GearOverviewResponse,
  GearOwnership,
  GearSystemResponse,
} from '~/api/api';
import { PageHeader } from '~/components/PageHeader';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { useUrlParams } from '~/hooks/useUrlParam';
import { GearCategoryChip } from '~/routes/Gear/components/GearCategoryChip';
import { gearTileImage } from '~/routes/Gear/components/GearThumb';
import { GearItemDetailsModal } from '~/routes/Gear/modals/GearItemDetailsModal';
import { GearItemModal } from '~/routes/Gear/modals/GearItemModal';
import { GearKitsModal } from '~/routes/Gear/modals/GearKitsModal';
import { GearShoppingModal } from '~/routes/Gear/modals/GearShoppingModal';
import { GearSystemDetailsModal } from '~/routes/Gear/modals/GearSystemDetailsModal';
import { GearSystemModal } from '~/routes/Gear/modals/GearSystemModal';
import { formatAmount } from '~/utils/formatAmount';
import { GEAR_CATEGORY_GROUPS, gearCategoryColor, gearCategoryIcon, gearCategoryLabel } from '~/utils/gearCategory';
import { getApiErrorMessage, getApiErrorStatus } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** Category → its group label, for filtering by kind of gear. */
const GROUP_OF = new Map<GearCategory, string>(
  GEAR_CATEGORY_GROUPS.flatMap((group) => group.categories.map((category) => [category, group.label] as const)),
);

export const GearView = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { gearApi } = useApi();
  const toast = useToast();

  const gearQuery = useAsync<GearOverviewResponse>(async () => {
    if (!gearApi) return undefined;
    const { data } = await gearApi.gearControllerList();
    return data;
  }, [gearApi]);

  /**
   * The overview carries the grouping and the ordering but not the planning
   * fields, so the flat admin list is pulled alongside it and joined by id.
   * That keeps one inventory on screen without hiding the detail behind a tab.
   */
  const detailsQuery = useAsync<Map<string, GearItemAdminResponse>>(async () => {
    if (!gearApi) return undefined;
    const { data } = await gearApi.gearControllerListItems({});
    return new Map(data.items.map((item) => [item.id, item]));
  }, [gearApi]);

  const details = detailsQuery.data;

  // Local copies so drag&drop feels immediate; synced from the query.
  const [systems, setSystems] = useState<GearSystemResponse[]>([]);
  const systemsRef = useRef<GearSystemResponse[]>([]);
  const sysDrag = useRef<number | null>(null);
  const [ungrouped, setUngrouped] = useState<GearItemResponse[]>([]);

  const setSystemsLocal = (next: GearSystemResponse[]) => {
    systemsRef.current = next;
    setSystems(next);
  };

  useEffect(() => {
    if (!gearQuery.data) return;
    setSystemsLocal(gearQuery.data.systems);
    setUngrouped(gearQuery.data.ungrouped);
  }, [gearQuery.data]);

  const applyOverview = (data: GearOverviewResponse) => {
    setSystemsLocal(data.systems);
    setUngrouped(data.ungrouped);
  };

  const reload = async () => {
    await Promise.all([gearQuery.reload(), detailsQuery.reload()]);
  };

  const systemModal = useModal('gear-system', GearSystemModal, { title: 'System' });
  const itemModal = useModal('gear-item', GearItemModal, { title: 'Gear item' });
  const confirmModal = useModal('gear-confirm', ConfirmModal, { title: 'Delete' });
  const shoppingModal = useModal('gear-shopping', GearShoppingModal, { title: 'Shopping list' });
  const kitsModal = useModal('gear-kits', GearKitsModal, { title: 'Kits' });
  const itemDetailsModal = useModal('gear-item-details', GearItemDetailsModal, { title: 'Gear item' });
  const systemDetailsModal = useModal('gear-system-details', GearSystemDetailsModal, { title: 'System' });

  const openCreateSystem = () => systemModal.show({ onSaved: reload });
  const openEditSystem = (system: GearSystemResponse) => systemModal.show({ system, onSaved: reload });
  const openCreateItem = (defaultSystemId?: string) =>
    itemModal.show({ systems: systemsRef.current, defaultSystemId, onSaved: reload });
  // The admin record when it is loaded, so the form opens with the planning fields filled in.
  const openEditItem = (item: GearItemResponse) =>
    itemModal.show({ item: details?.get(item.id) ?? item, systems: systemsRef.current, onSaved: reload });

  const deleteSystem = (system: GearSystemResponse) =>
    confirmModal.show({
      message: `Delete “${system.name}”?`,
      description: system.items.length
        ? `Its ${system.items.length} item(s) will be moved to Ungrouped.`
        : 'This system will be removed.',
      danger: true,
      confirmLabel: 'Delete system',
      onConfirm: async () => {
        if (!gearApi) return;
        try {
          await gearApi.gearControllerRemoveSystem({ id: system.id });
          toast('System deleted', 'success');
          await reload();
        } catch (e) {
          toast(getApiErrorMessage(e, 'Could not delete the system.'), 'error');
        }
      },
    });

  const retireItem = (item: GearItemResponse) =>
    confirmModal.show({
      message: `Retire “${item.brand} ${item.model}”?`,
      description:
        'It was used on a session, so its history has to stay. Retiring keeps the record and takes it out of the public portfolio and out of packing lists.',
      confirmLabel: 'Retire',
      onConfirm: async () => {
        if (!gearApi) return;
        try {
          await gearApi.gearControllerUpdate({ id: item.id, updateGearDto: { ownership: GearOwnership.Retired } });
          toast('Moved to retired', 'success');
          await reload();
        } catch (e) {
          toast(getApiErrorMessage(e, 'Could not retire the gear item.'), 'error');
          throw e;
        }
      },
    });

  const deleteItem = (item: GearItemResponse) =>
    confirmModal.show({
      message: `Delete “${item.brand} ${item.model}”?`,
      danger: true,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        if (!gearApi) return;
        try {
          await gearApi.gearControllerRemove({ id: item.id });
          toast('Gear deleted', 'success');
          await reload();
        } catch (e) {
          // 409 means the item has usage history, which deleting would erase.
          // Offer the thing the user actually wants instead of just refusing.
          if (getApiErrorStatus(e) === 409) {
            confirmModal.hide();
            retireItem(item);
            return;
          }
          toast(getApiErrorMessage(e, 'Could not delete the gear item.'), 'error');
        }
      },
    });

  /**
   * Only one modal can be visible at a time, so every action that leads out of
   * a details dialog closes it first. `hide()` is deliberately not awaited: its
   * promise is only settled by a callback the Modal never fires.
   */
  // The open details card lives in the address, so a link reopens it.
  const [urlState, setUrlState] = useUrlParams(['item', 'system'] as const);
  const openedRef = useRef<string>();
  const leaveDetails = () => {
    openedRef.current = undefined;
    setUrlState({ item: null, system: null });
  };

  const openItemDetails = (item: GearItemResponse) => {
    openedRef.current = `item:${item.id}`;
    setUrlState({ item: item.id, system: null });
    return itemDetailsModal.show({
      item,
      handleClose: async () => {
        leaveDetails();
        itemDetailsModal.hide();
      },
      detail: details?.get(item.id),
      systemName: systemsRef.current.find((system) => system.id === item.systemId)?.name,
      onChanged: reload,
      onEdit: (target: GearItemResponse) => {
        leaveDetails();
        itemDetailsModal.hide();
        openEditItem(target);
      },
      onDelete: (target: GearItemResponse) => {
        leaveDetails();
        itemDetailsModal.hide();
        deleteItem(target);
      },
    });
  };

  const openSystemDetails = (system: GearSystemResponse) => {
    openedRef.current = `system:${system.id}`;
    setUrlState({ system: system.id, item: null });
    return systemDetailsModal.show({
      system,
      handleClose: async () => {
        leaveDetails();
        systemDetailsModal.hide();
      },
      onChanged: reload,
      onEdit: (target: GearSystemResponse) => {
        leaveDetails();
        systemDetailsModal.hide();
        openEditSystem(target);
      },
      onDelete: (target: GearSystemResponse) => {
        leaveDetails();
        systemDetailsModal.hide();
        deleteSystem(target);
      },
      onAddItem: (target: GearSystemResponse) => {
        leaveDetails();
        systemDetailsModal.hide();
        openCreateItem(target.id);
      },
    });
  };

  // Opening from a link, once the gear list has loaded.
  useEffect(() => {
    if (!gearQuery.data) return;
    if (urlState.item && openedRef.current !== `item:${urlState.item}`) {
      const all = [...gearQuery.data.systems.flatMap((system) => system.items), ...gearQuery.data.ungrouped];
      const item = all.find((candidate) => candidate.id === urlState.item);
      if (item) openItemDetails(item);
      else leaveDetails();
    } else if (urlState.system && openedRef.current !== `system:${urlState.system}`) {
      const system = gearQuery.data.systems.find((candidate) => candidate.id === urlState.system);
      if (system) openSystemDetails(system);
      else leaveDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gearQuery.data, urlState.item, urlState.system]);

  const reorderSystems = (from: number, to: number) => {
    const next = [...systemsRef.current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setSystemsLocal(next);
  };

  const persistSystemOrder = async () => {
    if (!gearApi) return;
    try {
      const { data } = await gearApi.gearControllerReorderSystems({
        reorderGearDto: { ids: systemsRef.current.map((s) => s.id) },
      });
      applyOverview(data);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save the system order.'), 'error');
      await gearQuery.reload();
    }
  };

  const persistItemOrder = async (ids: string[]) => {
    if (!gearApi) return;
    try {
      const { data } = await gearApi.gearControllerReorder({ reorderGearDto: { ids } });
      applyOverview(data);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save the item order.'), 'error');
      await gearQuery.reload();
    }
  };

  // Filtering by the same groups the category select uses: 39 categories as
  // chips would be a wall, nine groups read at a glance.
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const matches = (item: GearItemResponse) => !groupFilter || GROUP_OF.get(item.category) === groupFilter;

  const groupCounts = useMemo(() => {
    const counts = new Map<string, number>();
    [...systems.flatMap((system) => system.items), ...ungrouped].forEach((item) => {
      const group = GROUP_OF.get(item.category) ?? 'Other';
      counts.set(group, (counts.get(group) ?? 0) + 1);
    });
    return counts;
  }, [systems, ungrouped]);
  const totalItems = Array.from(groupCounts.values()).reduce((sum, n) => sum + n, 0);

  const visibleSystems = groupFilter ? systems.filter((system) => system.items.some(matches)) : systems;
  const visibleUngrouped = ungrouped.filter(matches);
  // A reorder sends the ids it can see; with a filter on that would be a
  // partial list, so dragging waits until the filter is cleared.
  const canReorder = !groupFilter;

  const wishlistCount = details
    ? Array.from(details.values()).filter((item) => item.ownership === GearOwnership.Wishlist).length
    : 0;

  const isEmpty = !gearQuery.loading && systems.length === 0 && ungrouped.length === 0;

  return (
    <Scrollbar style={styles.scroll}>
      {/* Padded on the right so the blocks stop short of the scrollbar track
          instead of running underneath it. */}
      <div style={styles.content}>
        <PageHeader
          title='Gear'
          meta={
            totalItems
              ? `${totalItems} item${totalItems === 1 ? '' : 's'} · ${systems.length} system${
                  systems.length === 1 ? '' : 's'
                }`
              : undefined
          }
          actions={
            <>
              <Button
                label={wishlistCount ? `To buy · ${wishlistCount}` : 'To buy'}
                variant='secondary'
                icon={<FiShoppingCart size={14} />}
                onClick={() => shoppingModal.show()}
              />
              <Button label='Kits' variant='secondary' icon={<FiLayers size={14} />} onClick={() => kitsModal.show()} />
              <Button label='Add system' variant='secondary' icon={<FiPlus size={14} />} onClick={openCreateSystem} />
              <Button label='Add gear' icon={<FiPlus size={14} />} onClick={() => openCreateItem()} />
            </>
          }
        />

        {totalItems ? (
          <div style={styles.filterRow}>
            <button
              type='button'
              aria-pressed={!groupFilter}
              onClick={() => setGroupFilter(null)}
              style={{ ...styles.filterChip, ...(!groupFilter ? styles.filterChipOn : {}) }}
            >
              All <span style={styles.filterCount}>{totalItems}</span>
            </button>
            {GEAR_CATEGORY_GROUPS.filter((group) => groupCounts.get(group.label)).map((group) => {
              const Icon = gearCategoryIcon(group.categories[0]);
              const active = groupFilter === group.label;
              return (
                <button
                  key={group.label}
                  type='button'
                  aria-pressed={active}
                  onClick={() => setGroupFilter(active ? null : group.label)}
                  style={{ ...styles.filterChip, ...(active ? styles.filterChipOn : {}) }}
                >
                  <Icon size={13} color={active ? undefined : theme.colors[group.color]} />
                  {group.label}
                  <span style={styles.filterCount}>{groupCounts.get(group.label)}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {gearQuery.loading && !gearQuery.data ? (
          <Loader />
        ) : isEmpty ? (
          <EmptyState
            icon={<MdCameraAlt size={26} color={theme.colors.blue04} />}
            title='No gear yet'
            description='Create a system (e.g. “Fujifilm X”) or add a standalone item.'
          />
        ) : (
          <>
            {groupFilter && !visibleSystems.length && !visibleUngrouped.length ? (
              <EmptyState title='Nothing here' description={`No ${groupFilter.toLowerCase()} gear yet.`} />
            ) : null}

            {visibleSystems.map((system, i) => (
              <div
                key={system.id}
                style={styles.block}
                onDragOver={(e) => {
                  if (sysDrag.current === null) return;
                  e.preventDefault();
                  const from = sysDrag.current;
                  if (from === i) return;
                  reorderSystems(from, i);
                  sysDrag.current = i;
                }}
              >
                <div style={styles.blockHeader}>
                  <div
                    style={{ ...styles.grip, visibility: canReorder ? 'visible' : 'hidden' }}
                    title='Drag to reorder systems'
                    draggable={canReorder}
                    onDragStart={(e: DragEvent) => {
                      // Firefox will not start a drag that carries no data.
                      e.dataTransfer.setData('text/plain', system.id);
                      e.dataTransfer.effectAllowed = 'move';
                      sysDrag.current = i;
                    }}
                    onDragEnd={() => {
                      sysDrag.current = null;
                      persistSystemOrder();
                    }}
                  >
                    <FiMove size={14} />
                  </div>

                  <div
                    role='button'
                    tabIndex={0}
                    style={styles.systemMeta}
                    title='System details'
                    onClick={() => openSystemDetails(system)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter' && e.key !== ' ') return;
                      e.preventDefault();
                      openSystemDetails(system);
                    }}
                  >
                    <div style={styles.systemThumb}>
                      {gearTileImage(system).src ? (
                        <img src={gearTileImage(system).src} alt='' style={styles.systemThumbImg} loading='lazy' />
                      ) : (
                        <FiImage size={16} color={theme.colors.dark05} />
                      )}
                    </div>
                    <div style={styles.systemTitleWrap}>
                      <div style={styles.systemTitleRow}>
                        <span style={styles.blockTitle}>{system.name}</span>
                        {system.label ? <span style={styles.systemLabel}>{system.label}</span> : null}
                        <span
                          style={system.visible ? styles.eyeOn : styles.eyeOff}
                          title={system.visible ? 'Shown on the public page' : 'Hidden from the public page'}
                        >
                          {system.visible ? <FiEye size={13} /> : <FiEyeOff size={13} />}
                        </span>
                        <span style={styles.count}>{system.items.length}</span>
                      </div>
                      {system.description ? <span style={styles.systemDesc}>{system.description}</span> : null}
                    </div>
                  </div>

                  <button style={styles.iconBtn} title='Add item to system' onClick={() => openCreateItem(system.id)}>
                    <FiPlus size={15} />
                  </button>
                </div>

                <ItemsGrid
                  details={details}
                  items={groupFilter ? system.items.filter(matches) : system.items}
                  reorderable={canReorder}
                  systemHidden={!system.visible}
                  emptyLabel='No items in this system yet.'
                  onOpen={openItemDetails}
                  onReorder={persistItemOrder}
                />
              </div>
            ))}

            {visibleUngrouped.length ? (
              <div style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockTitle}>Ungrouped</span>
                </div>
                <ItemsGrid
                  details={details}
                  items={visibleUngrouped}
                  reorderable={canReorder}
                  emptyLabel='No standalone items.'
                  onOpen={openItemDetails}
                  onReorder={persistItemOrder}
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </Scrollbar>
  );
};

type ItemsGridProps = {
  items: GearItemResponse[];
  /** Planning fields joined in from the flat admin list, keyed by item id. */
  details?: Map<string, GearItemAdminResponse>;
  /** A hidden system takes its items off the public page whatever their own flag says. */
  systemHidden?: boolean;
  emptyLabel: string;
  /** Off while a filter hides part of the list. */
  reorderable?: boolean;
  onOpen: (item: GearItemResponse) => void;
  onReorder: (ids: string[]) => void;
};

const ItemsGrid = ({
  items,
  details,
  systemHidden,
  emptyLabel,
  reorderable = true,
  onOpen,
  onReorder,
}: ItemsGridProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const [local, setLocal] = useState<GearItemResponse[]>(items);
  const localRef = useRef<GearItemResponse[]>(items);
  const drag = useRef<number | null>(null);
  const orderBefore = useRef<string>('');
  // Drives the dimming of tiles the dragged one cannot trade places with.
  const [dragCategory, setDragCategory] = useState<GearCategory | null>(null);

  useEffect(() => {
    localRef.current = items;
    setLocal(items);
  }, [items]);

  const setLocalOrder = (next: GearItemResponse[]) => {
    localRef.current = next;
    setLocal(next);
  };

  const reorder = (from: number, to: number) => {
    const next = [...localRef.current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setLocalOrder(next);
  };

  if (!local.length) return <span style={styles.emptyLabel}>{emptyLabel}</span>;

  return (
    <div style={styles.itemsGrid}>
      {local.map((item, i) => {
        const detail = details?.get(item.id);
        // Anything not actually owned reads as unavailable rather than being
        // hidden, so the wishlist stays visible next to what it belongs with.
        const owned = item.ownership === GearOwnership.Owned;
        const Icon = gearCategoryIcon(item.category);
        // The backend sorts items by category before their saved order, so a
        // position only sticks among items of the same category. Dropping on
        // anything else would be written and then silently undone by the reply,
        // which is exactly what made ordering look broken — so it is refused
        // here, visibly, instead.
        const blocked = dragCategory !== null && dragCategory !== item.category;
        const publicity = describePublicity(item, systemHidden);

        const meta = detail
          ? [
              detail.estimatedPrice != null ? formatAmount(detail.estimatedPrice) : null,
              detail.neededBy ? needLabel(item.ownership, detail.neededBy) : null,
              detail.acquiredAt && owned ? `since ${formatShort(detail.acquiredAt)}` : null,
            ]
              .filter(Boolean)
              .join(' · ')
          : '';

        return (
          <div
            key={item.id}
            data-gear-tile
            role='button'
            tabIndex={0}
            style={{ ...styles.itemTile, opacity: blocked ? 0.25 : owned ? 1 : 0.6 }}
            onClick={() => onOpen(item)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              e.preventDefault();
              onOpen(item);
            }}
            onDragOver={(e: DragEvent) => {
              if (drag.current === null) return;
              e.stopPropagation();
              if (blocked) return;
              // Accepted even over the dragged tile itself, so releasing there
              // is a drop rather than a cancelled drag.
              e.preventDefault();
              if (drag.current === i) return;
              reorder(drag.current, i);
              drag.current = i;
            }}
          >
            <div style={styles.itemThumb}>
              {gearTileImage(item).src ? (
                <img
                  src={gearTileImage(item).src}
                  alt=''
                  style={{
                    ...styles.itemThumbImg,
                    backgroundImage: gearTileImage(item).placeholder
                      ? `url(${gearTileImage(item).placeholder})`
                      : undefined,
                    backgroundSize: 'cover',
                  }}
                  loading='lazy'
                  draggable={false}
                />
              ) : (
                // No photo of this copy: show what kind of thing it is rather than a
                // generic picture placeholder, which said nothing about the item.
                <Icon size={26} color={theme.colors[gearCategoryColor(item.category)]} />
              )}

              <GearCategoryChip category={item.category} style={styles.categoryChip} />

              {/* The only draggable part. With the whole tile draggable, a click
                  that moved a pixel became a drag and opening details was a gamble. */}
              <div
                style={{ ...styles.itemGrip, ...(reorderable ? {} : { display: 'none' }) }}
                title={`Drag to reorder among ${gearCategoryLabel(item.category).toLowerCase()} items`}
                draggable={reorderable}
                onClick={(e) => e.stopPropagation()}
                onDragStart={(e: DragEvent) => {
                  e.stopPropagation();
                  // Firefox will not start a drag that carries no data.
                  e.dataTransfer.setData('text/plain', item.id);
                  e.dataTransfer.effectAllowed = 'move';
                  const tile = (e.currentTarget as HTMLElement).closest('[data-gear-tile]');
                  if (tile) e.dataTransfer.setDragImage(tile, 24, 24);
                  drag.current = i;
                  orderBefore.current = localRef.current.map((x) => x.id).join();
                  setDragCategory(item.category);
                }}
                onDragEnd={(e: DragEvent) => {
                  e.stopPropagation();
                  drag.current = null;
                  setDragCategory(null);
                  const ids = localRef.current.map((x) => x.id);
                  if (ids.join() !== orderBefore.current) onReorder(ids);
                }}
              >
                <FiMove size={12} />
              </div>

              {owned ? null : (
                <span style={item.ownership === GearOwnership.Wishlist ? styles.wishlistChip : styles.retiredChip}>
                  {item.ownership === GearOwnership.Wishlist ? 'Don’t have it' : 'Retired'}
                </span>
              )}
              <span style={publicity.shown ? styles.itemEyeOn : styles.itemEyeOff} title={publicity.reason}>
                {publicity.shown ? <FiEye size={12} /> : <FiEyeOff size={12} />}
              </span>
            </div>

            <div style={styles.itemInfo}>
              <span style={styles.itemBrand}>{item.brand}</span>
              <span style={styles.itemModel} title={item.model}>
                {item.model}
              </span>

              {/* Planning detail, only where there is something to say. */}
              {meta ? <span style={styles.itemMeta}>{meta}</span> : null}

              {detail?.neededFor ? (
                <span style={styles.itemMeta} title={detail.neededFor.name}>
                  for {detail.neededFor.name}
                </span>
              ) : null}

              {detail?.missedFor.length ? <span style={styles.itemMissed}>a trip went without it</span> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Whether an item really appears on the public page, not just what its own
 * switch says. The public list drops anything not owned and everything inside
 * a hidden system, so an eye driven by `visible` alone would show an open eye
 * on gear nobody can see.
 */
const describePublicity = (item: GearItemResponse, systemHidden?: boolean): { shown: boolean; reason: string } => {
  if (!item.visible) return { shown: false, reason: 'Hidden from the public page' };
  if (item.ownership !== GearOwnership.Owned) {
    return { shown: false, reason: 'Not on the public page — only owned gear is shown there' };
  }
  if (systemHidden) return { shown: false, reason: 'Not on the public page — its system is hidden' };
  return { shown: true, reason: 'Shown on the public page' };
};

const formatShort = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
};

/** `neededBy` means a buy-by date on the wishlist and the next use when owned. */
const needLabel = (ownership: GearOwnership, neededBy: string): string =>
  ownership === GearOwnership.Wishlist ? `buy by ${formatShort(neededBy)}` : `next ${formatShort(neededBy)}`;

const chip = {
  position: 'absolute',
  fontSize: 10,
  fontWeight: 700,
  padding: '2px 7px',
  borderRadius: 999,
} as const;

const eye = {
  position: 'absolute',
  bottom: 6,
  right: 6,
  width: 22,
  height: 22,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
} as const;

const useStyles = mkUseStyles((t) => ({
  scroll: { height: '100%', width: '100%' },
  content: { gap: t.spacing.l, paddingRight: t.spacing.l, paddingBottom: t.spacing.m },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs },
  filterChip: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    padding: '0 12px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    color: t.colors.dark05,
    backgroundColor: 'transparent',
    // Longhands: the on-state swaps only the colour.
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: t.colors.dark04 + t.colorOpacity(0.5),
  },
  filterChipOn: {
    color: t.colors.white,
    borderColor: t.colors.blue,
    backgroundColor: t.colors.blue + t.colorOpacity(0.18),
  },
  filterCount: { fontSize: 11, fontWeight: 700, opacity: 0.7 },
  block: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    border: `1px solid ${t.colors.gray01 + t.colorOpacity(0.5)}`,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  systemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    minWidth: 0,
    flex: 1,
    cursor: 'pointer',
  },
  grip: {
    width: 26,
    height: 26,
    minWidth: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    cursor: 'grab',
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
  },
  systemThumb: {
    width: 40,
    height: 40,
    minWidth: 40,
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  systemThumbImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  systemTitleWrap: { gap: 2, minWidth: 0 },
  systemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexWrap: 'wrap' },
  blockTitle: { fontWeight: 700, fontSize: 16 },
  count: {
    fontSize: 11,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray01 + t.colorOpacity(0.5),
    padding: '2px 8px',
    borderRadius: 999,
  },
  systemLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: t.colors.blue04,
    backgroundColor: t.colors.blue + t.colorOpacity(0.14),
    padding: '2px 8px',
    borderRadius: 999,
  },
  eyeOn: { display: 'inline-flex', alignItems: 'center', color: t.colors.lightGreen },
  eyeOff: { display: 'inline-flex', alignItems: 'center', color: t.colors.yellow },
  systemDesc: {
    fontSize: 12,
    color: t.colors.dark05,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 420,
  },
  iconBtn: {
    width: 30,
    height: 30,
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    border: 0,
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: t.colors.gray01 + t.colorOpacity(0.6),
  },
  emptyLabel: { fontSize: 13, color: t.colors.dark05 },
  itemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: t.spacing.sm,
  },
  itemTile: {
    borderRadius: t.borderRadius.large,
    overflow: 'hidden',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
    border: `1px solid ${t.colors.gray01 + t.colorOpacity(0.5)}`,
    cursor: 'pointer',
    transition: 'opacity 0.15s ease',
  },
  itemThumb: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 10',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  itemThumbImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  categoryChip: { position: 'absolute', top: 6, left: 6 },
  itemGrip: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    cursor: 'grab',
    color: t.colors.white,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.72),
  },
  itemEyeOn: {
    ...eye,
    color: t.colors.lightGreen,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.78),
  },
  itemEyeOff: {
    ...eye,
    color: t.colors.yellow,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.78),
    border: `1px solid ${t.colors.yellow + t.colorOpacity(0.35)}`,
  },
  wishlistChip: {
    ...chip,
    bottom: 6,
    left: 6,
    color: t.colors.yellow,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.78),
    border: `1px solid ${t.colors.yellow + t.colorOpacity(0.35)}`,
  },
  retiredChip: {
    ...chip,
    bottom: 6,
    left: 6,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.78),
    border: `1px solid ${t.colors.dark04 + t.colorOpacity(0.45)}`,
  },
  itemInfo: { gap: 1, padding: t.spacing.s, minWidth: 0 },
  itemBrand: { fontSize: 12, color: t.colors.dark05 },
  itemModel: { fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  itemMeta: {
    fontSize: 11,
    color: t.colors.dark05,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemMissed: { fontSize: 11, color: t.colors.yellow },
}));
