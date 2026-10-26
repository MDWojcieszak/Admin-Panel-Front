import { useContext, useEffect } from 'react';
import { ModalManagerContext } from '~/contexts/ModalManager/ModalManagerContext';
import { useModal } from '~/hooks/useModal';
import { QuickCaptureModal } from '~/routes/Projects/modals/QuickCaptureModal';

/** Typing somewhere: a field, a select, or an editor such as the blog's BlockNote. */
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/**
 * `N` anywhere in the panel opens quick capture, unless you are typing, a
 * modal is already open, or it is part of a shortcut (Ctrl, ⌘, Alt).
 * Returns the opener, for the phone's button: a phone has no keyboard.
 */
export const useQuickCapture = () => {
  const modals = useContext(ModalManagerContext);
  const capture = useModal('quick-capture', QuickCaptureModal, { title: 'Quick capture' });
  const show = capture.show;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'n' && e.key !== 'N') return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || e.defaultPrevented) return;
      if (isTyping(e.target) || modals?.isAnyVisible()) return;
      e.preventDefault();
      show();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // `show` is a fresh function each render; the modal it opens is the same.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modals]);

  return () => show();
};
