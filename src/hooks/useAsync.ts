import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';

type UseAsyncState<T> = {
  data?: T;
  loading: boolean;
  error?: unknown;
};

type UseAsyncResult<T, TParams extends any[]> = UseAsyncState<T> & {
  reload: (...params: TParams) => Promise<T | undefined>;
  setData: React.Dispatch<React.SetStateAction<T | undefined>>;
};

export const useAsync = <T, TParams extends any[] = []>(
  asyncFn: (...params: TParams) => Promise<T | undefined>,
  deps: DependencyList = [],
  options?: {
    immediate?: boolean;
    clearOnReload?: boolean;
  },
): UseAsyncResult<T, TParams> => {
  const { immediate = true, clearOnReload = false } = options || {};

  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(undefined);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...params: TParams): Promise<T | undefined> => {
    if (clearOnReload) {
      setData(undefined);
    }

    setLoading(true);
    setError(undefined);

    try {
      const result = await asyncFn(...params);

      if (!mountedRef.current) return undefined;

      if (result !== undefined) {
        setData(result);
      }

      return result;
    } catch (err) {
      if (!mountedRef.current) return undefined;

      setError(err);
      return undefined;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, deps);

  useEffect(() => {
    if (!immediate) return;
    execute(...([] as unknown as TParams));
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    reload: execute,
    setData,
  };
};
