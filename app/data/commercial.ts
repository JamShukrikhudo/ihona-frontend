// Keys mirror the host's Property::COMMERCIAL_SUBTYPES exactly
// (ihona-next/app/Models/Property.php) — keep both in sync. Only
// meaningful when propertyType === 'commercial'.
export type CommercialSubtypeValue =
  | 'office'
  | 'warehouse'
  | 'retail'
  | 'production'
  | 'building'
  | 'free_purpose'
  | 'business'
  | 'commercial_land'
  | 'garage'

// Order matches the /commercial landing page's tile grid (cian-style:
// office/warehouse/retail first — the highest-demand categories).
export const commercialSubtypes: { value: CommercialSubtypeValue; icon: string }[] = [
  { value: 'office', icon: 'office' },
  { value: 'warehouse', icon: 'warehouse' },
  { value: 'retail', icon: 'retail' },
  { value: 'production', icon: 'production' },
  { value: 'building', icon: 'building' },
  { value: 'free_purpose', icon: 'free-purpose' },
  { value: 'business', icon: 'business' },
  { value: 'commercial_land', icon: 'land' },
  { value: 'garage', icon: 'garage' },
]
