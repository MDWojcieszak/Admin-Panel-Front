import { useMemo, useState } from 'react';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import {
  FiDownload,
  FiExternalLink,
  FiMessageSquare,
  FiPaperclip,
  FiPlus,
  FiShoppingCart,
  FiUpload,
} from 'react-icons/fi';
import { MdOutlineInventory2 } from 'react-icons/md';
import { BomItemResponse, BomPartKind, BomResponse, BomStatus, ProjectDetailResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { PillSelect } from '~/components/PillSelect';
import { Loader } from '~/components/Loader';
import { Table } from '~/components/Table';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { apiUrl } from '~/routes/Documents/utils';
import { downloadBomCsv } from '~/routes/Projects/bomExport';
import { BOM_GROUPS, BOM_KIND_ICON, BOM_KINDS, BomGroup, bomKindRank } from '~/routes/Projects/bomKinds';
import { BOM_GROUP_ICON, KindPicker } from '~/routes/Projects/components/KindPicker';
import { StatusDot, useProjectStyles } from '~/routes/Projects/components/shared';
import { useProjectEvents } from '~/routes/Projects/hooks/useProjectEvents';
import { BomImportModal } from '~/routes/Projects/modals/BomImportModal';
import { BomItemPanel } from '~/routes/Projects/modals/BomItemPanel';
import { ShoppingListModal } from '~/routes/Projects/modals/ShoppingListModal';
import { BOM_STATUS_COLOR, BOM_STATUS_LABEL, canCheck, canEdit, formatMoney, SAFE_URL } from '~/routes/Projects/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { useIsMobile } from '~/hooks/useBreakpoint';

// Each status in a row is a pill in its own colour.
const STATUS_PILLS = Object.values(BomStatus).map((value) => ({
  value,
  label: BOM_STATUS_LABEL[value],
  color: BOM_STATUS_COLOR[value],
}));
const CURRENCY_KEY = 'bom-currency';
const KIND_KEY = 'bom-kind';

/** The kind picked last: parts tend to come in runs (all the screws, then the wiring). */
const lastKind = (): BomPartKind => {
  try {
    const saved = localStorage.getItem(KIND_KEY) as BomPartKind | null;
    return saved && saved in BOM_KINDS ? saved : BomPartKind.Other;
  } catch {
    return BomPartKind.Other;
  }
};

const lastCurrency = () => {
  try {
    return localStorage.getItem(CURRENCY_KEY) || 'PLN';
  } catch {
    return 'PLN';
  }
};

/**
 * Parts in their kind's group, groups in catalogue order; within a group,
 * kind by kind, each in the list's own order. The table draws a heading
 * wherever the group changes.
 */
const sortParts = (items: BomItemResponse[]) =>
  [...items].sort(
    (a, b) =>
      BOM_GROUPS.indexOf(BOM_KINDS[a.kind].group) - BOM_GROUPS.indexOf(BOM_KINDS[b.kind].group) ||
      bomKindRank(a.kind) - bomKindRank(b.kind) ||
      a.order - b.order,
  );

/** A build's parts as a table: what each is, how many, its status, price, source and notes. */
export const BomList = ({ project }: { project: ProjectDetailResponse }) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const isMobile = useIsMobile();
  const toast = useToast();
  const { buildsApi } = useApi();
  const editable = canEdit(project.role);
  const checkable = canCheck(project.role, project.viewersCanCheck);

  const [kind, setKind] = useState<BomPartKind>(lastKind);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState(lastCurrency);

  const query = useAsync<BomResponse>(async () => {
    if (!buildsApi) return undefined;
    const { data } = await buildsApi.buildControllerListBom({ id: project.id });
    return data;
  }, [buildsApi, project.id]);

  useProjectEvents((event) => event.kind === 'bom' && query.reload(), project.id);

  const panel = useModal('bom-item', BomItemPanel, { title: 'Part', type: 'side' });
  const importModal = useModal('bom-import', BomImportModal, { title: 'Import parts' });
  const shoppingModal = useModal('bom-shopping-list', ShoppingListModal, { title: 'To shopping list' });

  const run = async (action: () => Promise<{ data: BomResponse } | undefined>, failure: string) => {
    try {
      const result = await action();
      if (result) query.setData(result.data);
      return true;
    } catch (e) {
      toast(getApiErrorMessage(e, failure), 'error');
      query.reload();
      return false;
    }
  };

  const setStatus = (itemId: string, status: BomStatus) =>
    buildsApi &&
    run(
      () => buildsApi.buildControllerSetBomStatus({ itemId, setBomStatusDto: { status } }),
      'Could not change the part.',
    );

  const add = async () => {
    if (!buildsApi || !name.trim()) return;
    const number = (v: string) => (v.trim() ? Number(v.replace(',', '.')) : undefined);
    const code = currency.trim().toUpperCase();
    const ok = await run(
      () =>
        buildsApi.buildControllerAddBomItem({
          id: project.id,
          createBomItemDto: {
            name: name.trim(),
            kind,
            quantity: number(quantity) ?? 1,
            unit: unit.trim() || null,
            unitPrice: number(price) ?? null,
            currency: price.trim() && /^[A-Z]{3}$/.test(code) ? code : null,
          },
        }),
      'Could not add the part.',
    );
    if (!ok) return;
    try {
      localStorage.setItem(CURRENCY_KEY, code);
      localStorage.setItem(KIND_KEY, kind);
    } catch {
      // Remembering the kind and currency is a convenience only.
    }
    setName('');
    setQuantity('1');
    setUnit('');
    setPrice('');
  };

  const rows = useMemo(() => sortParts(query.data?.items ?? []), [query.data]);

  const columns = useMemo<ColumnDef<BomItemResponse>[]>(
    () => [
      {
        id: 'part',
        header: 'Part',
        size: 280,
        meta: { mobile: 'title' },
        cell: ({ row }) => <PartCell item={row.original} />,
      },
      {
        id: 'quantity',
        header: 'Qty',
        size: 80,
        cell: ({ row }) => (
          <span style={styles.number}>
            {row.original.quantity}
            {row.original.unit ? <span style={shared.muted}> {row.original.unit}</span> : null}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        size: 140,
        cell: ({ row }) => (
          <PillSelect
            label='Status'
            value={row.original.status}
            disabled={!checkable}
            options={STATUS_PILLS}
            onChange={(value) => setStatus(row.original.id, value as BomStatus)}
          />
        ),
      },
      {
        id: 'unitPrice',
        header: 'Price / unit',
        size: 100,
        cell: ({ row }) =>
          row.original.unitPrice !== null ? (
            <span style={styles.number}>{formatMoney(row.original.unitPrice, row.original.currency)}</span>
          ) : (
            <span style={shared.muted}>—</span>
          ),
      },
      {
        id: 'cost',
        header: 'Cost',
        size: 110,
        cell: ({ row }) =>
          row.original.cost !== null ? (
            <span style={{ ...styles.number, ...styles.cost }}>
              {formatMoney(row.original.cost, row.original.currency)}
            </span>
          ) : (
            <span style={shared.muted}>—</span>
          ),
      },
      {
        id: 'source',
        header: 'Source',
        size: 150,
        cell: ({ row }) => <SourceCell item={row.original} />,
      },
      {
        id: 'note',
        header: 'Note',
        size: 160,
        cell: ({ row }) =>
          row.original.note ? (
            <span style={{ ...shared.muted, ...styles.clamp }} title={row.original.note}>
              {row.original.note}
            </span>
          ) : null,
      },
      {
        id: 'extras',
        header: '',
        size: 70,
        meta: { mobile: 'actions' },
        cell: ({ row }) => <Counts item={row.original} />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkable, styles, shared],
  );

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  if (query.loading && !query.data) return <Loader />;
  const summary = query.data?.summary;
  // Needed and not waiting on any list yet: what a shopping list would get.
  const toShop = (query.data?.items ?? []).filter((i) => i.status === BomStatus.Needed && !i.onShoppingList).length;

  return (
    <div style={styles.container}>
      {summary && summary.total ? (
        <div style={styles.summary}>
          <span style={shared.row}>
            {(['NEEDED', 'ORDERED', 'HAVE', 'USED'] as BomStatus[]).map((status) => (
              <span key={status} style={{ ...shared.row, gap: 6, ...shared.muted }}>
                <StatusDot color={BOM_STATUS_COLOR[status]} />
                {summary[status.toLowerCase() as 'needed' | 'ordered' | 'have' | 'used']}{' '}
                {BOM_STATUS_LABEL[status].toLowerCase()}
              </span>
            ))}
          </span>
          <span style={{ ...shared.row, marginLeft: isMobile ? 0 : 'auto' }}>
            {summary.costs.map((cost) => (
              <span key={cost.currency ?? '-'} style={styles.total}>
                {formatMoney(cost.total, cost.currency)}
                {cost.toBuy ? (
                  <span style={shared.muted}> · {formatMoney(cost.toBuy, cost.currency)} to buy</span>
                ) : null}
              </span>
            ))}
          </span>
          <span style={isMobile ? styles.actionsMobile : styles.actions}>
            {editable ? (
              <Button
                label='Import'
                variant='secondary'
                icon={<FiUpload size={14} />}
                onClick={() =>
                  importModal.show({
                    projectId: project.id,
                    defaultCurrency: currency.trim().toUpperCase() || null,
                    onDone: () => query.reload(),
                  })
                }
              />
            ) : null}
            {editable && toShop > 0 ? (
              <Button
                label={isMobile ? 'Shopping list' : 'To shopping list'}
                variant='secondary'
                icon={<FiShoppingCart size={14} />}
                onClick={() =>
                  shoppingModal.show({
                    projectId: project.id,
                    projectTitle: project.title,
                    count: toShop,
                    onDone: () => query.reload(),
                  })
                }
              />
            ) : null}
            <Button
              label='Export CSV'
              variant='secondary'
              icon={<FiDownload size={14} />}
              onClick={() => query.data && downloadBomCsv(query.data, project.title)}
            />
          </span>
        </div>
      ) : null}

      {editable ? (
        <div style={styles.addRow}>
          <div style={styles.addKind}>
            <KindPicker value={kind} onChange={setKind} />
          </div>
          <input
            style={{ ...shared.textInput, ...styles.addName }}
            value={name}
            placeholder='Part, e.g. M5×12 bolts'
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <div style={styles.addNumbers}>
            <input
              style={{ ...shared.textInput, ...styles.addSmall }}
              inputMode='decimal'
              value={quantity}
              title='Quantity'
              aria-label='Quantity'
              onChange={(e) => setQuantity(e.target.value)}
            />
            <input
              style={{ ...shared.textInput, ...styles.addSmall }}
              value={unit}
              placeholder='unit'
              onChange={(e) => setUnit(e.target.value)}
            />
            <input
              style={{ ...shared.textInput, ...styles.addPrice }}
              inputMode='decimal'
              value={price}
              placeholder='price / unit'
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
            <input
              style={{ ...shared.textInput, ...shared.mono, ...styles.addSmall }}
              value={currency}
              maxLength={3}
              title='Currency'
              aria-label='Currency'
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            />
          </div>
          <Button label='Add' icon={<FiPlus size={14} />} disabled={!name.trim()} onClick={add} />
        </div>
      ) : null}

      <Table
        table={table}
        hidePagination
        // On a phone the page scrolls as a whole; a table scrolling inside the
        // space left under the header and the add row was a sliver.
        fillHeight={!isMobile}
        onRowClick={(item) => panel.show({ itemId: item.id, project })}
        getGroup={(item) => {
          const group = BOM_KINDS[item.kind].group;
          return { key: group, label: <GroupLabel group={group} /> };
        }}
        emptyState={{
          icon: <MdOutlineInventory2 size={26} color={theme.colors.blue04} />,
          title: 'No parts yet',
          description:
            'List what the build needs, with prices to see the cost. Ordered parts no longer count as to buy.',
        }}
      />
    </div>
  );
};

/** The photo or the kind's icon, the name, and what kind of part it is. */
const PartCell = ({ item }: { item: BomItemResponse }) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const info = BOM_KINDS[item.kind];
  const Icon = BOM_KIND_ICON[item.kind];
  const used = item.status === BomStatus.Used;
  return (
    <span style={styles.part}>
      <span style={styles.thumb} title={`${info.group} · ${info.label}`}>
        {item.photo ? (
          <img src={apiUrl(item.photo.thumbUrl)} alt='' loading='lazy' style={styles.thumbImage} />
        ) : (
          <Icon size={20} color={theme.colors.blue04} />
        )}
      </span>
      <span style={styles.partText}>
        <span style={{ ...styles.partName, color: used ? theme.colors.dark05 : theme.colors.white }}>{item.name}</span>
        <span style={{ ...shared.muted, ...styles.partKind }}>
          {info.label}
          {item.gearItem ? ` · ${item.gearItem.brand} ${item.gearItem.model}` : ''}
        </span>
      </span>
    </span>
  );
};

/** Where it comes from: the supplier, linked when there is a plain web address. */
const SourceCell = ({ item }: { item: BomItemResponse }) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const link = item.url && SAFE_URL.test(item.url) ? item.url : null;
  if (!item.supplier && !link) return <span style={shared.muted}>—</span>;
  const label = item.supplier || hostOf(link!);
  return link ? (
    <a
      href={link}
      target='_blank'
      rel='noreferrer noopener'
      title={link}
      onClick={(e) => e.stopPropagation()}
      style={styles.source}
    >
      <span style={styles.clamp}>{label}</span>
      <FiExternalLink size={13} style={{ flexShrink: 0 }} />
    </a>
  ) : (
    <span style={styles.clamp}>{label}</span>
  );
};

/** "shop.example" from a link; the link itself when it does not parse. */
const hostOf = (link: string) => {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return link;
  }
};

const Counts = ({ item }: { item: BomItemResponse }) => {
  const shared = useProjectStyles();
  const theme = useTheme();
  if (!item.documentCount && !item.commentCount) return null;
  return (
    <span style={{ ...shared.row, gap: theme.spacing.s, flexWrap: 'nowrap', ...shared.muted, fontSize: 12 }}>
      {item.documentCount ? (
        <span style={{ ...shared.row, gap: 3 }}>
          <FiPaperclip size={12} />
          {item.documentCount}
        </span>
      ) : null}
      {item.commentCount ? (
        <span style={{ ...shared.row, gap: 3 }}>
          <FiMessageSquare size={12} />
          {item.commentCount}
        </span>
      ) : null}
    </span>
  );
};

const GroupLabel = ({ group }: { group: BomGroup }) => {
  const styles = useStyles();
  const theme = useTheme();
  const Icon = BOM_GROUP_ICON[group];
  return (
    <span style={styles.groupLabel}>
      <Icon size={16} color={theme.colors.blue04} />
      {group}
    </span>
  );
};

const useStyles = mkUseStyles((t) => ({
  // Fills the view: summary and the add row stay, the table scrolls itself.
  container: { flex: 1, minHeight: 0, gap: t.spacing.m },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: t.spacing.m,
    flexShrink: 0,
    padding: `${t.spacing.sm}px ${t.spacing.m}px`,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  total: { fontSize: 15, fontWeight: 700, color: t.colors.white },
  actions: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexWrap: 'wrap' },
  // Phone: the actions share a row of their own, each taking an equal part of it.
  actionsMobile: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))',
    gap: t.spacing.s,
    width: '100%',
  },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexWrap: 'wrap', flexShrink: 0 },
  addKind: { flex: '2 1 200px', minWidth: 0 },
  addName: { flex: '3 1 220px', width: 'auto', minWidth: 0 },
  // Quantity, unit, price and currency stay together, on one line even on a phone.
  addNumbers: { flex: '2 1 280px', flexDirection: 'row', gap: t.spacing.s, minWidth: 0 },
  addSmall: { flex: '1 1 56px', width: 'auto', minWidth: 0 },
  addPrice: { flex: '2 1 96px', width: 'auto', minWidth: 0 },
  part: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, minWidth: 0 },
  thumb: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  thumbImage: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  partText: { display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 },
  partName: { fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  partKind: { fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  number: { fontSize: 14, color: t.colors.white, whiteSpace: 'nowrap' },
  cost: { fontWeight: 700 },
  source: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
    color: t.colors.blue04,
    textDecoration: 'none',
    fontSize: 13,
  },
  clamp: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 },
  groupLabel: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
}));
