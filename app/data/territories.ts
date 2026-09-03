// Mirrors database/seeders/TerritorySeeder.php on the host (uppercase `code`
// there) — `slug` here is CONTEXT.md's lowercase convention, used in URLs
// and as the query param sent to the API. Display names live in
// i18n/locales/*.json under `territory_names.<slug>` (see territoryName()
// below) rather than on this object, so a territory has exactly one
// translated name per locale instead of a hardcoded Russian one that never
// changed with the site's language switcher.
export interface Territory {
  slug: string
  code: string
  lat: number
  lng: number
}

export const territories: Territory[] = [
  { slug: 'dushanbe', code: 'DUSHANBE', lat: 38.5598, lng: 68.787 },
  { slug: 'khujand', code: 'KHUJAND', lat: 40.2833, lng: 69.6333 },
  { slug: 'bokhtar', code: 'BOKHTAR', lat: 37.8333, lng: 68.7833 },
  { slug: 'kulyab', code: 'KULYAB', lat: 37.9147, lng: 69.7822 },
  { slug: 'pamir', code: 'PAMIR', lat: 37.4913, lng: 71.5561 },
  { slug: 'tursunzade', code: 'TURSUNZADE', lat: 38.5136, lng: 68.2394 },
  { slug: 'vahdat', code: 'VAHDAT', lat: 38.5594, lng: 69.0186 },
]

export function findTerritoryBySlug(slug: string): Territory | undefined {
  return territories.find((t) => t.slug === slug)
}

// Takes `t` as a parameter (same pattern as formatPublishedAgo) rather than
// calling useI18n() itself — this file is plain data/utility code, not a
// composable, and gets imported from places without an active Vue setup
// context (e.g. nuxt.config.ts's sitemap urls()).
export function territoryName(slug: string | undefined, t: (key: string) => string): string {
  if (!slug) return ''
  return t(`territory_names.${slug}`)
}

export type PropertyTypeValue = 'apartment' | 'house' | 'land' | 'cottage' | 'commercial' | 'guesthouse' | 'hostel'
export type DealTypeValue = 'sale' | 'rent'

// Business priority (see CONTEXT.md + product direction): city housing —
// buy or rent a flat, house, land, cottage, commercial premises — comes
// first. Tourism (guesthouse/hostel, always nightly) is a second, smaller
// section, not mixed into the primary Купить/Снять nav. Labels live in
// i18n under `property_type.<value>` — see propertyTypeLabel().
export const cityPropertyTypes: { value: PropertyTypeValue; icon: string }[] = [
  { value: 'apartment', icon: '🏢' },
  { value: 'house', icon: '🏠' },
  { value: 'land', icon: '🗺️' },
  { value: 'cottage', icon: '🌲' },
  { value: 'commercial', icon: '🏬' },
]

export const tourismPropertyTypes: { value: PropertyTypeValue; icon: string }[] = [
  { value: 'guesthouse', icon: '🏡' },
  { value: 'hostel', icon: '🛏️' },
]

export const propertyTypes = [...cityPropertyTypes, ...tourismPropertyTypes]

export const dealTypes: { value: DealTypeValue }[] = [{ value: 'sale' }, { value: 'rent' }]

export function propertyTypeLabel(value: string, t: (key: string) => string): string {
  return t(`property_type.${value}`)
}

export function isTourismType(value: string): boolean {
  return tourismPropertyTypes.some((t) => t.value === value)
}

// Branded flat-illustration fallback for a listing with no real photos yet
// (all live listings, currently — see docs/handoffs on the empty gallery
// column). One per property type, recoloured to the site's brand green.
export function placeholderImage(type: string): string {
  return `/images/placeholders/${type}-placeholder.svg`
}
