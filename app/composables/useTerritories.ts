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
 * {id, team_id, name, code, boundary, metadata} — no slug/lat/lng, since the
 * backend has no geocoding for territories yet. Merge the live id/code onto
 * the static presentation metadata (matched by code) rather than dropping
 * to full mock data — this is real backend data, just missing fields the
 * frontend still owns for now. Display names come from i18n
 * (territoryName(slug, t)), not from the API's single-language `name`.
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
