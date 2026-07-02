import { DragEvent, useEffect, useRef, useState } from 'react';
import { FiEdit2, FiImage, FiMove, FiPlus, FiTrash2 } from 'react-icons/fi';
import { MdCameraAlt } from 'react-icons/md';
import { GearItemResponse, GearOverviewResponse, GearSystemResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { Switch } from '~/components/Switch';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { GearItemModal } from '~/routes/Galleries/modals/GearItemModal';
import { GearSystemModal } from '~/routes/Galleries/modals/GearSystemModal';
import { imgUrl } from '~/routes/Galleries/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

const categoryLabel = (c: string) => c.charAt(0) + c.slice(1).toLowerCase();

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
    await gearQuery.reload();
  };

  const systemModal = useModal('gear-system', GearSystemModal, { title: 'System' });
  const itemModal = useModal('gear-item', GearItemModal, { title: 'Gear item' });
  const confirmModal = useModal('gear-confirm', ConfirmModal, { title: 'Delete' });

  const openCreateSystem = () => systemModal.show({ onSaved: reload });
  const openEditSystem = (system: GearSystemResponse) => systemModal.show({ system, onSaved: reload });
  const openCreateItem = (defaultSystemId?: string) =>
    itemModal.show({ systems: systemsRef.current, defaultSystemId, onSaved: reload });
  const openEditItem = (item: GearItemResponse) =>
    itemModal.show({ item, systems: systemsRef.current, onSaved: reload });

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
          await gearQuery.reload();
        } catch (e) {
          toast(getApiErrorMessage(e, 'Could not delete the system.'), 'error');
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
          await gearQuery.reload();
        } catch (e) {
          toast(getApiErrorMessage(e, 'Could not delete the gear item.'), 'error');
        }
      },
    });

  const toggleSystemVisible = async (system: GearSystemResponse) => {
    if (!gearApi) return;
    setSystemsLocal(systemsRef.current.map((s) => (s.id === system.id ? { ...s, visible: !s.visible } : s)));
    try {
      await gearApi.gearControllerUpdateSystem({ id: system.id, updateGearSystemDto: { visible: !system.visible } });
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not update visibility.'), 'error');
      await gearQuery.reload();
    }
  };

  const toggleItemVisible = async (item: GearItemResponse) => {
    if (!gearApi) return;
    try {
      await gearApi.gearControllerUpdate({ id: item.id, updateGearDto: { visible: !item.visible } });
      await gearQuery.reload();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not update visibility.'), 'error');
    }
  };

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

  const isEmpty = !gearQuery.loading && systems.length === 0 && ungrouped.length === 0;

  return (
    <div style={styles.scroll}>
      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.titleWrap}>
            <h2 style={styles.heading}>My gear</h2>
            <span style={styles.subheading}>
              Systems (camera bodies + their lenses) and standalone items shown on the public “Gear” page.
            </span>
          </div>
          <div style={styles.headerActions}>
            <Button label='Add system' variant='secondary' icon={<FiPlus size={14} />} onClick={openCreateSystem} />
            <Button label='Add gear' icon={<FiPlus size={14} />} onClick={() => openCreateItem()} />
          </div>
        </div>

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
            {systems.map((system, i) => (
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
                  <div style={styles.systemMeta}>
                    <div
                      style={styles.grip}
                      title='Drag to reorder systems'
                      draggable
                      onDragStart={() => (sysDrag.current = i)}
                      onDragEnd={() => {
                        sysDrag.current = null;
                        persistSystemOrder();
                      }}
                    >
                      <FiMove size={14} />
                    </div>
                    <div style={styles.systemThumb}>
                      {imgUrl(system.coverUrl) ? (
                        <img src={imgUrl(system.coverUrl)} alt='' style={styles.systemThumbImg} loading='lazy' />
                      ) : (
                        <FiImage size={16} color={theme.colors.dark05} />
                      )}
                    </div>
                    <div style={styles.systemTitleWrap}>
                      <div style={styles.systemTitleRow}>
                        <span style={styles.blockTitle}>{system.name}</span>
                        {system.label ? <span style={styles.systemLabel}>{system.label}</span> : null}
                        {!system.visible ? <span style={styles.hiddenChip}>Hidden</span> : null}
                      </div>
                      {system.description ? <span style={styles.systemDesc}>{system.description}</span> : null}
                    </div>
                  </div>
                  <div style={styles.blockActions}>
                    <Switch checked={system.visible} onChange={() => toggleSystemVisible(system)} />
                    <button style={styles.iconBtn} title='Add item to system' onClick={() => openCreateItem(system.id)}>
                      <FiPlus size={15} />
                    </button>
                    <button style={styles.iconBtn} title='Edit system' onClick={() => openEditSystem(system)}>
                      <FiEdit2 size={15} />
                    </button>
                    <button style={styles.iconBtnDanger} title='Delete system' onClick={() => deleteSystem(system)}>
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>

                <ItemsGrid
                  items={system.items}
                  emptyLabel='No items in this system yet.'
                  onEdit={openEditItem}
                  onDelete={deleteItem}
                  onToggleVisible={toggleItemVisible}
                  onReorder={persistItemOrder}
                />
              </div>
            ))}

            {ungrouped.length ? (
              <div style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockTitle}>Ungrouped</span>
                </div>
                <ItemsGrid
                  items={ungrouped}
                  emptyLabel='No standalone items.'
                  onEdit={openEditItem}
                  onDelete={deleteItem}
                  onToggleVisible={toggleItemVisible}
                  onReorder={persistItemOrder}
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

type ItemsGridProps = {
  items: GearItemResponse[];
  emptyLabel: string;
  onEdit: (item: GearItemResponse) => void;
  onDelete: (item: GearItemResponse) => void;
  onToggleVisible: (item: GearItemResponse) => void;
  onReorder: (ids: string[]) => void;
};

const ItemsGrid = ({ items, emptyLabel, onEdit, onDelete, onToggleVisible, onReorder }: ItemsGridProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const [local, setLocal] = useState<GearItemResponse[]>(items);
  const localRef = useRef<GearItemResponse[]>(items);
  const drag = useRef<number | null>(null);

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
      {local.map((item, i) => (
        <div
          key={item.id}
          style={styles.itemTile}
          draggable
          onDragStart={(e: DragEvent) => {
            e.stopPropagation();
            drag.current = i;
          }}
          onDragOver={(e: DragEvent) => {
            e.stopPropagation();
            if (drag.current === null || drag.current === i) return;
            e.preventDefault();
            reorder(drag.current, i);
            drag.current = i;
          }}
          onDragEnd={(e: DragEvent) => {
            e.stopPropagation();
            drag.current = null;
            onReorder(localRef.current.map((x) => x.id));
          }}
        >
          <div style={styles.itemThumb}>
            {imgUrl(item.coverUrl) ? (
              <img src={imgUrl(item.coverUrl)} alt='' style={styles.itemThumbImg} loading='lazy' draggable={false} />
            ) : (
              <FiImage size={18} color={theme.colors.dark05} />
            )}
            <span style={styles.categoryChip}>{categoryLabel(item.category)}</span>
            {!item.visible ? <span style={styles.itemHiddenChip}>Hidden</span> : null}
          </div>
          <div style={styles.itemInfo}>
            <span style={styles.itemBrand}>{item.brand}</span>
            <span style={styles.itemModel} title={item.model}>
              {item.model}
            </span>
          </div>
          <div style={styles.itemActions}>
            <Switch checked={item.visible} onChange={() => onToggleVisible(item)} />
            <div style={styles.itemActionsRight}>
              <button style={styles.iconBtn} title='Edit' onClick={() => onEdit(item)}>
                <FiEdit2 size={14} />
              </button>
              <button style={styles.iconBtnDanger} title='Delete' onClick={() => onDelete(item)}>
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  scroll: { height: '100%', minHeight: 0, width: '100%', overflowY: 'auto' },
  content: { gap: t.spacing.l, paddingBottom: t.spacing.m },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: t.spacing.m },
  titleWrap: { gap: 2, minWidth: 0 },
  heading: { fontSize: 22, fontWeight: 700 },
  subheading: { fontSize: 13, color: t.colors.dark05, maxWidth: 620 },
  headerActions: { flexDirection: 'row', gap: t.spacing.s, flexWrap: 'wrap' },
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
    justifyContent: 'space-between',
    gap: t.spacing.m,
    flexWrap: 'wrap',
  },
  systemMeta: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, minWidth: 0, flex: 1 },
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
  systemLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: t.colors.blue04,
    backgroundColor: t.colors.blue + t.colorOpacity(0.14),
    padding: '2px 8px',
    borderRadius: 999,
  },
  hiddenChip: {
    fontSize: 11,
    fontWeight: 700,
    color: t.colors.yellow,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.72),
    padding: '2px 8px',
    borderRadius: 999,
  },
  systemDesc: {
    fontSize: 12,
    color: t.colors.dark05,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 420,
  },
  blockActions: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
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
  iconBtnDanger: {
    width: 30,
    height: 30,
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    border: 0,
    cursor: 'pointer',
    color: t.colors.red,
    backgroundColor: t.colors.red + t.colorOpacity(0.14),
  },
  emptyLabel: { fontSize: 13, color: t.colors.dark05 },
  itemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: t.spacing.m,
  },
  itemTile: {
    borderRadius: t.borderRadius.large,
    overflow: 'hidden',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
    border: `1px solid ${t.colors.gray01 + t.colorOpacity(0.5)}`,
    cursor: 'grab',
  },
  itemThumb: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4 / 3',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  itemThumbImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  categoryChip: {
    position: 'absolute',
    top: 6,
    left: 6,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.3,
    color: t.colors.white,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.72),
    padding: '2px 7px',
    borderRadius: 999,
  },
  itemHiddenChip: {
    position: 'absolute',
    top: 6,
    right: 6,
    fontSize: 10,
    fontWeight: 700,
    color: t.colors.yellow,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.72),
    padding: '2px 7px',
    borderRadius: 999,
  },
  itemInfo: { gap: 1, padding: t.spacing.s, minWidth: 0 },
  itemBrand: { fontSize: 12, color: t.colors.dark05 },
  itemModel: { fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.s,
    padding: t.spacing.s,
    paddingTop: 0,
  },
  itemActionsRight: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
}));
