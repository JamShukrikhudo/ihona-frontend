import { mockProperties, findPropertyById } from '~/data/mockProperties'
import { findTerritoryBySlug, territories } from '~/data/territories'
import type { Property, PropertyFilters, PropertyTypeValue } from '~/types/property'

interface PropertiesResult {
  properties: Property[]
  usingLiveData: boolean
}

interface ApiProperty {
  id: number
  title: string
  description: string | null
  address: string | null
  territory_code: string | null
  property_type: string
  price: string | number
  currency: string
  bedrooms: number | null
  bathrooms: number | null
  area_sqft: string | number | null
  latitude: number | null
  longitude: number | null
  features: string[] | null
  gallery: { url: string }[]
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=60'

/**
 * Maps the API's real, storefront-facing shape onto the frontend's Property
 * type. The API deliberately has no has_generator/has_wifi/has_parking/
 * mountain_view/altitude/water_source/max_guests — those columns don't
 * exist on real_estate_properties (a known, out-of-scope schema-drift bug —
 * see the host's docs/handoffs). Live-API properties always render those as
 * absent, only mock properties still show them.
 */
function mapApiProperty(api: ApiProperty): Property {
  const territory = api.territory_code ? territories.find((t) => t.code === api.territory_code) : undefined

  return {
    id: api.id,
    title: api.title,
    propertyType: api.property_type as PropertyTypeValue,
    territorySlug: territory?.slug ?? api.territory_code?.toLowerCase() ?? '',
    address: api.address ?? '',
    lat: api.latitude ?? territory?.lat ?? 38.5598,
    lng: api.longitude ?? territory?.lng ?? 68.787,
    price: Number(api.price),
    currency: 'TJS',
    area: Number(api.area_sqft ?? 0),
    rooms: api.bedrooms,
    maxGuests: null,
    altitude: null,
    hasWifi: false,
    hasGenerator: false,
    hasParking: false,
    mountainView: false,
    waterSource: null,
    description: api.description ?? '',
    images: api.gallery.length ? api.gallery.map((g) => g.url) : [PLACEHOLDER_IMAGE],
  }
}

/**
 * Wraps GET /v1/public/properties — real, live, unauthenticated (see
 * real-estate-properties-api's PublicPropertyController). Falls back to
 * mockProperties only if the API is unreachable, not merely because the
 * visitor is anonymous — the endpoint needs no auth at all.
 */
export async function useProperties(filters: PropertyFilters = {}): Promise<PropertiesResult> {
  try {
    const data = await apiFetch<{ data: ApiProperty[] }>('/v1/public/properties', {
      query: {
        territory: filters.territorySlug,
        type: filters.propertyType || undefined,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
      },
    })
    return { properties: data.data.map(mapApiProperty), usingLiveData: true }
  } catch {
    return { properties: applyFilters(mockProperties, filters), usingLiveData: false }
  }
}

export async function usePropertyById(id: number) {
  const { data } = await useAsyncData(`property-${id}`, async () => {
    try {
      const res = await apiFetch<{ data: ApiProperty }>(`/v1/public/properties/${id}`)
      return mapApiProperty(res.data)
    } catch {
      return findPropertyById(id) ?? null
    }
  })

  return data
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
