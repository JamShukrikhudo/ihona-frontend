import type { Property } from '~/types/property'

interface FavoriteToggleResponse {
  favorited: boolean
}

interface ApiFavoriteProperty {
  id: number
  title: string
  description: string | null
  address: string | null
  property_type: string
  price: string | number
  currency: string
  bedrooms: number | null
  area_sqft: string | number | null
  latitude: number | null
  longitude: number | null
  gallery: { url: string }[]
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=60'

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
    title: api.title,
    propertyType: api.property_type as Property['propertyType'],
    territorySlug: '',
    address: api.address ?? '',
    lat: api.latitude ?? 38.5598,
    lng: api.longitude ?? 68.787,
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
  }))
}
