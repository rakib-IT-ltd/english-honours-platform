import { useEffect, useState } from 'react';
import { fetchList } from '../lib/api';

export type ListState<T> =
  { status: 'idle' } | { status: 'loading' } | { status: 'ok'; data: T[] } | { status: 'error' };

/** Loads a JSON array from `url`. A null url means "nothing to load" (idle). */
export function useApiList<T>(url: string | null): ListState<T> {
  const [state, setState] = useState<{ url: string | null; result: ListState<T> }>({
    url: null,
    result: { status: 'idle' },
  });

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    fetchList<T>(url, controller.signal)
      .then((data) => setState({ url, result: { status: 'ok', data } }))
      .catch(() => {
        if (controller.signal.aborted) return;
        setState({ url, result: { status: 'error' } });
      });
    return () => controller.abort();
  }, [url]);

  if (!url) return { status: 'idle' };
  // Results of an earlier url are never shown for the current one.
  return state.url === url ? state.result : { status: 'loading' };
}
