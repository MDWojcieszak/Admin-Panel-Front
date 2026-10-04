import { CSSProperties, ReactNode } from 'react';
import Scrollbars from 'react-custom-scrollbars';
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
  return (
    <Scrollbars
      style={style}
      autoHeight={maxHeight !== undefined}
      autoHeightMax={maxHeight}
      renderTrackVertical={({ style, ...props }) => <div {...props} style={{ ...style, ...styles.scrollContainer }} />}
      renderThumbVertical={({ style, ...props }) => <div {...props} style={{ ...style, ...styles.scroll }} />}
      // Horizontal too: left to the library it fell back to a bar that matched nothing else.
      renderTrackHorizontal={({ style, ...props }) => (
        <div {...props} style={{ ...style, ...(horizontal ? styles.scrollContainerHorizontal : styles.hidden) }} />
      )}
      // Native bars are hidden by the stylesheet, so the margins that pushed them out of sight go.
      renderView={({ style, ...props }) => (
        <div
          {...props}
          className='app-scrollbar-view'
          style={{ ...style, marginRight: 0, marginBottom: 0, ...(horizontal ? {} : { overflowX: 'hidden' }) }}
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
