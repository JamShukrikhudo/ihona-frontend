import type { PropertyTypeValue } from '~/data/territories'

export interface Property {
  id: number
  title: string
  propertyType: PropertyTypeValue
  territorySlug: string
  address: string
  lat: number
  lng: number
  price: number
  currency: 'TJS'
  rentPeriod?: 'night' | 'month'
  area: number
  rooms: number | null
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
  minPrice?: number
  maxPrice?: number
  hasGenerator?: boolean
  hasWifi?: boolean
  page?: number
}
