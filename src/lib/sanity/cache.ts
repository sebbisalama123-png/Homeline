/**
 * Cloudflare Cache API wrapper for Sanity fetches.
 *
 * On Cloudflare Workers, `caches.default` is the shared cache storage.
 * On local dev (Node / Vite), `caches` is undefined — we fall through to the
 * live Sanity fetch without caching so the dev loop is unaffected.
 *
 * Cache TTL: 5 minutes (300 s). Sanity's CDN (`useCdn: true`) serves the
 * same data stale-while-revalidating; this layer adds an extra edge hit that
 * never leaves the Cloudflare datacenter.
 */

const CACHE_TTL = 300 // seconds
// Use an internal URL namespace that won't clash with real routes.
const CACHE_ORIGIN = 'https://sanity-edge-cache.internal'

export async function cachedSanityFetch<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  // Use Cloudflare edge cache only when Workers' `caches.default` exists.
  const cacheStorage = (globalThis as { caches?: CacheStorage }).caches
  const edgeCache = (
    cacheStorage as (CacheStorage & { default?: Cache }) | undefined
  )?.default

  // Browser/dev runtimes expose `caches` but not `caches.default`.
  if (
    !edgeCache ||
    typeof edgeCache.match !== 'function' ||
    typeof edgeCache.put !== 'function'
  ) {
    return fetcher()
  }

  const request = new Request(`${CACHE_ORIGIN}/${cacheKey}`)

  const cached = await edgeCache.match(request)
  if (cached) {
    return cached.json() as Promise<T>
  }

  const data = await fetcher()

  // Store a fresh response. We never await this so it doesn't add latency.
  void edgeCache.put(
    request,
    new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}`,
      },
    }),
  )

  return data
}
