import { differenceInCalendarDays } from 'date-fns';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { IconType } from 'react-icons';
import {
  FiAlertTriangle,
  FiCheckSquare,
  FiChevronRight,
  FiExternalLink,
  FiHelpCircle,
  FiShoppingCart,
} from 'react-icons/fi';
import { MdSdCard } from 'react-icons/md';
import { AttentionResponse, PhotoEntryDetailsResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useCan } from '~/hooks/usePermissions';
import { useUrlParams } from '~/hooks/useUrlParam';
import { STAGE_LABELS } from '~/routes/PhotoManagement/components/EntryCommentsPanel';
import { PhotoEntryDetailsModal } from '~/routes/PhotoManagement/modals/PhotoEntryDetailsModal';
import { formatAmount } from '~/utils/formatAmount';
import { gearItemLabel } from '~/utils/gearCategory';
import { mkUseStyles, useTheme } from '~/utils/theme';

type CategoryKey = 'unsecuredOverdue' | 'pastPlanned' | 'openTodos' | 'wishlistDueSoon' | 'undeclared';

type Category = { key: CategoryKey; label: string; icon: IconType; color: string };

/** Most urgent first. */
const CATEGORIES: Category[] = [
  { key: 'unsecuredOverdue', label: 'Upload overdue', icon: MdSdCard, color: '#F08A80' },
  { key: 'pastPlanned', label: 'Did it happen?', icon: FiHelpCircle, color: '#E7BE63' },
  { key: 'openTodos', label: 'Open to-dos', icon: FiCheckSquare, color: '#7FCBFF' },
  { key: 'wishlistDueSoon', label: 'To buy soon', icon: FiShoppingCart, color: '#F9F871' },
  { key: 'undeclared', label: 'Gear never declared', icon: FiHelpCircle, color: '#A9BCC9' },
];

/** Rows per section before "Show all"; enough to see what is there. */
const VISIBLE_ROWS = 4;

const relativeDay = (value?: string | null) => {
  if (!value) return 'no date';
  const days = differenceInCalendarDays(new Date(value), new Date());
  if (days < 0) return `${-days} day${days === -1 ? '' : 's'} late`;
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
};

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : 'No date');

type Row = { key: string; title: ReactNode; meta: ReactNode; trailing?: ReactNode; entryId?: string };

/**
 * Everything in the photo library that is waiting on you, all at once and
 * most urgent first. It only points: each row opens its session, where the
 * actual change (answer a plan, tick a to-do, declare gear) is made — nothing
 * is ticked off from here by accident.
 */
export const AttentionCard = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { photoEntryApi } = useApi();
  const can = useCan();
  const canRead = can('photoEntry.read');
  const [expanded, setExpanded] = useState<Set<CategoryKey>>(new Set());
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

  const [urlState, setUrlState] = useUrlParams(['entry'] as const);
  const openedRef = useRef<string>();

  const openEntry = async (entryId: string) => {
    if (!photoEntryApi) return;
    openedRef.current = entryId;
    setUrlState({ entry: entryId });
    const { data: entry } = await photoEntryApi.photoEntryControllerGetById({ id: entryId });
    detailsModal.show({
      entry: entry as PhotoEntryDetailsResponse,
      handleClose: async () => {
        openedRef.current = undefined;
        setUrlState({ entry: null });
        await query.reload();
        detailsModal.hide();
      },
      onSaved: async () => {
        await query.reload();
      },
    });
  };

  // A dashboard link with ?entry= reopens that session's card.
  useEffect(() => {
    if (!photoEntryApi || !urlState.entry || openedRef.current === urlState.entry) return;
    openEntry(urlState.entry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoEntryApi, urlState.entry]);

  const data = query.data;
  if (!canRead || !data) return null;
  const counts = data.counts;
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  if (!total) return null;

  const rowsFor = (key: CategoryKey): Row[] => {
    switch (key) {
      case 'unsecuredOverdue':
        return data.unsecuredOverdue.map((entry) => ({
          key: entry.photoEntryId,
          entryId: entry.photoEntryId,
          title: entry.name,
          meta: entry.items.map((item, i) => (
            <span key={item.gear.id}>
              {i ? ' · ' : ''}
              {gearItemLabel(item.gear)}{' '}
              <span style={{ color: item.overdue ? CATEGORIES[0].color : undefined }}>
                {item.daysPending}/{item.reminderDays}d
              </span>
            </span>
          )),
        }));
      case 'pastPlanned':
        return data.pastPlanned.map((entry) => ({
          key: entry.photoEntryId,
          entryId: entry.photoEntryId,
          title: entry.name,
          meta: `Planned until ${formatDate(entry.endDate)} · ${entry.daysOver} day${
            entry.daysOver === 1 ? '' : 's'
          } ago`,
        }));
      case 'openTodos':
        return data.openTodos.map((todo) => ({
          key: todo.commentId,
          entryId: todo.photoEntryId,
          title: todo.body,
          meta: `${todo.entryName} · ${STAGE_LABELS[todo.stage] ?? todo.stage}`,
        }));
      case 'wishlistDueSoon':
        return data.wishlistDueSoon.map((item) => ({
          key: item.id,
          title: gearItemLabel(item),
          meta: `Buy ${relativeDay(item.neededBy)}${item.neededFor ? ` · for ${item.neededFor.name}` : ''}`,
          trailing: (
            <>
              {item.estimatedPrice != null ? (
                <span style={styles.price}>{formatAmount(item.estimatedPrice)}</span>
              ) : null}
              {item.purchaseUrl ? (
                <a
                  href={item.purchaseUrl}
                  target='_blank'
                  rel='noreferrer'
                  style={styles.shop}
                  onClick={(e) => e.stopPropagation()}
                >
                  Shop <FiExternalLink size={12} />
                </a>
              ) : null}
            </>
          ),
        }));
      case 'undeclared':
        return data.undeclared.map((entry) => ({
          key: entry.photoEntryId,
          entryId: entry.photoEntryId,
          title: entry.name,
          meta: `${formatDate(entry.startDate)} · no gear list`,
        }));
    }
  };

  const withItems = CATEGORIES.filter((category) => counts[category.key]);

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

      <div style={styles.grid}>
        {withItems.map((category) => {
          const Icon = category.icon;
          const rows = rowsFor(category.key);
          const open = expanded.has(category.key);
          const shown = open ? rows : rows.slice(0, VISIBLE_ROWS);
          const sum =
            category.key === 'wishlistDueSoon'
              ? data.wishlistDueSoon.reduce((acc, item) => acc + (item.estimatedPrice ?? 0), 0)
              : 0;

          return (
            <div key={category.key} style={{ ...styles.section, borderTopColor: category.color }}>
              <div style={styles.sectionHead}>
                <span style={{ ...styles.sectionTitle, color: category.color }}>
                  <Icon size={15} />
                  {category.label}
                </span>
                <span style={styles.count}>{counts[category.key]}</span>
                {sum ? <span style={{ ...styles.muted, marginLeft: 'auto' }}>≈ {formatAmount(sum)}</span> : null}
              </div>

              <div style={styles.rows}>
                {shown.map((row) => {
                  const hoverKey = `${category.key}:${row.key}`;
                  const clickable = Boolean(row.entryId);
                  return (
                    <div
                      key={row.key}
                      role={clickable ? 'button' : undefined}
                      tabIndex={clickable ? 0 : undefined}
                      style={{
                        ...styles.row,
                        ...(clickable && hoveredRow === hoverKey ? styles.rowHover : {}),
                        cursor: clickable ? 'pointer' : 'default',
                      }}
                      onMouseEnter={() => setHoveredRow(hoverKey)}
                      onMouseLeave={() => setHoveredRow((prev) => (prev === hoverKey ? undefined : prev))}
                      onClick={row.entryId ? () => openEntry(row.entryId!) : undefined}
                      onKeyDown={(e) => {
                        if (!row.entryId || (e.key !== 'Enter' && e.key !== ' ')) return;
                        e.preventDefault();
                        openEntry(row.entryId);
                      }}
                    >
                      <div style={styles.rowMain}>
                        <span style={styles.rowTitle}>{row.title}</span>
                        <span style={styles.rowMeta}>{row.meta}</span>
                      </div>
                      {row.trailing}
                      {clickable ? <FiChevronRight size={15} color={theme.colors.dark05} /> : null}
                    </div>
                  );
                })}
              </div>

              {rows.length > VISIBLE_ROWS ? (
                <button
                  type='button'
                  style={styles.more}
                  onClick={() =>
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      if (next.has(category.key)) next.delete(category.key);
                      else next.add(category.key);
                      return next;
                    })
                  }
                >
                  {open ? 'Show less' : `Show all ${rows.length}`}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(380px, 100%), 1fr))',
    gap: t.spacing.m,
    alignItems: 'start',
  },
  section: {
    gap: t.spacing.xs,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
    borderTopWidth: 2,
    borderTopStyle: 'solid',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: `${t.spacing.xs}px ${t.spacing.s}px`,
  },
  sectionTitle: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 },
  count: {
    padding: '1px 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    color: t.colors.white,
    backgroundColor: t.colors.white + t.colorOpacity(0.08),
  },
  rows: { gap: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: `${t.spacing.xs}px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    transition: 'background-color 0.12s ease',
  },
  rowHover: { backgroundColor: t.colors.white + t.colorOpacity(0.05) },
  rowMain: { flex: 1, minWidth: 0, gap: 1 },
  rowTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: t.colors.white,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowMeta: {
    fontSize: 12,
    color: t.colors.dark05,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  price: { fontSize: 12, fontWeight: 700, color: '#F9F871', whiteSpace: 'nowrap' },
  shop: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    fontWeight: 600,
    color: t.colors.blue04,
    whiteSpace: 'nowrap',
  },
  more: {
    alignSelf: 'flex-start',
    margin: `2px ${t.spacing.s}px ${t.spacing.xs}px`,
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    color: t.colors.blue04,
  },
}));
