import { mockProperties, findPropertyById } from '~/data/mockProperties'
import { findTerritoryBySlug, placeholderImage, territories } from '~/data/territories'
import type { Property, PropertyFilters, PropertyTypeValue } from '~/types/property'

interface PropertiesResult {
  properties: Property[]
  usingLiveData: boolean
  meta: { currentPage: number; lastPage: number; total: number }
}

interface ApiPaginationMeta {
  current_page: number
  last_page: number
  total: number
}

const SINGLE_PAGE_META = { currentPage: 1, lastPage: 1, total: 0 }

interface ApiProperty {
  id: number
  reference: string
  title: string
  description: string | null
  address: string | null
  territory_code: string | null
  property_type: string
  deal_type: string | null
  price: string | number
  currency: string
  price_usd: number | null
  bedrooms: number | null
  bathrooms: number | null
  floor: number | null
  total_floors: number | null
  area_sqft: string | number | null
  latitude: number | null
  longitude: number | null
  features: string[] | null
  has_generator: boolean
  has_wifi: boolean
  has_parking: boolean
  mountain_view: string | null
  altitude: number | null
  water_source: string | null
  max_guests: number | null
  views_count: number
  published_at: string | null
  gallery: { url: string }[]
}

// Tourism types always price nightly rather than monthly — used both for
// rentPeriod below and could grow to gate other nightly-only UI later.
const NIGHTLY_TYPES = ['guesthouse', 'hostel', 'hunting-lodge']

/** Maps the API's real, storefront-facing shape onto the frontend's Property type. */
function mapApiProperty(api: ApiProperty): Property {
  const territory = api.territory_code ? territories.find((t) => t.code === api.territory_code) : undefined

  return {
    id: api.id,
    reference: api.reference,
    title: api.title,
    propertyType: api.property_type as PropertyTypeValue,
    dealType: (api.deal_type as Property['dealType']) ?? 'sale',
    rentPeriod: api.deal_type === 'rent' ? (NIGHTLY_TYPES.includes(api.property_type) ? 'night' : 'month') : undefined,
    territorySlug: territory?.slug ?? api.territory_code?.toLowerCase() ?? '',
    address: api.address ?? '',
    lat: api.latitude ?? territory?.lat ?? 38.5598,
    lng: api.longitude ?? territory?.lng ?? 68.787,
    price: Number(api.price),
    currency: 'TJS',
    priceUsd: api.price_usd,
    area: Number(api.area_sqft ?? 0),
    rooms: api.bedrooms,
    bathrooms: api.bathrooms,
    floor: api.floor,
    totalFloors: api.total_floors,
    // No ceiling_height column on properties — mock data only.
    ceilingHeight: null,
    maxGuests: api.max_guests,
    altitude: api.altitude,
    hasWifi: api.has_wifi,
    hasGenerator: api.has_generator,
    hasParking: api.has_parking,
    mountainView: api.mountain_view !== null,
    waterSource: api.water_source as Property['waterSource'],
    description: api.description ?? '',
    images: api.gallery.length ? api.gallery.map((g) => g.url) : [placeholderImage(api.property_type)],
    publishedAt: api.published_at,
    viewsCount: api.views_count,
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
    const data = await apiFetch<{ data: ApiProperty[]; meta: ApiPaginationMeta }>('/v1/public/properties', {
      query: {
        territory: filters.territorySlug,
        type: filters.propertyType || undefined,
        deal_type: filters.dealType || undefined,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        rooms: filters.rooms?.length ? filters.rooms.join(',') : undefined,
        sort: filters.sort,
        page: filters.page,
        bbox: filters.bbox
          ? [filters.bbox.minLng, filters.bbox.minLat, filters.bbox.maxLng, filters.bbox.maxLat].join(',')
          : undefined,
      },
    })
    return {
      properties: data.data.map(mapApiProperty),
      usingLiveData: true,
      meta: { currentPage: data.meta.current_page, lastPage: data.meta.last_page, total: data.meta.total },
    }
  } catch {
    const properties = sortProperties(applyFilters(mockProperties, filters), filters.sort)
    return { properties, usingLiveData: false, meta: { ...SINGLE_PAGE_META, total: properties.length } }
  }
}

/**
 * Fetches every live listing (paging through the API's page_size=60 cap in
 * parallel once the first page reveals last_page) so the catalog page can
 * filter instantly on the client — cian's setFilter()-style "no request per
 * filter change" pattern, adapted to our own map/list stack rather than
 * ymaps' v2.1-only ObjectManager. Only sane at our actual scale (tens to
 * low hundreds of listings, not cian's own 10,000+); falls back to
 * mockProperties, matching useProperties()'s existing behaviour.
 */
export async function useAllProperties(): Promise<{ properties: Property[]; usingLiveData: boolean }> {
  try {
    const pageSize = 60
    const first = await apiFetch<{ data: ApiProperty[]; meta: ApiPaginationMeta }>('/v1/public/properties', {
      query: { page: 1, page_size: pageSize },
    })
    const all = [...first.data]
    if (first.meta.last_page > 1) {
      const rest = await Promise.all(
        Array.from({ length: first.meta.last_page - 1 }, (_, i) =>
          apiFetch<{ data: ApiProperty[] }>('/v1/public/properties', { query: { page: i + 2, page_size: pageSize } }),
        ),
      )
      for (const page of rest) all.push(...page.data)
    }
    return { properties: all.map(mapApiProperty), usingLiveData: true }
  } catch {
    return { properties: mockProperties, usingLiveData: false }
  }
}

export function sortProperties(properties: Property[], sort?: PropertyFilters['sort']): Property[] {
  const sorted = [...properties]
  switch (sort) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'area_desc':
      return sorted.sort((a, b) => b.area - a.area)
    default:
      return sorted
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

/**
 * Was mock-only regardless of whether the main property came from the live
 * API — inconsistent on a real property page. Now queries the same
 * territory live and falls back to the mock list only when that comes back
 * empty (e.g. the main property itself is a mock one, or the API's down).
 */
export async function useSimilarProperties(property: Property, limit = 3): Promise<Property[]> {
  try {
    const { properties, usingLiveData } = await useProperties({ territorySlug: property.territorySlug })
    if (usingLiveData) {
      const matches = properties.filter((p) => p.id !== property.id)
      if (matches.length) return matches.slice(0, limit)
    }
  } catch {
    // fall through
  }

  return mockProperties
    .filter((p) => p.id !== property.id && (p.territorySlug === property.territorySlug || p.propertyType === property.propertyType))
    .slice(0, limit)
}

export function applyFilters(properties: Property[], filters: PropertyFilters) {
  return properties.filter((property) => {
    if (filters.territorySlug && property.territorySlug !== filters.territorySlug) return false
    if (filters.propertyType && property.propertyType !== filters.propertyType) return false
    if (filters.dealType && property.dealType !== filters.dealType) return false
    if (filters.rooms?.length) {
      const rooms = property.rooms ?? 0
      const matches = filters.rooms.some((r) => (r >= 5 ? rooms >= 5 : rooms === r))
      if (!matches) return false
    }
    if (filters.minPrice && property.price < filters.minPrice) return false
    if (filters.maxPrice && property.price > filters.maxPrice) return false
    if (filters.hasGenerator && !property.hasGenerator) return false
    if (filters.hasWifi && !property.hasWifi) return false
    // "Search this area": everything's already loaded client-side, so the
    // map's reported viewport is just one more local predicate — no request
    // to the backend's bbox param needed here.
    if (filters.bbox) {
      const { minLat, maxLat, minLng, maxLng } = filters.bbox
      if (property.lat < minLat || property.lat > maxLat || property.lng < minLng || property.lng > maxLng) return false
    }
    return true
  })
}
