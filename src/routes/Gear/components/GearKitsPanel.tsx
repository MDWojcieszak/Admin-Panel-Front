import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiCheck, FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { GearItemAdminResponse, GearItemResponse, GearKitResponse, GearOwnership } from '~/api/api';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { GearCategoryChip } from '~/routes/Gear/components/GearCategoryChip';
import { GearThumb } from '~/routes/Gear/components/GearThumb';
import { getApiErrorMessage } from '~/utils/apiError';
import { gearItemLabel } from '~/utils/gearCategory';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** How many thumbnails a kit row shows before collapsing the rest into "+N". */
const STRIP_LIMIT = 9;

/**
 * Kits are templates. Expanding one onto a session copies its items, so editing
 * a kit afterwards never reaches back into the sessions it was expanded into.
 */
type GearKitsPanelProps = {
  /** Shown as a Close button on the list view only — the editor has its own Cancel. */
  onClose?: () => void;
};

export const GearKitsPanel = ({ onClose }: GearKitsPanelProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { gearApi } = useApi();
  const toast = useToast();

  const [kits, setKits] = useState<GearKitResponse[]>([]);
  const [catalog, setCatalog] = useState<GearItemAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string>();
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftItems, setDraftItems] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!gearApi) return;
    setLoading(true);
    try {
      const [{ data: kitList }, { data: items }] = await Promise.all([
        gearApi.gearControllerListKits(),
        gearApi.gearControllerListItems({}),
      ]);
      setKits(kitList);
      setCatalog(items.items);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not load the kits.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [gearApi, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmModal = useModal('gear-kit-confirm', ConfirmModal, { title: 'Delete kit' });

  const startNew = () => {
    setEditingId('new');
    setDraftName('');
    setDraftDescription('');
    setDraftItems(new Set());
    setSearch('');
  };

  const startEdit = (kit: GearKitResponse) => {
    setEditingId(kit.id);
    setDraftName(kit.name);
    setDraftDescription(kit.description ?? '');
    setDraftItems(new Set(kit.items.map((item) => item.id)));
    setSearch('');
  };

  const toggle = (id: string) =>
    setDraftItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const save = async () => {
    if (!gearApi || !draftName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: draftName.trim(),
        description: draftDescription.trim() || undefined,
        gearItemIds: Array.from(draftItems),
      };

      if (editingId === 'new') {
        await gearApi.gearControllerCreateKit({ createGearKitDto: payload });
        toast('Kit created', 'success');
      } else if (editingId) {
        // gearItemIds replaces the contents wholesale, so the draft is the truth.
        await gearApi.gearControllerUpdateKit({ id: editingId, updateGearKitDto: payload });
        toast('Kit saved', 'success');
      }

      setEditingId(undefined);
      await load();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save the kit. Names have to be unique.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = (kit: GearKitResponse) =>
    confirmModal.show({
      message: `Delete “${kit.name}”?`,
      description: 'Sessions it was already expanded onto keep their gear.',
      danger: true,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        if (!gearApi) return;
        try {
          await gearApi.gearControllerRemoveKit({ id: kit.id });
          await load();
          toast('Kit deleted', 'success');
        } catch (e) {
          toast(getApiErrorMessage(e, 'Could not delete the kit.'), 'error');
          throw e;
        }
      },
    });

  // Retired gear is only offered while it is still in the draft, so an old kit
  // can be cleaned up but nothing sold can be added to a new one.
  const pickable = useMemo(() => {
    const term = search.trim().toLowerCase();
    return catalog
      .filter((item) => item.ownership !== GearOwnership.Retired || draftItems.has(item.id))
      .filter((item) => !term || gearItemLabel(item).toLowerCase().includes(term));
  }, [catalog, search, draftItems]);

  const chosen = useMemo(() => catalog.filter((item) => draftItems.has(item.id)), [catalog, draftItems]);

  if (loading && !kits.length) return <Loader />;

  if (editingId) {
    return (
      <div style={styles.container}>
        <span style={styles.heading}>{editingId === 'new' ? 'New kit' : 'Edit kit'}</span>

        <div style={styles.fieldRow}>
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder='Kit name'
            style={{ ...styles.input, flex: 1 }}
          />
          <input
            value={draftDescription}
            onChange={(e) => setDraftDescription(e.target.value)}
            placeholder='Description (optional)'
            style={{ ...styles.input, flex: 1.4 }}
          />
        </div>

        {/* What is in the kit right now, always in view — the picker below is a
            long list and the selection would otherwise scroll out of sight. */}
        <div style={styles.chosenBlock}>
          <span style={styles.subHeading}>In this kit · {chosen.length}</span>
          {chosen.length ? (
            <div style={styles.chosenStrip}>
              {chosen.map((item) => (
                <div key={item.id} style={styles.chosenItem} title={gearItemLabel(item)}>
                  <GearThumb gear={item} size={40} />
                  <button
                    type='button'
                    aria-label={`Remove ${gearItemLabel(item)}`}
                    style={styles.chosenRemove}
                    onClick={() => toggle(item.id)}
                  >
                    <FiX size={10} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <span style={styles.meta}>Nothing yet — pick items below.</span>
          )}
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search gear…'
          style={styles.input}
        />

        <Scrollbar maxHeight='min(360px, 42vh)'>
          <div style={styles.pickGrid}>
            {pickable.length === 0 ? <span style={styles.meta}>Nothing matches that search.</span> : null}

            {pickable.map((item) => {
              const picked = draftItems.has(item.id);
              return (
                <div
                  key={item.id}
                  role='checkbox'
                  aria-checked={picked}
                  tabIndex={0}
                  style={{
                    ...styles.pickTile,
                    borderColor: picked ? theme.colors.blue : theme.colors.gray01 + theme.colorOpacity(0.5),
                    backgroundColor: picked
                      ? theme.colors.blue + theme.colorOpacity(0.16)
                      : theme.colors.gray04 + theme.colorOpacity(0.5),
                  }}
                  onClick={() => toggle(item.id)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    toggle(item.id);
                  }}
                >
                  <div style={styles.pickImage}>
                    <GearThumb gear={item} style={styles.pickThumb} size={64} />
                    <div style={{ ...styles.pickCheck, ...(picked ? styles.pickCheckOn : {}) }}>
                      {picked ? <FiCheck size={12} /> : null}
                    </div>
                    {item.ownership === GearOwnership.Owned ? null : (
                      <span style={styles.pickState}>
                        {item.ownership === GearOwnership.Wishlist ? 'Don’t have it' : 'Retired'}
                      </span>
                    )}
                  </div>

                  <div style={styles.pickText}>
                    <span style={styles.pickBrand}>{item.brand}</span>
                    <span style={styles.pickModel} title={item.model}>
                      {item.model}
                    </span>
                    <GearCategoryChip category={item.category} style={{ marginTop: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Scrollbar>

        <div style={styles.actions}>
          <Button label='Cancel' variant='secondary' onClick={() => setEditingId(undefined)} />
          <Button label='Save kit' onClick={save} loading={saving} disabled={!draftName.trim()} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.listHeader}>
        <div style={styles.listHeaderText}>
          <span style={styles.heading}>Kits</span>
          <span style={styles.meta}>Reusable bags you can drop onto a session in one go.</span>
        </div>
        <Button label='New kit' variant='secondary' icon={<FiPlus size={14} />} onClick={startNew} />
      </div>

      {kits.length === 0 ? (
        <EmptyState title='No kits yet' description='Group the gear you always take together.' />
      ) : (
        <Scrollbar maxHeight='min(460px, 60vh)'>
          <div style={styles.list}>
            {kits.map((kit) => (
              <div key={kit.id} style={styles.kitRow}>
                <div style={styles.kitTop}>
                  <div style={styles.kitText}>
                    <span style={styles.name}>{kit.name}</span>
                    <span style={styles.meta}>
                      {kit.items.length} item(s)
                      {kit.description ? ` · ${kit.description}` : ''}
                    </span>
                  </div>

                  <button type='button' style={styles.iconBtn} title='Edit kit' onClick={() => startEdit(kit)}>
                    <FiEdit2 size={14} />
                  </button>
                  <button type='button' style={styles.iconBtnDanger} title='Delete kit' onClick={() => remove(kit)}>
                    <FiTrash2 size={14} />
                  </button>
                </div>

                <KitStrip items={kit.items} />
              </div>
            ))}
          </div>
        </Scrollbar>
      )}

      {onClose ? (
        <div style={styles.actions}>
          <Button label='Close' variant='secondary' onClick={onClose} />
        </div>
      ) : null}
    </div>
  );
};

const KitStrip = ({ items }: { items: GearItemResponse[] }) => {
  const styles = useStyles();
  if (!items.length) return <span style={styles.meta}>Empty kit.</span>;

  const shown = items.slice(0, STRIP_LIMIT);
  const rest = items.length - shown.length;

  return (
    <div style={styles.strip}>
      {shown.map((item) => (
        <div key={item.id} title={gearItemLabel(item)}>
          <GearThumb gear={item} size={40} />
        </div>
      ))}
      {rest > 0 ? <span style={styles.stripMore}>+{rest}</span> : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.s, minHeight: 0, minWidth: 0 },
  heading: { fontWeight: 700, fontSize: 18 },
  subHeading: { fontWeight: 700, fontSize: 12, color: t.colors.blue04 },
  meta: { fontSize: 12, color: t.colors.dark05, wordBreak: 'break-word' },
  name: { fontWeight: 600, fontSize: 15 },
  fieldRow: { flexDirection: 'row', gap: t.spacing.s, flexWrap: 'wrap' },
  input: {
    minWidth: 0,
    boxSizing: 'border-box',
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.blue02 + t.colorOpacity(0.5)}`,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
    color: t.colors.white,
    outline: 'none',
    fontSize: 13,
  },
  chosenBlock: {
    gap: t.spacing.xs,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.medium,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  chosenStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.s },
  chosenItem: { position: 'relative' },
  chosenRemove: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 16,
    height: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 0,
    borderRadius: '50%',
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: t.colors.red,
  },
  pickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))',
    gap: t.spacing.s,
    paddingRight: t.spacing.l,
  },
  pickTile: {
    borderRadius: t.borderRadius.medium,
    borderWidth: 1,
    borderStyle: 'solid',
    overflow: 'hidden',
    cursor: 'pointer',
    userSelect: 'none',
  },
  pickImage: { position: 'relative', width: '100%', aspectRatio: '16 / 10', overflow: 'hidden' },
  // Taken out of flow: left in it, a photo's own height stretched the tile past
  // the aspect ratio and photo tiles ended up taller than icon ones.
  pickThumb: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    minWidth: 0,
    border: 0,
    borderRadius: 0,
  },
  pickCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    color: t.colors.white,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.72),
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: t.colors.dark04,
  },
  pickCheckOn: { backgroundColor: t.colors.blue, borderColor: t.colors.blue },
  pickState: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 999,
    color: t.colors.yellow,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.8),
  },
  pickText: { gap: 1, padding: t.spacing.xs, minWidth: 0 },
  pickBrand: { fontSize: 11, color: t.colors.dark05 },
  pickModel: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.s,
  },
  listHeaderText: { gap: 2, minWidth: 0 },
  list: { gap: t.spacing.s, paddingRight: t.spacing.l },
  kitRow: {
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.medium,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  kitTop: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
  kitText: { flex: 1, minWidth: 0, gap: 2 },
  strip: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: t.spacing.xs },
  stripMore: { fontSize: 12, fontWeight: 600, color: t.colors.dark05, marginLeft: t.spacing.xs },
  iconBtn: {
    width: 30,
    height: 30,
    minWidth: 30,
    display: 'flex',
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    border: 0,
    cursor: 'pointer',
    color: t.colors.red,
    backgroundColor: t.colors.red + t.colorOpacity(0.14),
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: t.spacing.m, marginTop: t.spacing.xs },
}));
