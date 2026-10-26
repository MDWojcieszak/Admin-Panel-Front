import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PhotoEntryResponse } from '~/api/api';
import { KanbanBoard } from '~/components/KanbanBoard';
import { PhotoEntryKanbanCard } from '~/routes/PhotoManagement/components/PhotoEntryKanbanCard';
import { getKanbanColumnColors } from '~/routes/PhotoManagement/utils/colors';
import { buildNameQualifiers } from '~/routes/PhotoManagement/utils/entryNames';
import {
  KANBAN_COLUMNS,
  KanbanColumn,
  KanbanColumnId,
  canMoveToColumn,
  compareEntriesByDate,
  getEntryColumn,
  planColumnMove,
} from '~/routes/PhotoManagement/utils/kanban';
import { mkUseStyles } from '~/utils/theme';

import { colors } from '~/utils/theme/colors';

type PhotoEntryKanbanProps = {
  entries: PhotoEntryResponse[];
  onRequestColumnChange: (entry: PhotoEntryResponse, column: KanbanColumn) => Promise<void> | void;
  /** Surfaces why a drop was refused, so a dimmed lane is not the only feedback. */
  onForbiddenMove?: (reason: string) => void;
  onCardClick: (entry: PhotoEntryResponse) => void;
};

type DragInfoState = {
  entryId: string;
  fromColumn: KanbanColumnId;
  hoverColumn: KanbanColumnId | null;
} | null;

export const PhotoEntryKanban = ({
  entries,
  onRequestColumnChange,
  onForbiddenMove,
  onCardClick,
}: PhotoEntryKanbanProps) => {
  const styles = useStyles();
  const [optimisticEntries, setOptimisticEntries] = useState(entries);
  const [dragState, setDragState] = useState<DragInfoState>(null);
  const [pendingEntryId, setPendingEntryId] = useState<string | null>(null);
  const [cancelledOpen, setCancelledOpen] = useState(false);

  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setOptimisticEntries(entries);
  }, [entries]);

  const draggedEntry = useMemo(() => {
    if (!dragState) return null;
    return optimisticEntries.find((entry) => entry.id === dragState.entryId) ?? null;
  }, [dragState, optimisticEntries]);

  const entriesByColumn = useMemo(() => {
    const grouped = new Map<KanbanColumnId, PhotoEntryResponse[]>();
    KANBAN_COLUMNS.forEach((column) => grouped.set(column.id, []));

    // Sorted once here so every lane (and the cancelled strip) reads newest first.
    [...optimisticEntries].sort(compareEntriesByDate).forEach((entry) => {
      const column = getEntryColumn(entry);
      if (column) grouped.get(column)?.push(entry);
    });

    return grouped;
  }, [optimisticEntries]);

  // Computed across the whole board, not per lane: two trips with the same name
  // are confusing wherever they sit, including in different columns.
  const nameQualifiers = useMemo(() => buildNameQualifiers(optimisticEntries), [optimisticEntries]);

  // Cancelled entries have no lane, so without this strip filtering by
  // "Cancelled" would render an empty board and look broken.
  const cancelledEntries = useMemo(
    () => optimisticEntries.filter((entry) => getEntryColumn(entry) === null).sort(compareEntriesByDate),
    [optimisticEntries],
  );

  const getColumnFromPoint = (x: number, y: number): KanbanColumnId | null => {
    for (const column of KANBAN_COLUMNS) {
      const el = columnRefs.current[column.id];
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      if (inside) return column.id;
    }

    return null;
  };

  const handleDragMove = (x: number, y: number) => {
    setDragState((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        hoverColumn: getColumnFromPoint(x, y),
      };
    });
  };

  const handleDragEnd = async (entry: PhotoEntryResponse) => {
    const currentDrag = dragState;
    setDragState(null);

    if (!currentDrag) return;

    const targetId = currentDrag.hoverColumn;
    if (!targetId || targetId === currentDrag.fromColumn) return;

    const target = KANBAN_COLUMNS.find((column) => column.id === targetId);
    if (!target) return;

    const move = planColumnMove(entry, target);
    if (move.kind === 'noop') return;
    if (move.kind === 'forbidden') {
      onForbiddenMove?.(move.reason);
      return;
    }

    const previousEntries = optimisticEntries;

    setOptimisticEntries((prev) =>
      prev.map((item) =>
        item.id === entry.id ? { ...item, status: target.status, postStage: target.postStage } : item,
      ),
    );

    try {
      setPendingEntryId(entry.id);
      await onRequestColumnChange(entry, target);
    } catch (error) {
      setOptimisticEntries(previousEntries);
    } finally {
      setPendingEntryId(null);
    }
  };

  const describeLane = (column: KanbanColumn) => {
    const columnColors = getKanbanColumnColors(column.id);
    const columnEntries = entriesByColumn.get(column.id) ?? [];

    const isDragging = Boolean(dragState);
    const isHover = dragState?.hoverColumn === column.id;
    const isDraggedSource = dragState?.fromColumn === column.id;

    const draggedCanMoveHere = draggedEntry ? canMoveToColumn(draggedEntry, column) : false;
    const shouldDim = Boolean(isDragging && draggedEntry && !isDraggedSource && !draggedCanMoveHere);
    const shouldHighlight = Boolean(isDragging && draggedEntry && isHover && draggedCanMoveHere);

    return { columnColors, columnEntries, isDraggedSource, draggedCanMoveHere, shouldDim, shouldHighlight };
  };

  return (
    <KanbanBoard
      dragging={Boolean(dragState)}
      lanes={KANBAN_COLUMNS.map((column) => {
        const { columnColors, columnEntries, isDraggedSource, draggedCanMoveHere, shouldDim, shouldHighlight } =
          describeLane(column);
        return {
          id: column.id,
          title: column.title,
          count: columnEntries.length,
          palette: columnColors,
          highlight: shouldHighlight,
          dimmed: shouldDim,
          blocked: !draggedCanMoveHere,
          raised: isDraggedSource,
          bodyRef: (node) => {
            columnRefs.current[column.id] = node;
          },
          children: (
            <AnimatePresence initial={false}>
              {columnEntries.map((entry) => (
                <PhotoEntryKanbanCard
                  key={entry.id}
                  entry={entry}
                  qualifier={nameQualifiers.get(entry.id)}
                  accentColor={columnColors.accent}
                  pending={pendingEntryId === entry.id}
                  isDragging={dragState?.entryId === entry.id}
                  onCardClick={onCardClick}
                  onDragStart={(dragged) => {
                    const fromColumn = getEntryColumn(dragged);
                    if (!fromColumn) return;

                    setDragState({
                      entryId: dragged.id,
                      fromColumn,
                      hoverColumn: fromColumn,
                    });
                  }}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  styles={styles}
                />
              ))}
            </AnimatePresence>
          ),
        };
      })}
      footer={
        cancelledEntries.length ? (
          <div style={styles.cancelledStrip}>
            <div
              role='button'
              tabIndex={0}
              style={styles.cancelledHeader}
              onClick={() => setCancelledOpen((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCancelledOpen((prev) => !prev);
                }
              }}
            >
              <span style={styles.cancelledTitle}>Cancelled</span>
              <span style={styles.columnCount}>{cancelledEntries.length}</span>
              <span style={styles.cancelledToggle}>{cancelledOpen ? 'Hide' : 'Show'}</span>
            </div>

            <AnimatePresence initial={false}>
              {cancelledOpen ? (
                <motion.div
                  key='cancelled-list'
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={styles.cancelledList}>
                    {cancelledEntries.map((entry) => (
                      <div
                        key={entry.id}
                        role='button'
                        tabIndex={0}
                        style={styles.cancelledItem}
                        onClick={() => onCardClick(entry)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onCardClick(entry);
                          }
                        }}
                      >
                        {entry.name}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null
      }
    />
  );
};

const useStyles = mkUseStyles((t) => ({
  columnCount: {
    color: colors.dark05,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: `${t.spacing.xs}px ${t.spacing.s}px`,
    borderRadius: 999,
    fontSize: 12,
    flexShrink: 0,
  },
  card: {
    backgroundColor: 'rgba(30, 32, 37, 0.92)',
    borderRadius: 14,
    padding: t.spacing.m,
    gap: t.spacing.xs,
    cursor: 'grab',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
    userSelect: 'none',
    touchAction: 'none',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
  },
  cardTitle: {
    color: colors.white,
    fontWeight: '600',
    wordBreak: 'break-word',
  },
  cardMeta: {
    color: colors.dark05,
    fontSize: 12,
    wordBreak: 'break-word',
  },
  cancelledStrip: {
    flexShrink: 0,
    marginTop: t.spacing.s,
    marginRight: t.spacing.l + t.spacing.xs,
    borderRadius: t.borderRadius.large,
    border: '1px solid rgba(247, 94, 121, 0.22)',
    backgroundColor: 'rgba(247, 94, 121, 0.06)',
    overflow: 'hidden',
  },
  cancelledHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    cursor: 'pointer',
    userSelect: 'none',
  },
  cancelledTitle: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  cancelledToggle: {
    marginLeft: 'auto',
    color: colors.dark05,
    fontSize: 12,
  },
  cancelledList: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.s,
    padding: t.spacing.s,
    paddingTop: 0,
  },
  cancelledItem: {
    padding: `${t.spacing.xs}px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: colors.dark05,
    fontSize: 12,
    cursor: 'pointer',
    textDecoration: 'line-through',
  },
}));
