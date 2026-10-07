import { useSyncExternalStore } from 'react';

/**
 * Below this the panel switches to its phone layout: the sidebar becomes a
 * drawer behind a top bar, dialogs become bottom sheets and side panels take
 * the whole screen. One breakpoint on purpose — pages that need a middle step
 * (two columns that only fit on a laptop) use their own container widths.
 */
export const MOBILE_MAX_WIDTH = 767;
export const MOBILE_QUERY = `(max-width: ${MOBILE_MAX_WIDTH}px)`;

// One subscriber per query, so useSyncExternalStore does not resubscribe on every render.
const subscribers = new Map<string, (onChange: () => void) => () => void>();

const subscribe = (query: string) => {
  let fn = subscribers.get(query);
  if (!fn) {
    fn = (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    };
    subscribers.set(query, fn);
  }
  return fn;
};

/** Live result of a media query; re-renders when it flips (rotation, resize). */
export const useMediaQuery = (query: string) =>
  useSyncExternalStore(subscribe(query), () => window.matchMedia(query).matches);

export const useIsMobile = () => useMediaQuery(MOBILE_QUERY);
