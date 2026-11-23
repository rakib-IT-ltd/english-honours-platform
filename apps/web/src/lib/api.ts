/**
 * Base URL of the backend API as seen from the browser. When it is not set (for example in the
 * static GitHub Pages preview, which has no backend) the website runs in "not connected" mode and
 * makes no requests.
 */
export function getApiBaseUrl(): string | null {
  const value = process.env['NEXT_PUBLIC_API_BASE_URL'];
  return value ? value.replace(/\/+$/, '') : null;
}

/** Builds `<base>/<path>?<query>`, skipping empty query values. */
export function buildApiUrl(
  base: string,
  path: string,
  query: Record<string, string> = {},
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return `${base}/${path.replace(/^\/+/, '')}${qs ? `?${qs}` : ''}`;
}

export async function fetchList<T>(url: string, signal?: AbortSignal): Promise<T[]> {
  const response = await fetch(url, signal ? { signal } : undefined);
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  const body: unknown = await response.json();
  if (!Array.isArray(body)) throw new Error('Unexpected response shape');
  return body as T[];
}

export async function fetchItem<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, signal ? { signal } : undefined);
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  return (await response.json()) as T;
}
