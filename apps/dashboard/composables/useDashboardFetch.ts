/**
 * SSR-safe fetch that forwards the browser session cookie to Nitro API routes.
 */
export function useDashboardFetch() {
  return useRequestFetch();
}
