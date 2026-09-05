// Silent IP-geolocation for the "Вы в Душанбе?" banner — no browser
// permission prompt, unlike navigator.geolocation. Runs server-side rather
// than calling ipapi.co from the browser: keeps the visitor's IP from being
// sent to a third party client-side, and avoids the mixed-content issue of
// most free geo-IP APIs' plain-HTTP endpoints on an HTTPS site.
//
// Mirrors app/data/territories.ts's 7 entries — duplicated rather than
// imported since this list rarely changes and importing from app/ into
// server/ risks pulling in client-only code.
const TERRITORIES = [
  { slug: 'dushanbe', lat: 38.5598, lng: 68.787 },
  { slug: 'khujand', lat: 40.2833, lng: 69.6333 },
  { slug: 'bokhtar', lat: 37.8333, lng: 68.7833 },
  { slug: 'kulyab', lat: 37.9147, lng: 69.7822 },
  { slug: 'pamir', lat: 37.4913, lng: 71.5561 },
  { slug: 'tursunzade', lat: 38.5136, lng: 68.2394 },
  { slug: 'vahdat', lat: 38.5594, lng: 69.0186 },
]

function nearestTerritory(lat: number, lng: number): string {
  const latScale = Math.cos((lat * Math.PI) / 180)
  let nearestSlug = TERRITORIES[0].slug
  let nearestDist = Infinity
  for (const t of TERRITORIES) {
    const dLat = lat - t.lat
    const dLng = (lng - t.lng) * latScale
    const dist = dLat * dLat + dLng * dLng
    if (dist < nearestDist) {
      nearestDist = dist
      nearestSlug = t.slug
    }
  }
  return nearestSlug
}

interface IpApiResponse {
  latitude?: number
  longitude?: number
  country_code?: string
  error?: boolean
}

export default defineEventHandler(async (event): Promise<{ territorySlug: string | null }> => {
  const ip = getRequestIP(event, { xForwardedFor: true })
  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return { territorySlug: null }
  }

  try {
    const geo = await $fetch<IpApiResponse>(`https://ipapi.co/${ip}/json/`)
    if (geo.error || geo.country_code !== 'TJ' || geo.latitude == null || geo.longitude == null) {
      return { territorySlug: null }
    }
    return { territorySlug: nearestTerritory(geo.latitude, geo.longitude) }
  } catch {
    return { territorySlug: null }
  }
})
