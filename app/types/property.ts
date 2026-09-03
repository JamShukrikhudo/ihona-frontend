import type { DealTypeValue, PropertyTypeValue } from '~/data/territories'

export interface Property {
  id: number
  /** Human-readable listing number ("IH-2026-00015") — see Property::reference() on the host. */
  reference: string
  title: string
  propertyType: PropertyTypeValue
  dealType: DealTypeValue
  territorySlug: string
  address: string
  lat: number
  lng: number
  price: number
  currency: 'TJS'
  rentPeriod?: 'night' | 'month'
  area: number
  rooms: number | null
  bathrooms: number | null
  maxGuests: number | null
  altitude: number | null
  hasWifi: boolean
  hasGenerator: boolean
  hasParking: boolean
  mountainView: boolean
  // mains/delivered: mock data only. well/river/spring/other match the
  // Filament PropertyResource's actual water_source Select options — the
  // set live listings can carry.
  waterSource: 'mains' | 'well' | 'river' | 'spring' | 'delivered' | 'other' | null
  description: string
  images: string[]
  /** ISO 8601, from the API's published_at — null for mock data. */
  publishedAt: string | null
  /**
   * Deduped per-visitor-per-day on the backend (see
   * Property::recordView()) — only incremented by loading the property's
   * own detail page, not by appearing in a list. 0 for mock data.
   */
  viewsCount: number
}

export interface PropertyFilters {
  territorySlug?: string
  propertyType?: PropertyTypeValue | ''
  dealType?: DealTypeValue | ''
  minPrice?: number
  maxPrice?: number
  /** Discrete room-count chips (cian-style): 1/2/3/4/5, 5 meaning "5+". */
  rooms?: number[]
  hasGenerator?: boolean
  hasWifi?: boolean
  page?: number
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'area_desc'
}
