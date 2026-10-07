import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { FiArrowRight, FiMapPin } from 'react-icons/fi';
import { PhotoEntryResponse, PhotoEntryStatus } from '~/api/api';
import { EmptyState } from '~/components/EmptyState';
import { getKanbanColumnColors } from '~/routes/PhotoManagement/utils/colors';
import {
  EntryChip,
  formatDateRange,
  getCounters,
  getPhotoEntryTypeMeta,
  getStatusChips,
  parseDate,
} from '~/routes/PhotoManagement/utils/entryDisplay';
import { buildNameQualifiers } from '~/routes/PhotoManagement/utils/entryNames';
import {
  KANBAN_COLUMNS,
  KanbanColumn,
  KanbanColumnId,
  compareEntriesByDate,
  getEntryColumn,
  planColumnMove,
} from '~/routes/PhotoManagement/utils/kanban';
import { mkUseStyles, useTheme } from '~/utils/theme';

type PhotoEntryLanesProps = {
  entries: PhotoEntryResponse[];
  onRequestColumnChange: (entry: PhotoEntryResponse, column: KanbanColumn) => Promise<void> | void;
  onForbiddenMove?: (reason: string) => void;
  onCardClick: (entry: PhotoEntryResponse) => void;
};

/**
 * The board on a phone. Five lanes side by side do not fit and dragging a card
 * fights the page's scroll, so one lane shows at a time — picked from tabs that
 * carry the counts — and a card moves through its own "Move" button, offering
 * exactly the lanes the board would let it be dropped on.
 */
export const PhotoEntryLanes = ({ entries, onRequestColumnChange, onForbiddenMove, onCardClick }: PhotoEntryLanesProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const [lane, setLane] = useState<KanbanColumnId>('AFTER_SHOOT');
  const [moving, setMoving] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const byLane = useMemo(() => {
    const grouped = new Map<KanbanColumnId, PhotoEntryResponse[]>(KANBAN_COLUMNS.map((c) => [c.id, []]));
    entries.forEach((entry) => {
      const column = getEntryColumn(entry);
      if (column) grouped.get(column)!.push(entry);
    });
    grouped.forEach((list) => list.sort(compareEntriesByDate));
    return grouped;
  }, [entries]);

  // Open on the first lane with something in it rather than an empty one.
  useEffect(() => {
    if (byLane.get(lane)?.length) return;
    const first = KANBAN_COLUMNS.find((c) => byLane.get(c.id)?.length);
    if (first) setLane(first.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byLane]);

  const qualifiers = useMemo(() => buildNameQualifiers(entries), [entries]);
  const visible = byLane.get(lane) ?? [];
  const cancelled = entries.filter((entry) => entry.status === PhotoEntryStatus.Cancelled).length;

  const move = async (entry: PhotoEntryResponse, column: KanbanColumn) => {
    const plan = planColumnMove(entry, column);
    if (plan.kind === 'forbidden') {
      onForbiddenMove?.(plan.reason);
      return;
    }
    if (plan.kind !== 'allowed') return;
    setPending(entry.id);
    setMoving(null);
    try {
      await onRequestColumnChange(entry, column);
    } catch {
      // The library has already said why in a toast and reloaded the list.
    } finally {
      setPending(null);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.tabs} className='no-scrollbar'>
        {KANBAN_COLUMNS.map((column) => {
          const palette = getKanbanColumnColors(column.id);
          const active = column.id === lane;
          return (
            <button
              key={column.id}
              type='button'
              onClick={() => setLane(column.id)}
              style={{
                ...styles.tab,
                color: active ? theme.colors.white : theme.colors.dark05,
                borderColor: active ? palette.accent : palette.border,
                backgroundColor: active ? palette.activeBackground : 'transparent',
              }}
            >
              <span style={{ ...styles.tabDot, backgroundColor: palette.accent }} />
              {column.title}
              <span style={styles.tabCount}>{byLane.get(column.id)?.length ?? 0}</span>
            </button>
          );
        })}
      </div>

      <div style={styles.list}>
        {visible.length === 0 ? (
          <div style={styles.empty}>
            <EmptyState title='Nothing here' description='No session is at this stage right now.' />
          </div>
        ) : (
          visible.map((entry) => {
            const palette = getKanbanColumnColors(lane);
            const type = getPhotoEntryTypeMeta(entry.type);
            const TypeIcon = type.icon;
            const range = formatDateRange(parseDate(entry.startDate), parseDate(entry.endDate));
            const chips = getStatusChips(entry);
            const counters = getCounters(entry);
            const qualifier = qualifiers.get(entry.id);
            const targets = KANBAN_COLUMNS.filter((column) => planColumnMove(entry, column).kind !== 'noop');

            return (
              <div
                key={entry.id}
                style={{ ...styles.card, borderLeftColor: palette.accent, opacity: pending === entry.id ? 0.55 : 1 }}
                onClick={() => onCardClick(entry)}
              >
                <div style={styles.cardTop}>
                  <span style={styles.name}>
                    {entry.name}
                    {qualifier ? <span style={styles.muted}> · {qualifier}</span> : null}
                  </span>
                  <button
                    type='button'
                    style={{ ...styles.moveButton, ...(moving === entry.id ? styles.moveButtonOn : null) }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMoving((id) => (id === entry.id ? null : entry.id));
                    }}
                  >
                    Move
                    <FiArrowRight size={13} />
                  </button>
                </div>

                <div style={styles.meta}>
                  <span style={{ ...styles.row, gap: 4, color: type.color, fontWeight: 600 }}>
                    <TypeIcon size={13} />
                    {type.label}
                  </span>
                  {range ? <span>· {range}</span> : null}
                </div>

                {entry.location ? (
                  <div style={{ ...styles.meta, flexWrap: 'nowrap' }}>
                    <FiMapPin size={12} style={{ flexShrink: 0 }} />
                    <span style={styles.ellipsis}>
                      {entry.location.name ||
                        `${entry.location.latitude.toFixed(3)}, ${entry.location.longitude.toFixed(3)}`}
                    </span>
                  </div>
                ) : null}

                {chips.length ? (
                  <div style={{ ...styles.row, flexWrap: 'wrap', gap: 6 }}>
                    {chips.map((chip) => (
                      <EntryChip key={chip.key} chip={chip} />
                    ))}
                  </div>
                ) : null}

                {counters.length ? (
                  <div style={styles.counters}>
                    {counters.map((counter) => {
                      const Icon = counter.icon;
                      return (
                        <span key={counter.key} style={{ ...styles.row, gap: 4, color: counter.color }}>
                          <Icon size={13} />
                          {counter.label}
                        </span>
                      );
                    })}
                  </div>
                ) : null}

                <AnimatePresence initial={false}>
                  {moving === entry.id ? (
                    <motion.div
                      key='move'
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{ overflow: 'hidden' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={styles.moveTargets}>
                        {targets.map((column) => {
                          const plan = planColumnMove(entry, column);
                          const targetPalette = getKanbanColumnColors(column.id);
                          return (
                            <button
                              key={column.id}
                              type='button'
                              onClick={() => move(entry, column)}
                              style={{
                                ...styles.moveTarget,
                                borderColor: targetPalette.border,
                                opacity: plan.kind === 'forbidden' ? 0.45 : 1,
                              }}
                            >
                              <span style={{ ...styles.tabDot, backgroundColor: targetPalette.accent }} />
                              {column.title}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })
        )}

        {cancelled ? (
          <span style={styles.footnote}>
            {cancelled} cancelled session{cancelled === 1 ? '' : 's'} — the List view shows them.
          </span>
        ) : null}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  wrapper: { gap: t.spacing.sm, minHeight: 0, height: '100%' },
  tabs: { flexDirection: 'row', gap: t.spacing.xs, overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none' },
  tab: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    height: 36,
    padding: '0 12px',
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tabDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  tabCount: { fontSize: 12, fontWeight: 700, opacity: 0.7 },
  list: { flex: 1, minHeight: 0, overflowY: 'auto', gap: t.spacing.s, paddingBottom: t.spacing.m },
  empty: { paddingTop: t.spacing.xl },
  card: {
    gap: t.spacing.xs,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.8),
    borderLeftWidth: 3,
    borderLeftStyle: 'solid',
    cursor: 'pointer',
    flexShrink: 0,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing.s },
  name: { flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700, wordBreak: 'break-word' },
  muted: { color: t.colors.dark05, fontWeight: 400 },
  moveButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
    height: 30,
    padding: '0 10px',
    borderRadius: 999,
    border: `1px solid ${t.colors.dark04 + t.colorOpacity(0.5)}`,
    background: 'transparent',
    color: t.colors.dark05,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  moveButtonOn: { color: t.colors.white, borderColor: t.colors.blue, backgroundColor: t.colors.blue + t.colorOpacity(0.18) },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, fontSize: 13, color: t.colors.dark05 },
  row: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
  ellipsis: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 },
  counters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
    paddingTop: 8,
    borderTop: '1px solid rgba(146, 164, 177, 0.14)',
    fontSize: 12,
    fontWeight: 600,
  },
  moveTargets: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs, paddingTop: t.spacing.s },
  moveTarget: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    padding: '0 12px',
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
    background: 'transparent',
    color: t.colors.white,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  footnote: { fontSize: 12, color: t.colors.dark05, textAlign: 'center', paddingTop: t.spacing.s },
}));
