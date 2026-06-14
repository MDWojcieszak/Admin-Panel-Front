import { RefObject, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdChatBubbleOutline } from 'react-icons/md';
import { mkUseStyles } from '~/utils/theme';

type CommentGutterProps = {
  /** The editor wrap, used for bounds + the column probe X. */
  containerRef: RefObject<HTMLElement>;
  /** blockId → backend sectionId (covers native blocks too). */
  sectionMap: Record<string, string>;
  onAdd: (sectionId: string) => void;
};

/**
 * A floating "comment" affordance for whatever block is at the cursor's vertical position — like
 * Notion's hover controls. We probe the editor column at the cursor's Y (not the exact target), so
 * moving sideways toward the button (or into the margin) keeps it visible; it only hides when the
 * cursor leaves the editor area. Works for ANY block (headings, prose, lists, custom).
 */
export const CommentGutter = ({ containerRef, sectionMap, onAdd }: CommentGutterProps) => {
  const styles = useStyles();
  const [target, setTarget] = useState<{ sectionId: string; top: number; left: number } | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const onMove = (e: MouseEvent) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const wrap = root.getBoundingClientRect();
        // Hide only when the cursor is well away from the editor + its right gutter.
        if (
          e.clientY < wrap.top - 60 ||
          e.clientY > wrap.bottom + 60 ||
          e.clientX < wrap.left - 60 ||
          e.clientX > wrap.right + 400
        ) {
          setTarget(null);
          return;
        }
        // Find the commentable block whose vertical span contains the cursor by scanning the mapped
        // blocks directly — robust to content centring/width (an elementFromPoint X-probe missed those).
        // Mapped blocks are top-level (columns content resolves to the columns block, which is mapped).
        let hit: { sectionId: string; r: DOMRect } | null = null;
        for (const id of Object.keys(sectionMap)) {
          const sectionId = sectionMap[id];
          if (!sectionId) continue;
          const el = root.querySelector(`[data-id="${CSS.escape(id)}"]`);
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (e.clientY >= r.top && e.clientY <= r.bottom) {
            hit = { sectionId, r };
            break;
          }
        }
        if (!hit) return; // keep the current target (e.g. cursor in a gap between blocks)
        setTarget({ sectionId: hit.sectionId, top: hit.r.top + 1, left: hit.r.right + 6 });
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
      // Reset the throttle latch: the cancelled frame's callback never runs to clear it, so without this
      // the re-mounted handler (e.g. after a locale-switch reload changes sectionMap) sees a stale
      // non-zero ref and early-returns forever — the hover icon silently dies after a few switches.
      rafRef.current = 0;
    };
  }, [containerRef, sectionMap]);

  if (!target) return null;
  return createPortal(
    <button
      className='blog-gutter-comment'
      style={{ ...styles.btn, top: target.top, left: target.left }}
      type='button'
      title='Comment on this section'
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
    border: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: t.colors.gray01,
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    zIndex: 30,
    transition: 'background-color 0.12s ease',
  },
}));
