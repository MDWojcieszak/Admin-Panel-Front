import { useState } from 'react';
import { FiExternalLink, FiMessageSquare, FiPaperclip, FiPlus } from 'react-icons/fi';
import { BomItemResponse, BomResponse, BomStatus, ProjectDetailResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { PlainSelect, StatusDot, useProjectStyles } from '~/routes/Projects/components/shared';
import { useProjectEvents } from '~/routes/Projects/hooks/useProjectEvents';
import { BomItemPanel } from '~/routes/Projects/modals/BomItemPanel';
import { BOM_STATUS_COLOR, BOM_STATUS_LABEL, canCheck, canEdit, formatMoney, SAFE_URL } from '~/routes/Projects/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

const STATUS_OPTIONS = Object.values(BomStatus).map((value) => ({ value, label: BOM_STATUS_LABEL[value] }));
const CURRENCY_KEY = 'bom-currency';

const lastCurrency = () => {
  try {
    return localStorage.getItem(CURRENCY_KEY) || 'PLN';
  } catch {
    return 'PLN';
  }
};

/** A build's parts: what is needed, ordered, at hand or used, and what it costs. */
export const BomList = ({ project }: { project: ProjectDetailResponse }) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const toast = useToast();
  const { buildsApi } = useApi();
  const editable = canEdit(project.role);
  const checkable = canCheck(project.role, project.viewersCanCheck);

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
    } catch {
      // Remembering the currency is a convenience only.
    }
    setName('');
    setQuantity('1');
    setUnit('');
    setPrice('');
  };

  if (query.loading && !query.data) return <Loader />;
  const { items, summary } = query.data ?? { items: [], summary: undefined };

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
          <span style={shared.row}>
            {summary.costs.map((cost) => (
              <span key={cost.currency ?? '-'} style={styles.cost}>
                {formatMoney(cost.total, cost.currency)}
                {cost.toBuy ? (
                  <span style={shared.muted}> · {formatMoney(cost.toBuy, cost.currency)} to buy</span>
                ) : null}
              </span>
            ))}
          </span>
        </div>
      ) : null}

      {editable ? (
        <div style={styles.addRow}>
          <input
            style={{ ...shared.textInput, flex: '3 1 200px' }}
            value={name}
            placeholder='Part, e.g. M5×12 bolts'
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <input
            style={{ ...shared.textInput, flex: '0 1 70px' }}
            inputMode='decimal'
            value={quantity}
            title='Quantity'
            onChange={(e) => setQuantity(e.target.value)}
          />
          <input
            style={{ ...shared.textInput, flex: '0 1 70px' }}
            value={unit}
            placeholder='unit'
            onChange={(e) => setUnit(e.target.value)}
          />
          <input
            style={{ ...shared.textInput, flex: '0 1 100px' }}
            inputMode='decimal'
            value={price}
            placeholder='price / unit'
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <input
            style={{ ...shared.textInput, ...shared.mono, flex: '0 1 64px' }}
            value={currency}
            maxLength={3}
            title='Currency'
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
          />
          <Button label='Add' icon={<FiPlus size={14} />} disabled={!name.trim()} onClick={add} />
        </div>
      ) : null}

      {items.length === 0 ? (
        <div style={shared.emptyRow}>No parts yet. List what the build needs, with prices to see the cost.</div>
      ) : (
        <div style={shared.list}>
          {items.map((item) => (
            <BomRow
              key={item.id}
              item={item}
              checkable={checkable}
              onOpen={() => panel.show({ itemId: item.id, project })}
              onStatus={(status) =>
                buildsApi &&
                run(
                  () => buildsApi.buildControllerSetBomStatus({ itemId: item.id, setBomStatusDto: { status } }),
                  'Could not change the part.',
                )
              }
            />
          ))}
        </div>
      )}
      <span style={{ ...shared.muted, color: theme.colors.dark04 }}>
        Ordered parts no longer count as &ldquo;to buy&rdquo;. Prices are per unit.
      </span>
    </div>
  );
};

const BomRow = ({
  item,
  checkable,
  onOpen,
  onStatus,
}: {
  item: BomItemResponse;
  checkable: boolean;
  onOpen: () => void;
  onStatus: (status: BomStatus) => void;
}) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const gone = item.status === BomStatus.Used;
  return (
    <div style={{ ...shared.listRow, ...styles.row }} onClick={onOpen}>
      <span onClick={(e) => e.stopPropagation()} style={styles.statusCell}>
        <PlainSelect
          value={item.status}
          disabled={!checkable}
          options={STATUS_OPTIONS}
          style={{ ...styles.status, color: BOM_STATUS_COLOR[item.status] }}
          onChange={(value) => onStatus(value as BomStatus)}
        />
      </span>
      <span style={{ ...styles.name, color: gone ? theme.colors.dark05 : theme.colors.white }}>
        {item.name}
        {item.gearItem ? (
          <span style={{ ...shared.muted, fontSize: 12 }}>
            {' '}
            · {item.gearItem.brand} {item.gearItem.model}
          </span>
        ) : null}
      </span>
      <span style={styles.qty}>
        {item.quantity}
        {item.unit ? ` ${item.unit}` : ''}
      </span>
      <span style={styles.money}>{item.cost !== null ? formatMoney(item.cost, item.currency) : ''}</span>
      <span style={{ ...shared.row, gap: theme.spacing.s, flexWrap: 'nowrap', ...shared.muted, fontSize: 12 }}>
        {item.url && SAFE_URL.test(item.url) ? (
          <a
            href={item.url}
            target='_blank'
            rel='noreferrer noopener'
            title={item.supplier ?? item.url}
            onClick={(e) => e.stopPropagation()}
            style={{ color: theme.colors.blue04, display: 'inline-flex' }}
          >
            <FiExternalLink size={13} />
          </a>
        ) : null}
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
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.m },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: t.spacing.m,
    padding: `${t.spacing.sm}px ${t.spacing.m}px`,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  cost: { fontSize: 15, fontWeight: 700, color: t.colors.white },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexWrap: 'wrap' },
  row: { cursor: 'pointer', flexWrap: 'wrap' },
  statusCell: { flexShrink: 0 },
  status: { width: 110, height: 30, fontSize: 13, fontWeight: 600 },
  name: { flex: '1 1 180px', minWidth: 0, fontSize: 14, wordBreak: 'break-word' },
  qty: { width: 80, fontSize: 13, color: t.colors.dark05, textAlign: 'right' },
  money: { width: 100, fontSize: 14, fontWeight: 600, color: t.colors.white, textAlign: 'right' },
}));
