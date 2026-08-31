import type { UseFetchOptions } from 'nuxt/app'

/**
 * Bearer-token API client for https://ihona.tj/api. Auth: Sanctum personal
 * access tokens issued by POST /v1/auth/token (identity-core-api module —
 * not built on the host yet) — not SPA cookie auth.
 */
export function useApi<T>(path: string, options: UseFetchOptions<T> = {}) {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  return useFetch(path, {
    baseURL: config.public.apiBase,
    ...options,
    headers: {
      Accept: 'application/json',
      ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      ...options.headers,
    },
  })
}

export async function apiFetch<T>(path: string, options: Parameters<typeof $fetch>[1] = {}) {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  return $fetch<T>(path, {
    baseURL: config.public.apiBase,
    ...options,
    headers: {
      Accept: 'application/json',
      ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  })
}
