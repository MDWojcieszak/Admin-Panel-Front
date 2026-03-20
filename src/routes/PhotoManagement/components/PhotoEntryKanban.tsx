import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PhotoEntryResponse, PhotoEntryStatus } from '~/api/api';
import { Scrollbar } from '~/components/Scrollbar';
import { PhotoEntryKanbanCard } from '~/routes/PhotoManagement/components/PhotoEntryKanbanCard';
import { PhotoEntryKanbanColumnHeader } from '~/routes/PhotoManagement/components/PhotoEntryKanbanColumnHeader';
import { getPhotoEntryStatusColors } from '~/routes/PhotoManagement/utils/colors';
import { canMoveToStatus, resolvePhotoEntryStatusDrop } from '~/routes/PhotoManagement/utils/kanban';
import { mkUseStyles } from '~/utils/theme';

import { colors } from '~/utils/theme/colors';

type PhotoEntryKanbanProps = {
  entries: PhotoEntryResponse[];
  onRequestStatusChange: (entry: PhotoEntryResponse, targetStatus: PhotoEntryStatus) => Promise<void> | void;
  onCardClick: (entry: PhotoEntryResponse) => void;
};

type DragInfoState = {
  entryId: string;
  fromStatus: PhotoEntryStatus;
  hoverStatus: PhotoEntryStatus | null;
} | null;

const KANBAN_COLUMNS = [
  { title: 'Planned', status: PhotoEntryStatus.Planned },
  { title: 'Active', status: PhotoEntryStatus.Active },
  { title: 'Selected', status: PhotoEntryStatus.Selected },
  { title: 'Editing', status: PhotoEntryStatus.Editing },
  { title: 'Completed', status: PhotoEntryStatus.Completed },
];

export const PhotoEntryKanban = ({ entries, onRequestStatusChange, onCardClick }: PhotoEntryKanbanProps) => {
  const styles = useStyles();
  const [optimisticEntries, setOptimisticEntries] = useState(entries);
  const [dragState, setDragState] = useState<DragInfoState>(null);
  const [pendingEntryId, setPendingEntryId] = useState<string | null>(null);

  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setOptimisticEntries(entries);
  }, [entries]);

  const draggedEntry = useMemo(() => {
    if (!dragState) return null;
    return optimisticEntries.find((entry) => entry.id === dragState.entryId) ?? null;
  }, [dragState, optimisticEntries]);

  const getColumnFromPoint = (x: number, y: number): PhotoEntryStatus | null => {
    for (const column of KANBAN_COLUMNS) {
      const el = columnRefs.current[column.status];
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      if (inside) return column.status;
    }

    return null;
  };

  const handleDragMove = (x: number, y: number) => {
    setDragState((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        hoverStatus: getColumnFromPoint(x, y),
      };
    });
  };

  const handleDragEnd = async (entry: PhotoEntryResponse) => {
    const currentDrag = dragState;
    setDragState(null);

    if (!currentDrag) return;

    const targetStatus = currentDrag.hoverStatus;
    if (!targetStatus) return;
    if (entry.status === targetStatus) return;

    const decision = resolvePhotoEntryStatusDrop(entry, targetStatus);
    if (decision.type !== 'allowed') return;

    const previousEntries = optimisticEntries;

    setOptimisticEntries((prev) =>
      prev.map((item) =>
        item.id === entry.id
          ? {
              ...item,
              status: targetStatus,
            }
          : item,
      ),
    );

    try {
      setPendingEntryId(entry.id);
      await onRequestStatusChange(entry, targetStatus);
    } catch (error) {
      setOptimisticEntries(previousEntries);
    } finally {
      setPendingEntryId(null);
    }
  };

  return (
    <LayoutGroup>
      <div style={styles.wrapper}>
        <div style={styles.boardHeaders}>
          {KANBAN_COLUMNS.map((column) => {
            const statusColors = getPhotoEntryStatusColors(column.status);
            const columnEntries = optimisticEntries.filter((entry) => entry.status === column.status);

            const isDragging = Boolean(dragState);
            const isHover = dragState?.hoverStatus === column.status;
            const isDraggedSource = dragState?.fromStatus === column.status;
            const shouldRaiseColumn = dragState?.fromStatus === column.status;

            const draggedCanMoveHere = draggedEntry ? canMoveToStatus(draggedEntry.status, column.status) : false;
            const shouldDim = isDragging && draggedEntry && !isDraggedSource && !draggedCanMoveHere;
            const shouldHighlight = isDragging && draggedEntry && isHover && draggedCanMoveHere;

            return (
              <motion.div
                key={column.status}
                layout
                animate={{
                  opacity: shouldDim ? 0.35 : 1,
                  border: shouldHighlight ? `1px solid ${statusColors.accent}` : `1px solid ${statusColors.border}`,
                  borderBottom: 'none',
                  backgroundColor: dragState
                    ? draggedCanMoveHere
                      ? statusColors.background
                      : statusColors.border
                    : statusColors.activeBackground,
                }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                style={{
                  ...styles.columnHeaderShell,
                  backgroundColor: statusColors.background,
                  zIndex: shouldRaiseColumn ? 20 : 1,
                }}
              >
                <PhotoEntryKanbanColumnHeader
                  title={column.title}
                  count={columnEntries.length}
                  accentColor={statusColors.accent}
                  shouldHighlight={shouldHighlight}
                  styles={styles}
                />
              </motion.div>
            );
          })}
        </div>

        <div style={styles.boardContent}>
          <Scrollbar style={styles.boardScroll}>
            <div style={styles.boardCards}>
              {KANBAN_COLUMNS.map((column) => {
                const statusColors = getPhotoEntryStatusColors(column.status);
                const columnEntries = optimisticEntries.filter((entry) => entry.status === column.status);

                const isDragging = Boolean(dragState);
                const isHover = dragState?.hoverStatus === column.status;
                const isDraggedSource = dragState?.fromStatus === column.status;
                const shouldRaiseColumn = dragState?.fromStatus === column.status;

                const draggedCanMoveHere = draggedEntry ? canMoveToStatus(draggedEntry.status, column.status) : false;
                const shouldDim = isDragging && draggedEntry && !isDraggedSource && !draggedCanMoveHere;
                const shouldHighlight = isDragging && draggedEntry && isHover && draggedCanMoveHere;

                return (
                  <motion.div
                    key={column.status}
                    ref={(node) => {
                      columnRefs.current[column.status] = node;
                    }}
                    layout
                    animate={{
                      opacity: shouldDim ? 0.35 : 1,
                      border: shouldHighlight ? `1px solid ${statusColors.accent}` : `1px solid ${statusColors.border}`,
                      backgroundColor: dragState
                        ? draggedCanMoveHere
                          ? statusColors.background
                          : statusColors.border
                        : statusColors.activeBackground,

                      borderTop: 'none',
                    }}
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    style={{
                      ...styles.columnBodyShell,
                      backgroundColor: statusColors.background,
                      zIndex: shouldRaiseColumn ? 20 : 1,
                    }}
                  >
                    <div style={styles.cards}>
                      <AnimatePresence initial={false}>
                        {columnEntries.map((entry) => (
                          <PhotoEntryKanbanCard
                            key={entry.id}
                            entry={entry}
                            pending={pendingEntryId === entry.id}
                            isDragging={dragState?.entryId === entry.id}
                            onCardClick={onCardClick}
                            onDragStart={(dragged) => {
                              setDragState({
                                entryId: dragged.id,
                                fromStatus: dragged.status,
                                hoverStatus: dragged.status,
                              });
                            }}
                            onDragMove={handleDragMove}
                            onDragEnd={handleDragEnd}
                            styles={styles}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Scrollbar>
        </div>
      </div>
    </LayoutGroup>
  );
};

const useStyles = mkUseStyles((t) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
  },
  boardHeaders: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: t.spacing.m,
    alignItems: 'start',
    width: 'calc(100% - 28px)',
    minWidth: 0,
    flexShrink: 0,
  },
  boardContent: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
  boardScroll: {
    height: '100%',
    minHeight: 0,
  },
  boardCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: t.spacing.m,
    alignItems: 'start',
    width: '100%',
    minWidth: 0,
    minHeight: '100%',
    boxSizing: 'border-box',
    paddingRight: t.spacing.l + t.spacing.xs,
  },
  columnHeaderShell: {
    width: '100%',
    minWidth: 0,
    borderRadius: '16px 16px 0 0',
    padding: t.spacing.m,
    boxSizing: 'border-box',
    position: 'relative',
  },
  columnBodyShell: {
    width: '100%',
    minWidth: 0,
    borderRadius: '0 0 16px 16px',
    padding: t.spacing.m,
    minHeight: 420,
    boxSizing: 'border-box',
    position: 'relative',
  },
  columnHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  columnAccent: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  columnTitle: {
    color: colors.white,
    fontWeight: '700',
    flex: 1,
    minWidth: 0,
  },
  columnCount: {
    color: colors.dark05,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: `${t.spacing.xs}px ${t.spacing.s}px`,
    borderRadius: 999,
    fontSize: 12,
    flexShrink: 0,
  },
  cards: {
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.s,
    minHeight: 120,
    width: '100%',
    minWidth: 0,
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
  cardMetaRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: t.spacing.s,
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  cardMeta: {
    color: colors.dark05,
    fontSize: 12,
    wordBreak: 'break-word',
  },
  badge: {
    fontSize: 11,
    color: colors.white,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    padding: `${t.spacing.xs}px ${t.spacing.s}px`,
    display: 'inline-flex',
    alignItems: 'center',
  },
  cardNote: {
    color: colors.dark05,
    fontSize: 12,
    marginTop: t.spacing.xs,
    lineHeight: 1.4,
    wordBreak: 'break-word',
  },
}));
