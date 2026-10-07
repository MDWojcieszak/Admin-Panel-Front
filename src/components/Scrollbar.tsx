import { CSSProperties, ReactNode } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { useIsMobile } from '~/hooks/useBreakpoint';
import { mkUseStyles } from '~/utils/theme';
import '~/components/Scrollbar.css';

type ScrollbarProps = {
  children: ReactNode;
  style?: CSSProperties;
  /**
   * Grow with the content and only start scrolling past this height. Without
   * it the area needs a fixed height from `style`, which leaves a short list
   * floating in empty space — the wrong default inside a dialog.
   */
  maxHeight?: number | string;
  /** False for a column that only ever scrolls down: no sideways track, nothing to drift into. */
  horizontal?: boolean;
};
export const Scrollbar = ({ children, style, maxHeight, horizontal = true }: ScrollbarProps) => {
  const styles = useStyles();
  // Phones overlay a thin indicator, as their own scrollbars do, so content
  // keeps no gutter for a track — pages pad their scroll content on the right
  // for the desktop track, and on a phone that padding was dead space.
  const isMobile = useIsMobile();
  return (
    <Scrollbars
      style={style}
      autoHeight={maxHeight !== undefined}
      autoHeightMax={maxHeight}
      renderTrackVertical={({ style, ...props }) => (
        <div {...props} style={{ ...style, ...(isMobile ? styles.scrollContainerTouch : styles.scrollContainer) }} />
      )}
      renderThumbVertical={({ style, ...props }) => <div {...props} style={{ ...style, ...styles.scroll }} />}
      // Horizontal too: left to the library it fell back to a bar that matched nothing else.
      renderTrackHorizontal={({ style, ...props }) => (
        <div {...props} style={{ ...style, ...(horizontal ? styles.scrollContainerHorizontal : styles.hidden) }} />
      )}
      // Native bars are hidden by the stylesheet, so the margins that pushed them out of sight go.
      renderView={({ style, ...props }) => (
        <div
          {...props}
          className={isMobile ? 'app-scrollbar-view app-scrollbar-view--touch' : 'app-scrollbar-view'}
          style={{
            ...style,
            marginRight: 0,
            marginBottom: 0,
            // With autoHeight the library also grows the view by the native bar's width to make up for
            // those margins; without them the view outgrew its box and always had ~17 px to scroll.
            ...(maxHeight !== undefined ? { minHeight: 0, maxHeight } : {}),
            ...(horizontal ? {} : { overflowX: 'hidden' }),
          }}
        />
      )}
      renderThumbHorizontal={({ style, ...props }) => <div {...props} style={{ ...style, ...styles.scroll }} />}
      // A track with nothing to scroll is just a stripe; show it only when there is.
      hideTracksWhenNotNeeded
    >
      {children}
    </Scrollbars>
  );
};

const useStyles = mkUseStyles((t) => ({
  scrollContainer: {
    right: 0,
    top: 0,
    bottom: 0,
    width: 10,
    cursor: 'pointer',
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.8),
    borderRadius: t.borderRadius.default,
  },
  scrollContainerTouch: {
    right: 1,
    top: 2,
    bottom: 2,
    width: 4,
    borderRadius: 2,
    pointerEvents: 'none',
  },
  scrollContainerHorizontal: {
    left: 0,
    // Clear of the vertical track in the corner.
    right: 12,
    bottom: 0,
    height: 10,
    cursor: 'pointer',
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.8),
    borderRadius: t.borderRadius.default,
  },
  hidden: { display: 'none' },
  scroll: {
    backgroundColor: t.colors.gray02,
    borderRadius: t.borderRadius.default,
  },
}));
