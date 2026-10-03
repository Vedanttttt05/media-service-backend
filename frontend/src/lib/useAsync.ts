import { useCallback, useEffect, useState, type DependencyList } from "react";
import { errorMessage } from "../api/client";

interface AsyncState<T> {
  data: T | undefined;
  error: string | null;
  loading: boolean;
  setData: (update: T | ((prev: T | undefined) => T)) => void;
  reload: () => void;
}

/** Runs `load` whenever `deps` change and tracks its result. Stale results are ignored. */
export function useAsync<T>(load: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    load()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { data, error, loading, setData: setData as AsyncState<T>["setData"], reload };
}
