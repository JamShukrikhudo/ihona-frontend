import type { DealTypeValue, PropertyTypeValue } from '~/data/territories'
import type { CommercialSubtypeValue } from '~/data/commercial'

export interface Property {
  id: number
  /** Human-readable listing number ("IH-2026-00015") — see Property::reference() on the host. */
  reference: string
  title: string
  propertyType: PropertyTypeValue
  /** Only set when propertyType === 'commercial'; absent on mock data. */
  commercialSubtype?: CommercialSubtypeValue | null
  dealType: DealTypeValue
  territorySlug: string
  address: string
  lat: number
  lng: number
  price: number
  currency: 'TJS'
  /** Live-converted USD equivalent (see currency-context's OpenExchangeRateApiProvider on the host) — null if the rate was unreachable. */
  priceUsd: number | null
  rentPeriod?: 'night' | 'month'
  area: number
  /** Only meaningful together with `area` — land plots are quoted in sotka/hectare locally, not always m². */
  areaUnit: 'sqm' | 'sotka' | 'hectare'
  rooms: number | null
  bathrooms: number | null
  /** Apartment-only. */
  floor: number | null
  totalFloors: number | null
  /** Apartment-only, mock data only — no `ceiling_height` column on the host yet. */
  ceilingHeight: number | null
  maxGuests: number | null
  altitude: number | null
  hasWifi: boolean
  hasGenerator: boolean
  hasParking: boolean
  mountainView: boolean
  waterSource: 'mains' | 'well' | 'river' | 'spring' | 'arik' | 'delivered' | 'other' | null
  // Land-plot-only fields — null/false for every other property type.
  electricityStatus: 'on_site' | 'nearby' | 'none' | null
  electricityDistanceM: number | null
  hasGas: boolean
  sewage: 'central' | 'septic' | 'none' | null
  roadAccess: 'paved' | 'dirt' | 'none' | null
  roadSeasonal: boolean
  terrain: 'flat' | 'slope' | 'terraced' | null
  fenced: boolean
  landCategory: 'residential' | 'agricultural' | 'commercial' | 'garden' | null
  /** Descriptive only, not a legal determination — see the admin form's own comment on this field. */
  tenureType: 'use_right' | 'long_term_lease' | 'building_right' | null
  cadastralNumber: string | null
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
  commercialSubtype?: CommercialSubtypeValue | ''
  dealType?: DealTypeValue | ''
  minPrice?: number
  maxPrice?: number
  /** Discrete room-count chips (cian-style): 1/2/3/4/5, 5 meaning "5+". */
  rooms?: number[]
  hasGenerator?: boolean
  hasWifi?: boolean
  page?: number
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'area_desc'
  /** Map viewport rectangle for the "search this area" flow (cian-style). */
  bbox?: { minLat: number; minLng: number; maxLat: number; maxLng: number }
}
