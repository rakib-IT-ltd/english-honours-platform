import { useEffect, useState } from 'react';
import { fetchItem } from '../lib/api';

export type ItemState<T> =
  { status: 'idle' } | { status: 'loading' } | { status: 'ok'; data: T } | { status: 'error' };

/** Loads one JSON object from `url`. A null url means "nothing to load" (idle). */
export function useApiItem<T>(url: string | null): ItemState<T> {
  const [state, setState] = useState<{ url: string | null; result: ItemState<T> }>({
    url: null,
    result: { status: 'idle' },
  });

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    fetchItem<T>(url, controller.signal)
      .then((data) => setState({ url, result: { status: 'ok', data } }))
      .catch(() => {
        if (controller.signal.aborted) return;
        setState({ url, result: { status: 'error' } });
      });
    return () => controller.abort();
  }, [url]);

  if (!url) return { status: 'idle' };
  return state.url === url ? state.result : { status: 'loading' };
}
