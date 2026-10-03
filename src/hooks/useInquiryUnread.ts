import { useCallback, useEffect, useState } from 'react';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';

/** Fired by the inbox after it changes a status, so the badge follows at once. */
export const INQUIRIES_CHANGED = 'inquiries:changed';

export const notifyInquiriesChanged = () => window.dispatchEvent(new Event(INQUIRIES_CHANGED));

const POLL_MS = 60_000;

/**
 * New (unread, not spam) inquiries for the navigation badge: polled once a
 * minute and refreshed whenever the inbox changes something.
 */
export const useInquiryUnread = () => {
  const { inquiriesApi } = useApi();
  const can = useCan();
  const canRead = can('inquiry.read');
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    if (!inquiriesApi || !canRead) return;
    try {
      const { data } = await inquiriesApi.inquiryControllerSummary();
      setCount(data.new);
    } catch {
      // A missed poll just keeps the last count.
    }
  }, [inquiriesApi, canRead]);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, POLL_MS);
    window.addEventListener(INQUIRIES_CHANGED, load);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(INQUIRIES_CHANGED, load);
    };
  }, [load]);

  return canRead ? count : 0;
};
