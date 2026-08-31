import { territories, findTerritoryBySlug } from '~/data/territories'
import type { Territory } from '~/data/territories'

interface ApiTerritory {
  id: number
  team_id: number
  name: string
  code: string
}

/**
 * Wraps GET /v1/public/territories (anonymous, real — see
 * real-estate-core-api's PublicTerritoryController). The API only carries
 * {id, team_id, name, code, boundary, metadata} — no slug/nameRu/lat/lng,
 * since the backend has no per-locale names or geocoding for territories
 * yet. Merge the live id/name/code onto the static presentation metadata
 * (matched by code) rather than dropping to full mock data — this is real
 * backend data, just missing fields the frontend still owns for now.
 */
export async function useTerritories(): Promise<Territory[]> {
  try {
    const data = await apiFetch<{ data: ApiTerritory[] }>('/v1/public/territories')
    if (data.data?.length) {
      return data.data.map((apiTerritory) => {
        const local = territories.find((t) => t.code === apiTerritory.code)
        return {
          slug: local?.slug ?? apiTerritory.code.toLowerCase(),
          code: apiTerritory.code,
          name: local?.name ?? apiTerritory.name,
          nameRu: local?.nameRu ?? apiTerritory.name,
          lat: local?.lat ?? 38.5598,
          lng: local?.lng ?? 68.787,
        }
      })
    }
  } catch {
    // API unreachable — fall through to the static list.
  }

  return territories
}

export function useTerritoryBySlug(slug: string) {
  return computed(() => findTerritoryBySlug(slug) ?? null)
}
