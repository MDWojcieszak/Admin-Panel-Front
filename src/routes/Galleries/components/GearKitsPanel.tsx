import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiCheck, FiPlus, FiTrash2 } from 'react-icons/fi';
import { GearItemAdminResponse, GearKitResponse, GearOwnership } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage } from '~/utils/apiError';
import { gearCategoryIcon, gearCategoryLabel, gearItemLabel } from '~/utils/gearCategory';
import { mkUseStyles, useTheme } from '~/utils/theme';

/**
 * Kits are templates. Expanding one onto a session copies its items, so editing
 * a kit afterwards never reaches back into the sessions it was expanded into.
 */
export const GearKitsPanel = () => {
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
  };

  const startEdit = (kit: GearKitResponse) => {
    setEditingId(kit.id);
    setDraftName(kit.name);
    setDraftDescription(kit.description ?? '');
    setDraftItems(new Set(kit.items.map((item) => item.id)));
  };

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

  const pickable = useMemo(() => {
    const term = search.trim().toLowerCase();
    return catalog
      .filter((item) => item.ownership !== GearOwnership.Retired || draftItems.has(item.id))
      .filter((item) => !term || gearItemLabel(item).toLowerCase().includes(term));
  }, [catalog, search, draftItems]);

  if (loading && !kits.length) return <Loader />;

  if (editingId) {
    return (
      <div style={styles.container}>
        <span style={styles.heading}>{editingId === 'new' ? 'New kit' : 'Edit kit'}</span>

        <input value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder='Kit name' style={styles.input} />
        <input
          value={draftDescription}
          onChange={(e) => setDraftDescription(e.target.value)}
          placeholder='Description (optional)'
          style={styles.input}
        />

        <div style={styles.pickHeader}>
          <span style={styles.subHeading}>Contents</span>
          <span style={styles.meta}>{draftItems.size} selected</span>
        </div>

        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search gear…' style={styles.input} />

        <Scrollbar style={styles.pickScroll}>
          <div style={styles.pickList}>
            {pickable.map((item) => {
              const picked = draftItems.has(item.id);
              const Icon = gearCategoryIcon(item.category);
              return (
                <div
                  key={item.id}
                  role='button'
                  tabIndex={0}
                  style={{ ...styles.pickRow, ...(picked ? styles.pickRowOn : {}) }}
                  onClick={() =>
                    setDraftItems((prev) => {
                      const next = new Set(prev);
                      if (next.has(item.id)) next.delete(item.id);
                      else next.add(item.id);
                      return next;
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    setDraftItems((prev) => {
                      const next = new Set(prev);
                      if (next.has(item.id)) next.delete(item.id);
                      else next.add(item.id);
                      return next;
                    });
                  }}
                >
                  <div style={{ ...styles.checkbox, ...(picked ? styles.checkboxOn : {}) }}>
                    {picked ? <FiCheck size={11} /> : null}
                  </div>
                  <Icon size={15} color={theme.colors.blue04} />
                  <span style={styles.name}>{gearItemLabel(item)}</span>
                  <span style={styles.meta}>{gearCategoryLabel(item.category)}</span>
                  {item.ownership === GearOwnership.Retired ? <Badge label='Retired' tone='red' /> : null}
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
      <div style={styles.pickHeader}>
        <div>
          <span style={styles.heading}>Kits</span>
          <span style={styles.meta}>Reusable bags you can drop onto a session in one go.</span>
        </div>
        <Button label='New kit' variant='secondary' icon={<FiPlus size={14} />} onClick={startNew} />
      </div>

      {kits.length === 0 ? (
        <EmptyState title='No kits yet' description='Group the gear you always take together.' />
      ) : (
        <div style={styles.list}>
          {kits.map((kit) => (
            <div key={kit.id} style={styles.kitRow}>
              <div style={styles.rowText}>
                <span style={styles.name}>{kit.name}</span>
                <span style={styles.meta}>
                  {kit.items.length} item(s)
                  {kit.description ? ` · ${kit.description}` : ''}
                </span>
                <span style={styles.meta}>{kit.items.map((item) => gearItemLabel(item)).join(', ') || '—'}</span>
              </div>

              <Button label='Edit' variant='secondary' onClick={() => startEdit(kit)} />
              <div
                role='button'
                tabIndex={0}
                style={styles.removeBtn}
                title='Delete kit'
                onClick={() => remove(kit)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  e.preventDefault();
                  remove(kit);
                }}
              >
                <FiTrash2 size={14} color={theme.colors.red} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.s, minHeight: 0, flex: 1 },
  heading: { fontWeight: 700, fontSize: 16 },
  subHeading: { fontWeight: 700, fontSize: 13 },
  meta: { fontSize: 12, color: t.colors.dark05, wordBreak: 'break-word' },
  name: { fontWeight: 600, fontSize: 14 },
  input: {
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.blue02 + t.colorOpacity(0.5)}`,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
    color: t.colors.white,
    outline: 'none',
    fontSize: 13,
  },
  pickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.s,
  },
  pickScroll: { height: 'min(300px, 45vh)' },
  pickList: { gap: t.spacing.xs, paddingRight: t.spacing.s },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.xs,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
    cursor: 'pointer',
  },
  pickRowOn: { backgroundColor: t.colors.blue + t.colorOpacity(0.18) },
  checkbox: {
    width: 16,
    height: 16,
    minWidth: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${t.colors.dark04}`,
    color: t.colors.white,
  },
  checkboxOn: { backgroundColor: t.colors.blue, borderColor: t.colors.blue },
  list: { gap: t.spacing.s },
  kitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  rowText: { flex: 1, minWidth: 0, gap: 2 },
  removeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: t.spacing.xs,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    backgroundColor: t.colors.red + t.colorOpacity(0.1),
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: t.spacing.m, marginTop: t.spacing.s },
}));
