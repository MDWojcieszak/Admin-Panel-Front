import { CSSProperties, ReactNode } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { mkUseStyles } from '~/utils/theme';

type ScrollbarProps = {
  children: ReactNode;
  style?: CSSProperties;
  /**
   * Grow with the content and only start scrolling past this height. Without
   * it the area needs a fixed height from `style`, which leaves a short list
   * floating in empty space — the wrong default inside a dialog.
   */
  maxHeight?: number | string;
};
export const Scrollbar = ({ children, style, maxHeight }: ScrollbarProps) => {
  const styles = useStyles();
  return (
    <Scrollbars
      style={style}
      autoHeight={maxHeight !== undefined}
      autoHeightMax={maxHeight}
      renderTrackVertical={({ style, ...props }) => <div {...props} style={{ ...style, ...styles.scrollContainer }} />}
      renderThumbVertical={({ style, ...props }) => <div {...props} style={{ ...style, ...styles.scroll }} />}
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
  scroll: {
    backgroundColor: t.colors.gray02,
    borderRadius: t.borderRadius.default,
  },
}));
