import { differenceInCalendarDays } from 'date-fns';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { IconType } from 'react-icons';
import {
  FiAlertTriangle,
  FiCheck,
  FiCheckCircle,
  FiCheckSquare,
  FiChevronRight,
  FiExternalLink,
  FiHelpCircle,
  FiShoppingCart,
} from 'react-icons/fi';
import { MdSdCard } from 'react-icons/md';
import { AttentionResponse, PhotoEntryDetailsResponse, PhotoEntryStatus } from '~/api/api';
import { Button } from '~/components/Button';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { STAGE_LABELS } from '~/routes/PhotoManagement/components/EntryCommentsPanel';
import { PhotoEntryDetailsModal } from '~/routes/PhotoManagement/modals/PhotoEntryDetailsModal';
import { getApiErrorMessage } from '~/utils/apiError';
import { formatAmount } from '~/utils/formatAmount';
import { gearItemLabel } from '~/utils/gearCategory';
import { mkUseStyles, useTheme } from '~/utils/theme';

type CategoryKey = 'unsecuredOverdue' | 'pastPlanned' | 'openTodos' | 'wishlistDueSoon' | 'undeclared';

type Category = {
  key: CategoryKey;
  label: string;
  icon: IconType;
  tone: 'red' | 'amber' | 'blue' | 'yellow' | 'slate';
};

/** Most urgent first; the first one with anything in it is open by default. */
const CATEGORIES: Category[] = [
  { key: 'unsecuredOverdue', label: 'Upload overdue', icon: MdSdCard, tone: 'red' },
  { key: 'pastPlanned', label: 'Did it happen?', icon: FiHelpCircle, tone: 'amber' },
  { key: 'openTodos', label: 'Open to-dos', icon: FiCheckSquare, tone: 'blue' },
  { key: 'wishlistDueSoon', label: 'To buy soon', icon: FiShoppingCart, tone: 'yellow' },
  { key: 'undeclared', label: 'Gear never declared', icon: FiHelpCircle, tone: 'slate' },
];

const TONE_COLOR = {
  red: '#F08A80',
  amber: '#E7BE63',
  blue: '#7FCBFF',
  yellow: '#F9F871',
  slate: '#A9BCC9',
};

/** Long lists fold; the rest is a click away. */
const VISIBLE_ROWS = 6;

const relativeDay = (value?: string | null) => {
  if (!value) return 'no date';
  const days = differenceInCalendarDays(new Date(value), new Date());
  if (days < 0) return `${-days} day${days === -1 ? '' : 's'} late`;
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
};

/**
 * Everything in the photo library waiting on you, from one request. The five
 * kinds are tiles with their counts, most urgent first; the open one lists its
 * items below with the action each needs — answer a past plan, tick off a
 * to-do, follow a shop link — and every item opens its session.
 */
export const AttentionCard = () => {
  const styles = useStyles();
  const theme = useTheme();
  const toast = useToast();
  const { photoEntryApi } = useApi();
  const can = useCan();
  const canRead = can('photoEntry.read');
  const [busy, setBusy] = useState<string>();
  const [selected, setSelected] = useState<CategoryKey>();
  const [expanded, setExpanded] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string>();

  const query = useAsync<AttentionResponse>(async () => {
    if (!photoEntryApi || !canRead) return undefined;
    const { data } = await photoEntryApi.photoEntryPlanningControllerGet();
    return data;
  }, [photoEntryApi, canRead]);

  const detailsModal = useModal(
    'dashboard-entry-details',
    PhotoEntryDetailsModal,
    { title: 'Session', type: 'side' },
    {
      handleClose: async () => {
        await query.reload();
        detailsModal.hide();
      },
    },
  );

  const data = query.data;
  const counts = data?.counts;

  // Keep the open tile pointing at something: the first non-empty one, and
  // move on when the open one empties out after an action.
  const firstWithItems = useMemo(() => CATEGORIES.find((c) => counts?.[c.key])?.key, [counts]);
  useEffect(() => {
    if (!counts) return;
    if (!selected || !counts[selected]) setSelected(firstWithItems);
  }, [counts, selected, firstWithItems]);

  const openEntry = async (entryId: string) => {
    if (!photoEntryApi) return;
    const { data: entry } = await photoEntryApi.photoEntryControllerGetById({ id: entryId });
    detailsModal.show({
      entry: entry as PhotoEntryDetailsResponse,
      onSaved: async () => {
        await query.reload();
      },
    });
  };

  const run = async (key: string, action: () => Promise<unknown>, fallback: string) => {
    setBusy(key);
    try {
      await action();
      await query.reload();
    } catch (e) {
      toast(getApiErrorMessage(e, fallback), 'error');
    } finally {
      setBusy(undefined);
    }
  };

  const answerPlan = (entryId: string, status: PhotoEntryStatus) =>
    photoEntryApi &&
    run(
      `${entryId}:${status}`,
      () => photoEntryApi.photoEntryControllerPatchStatus({ id: entryId, patchPhotoEntryStatusDto: { status } }),
      'Could not update the session.',
    );

  const tickOff = (commentId: string) =>
    photoEntryApi &&
    run(commentId, () => photoEntryApi.photoEntryCommentControllerResolve({ commentId }), 'Could not tick this off.');

  if (!canRead || !data || !counts) return null;
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  if (!total) return null;

  const rowProps = (key: string, onOpen?: () => void) => ({
    style: { ...styles.row, ...(hoveredRow === key ? styles.rowHover : {}), cursor: onOpen ? 'pointer' : 'default' },
    onMouseEnter: () => setHoveredRow(key),
    onMouseLeave: () => setHoveredRow((prev) => (prev === key ? undefined : prev)),
    onClick: onOpen,
  });

  const fold = <T,>(items: T[]) => (expanded ? items : items.slice(0, VISIBLE_ROWS));
  const hiddenCount = (items: unknown[]) => (expanded ? 0 : Math.max(0, items.length - VISIBLE_ROWS));

  const renderList = (): { rows: ReactNode; more: number; footer?: ReactNode } => {
    switch (selected) {
      case 'unsecuredOverdue':
        return {
          more: hiddenCount(data.unsecuredOverdue),
          rows: fold(data.unsecuredOverdue).map((entry) => (
            <div key={entry.photoEntryId} {...rowProps(entry.photoEntryId, () => openEntry(entry.photoEntryId))}>
              <div style={styles.rowMain}>
                <span style={styles.rowTitle}>{entry.name}</span>
                {entry.items.map((item) => (
                  <span key={item.gear.id} style={styles.rowMeta}>
                    {gearItemLabel(item.gear)} · {item.secureAction} ·{' '}
                    <span style={{ color: item.overdue ? TONE_COLOR.red : undefined }}>
                      {item.daysPending} of {item.reminderDays} days
                    </span>
                  </span>
                ))}
              </div>
              <FiChevronRight size={16} color={theme.colors.dark05} />
            </div>
          )),
        };
      case 'pastPlanned':
        return {
          more: hiddenCount(data.pastPlanned),
          rows: fold(data.pastPlanned).map((entry) => (
            <div key={entry.photoEntryId} {...rowProps(entry.photoEntryId)}>
              <div style={styles.rowMain}>
                <button type='button' style={styles.rowTitleButton} onClick={() => openEntry(entry.photoEntryId)}>
                  {entry.name}
                </button>
                <span style={styles.rowMeta}>
                  Planned until {entry.endDate ? new Date(entry.endDate).toLocaleDateString() : '—'} · {entry.daysOver}{' '}
                  day{entry.daysOver === 1 ? '' : 's'} ago
                </span>
              </div>
              <div style={styles.rowActions}>
                <Button
                  label='Cancelled'
                  variant='secondary'
                  loading={busy === `${entry.photoEntryId}:${PhotoEntryStatus.Cancelled}`}
                  onClick={() => answerPlan(entry.photoEntryId, PhotoEntryStatus.Cancelled)}
                />
                <Button
                  label='It happened'
                  icon={<FiCheck size={14} />}
                  loading={busy === `${entry.photoEntryId}:${PhotoEntryStatus.Shot}`}
                  onClick={() => answerPlan(entry.photoEntryId, PhotoEntryStatus.Shot)}
                />
              </div>
            </div>
          )),
        };
      case 'openTodos':
        return {
          more: hiddenCount(data.openTodos),
          rows: fold(data.openTodos).map((todo) => (
            <div key={todo.commentId} {...rowProps(todo.commentId, () => openEntry(todo.photoEntryId))}>
              <button
                type='button'
                aria-label='Tick off'
                title='Tick off'
                style={{ ...styles.tick, opacity: busy === todo.commentId ? 0.5 : 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  tickOff(todo.commentId);
                }}
              >
                {busy === todo.commentId ? <FiCheck size={12} /> : null}
              </button>
              <div style={styles.rowMain}>
                <span style={styles.rowTitle}>{todo.body}</span>
                <span style={styles.rowMeta}>
                  {todo.entryName} · {STAGE_LABELS[todo.stage] ?? todo.stage}
                </span>
              </div>
              <FiChevronRight size={16} color={theme.colors.dark05} />
            </div>
          )),
        };
      case 'wishlistDueSoon': {
        const sum = data.wishlistDueSoon.reduce((acc, item) => acc + (item.estimatedPrice ?? 0), 0);
        return {
          more: hiddenCount(data.wishlistDueSoon),
          footer: sum ? <span style={styles.footerNote}>About {formatAmount(sum)} in total</span> : undefined,
          rows: fold(data.wishlistDueSoon).map((item) => (
            <div key={item.id} {...rowProps(item.id)}>
              <div style={styles.rowMain}>
                <span style={styles.rowTitle}>{gearItemLabel(item)}</span>
                <span style={styles.rowMeta}>
                  Buy {relativeDay(item.neededBy)}
                  {item.neededFor ? ` · for ${item.neededFor.name}` : ''}
                </span>
              </div>
              {item.estimatedPrice != null ? (
                <span style={styles.price}>{formatAmount(item.estimatedPrice)}</span>
              ) : null}
              {item.purchaseUrl ? (
                <a href={item.purchaseUrl} target='_blank' rel='noreferrer' style={styles.shop}>
                  Shop <FiExternalLink size={12} />
                </a>
              ) : null}
            </div>
          )),
        };
      }
      case 'undeclared':
        return {
          more: hiddenCount(data.undeclared),
          footer: (
            <span style={styles.footerNote}>Old shoots land here after the migration — fill them in when you can.</span>
          ),
          rows: fold(data.undeclared).map((entry) => (
            <div key={entry.photoEntryId} {...rowProps(entry.photoEntryId, () => openEntry(entry.photoEntryId))}>
              <div style={styles.rowMain}>
                <span style={styles.rowTitle}>{entry.name}</span>
                <span style={styles.rowMeta}>
                  {entry.startDate ? new Date(entry.startDate).toLocaleDateString() : 'No date'} · no gear list
                </span>
              </div>
              <FiChevronRight size={16} color={theme.colors.dark05} />
            </div>
          )),
        };
      default:
        return { rows: null, more: 0 };
    }
  };

  const list = renderList();

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>
          <FiAlertTriangle size={16} /> Needs attention
        </span>
        <span style={styles.muted}>
          {total} thing{total === 1 ? '' : 's'} waiting on you
        </span>
      </div>

      <div style={styles.tiles}>
        {CATEGORIES.map((category) => {
          const count = counts[category.key];
          const active = selected === category.key;
          const Icon = count ? category.icon : FiCheckCircle;
          const color = TONE_COLOR[category.tone];
          return (
            <button
              key={category.key}
              type='button'
              disabled={!count}
              onClick={() => {
                setSelected(category.key);
                setExpanded(false);
              }}
              style={{
                ...styles.tile,
                ...(active ? { borderColor: color, backgroundColor: `${color}14` } : {}),
                opacity: count ? 1 : 0.45,
                cursor: count ? 'pointer' : 'default',
              }}
            >
              <span style={{ ...styles.tileIcon, color: count ? color : theme.colors.dark05 }}>
                <Icon size={16} />
              </span>
              <span style={{ ...styles.tileCount, color: count ? theme.colors.white : theme.colors.dark05 }}>
                {count || '0'}
              </span>
              <span style={styles.tileLabel}>{count ? category.label : `${category.label} · all clear`}</span>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div style={styles.list}>
          {list.rows}
          {list.more ? (
            <button type='button' style={styles.more} onClick={() => setExpanded(true)}>
              Show {list.more} more
            </button>
          ) : null}
          {list.footer}
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  card: {
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  header: { flexDirection: 'row', alignItems: 'baseline', gap: t.spacing.s, flexWrap: 'wrap' },
  title: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    fontWeight: 700,
    fontSize: 15,
  },
  muted: { fontSize: 12, color: t.colors.dark05 },
  tiles: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: t.spacing.s,
  },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.large,
    textAlign: 'left',
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: t.colors.gray01 + t.colorOpacity(0.5),
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
  },
  tileIcon: { display: 'flex' },
  tileCount: { fontSize: 24, fontWeight: 800, lineHeight: 1.1 },
  tileLabel: { fontSize: 12, fontWeight: 600, color: t.colors.dark05 },
  list: {
    gap: 2,
    padding: t.spacing.xs,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: `${t.spacing.s}px ${t.spacing.sm}px`,
    borderRadius: t.borderRadius.default,
    transition: 'background-color 0.12s ease',
  },
  rowHover: { backgroundColor: t.colors.white + t.colorOpacity(0.05) },
  rowMain: { flex: 1, minWidth: 0, gap: 2 },
  rowTitle: { fontSize: 14, fontWeight: 600, color: t.colors.white },
  rowTitleButton: {
    alignSelf: 'flex-start',
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: 14,
    fontWeight: 600,
    color: t.colors.white,
  },
  rowMeta: { fontSize: 12, color: t.colors.dark05 },
  rowActions: { flexDirection: 'row', gap: t.spacing.xs, flexShrink: 0 },
  tick: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    flexShrink: 0,
    borderRadius: 6,
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: 'transparent',
    border: `2px solid ${t.colors.dark04}`,
  },
  price: { fontSize: 13, fontWeight: 700, color: TONE_COLOR.yellow, whiteSpace: 'nowrap' },
  shop: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    fontWeight: 600,
    color: t.colors.blue04,
    whiteSpace: 'nowrap',
  },
  more: {
    alignSelf: 'flex-start',
    margin: `${t.spacing.xs}px ${t.spacing.sm}px`,
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    color: t.colors.blue04,
  },
  footerNote: { padding: `${t.spacing.xs}px ${t.spacing.sm}px`, fontSize: 12, color: t.colors.dark05 },
}));
