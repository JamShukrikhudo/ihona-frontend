// Mirrors database/seeders/TerritorySeeder.php on the host (uppercase `code`
// there) — `slug` here is CONTEXT.md's lowercase convention, used in URLs
// and as the query param sent to the API.
export interface Territory {
  slug: string
  code: string
  name: string
  nameRu: string
  lat: number
  lng: number
}

export const territories: Territory[] = [
  { slug: 'dushanbe', code: 'DUSHANBE', name: 'Dushanbe', nameRu: 'Душанбе', lat: 38.5598, lng: 68.787 },
  { slug: 'khujand', code: 'KHUJAND', name: 'Khujand', nameRu: 'Худжанд', lat: 40.2833, lng: 69.6333 },
  { slug: 'bokhtar', code: 'BOKHTAR', name: 'Bokhtar', nameRu: 'Бохтар', lat: 37.8333, lng: 68.7833 },
  { slug: 'kulyab', code: 'KULYAB', name: 'Kulyab', nameRu: 'Куляб', lat: 37.9147, lng: 69.7822 },
  { slug: 'pamir', code: 'PAMIR', name: 'Pamir / GBAO', nameRu: 'Памир (ГБАО)', lat: 37.4913, lng: 71.5561 },
  { slug: 'tursunzade', code: 'TURSUNZADE', name: 'Tursunzade', nameRu: 'Турсунзаде', lat: 38.5136, lng: 68.2394 },
  { slug: 'vahdat', code: 'VAHDAT', name: 'Vahdat', nameRu: 'Вахдат', lat: 38.5594, lng: 69.0186 },
]

export function findTerritoryBySlug(slug: string): Territory | undefined {
  return territories.find((t) => t.slug === slug)
}

export type PropertyTypeValue = 'apartment' | 'house' | 'guesthouse' | 'hostel' | 'land' | 'commercial' | 'cottage'

export const propertyTypes: { value: PropertyTypeValue; label: string; icon: string }[] = [
  { value: 'apartment', label: 'Квартира', icon: '🏢' },
  { value: 'house', label: 'Дом', icon: '🏠' },
  { value: 'guesthouse', label: 'Гостевой дом', icon: '🏡' },
  { value: 'hostel', label: 'Хостел', icon: '🛏️' },
  { value: 'land', label: 'Участок', icon: '🗺️' },
  { value: 'commercial', label: 'Коммерческая', icon: '🏬' },
  { value: 'cottage', label: 'Коттедж', icon: '🌲' },
]

export function propertyTypeLabel(value: string): string {
  return propertyTypes.find((t) => t.value === value)?.label ?? value
}
