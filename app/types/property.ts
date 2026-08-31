import type { DealTypeValue, PropertyTypeValue } from '~/data/territories'

export interface Property {
  id: number
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
  waterSource: 'mains' | 'well' | 'spring' | 'delivered' | null
  description: string
  images: string[]
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
