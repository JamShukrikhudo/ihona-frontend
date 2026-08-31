import { territories, findTerritoryBySlug } from '~/data/territories'
import type { Territory } from '~/data/territories'

/**
 * Wraps GET /v1/real-estate/territories (also auth:sanctum-gated today).
 * Falls back to the static list mirroring TerritorySeeder — that list rarely
 * changes, so this is a reasonable permanent fallback, not just a stopgap.
 */
export async function useTerritories(): Promise<Territory[]> {
  const auth = useAuthStore()

  if (auth.isAuthenticated) {
    try {
      const data = await apiFetch<{ data: Territory[] }>('/v1/real-estate/territories')
      if (data.data?.length) return data.data
    } catch {
      // fall through
    }
  }

  return territories
}

export function useTerritoryBySlug(slug: string) {
  return computed(() => findTerritoryBySlug(slug) ?? null)
}
