import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * One query parameter as state, for things a link should be able to reopen —
 * an open card, its tab. Writes replace the history entry, so opening and
 * closing cards does not fill the Back button.
 */
export const useUrlParams = <K extends string>(keys: readonly K[]) => {
  const [params, setParams] = useSearchParams();

  const values = Object.fromEntries(keys.map((key) => [key, params.get(key) ?? undefined])) as Record<
    K,
    string | undefined
  >;

  const set = useCallback(
    (next: Partial<Record<K, string | null | undefined>>) => {
      setParams(
        () => {
          // From the live address rather than the hook's snapshot: modal
          // callbacks are captured once and would otherwise write back stale
          // values.
          const updated = new URLSearchParams(window.location.search);
          Object.entries(next).forEach(([key, value]) => {
            if (value) updated.set(key, value as string);
            else updated.delete(key);
          });
          return updated;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return [values, set] as const;
};
