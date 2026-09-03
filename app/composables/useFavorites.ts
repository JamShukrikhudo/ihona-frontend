import { placeholderImage } from '~/data/territories'
import type { Property } from '~/types/property'

interface FavoriteToggleResponse {
  favorited: boolean
}

interface ApiFavoriteProperty {
  id: number
  reference: string
  title: string
  description: string | null
  address: string | null
  property_type: string
  deal_type: string | null
  price: string | number
  currency: string
  bedrooms: number | null
  bathrooms: number | null
  area_sqft: string | number | null
  latitude: number | null
  longitude: number | null
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

const NIGHTLY_TYPES = ['guesthouse', 'hostel', 'hunting-lodge']

/**
 * POST /v1/real-estate/properties/:id/favorite toggles; the authenticated-
 * only GET /v1/real-estate/properties/favorites list uses the full
 * PropertyResource (no territory_code, unlike PublicPropertyResource), so
 * favorited properties render without a territory name — acceptable for a
 * "your saved properties" list where the title/address already identify
 * the place.
 */
export async function toggleFavorite(propertyId: number): Promise<boolean> {
  const res = await apiFetch<FavoriteToggleResponse>(`/v1/real-estate/properties/${propertyId}/favorite`, {
    method: 'POST',
  })
  return res.favorited
}

export async function fetchFavorites(): Promise<Property[]> {
  const res = await apiFetch<{ data: ApiFavoriteProperty[] }>('/v1/real-estate/properties/favorites')
  return res.data.map((api) => ({
    id: api.id,
    reference: api.reference,
    title: api.title,
    propertyType: api.property_type as Property['propertyType'],
    dealType: (api.deal_type as Property['dealType']) ?? 'sale',
    rentPeriod: api.deal_type === 'rent' ? (NIGHTLY_TYPES.includes(api.property_type) ? 'night' : 'month') : undefined,
    territorySlug: '',
    address: api.address ?? '',
    lat: api.latitude ?? 38.5598,
    lng: api.longitude ?? 68.787,
    price: Number(api.price),
    currency: 'TJS',
    area: Number(api.area_sqft ?? 0),
    rooms: api.bedrooms,
    bathrooms: api.bathrooms,
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
  }))
}
