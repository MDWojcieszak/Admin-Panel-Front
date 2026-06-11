import { RefObject, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdChatBubbleOutline } from 'react-icons/md';
import { mkUseStyles } from '~/utils/theme';

type CommentGutterProps = {
  /** The editor wrap to watch for block hover. */
  containerRef: RefObject<HTMLElement>;
  /** blockId → backend sectionId (covers native blocks too). */
  sectionMap: Record<string, string>;
  onAdd: (sectionId: string) => void;
};

/**
 * A floating "comment" affordance shown to the right of whatever block is hovered — works for ANY
 * block (headings, prose, lists, custom), since native blocks can't carry a per-block button.
 */
export const CommentGutter = ({ containerRef, sectionMap, onAdd }: CommentGutterProps) => {
  const styles = useStyles();
  const [target, setTarget] = useState<{ sectionId: string; top: number; left: number } | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const onMove = (e: MouseEvent) => {
      const content = (e.target as HTMLElement).closest?.('.bn-block-content');
      const blockEl = content?.closest('[data-id]') as HTMLElement | null;
      const sectionId = blockEl ? sectionMap[blockEl.getAttribute('data-id') ?? ''] : undefined;
      if (!sectionId || !blockEl) return;
      clearTimeout(hideTimer.current);
      const r = blockEl.getBoundingClientRect();
      setTarget({ sectionId, top: r.top + 1, left: r.right + 6 });
    };
    const scheduleHide = () => {
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setTarget(null), 250);
    };
    root.addEventListener('mousemove', onMove);
    root.addEventListener('mouseleave', scheduleHide);
    return () => {
      root.removeEventListener('mousemove', onMove);
      root.removeEventListener('mouseleave', scheduleHide);
    };
  }, [containerRef, sectionMap]);

  if (!target) return null;
  return createPortal(
    <button
      style={{ ...styles.btn, top: target.top, left: target.left }}
      type='button'
      title='Comment on this section'
      onMouseEnter={() => clearTimeout(hideTimer.current)}
      onMouseLeave={() => {
        hideTimer.current = setTimeout(() => setTarget(null), 250);
      }}
      onClick={() => {
        onAdd(target.sectionId);
        setTarget(null);
      }}
    >
      <MdChatBubbleOutline size={14} />
    </button>,
    document.body,
  );
};

const useStyles = mkUseStyles((t) => ({
  btn: {
    position: 'fixed',
    width: 26,
    height: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: 0,
    cursor: 'pointer',
    color: '#fff',
    backgroundColor: t.colors.gray02,
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    zIndex: 30,
  },
}));
