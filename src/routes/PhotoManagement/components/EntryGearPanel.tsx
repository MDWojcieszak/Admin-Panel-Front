import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiAlertTriangle, FiCheck, FiEdit2, FiPlus, FiShoppingCart, FiTrash2, FiX } from 'react-icons/fi';
import {
  EntryGearPhase,
  EntryGearWarning,
  GearItemResponse,
  GearKitResponse,
  GearOwnership,
  PhotoEntryGearItemResponse,
  PhotoEntryGearListResponse,
  PhotoEntryShoppingListResponse,
  PhotoEntryStatus,
} from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage } from '~/utils/apiError';
import { formatAmount } from '~/utils/formatAmount';
import { GearThumb } from '~/routes/Gear/components/GearThumb';
import { gearCategoryLabel, gearItemLabel, holdsMedia } from '~/utils/gearCategory';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** Keeps a button's label on one line when its column is narrow. */
const NO_WRAP = { flexShrink: 0, whiteSpace: 'nowrap' } as const;

type EntryGearPanelProps = {
  entryId: string;
  /** Lets the parent refresh the entry, whose gearConfirmedAt and uploadStatus are derived from this list. */
  onChanged?: () => void | Promise<void>;
};

export const EntryGearPanel = ({ entryId, onChanged }: EntryGearPanelProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { photoEntryApi, gearApi } = useApi();
  const toast = useToast();

  const [gear, setGear] = useState<PhotoEntryGearListResponse>();
  const [shoppingList, setShoppingList] = useState<PhotoEntryShoppingListResponse>();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string>();
  const [adding, setAdding] = useState(false);
  const [catalog, setCatalog] = useState<GearItemResponse[]>([]);
  const [kits, setKits] = useState<GearKitResponse[]>([]);
  const [search, setSearch] = useState('');
  // After the shoot the list is a record, so its ticks and bins wait behind
  // Edit. While packing they are the whole point and stay out in the open.
  const [editing, setEditing] = useState(false);

  // Declaration flow for an entry added after the fact: pick what was used, then confirm.
  const [declaring, setDeclaring] = useState(false);
  const [declaredIds, setDeclaredIds] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);

  /** Every mutating gear endpoint answers with the whole list, so state is replaced, never refetched. */
  const absorb = useCallback(
    async (next: PhotoEntryGearListResponse) => {
      setGear(next);
      await onChanged?.();
    },
    [onChanged],
  );

  const load = useCallback(async () => {
    if (!photoEntryApi) return;
    setLoading(true);
    try {
      const { data } = await photoEntryApi.photoEntryGearControllerList({ id: entryId });
      setGear(data);

      if (data.status === PhotoEntryStatus.Planned) {
        const { data: list } = await photoEntryApi.photoEntryGearControllerShoppingList({ id: entryId });
        setShoppingList(list);
      } else {
        setShoppingList(undefined);
      }
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not load the gear for this session.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [photoEntryApi, entryId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openCatalog = async () => {
    setAdding((prev) => !prev);
    if (catalog.length || !gearApi) return;
    try {
      const [{ data: items }, { data: kitList }] = await Promise.all([
        gearApi.gearControllerListItems({}),
        gearApi.gearControllerListKits(),
      ]);
      setCatalog(items.items);
      setKits(kitList);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not load the gear catalog.'), 'error');
    }
  };

  const run = async (key: string, action: () => Promise<PhotoEntryGearListResponse>, fallback: string) => {
    setBusyId(key);
    try {
      await absorb(await action());
    } catch (e) {
      toast(getApiErrorMessage(e, fallback), 'error');
    } finally {
      setBusyId(undefined);
    }
  };

  const patchItem = (gearItemId: string, dto: { packed?: boolean; used?: boolean; secured?: boolean }) => {
    if (!photoEntryApi) return;
    return run(
      gearItemId,
      async () => {
        const { data } = await photoEntryApi.photoEntryGearControllerPatch({
          id: entryId,
          gearItemId,
          patchPhotoEntryGearDto: dto,
        });
        return data;
      },
      'Could not update this item.',
    );
  };

  const removeItem = (gearItemId: string) => {
    if (!photoEntryApi) return;
    return run(
      gearItemId,
      async () => {
        const { data } = await photoEntryApi.photoEntryGearControllerRemove({ id: entryId, gearItemId });
        return data;
      },
      'Could not remove this item.',
    );
  };

  const addItem = (gearItemId: string) => {
    if (!photoEntryApi) return;
    return run(
      gearItemId,
      async () => {
        const { data } = await photoEntryApi.photoEntryGearControllerAdd({
          id: entryId,
          gearItemId,
          addPhotoEntryGearDto: {},
        });
        return data;
      },
      'Could not add this item.',
    );
  };

  const addKit = (kitId: string) => {
    if (!photoEntryApi) return;
    return run(
      `kit-${kitId}`,
      async () => {
        const { data } = await photoEntryApi.photoEntryGearControllerAddFromKit({ id: entryId, kitId });
        return data;
      },
      'Could not add this kit.',
    );
  };

  /**
   * Replaces the list with exactly what was ticked, then stamps the confirmation.
   * An empty list is a valid answer — otherwise an entry where no gear was used
   * would keep asking for ever.
   */
  const confirmDeclaration = async () => {
    if (!photoEntryApi) return;
    setConfirming(true);
    try {
      await photoEntryApi.photoEntryGearControllerReplace({
        id: entryId,
        putPhotoEntryGearDto: {
          items: Array.from(declaredIds).map((gearItemId) => ({ gearItemId, used: true })),
        },
      });
      const { data } = await photoEntryApi.photoEntryGearControllerConfirm({ id: entryId });
      await absorb(data);
      setDeclaring(false);
      setDeclaredIds(new Set());
      toast('Gear confirmed', 'success');
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not confirm the gear.'), 'error');
    } finally {
      setConfirming(false);
    }
  };

  const startDeclaring = async () => {
    setDeclaring(true);
    setDeclaredIds(new Set(gear?.items.filter((item) => item.used).map((item) => item.gear.id)));
    if (!catalog.length) await openCatalog();
    setAdding(false);
  };

  const presentIds = useMemo(() => new Set(gear?.items.map((item) => item.gear.id) ?? []), [gear]);

  const availableCatalog = useMemo(() => {
    const term = search.trim().toLowerCase();
    return catalog
      .filter((item) => !presentIds.has(item.id))
      .filter((item) => !term || gearItemLabel(item).toLowerCase().includes(term));
  }, [catalog, presentIds, search]);

  const declarationCandidates = useMemo(() => {
    const term = search.trim().toLowerCase();
    const merged = new Map<string, GearItemResponse>();
    gear?.items.forEach((item) => merged.set(item.gear.id, item.gear));
    catalog.forEach((item) => merged.set(item.id, item));

    return Array.from(merged.values())
      .filter((item) => item.ownership !== GearOwnership.Wishlist)
      .filter((item) => !term || gearItemLabel(item).toLowerCase().includes(term));
  }, [gear, catalog, search]);

  if (loading && !gear) return <Loader />;
  if (!gear) return <EmptyState title='Gear unavailable' description='The gear list could not be loaded.' />;

  const isShot = gear.status === PhotoEntryStatus.Shot;
  const phase = gear.phase;

  const interactive = phase === EntryGearPhase.Pack || (phase === EntryGearPhase.Secure && editing);

  const listedItems = gear.items.filter((item) => item.listed);
  const otherItems = gear.items.filter((item) => !item.listed);

  if (declaring) {
    return (
      <div style={styles.container}>
        <div style={styles.promptBanner}>
          <FiAlertTriangle size={16} />
          <span>Tick the gear you actually used. Leaving it empty is fine — it just records that none was.</span>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search gear…'
          style={styles.searchInput}
        />

        <Scrollbar style={styles.pickerScroll}>
          <div style={styles.pickerList}>
            {declarationCandidates.map((item) => {
              const picked = declaredIds.has(item.id);
              return (
                <div
                  key={item.id}
                  role='button'
                  tabIndex={0}
                  style={{ ...styles.pickerRow, ...(picked ? styles.pickerRowPicked : {}) }}
                  onClick={() =>
                    setDeclaredIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(item.id)) next.delete(item.id);
                      else next.add(item.id);
                      return next;
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    setDeclaredIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(item.id)) next.delete(item.id);
                      else next.add(item.id);
                      return next;
                    });
                  }}
                >
                  <div style={{ ...styles.checkbox, ...(picked ? styles.checkboxOn : {}) }}>
                    {picked ? <FiCheck size={12} /> : null}
                  </div>
                  <GearThumb gear={item} size={32} />
                  <span style={styles.itemName}>{gearItemLabel(item)}</span>
                  <span style={styles.itemCategory}>{gearCategoryLabel(item.category)}</span>
                </div>
              );
            })}
          </div>
        </Scrollbar>

        <div style={styles.actions}>
          <Button label='Cancel' variant='secondary' onClick={() => setDeclaring(false)} />
          <Button label={`Confirm ${declaredIds.size} item(s)`} onClick={confirmDeclaration} loading={confirming} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {gear.needsGearConfirmation ? (
        <div style={styles.promptBanner}>
          <FiAlertTriangle size={16} />
          <div style={styles.promptText}>
            <span style={styles.promptTitle}>Which gear did you use?</span>
            <span>This session was never given a gear list, so nothing can be chased for its material.</span>
          </div>
          <Button label='Declare gear' variant='secondary' onClick={startDeclaring} />
        </div>
      ) : null}

      <div style={styles.headerRow}>
        <div style={styles.headerText}>
          <span style={styles.headerTitle}>
            {phase === EntryGearPhase.Pack
              ? 'Packing list'
              : phase === EntryGearPhase.Secure
                ? 'Upload the material'
                : 'Gear used'}
          </span>
          {phase === EntryGearPhase.Pack ? (
            <span style={styles.headerHint}>Tick things off as they go in the bag.</span>
          ) : phase === EntryGearPhase.None ? (
            <span style={styles.headerHint}>This session is closed — the list is read-only.</span>
          ) : null}
        </div>

        <div style={styles.headerActions}>
          {interactive ? (
            <Button
              label={adding ? 'Done adding' : 'Add gear'}
              style={NO_WRAP}
              variant='secondary'
              icon={adding ? <FiX size={14} /> : <FiPlus size={14} />}
              onClick={openCatalog}
            />
          ) : null}
          {phase === EntryGearPhase.Secure ? (
            <Button
              label={editing ? 'Done' : 'Edit'}
              style={NO_WRAP}
              variant={editing ? 'primary' : 'secondary'}
              icon={editing ? <FiCheck size={14} /> : <FiEdit2 size={14} />}
              onClick={() => {
                setEditing((prev) => !prev);
                setAdding(false);
              }}
            />
          ) : null}
        </div>
      </div>

      {gear.gearConfirmedAt ? (
        <span style={styles.confirmedNote}>Gear confirmed {new Date(gear.gearConfirmedAt).toLocaleString()}</span>
      ) : null}

      {adding && interactive ? (
        <div style={styles.addPanel}>
          {kits.length ? (
            <div style={styles.kitRow}>
              {kits.map((kit) => (
                <Button
                  key={kit.id}
                  label={kit.name}
                  variant='secondary'
                  icon={<FiPlus size={12} />}
                  loading={busyId === `kit-${kit.id}`}
                  onClick={() => addKit(kit.id)}
                />
              ))}
            </div>
          ) : null}

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search gear…'
            style={styles.searchInput}
          />

          <Scrollbar style={styles.pickerScroll}>
            <div style={styles.pickerList}>
              {availableCatalog.length === 0 ? (
                <span style={styles.headerHint}>Nothing left to add.</span>
              ) : (
                availableCatalog.map((item) => {
                  return (
                    <div
                      key={item.id}
                      role='button'
                      tabIndex={0}
                      style={styles.pickerRow}
                      onClick={() => addItem(item.id)}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter' && e.key !== ' ') return;
                        e.preventDefault();
                        addItem(item.id);
                      }}
                    >
                      <FiPlus size={14} color={theme.colors.lightGreen} />
                      <GearThumb gear={item} size={32} />
                      <span style={styles.itemName}>{gearItemLabel(item)}</span>
                      <span style={styles.itemCategory}>{gearCategoryLabel(item.category)}</span>
                      {item.ownership === GearOwnership.Wishlist ? <Badge label='Wishlist' tone='yellow' /> : null}
                    </div>
                  );
                })
              )}
            </div>
          </Scrollbar>
        </div>
      ) : null}

      {gear.items.length === 0 ? (
        <EmptyState
          title='No gear on this session'
          description={
            phase === EntryGearPhase.Pack
              ? 'Add items or a whole kit to build a packing list.'
              : 'Nothing was recorded for this session.'
          }
        />
      ) : (
        <div style={styles.list}>
          {(phase === EntryGearPhase.Secure ? listedItems : gear.items).map((item) => (
            <GearRow
              key={item.gear.id}
              item={item}
              phase={phase}
              interactive={interactive}
              isShot={isShot}
              busy={busyId === item.gear.id}
              onPatch={patchItem}
              onRemove={removeItem}
            />
          ))}

          {phase === EntryGearPhase.Secure && otherItems.length ? (
            <>
              <span style={styles.subHeading}>Other gear</span>
              {otherItems.map((item) => (
                <GearRow
                  key={item.gear.id}
                  item={item}
                  phase={phase}
                  interactive={interactive}
                  isShot={isShot}
                  busy={busyId === item.gear.id}
                  onPatch={patchItem}
                  onRemove={removeItem}
                />
              ))}
            </>
          ) : null}
        </div>
      )}

      {shoppingList?.items.length ? (
        <div style={styles.shoppingBlock}>
          <div style={styles.headerRow}>
            <div style={styles.headerText}>
              <span style={styles.headerTitle}>
                <FiShoppingCart size={14} /> Still to buy for this trip
              </span>
              <span style={styles.headerHint}>
                {shoppingList.neededBy
                  ? `Needed by ${new Date(shoppingList.neededBy).toLocaleDateString()}`
                  : 'No date set'}
              </span>
            </div>
            <Badge label={formatAmount(shoppingList.total)} tone='yellow' />
          </div>

          <div style={styles.list}>
            {shoppingList.items.map((item) => (
              <div key={item.gear.id} style={styles.shoppingRow}>
                <span style={styles.itemName}>{gearItemLabel(item.gear)}</span>
                {item.estimatedPrice != null ? (
                  <span style={styles.itemCategory}>{formatAmount(item.estimatedPrice)}</span>
                ) : null}
                {item.purchaseUrl ? (
                  <a href={item.purchaseUrl} target='_blank' rel='noreferrer' style={styles.shopLink}>
                    Shop
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

type GearRowProps = {
  item: PhotoEntryGearItemResponse;
  phase: EntryGearPhase;
  /** Ticks and the bin: always while packing, behind Edit after the shoot. */
  interactive: boolean;
  isShot: boolean;
  busy: boolean;
  onPatch: (gearItemId: string, dto: { packed?: boolean; used?: boolean; secured?: boolean }) => void;
  onRemove: (gearItemId: string) => void;
};

const GearRow = ({ item, phase, interactive, isShot, busy, onPatch, onRemove }: GearRowProps) => {
  const styles = useStyles();
  const theme = useTheme();

  const isWishlist = item.gear.ownership === GearOwnership.Wishlist;
  // Mirrors the backend's own rules so a disabled box replaces a 400 round trip.
  const canMarkUsed = isShot && !isWishlist;
  const canSecure = canMarkUsed && holdsMedia(item.gear.mediaSource);

  return (
    <div style={{ ...styles.row, opacity: busy ? 0.6 : 1 }}>
      <GearThumb gear={item.gear} size={44} />

      <div style={styles.rowText}>
        <div style={styles.rowTitleLine}>
          <span style={styles.itemName}>{gearItemLabel(item.gear)}</span>
          {item.warning === EntryGearWarning.Retired ? <Badge label='No longer owned' tone='red' /> : null}
          {item.warning === EntryGearWarning.NotOwned ? <Badge label='Still on wishlist' tone='yellow' /> : null}
          {item.needsSecuring ? <Badge label='Not uploaded yet' tone='red' /> : null}
        </div>
        <span style={styles.itemCategory}>
          {gearCategoryLabel(item.gear.category)}
          {item.secureAction ? ` · ${item.secureAction}` : ''}
        </span>

        {/* Under the name rather than beside it: in a column this narrow the
            toggles otherwise squeeze the name into three lines. */}
        {interactive ? (
          <div style={styles.toggleRow}>
            {phase === EntryGearPhase.Pack ? (
              <Toggle label='Packed' checked={item.packed} onChange={(v) => onPatch(item.gear.id, { packed: v })} />
            ) : null}

            {/* Shown only where it can be set: before the shoot, or for something
                still on the wishlist, a dead control just adds noise. */}
            {canMarkUsed ? (
              <Toggle label='Used' checked={item.used} onChange={(v) => onPatch(item.gear.id, { used: v })} />
            ) : null}

            {/* Only gear that holds material has anything to secure. A lens gets
                no control at all rather than one that is permanently greyed out. */}
            {phase === EntryGearPhase.Secure && holdsMedia(item.gear.mediaSource) ? (
              <Toggle
                label='Uploaded'
                checked={item.secured}
                disabled={!canSecure}
                onChange={(v) => onPatch(item.gear.id, { secured: v })}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Read mode states what the ticks would say, so nothing is hidden by Edit;
          on the right, where the bin sits in edit mode, the name keeps its line. */}
      {!interactive && phase === EntryGearPhase.Secure && (item.used || item.secured) ? (
        <div style={styles.stateBadges}>
          {item.used ? <Badge label='Used' tone='blue' /> : null}
          {item.secured && holdsMedia(item.gear.mediaSource) ? <Badge label='Uploaded' tone='green' /> : null}
        </div>
      ) : null}

      {interactive ? (
        <div
          role='button'
          tabIndex={0}
          style={styles.removeBtn}
          title='Remove from this session'
          onClick={() => onRemove(item.gear.id)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            onRemove(item.gear.id);
          }}
        >
          <FiTrash2 size={14} color={theme.colors.red} />
        </div>
      ) : null}
    </div>
  );
};

const Toggle = ({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) => {
  const styles = useStyles();

  return (
    <button
      type='button'
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        ...styles.toggle,
        ...(checked ? styles.toggleOn : {}),
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      title={disabled ? 'Not available for this item' : undefined}
    >
      <div style={{ ...styles.checkbox, ...(checked ? styles.checkboxOn : {}) }}>
        {checked ? <FiCheck size={11} /> : null}
      </div>
      {label}
    </button>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    minWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  stateBadges: { flexShrink: 0, alignItems: 'flex-end', gap: t.spacing.xs },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexWrap: 'wrap', justifyContent: 'flex-end' },
  headerText: {
    gap: 2,
    minWidth: 0,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    fontWeight: 700,
    fontSize: 15,
  },
  headerHint: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  subHeading: {
    fontSize: 12,
    fontWeight: 700,
    color: t.colors.blue04,
    marginTop: t.spacing.s,
  },
  confirmedNote: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  promptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    fontSize: 13,
    color: t.colors.yellow,
    backgroundColor: t.colors.yellow + t.colorOpacity(0.12),
    border: `1px solid ${t.colors.yellow + t.colorOpacity(0.28)}`,
  },
  promptText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  promptTitle: {
    fontWeight: 700,
  },
  list: {
    gap: t.spacing.s,
    minWidth: 0,
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
  rowText: {
    flex: 1,
    minWidth: 120,
    gap: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.xs,
    marginTop: t.spacing.xs,
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    flexWrap: 'wrap',
  },
  itemName: {
    fontWeight: 600,
    fontSize: 14,
  },
  itemCategory: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  toggle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    padding: `${t.spacing.xs}px ${t.spacing.s}px`,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    color: t.colors.dark05,
    backgroundColor: 'transparent',
    // Longhands, not the `border` shorthand: the on-state swaps only the colour,
    // and removing that key afterwards would otherwise clear the colour of the
    // shorthand and leave the border in the text colour.
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: t.colors.dark04 + t.colorOpacity(0.5),
  },
  toggleOn: {
    color: t.colors.white,
    borderColor: t.colors.blue,
    backgroundColor: t.colors.blue + t.colorOpacity(0.16),
  },
  checkbox: {
    width: 16,
    height: 16,
    minWidth: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: t.colors.dark04,
    color: t.colors.white,
  },
  checkboxOn: {
    backgroundColor: t.colors.blue,
    borderColor: t.colors.blue,
  },
  removeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: t.spacing.xs,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    backgroundColor: t.colors.red + t.colorOpacity(0.1),
  },
  addPanel: {
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  kitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.xs,
  },
  searchInput: {
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.blue02 + t.colorOpacity(0.5)}`,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
    color: t.colors.white,
    outline: 'none',
    fontSize: 13,
  },
  pickerScroll: {
    height: 'min(260px, 40vh)',
  },
  pickerList: {
    gap: t.spacing.xs,
    paddingRight: t.spacing.s,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.xs,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
    cursor: 'pointer',
  },
  pickerRowPicked: {
    backgroundColor: t.colors.blue + t.colorOpacity(0.18),
  },
  shoppingBlock: {
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.yellow + t.colorOpacity(0.07),
    border: `1px solid ${t.colors.yellow + t.colorOpacity(0.2)}`,
  },
  shoppingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.xs,
  },
  shopLink: {
    marginLeft: 'auto',
    fontSize: 12,
    color: t.colors.blue,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.m,
  },
}));
