import { ReactNode } from 'react';
import { Scrollbar } from '~/components/Scrollbar';
import { mkUseStyles } from '~/utils/theme';

/**
 * A side panel's content, scrolling in the app's own scrollbar. The side
 * panel gives its body a fixed height but does not scroll it; a long panel
 * (settings, a task with its comments) ran off the bottom without this.
 */
export const PanelScroll = ({ children }: { children: ReactNode }) => {
  const styles = useStyles();
  return (
    <Scrollbar style={styles.scroll} horizontal={false}>
      {/* Room for the desktop track; on a phone Scrollbar zeroes this child's padding itself. */}
      <div style={styles.gutter}>{children}</div>
    </Scrollbar>
  );
};

const useStyles = mkUseStyles(() => ({
  scroll: { height: '100%' },
  gutter: { paddingRight: 14 },
}));
