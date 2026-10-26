import { LayoutGroup, motion } from 'framer-motion';
import { HTMLAttributes, ReactNode, Ref } from 'react';
import { Scrollbar } from '~/components/Scrollbar';
import { useIsMobile } from '~/hooks/useBreakpoint';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** A lane's colours: its fill at rest and while a card is carried, its edge, its dot. */
export type KanbanPalette = {
  background: string;
  activeBackground: string;
  border: string;
  accent: string;
};

/** A palette from one `#rrggbb`, as the photo board's are built: the same tints of it. */
export const kanbanPalette = (hex: string, accent = hex): KanbanPalette => {
  const value = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#92A4B1';
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
  const rgba = (alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`;
  return { background: rgba(0.07), activeBackground: rgba(0.14), border: rgba(0.22), accent };
};

export type KanbanLane = {
  id: string;
  title: string;
  count: number;
  palette: KanbanPalette;
  /** The carried card may land here and is over it: the edge takes the accent. */
  highlight?: boolean;
  /** The carried card may not land here: the lane fades. */
  dimmed?: boolean;
  /** While a card is carried, a lane that won't take it is filled with its edge colour. */
  blocked?: boolean;
  /** Above its neighbours, for a card dragged out of it. */
  raised?: boolean;
  /** Beside the count in the header, e.g. an add button. */
  actions?: ReactNode;
  /** The lane's cards. */
  children: ReactNode;
  bodyRef?: (node: HTMLDivElement | null) => void;
  /** Drop handlers and data attributes for the lane's body. */
  bodyProps?: HTMLAttributes<HTMLDivElement> & Record<`data-${string}`, string>;
};

type KanbanBoardProps = {
  lanes: KanbanLane[];
  /** A card is being carried: lanes show where it may go. */
  dragging?: boolean;
  /**
   * The narrowest a lane gets before the board scrolls sideways (a number in
   * px, or any CSS length). Without it lanes share the width, however narrow.
   */
  minLaneWidth?: number | string;
  /** The sideways scroller, for scrolling the board while a card is carried to its edge. */
  scrollRef?: Ref<HTMLDivElement>;
  /** Under the board, outside its scroll: e.g. lanes that are folded away. */
  footer?: ReactNode;
};

/**
 * The board of lanes the photo entries started with: headers in a row of
 * their own, and one scroll for all the lanes under them, so a long lane
 * scrolls the whole board instead of a box inside it. Lanes take no layout
 * animation: a lane growing under an unfolded card was scaled into place,
 * and its cards jumped and stretched on the way. Cards and dragging
 * belong to the caller; the board only lays out and colours the lanes.
 */
export const KanbanBoard = ({ lanes, dragging, minLaneWidth, scrollRef, footer }: KanbanBoardProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const isMobile = useIsMobile();
  const columns = `repeat(${lanes.length}, minmax(${minLaneWidth ? toLength(minLaneWidth) : '0'}, 1fr))`;
  // Room for the desktop scroll track beside the lanes; a phone overlays its own.
  const gutter = isMobile ? 0 : SCROLL_GUTTER;
  const minWidth = minLaneWidth
    ? `calc(${lanes.length} * ${toLength(minLaneWidth)} + ${(lanes.length - 1) * theme.spacing.m + gutter}px)`
    : undefined;

  const fill = (lane: KanbanLane) =>
    dragging ? (lane.blocked ? lane.palette.border : lane.palette.background) : lane.palette.activeBackground;
  const edge = (lane: KanbanLane) => `1px solid ${lane.highlight ? lane.palette.accent : lane.palette.border}`;

  return (
    <LayoutGroup>
      <div style={styles.wrapper}>
        <div ref={scrollRef} style={styles.sideways}>
          <div style={{ ...styles.inner, minWidth }}>
            <div style={{ ...styles.headers, gridTemplateColumns: columns, width: `calc(100% - ${gutter}px)` }}>
              {lanes.map((lane) => (
                <motion.div
                  key={lane.id}
                  animate={{
                    opacity: lane.dimmed ? 0.35 : 1,
                    border: edge(lane),
                    borderBottom: 'none',
                    backgroundColor: fill(lane),
                  }}
                  transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  style={{
                    ...styles.headerShell,
                    backgroundColor: lane.palette.background,
                    zIndex: lane.raised ? 20 : 1,
                  }}
                >
                  <div style={styles.header}>
                    <motion.div
                      animate={{ opacity: lane.highlight ? 1 : 0.85 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      style={{ ...styles.accent, backgroundColor: lane.palette.accent }}
                    />
                    <div style={styles.title}>{lane.title}</div>
                    <div style={styles.count}>{lane.count}</div>
                    {lane.actions}
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={styles.content}>
              <Scrollbar style={styles.scroll} horizontal={false}>
                <div style={{ ...styles.lanes, gridTemplateColumns: columns, paddingRight: gutter }}>
                  {lanes.map((lane) => (
                    <motion.div
                      key={lane.id}
                      ref={lane.bodyRef}
                      animate={{
                        opacity: lane.dimmed ? 0.35 : 1,
                        border: edge(lane),
                        backgroundColor: fill(lane),
                        borderTop: 'none',
                      }}
                      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                      {...(lane.bodyProps as object)}
                      style={{
                        ...styles.bodyShell,
                        backgroundColor: lane.palette.background,
                        zIndex: lane.raised ? 20 : 1,
                      }}
                    >
                      <div style={styles.cards}>{lane.children}</div>
                    </motion.div>
                  ))}
                </div>
              </Scrollbar>
            </div>
          </div>
        </div>
        {footer}
      </div>
    </LayoutGroup>
  );
};

/** The desktop scroll track's width and a little air: the lanes keep clear of it. */
const SCROLL_GUTTER = 28;

const toLength = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

const useStyles = mkUseStyles((t) => ({
  wrapper: { display: 'flex', flexDirection: 'column', width: '100%', height: '100%', minWidth: 0, minHeight: 0 },
  sideways: { flex: 1, minHeight: 0, minWidth: 0, overflowX: 'auto', overflowY: 'hidden' },
  inner: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 },
  headers: { display: 'grid', gap: t.spacing.m, alignItems: 'start', minWidth: 0, flexShrink: 0 },
  content: { flex: 1, minHeight: 0, minWidth: 0 },
  scroll: { height: '100%', minHeight: 0 },
  lanes: {
    display: 'grid',
    gap: t.spacing.m,
    alignItems: 'start',
    width: '100%',
    minWidth: 0,
    minHeight: '100%',
    boxSizing: 'border-box',
  },
  headerShell: {
    width: '100%',
    minWidth: 0,
    borderRadius: '16px 16px 0 0',
    padding: t.spacing.m,
    boxSizing: 'border-box',
    position: 'relative',
  },
  bodyShell: {
    width: '100%',
    minWidth: 0,
    borderRadius: '0 0 16px 16px',
    padding: t.spacing.m,
    minHeight: 420,
    boxSizing: 'border-box',
    position: 'relative',
  },
  header: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, minHeight: 24 },
  accent: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  title: {
    color: t.colors.white,
    fontWeight: '700',
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  count: {
    color: t.colors.dark05,
    backgroundColor: t.colors.white + t.colorOpacity(0.08),
    padding: `${t.spacing.xs}px ${t.spacing.s}px`,
    borderRadius: 999,
    fontSize: 12,
    flexShrink: 0,
  },
  cards: { display: 'flex', flexDirection: 'column', gap: t.spacing.s, minHeight: 120, width: '100%', minWidth: 0 },
}));
