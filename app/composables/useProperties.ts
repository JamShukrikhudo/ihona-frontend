import { mockProperties, findPropertyById } from '~/data/mockProperties'
import type { Property, PropertyFilters } from '~/types/property'

interface PropertiesResult {
  properties: Property[]
  usingLiveData: boolean
}

/**
 * Wraps GET /v1/real-estate/properties. The endpoint is auth:sanctum-gated
 * today (no public browse route exists yet on the host), so anonymous
 * visitors always fall back to mockProperties — swap this for a real
 * unauthenticated fetch once the API exposes one. See README.
 */
export async function useProperties(filters: PropertyFilters = {}): Promise<PropertiesResult> {
  const auth = useAuthStore()

  if (auth.isAuthenticated) {
    try {
      const data = await apiFetch<{ data: Property[] }>('/v1/real-estate/properties', {
        query: filters,
      })
      return { properties: data.data, usingLiveData: true }
    } catch {
      // Backend unreachable or not yet implemented — fall through to mock data.
    }
  }

  return { properties: applyFilters(mockProperties, filters), usingLiveData: false }
}

export function usePropertyById(id: number) {
  return computed(() => findPropertyById(id) ?? null)
}

export function useSimilarProperties(property: Property, limit = 3) {
  return mockProperties
    .filter((p) => p.id !== property.id && (p.territorySlug === property.territorySlug || p.propertyType === property.propertyType))
    .slice(0, limit)
}

function applyFilters(properties: Property[], filters: PropertyFilters) {
  return properties.filter((property) => {
    if (filters.territorySlug && property.territorySlug !== filters.territorySlug) return false
    if (filters.propertyType && property.propertyType !== filters.propertyType) return false
    if (filters.minPrice && property.price < filters.minPrice) return false
    if (filters.maxPrice && property.price > filters.maxPrice) return false
    if (filters.hasGenerator && !property.hasGenerator) return false
    if (filters.hasWifi && !property.hasWifi) return false
    return true
  })
}
