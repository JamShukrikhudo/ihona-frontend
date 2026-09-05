<script setup lang="ts">
/**
 * Yandex Maps JS API v3. Loaded client-side only, once per page (the script
 * tag is shared across every PropertyMap instance via a module-level
 * promise). Renders a plain-text placeholder instead of a broken map when
 * NUXT_PUBLIC_YANDEX_MAPS_API_KEY isn't set — get a key at
 * https://developer.tech.yandex.ru/services.
 *
 * One marker per point, no clustering — the ~cian.ru catalog map handles
 * 10,000+ Moscow listings and needs custom canvas rendering for that; our
 * listing count is tens to low hundreds, where plain DOM markers stay cheap
 * and keep click/hover wiring simple. A point with a `price` renders as a
 * cian-style price bubble; without one (e.g. the single-listing map on the
 * property detail page) it's a plain dot.
 */
const props = withDefaults(
  defineProps<{
    points: { id?: number | string; lat: number; lng: number; label?: string; color?: string; price?: string }[]
    centerLat?: number
    centerLng?: number
    zoom?: number
    height?: string
    activeId?: number | string | null
  }>(),
  { zoom: 12, height: '320px', activeId: null },
)

const emit = defineEmits<{
  'marker-click': [id: number | string]
  'marker-hover': [id: number | string]
  'marker-leave': []
  'bounds-change': [bounds: { minLat: number; minLng: number; maxLat: number; maxLng: number }]
}>()

const config = useRuntimeConfig()
const container = ref<HTMLDivElement | null>(null)
const failed = ref(false)

let scriptPromise: Promise<void> | null = null
let mapInstance: any = null

function loadYmaps3(apiKey: string): Promise<void> {
  if ((window as any).ymaps3) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=ru_RU`
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Yandex Maps'))
      document.head.appendChild(script)
    })
  }
  return scriptPromise
}

async function renderMap() {
  const apiKey = config.public.yandexMapsApiKey as string
  if (!apiKey || !container.value || !props.points.length) {
    failed.value = !apiKey
    return
  }

  try {
    await loadYmaps3(apiKey)
    const ymaps3 = (window as any).ymaps3
    await ymaps3.ready

    const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapListener } = ymaps3

    const centerLat = props.centerLat ?? props.points[0].lat
    const centerLng = props.centerLng ?? props.points[0].lng

    // Re-rendering (e.g. the filtered results changed) previously called
    // `new YMap()` on the same container without releasing the old
    // instance — each filter change leaked a map. Destroy first.
    mapInstance?.destroy?.()

    const map = new YMap(container.value, {
      location: { center: [centerLng, centerLat], zoom: props.zoom },
    })
    mapInstance = map
    map.addChild(new YMapDefaultSchemeLayer())
    map.addChild(new YMapDefaultFeaturesLayer())

    for (const point of props.points) {
      const isActive = point.id !== undefined && point.id === props.activeId
      const color = point.color ?? '#2E7D5C'
      const pin = document.createElement('div')
      if (point.price) {
        // cian-style price bubble instead of a plain dot — the price is the
        // one thing worth showing before a click, so show it.
        pin.textContent = point.price
        pin.style.cssText = `background:${color};color:#fff;font:${isActive ? '700 13px' : '600 12px'} system-ui, sans-serif;padding:${isActive ? '6px 10px' : '4px 8px'};border-radius:999px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.35);cursor:pointer;${isActive ? 'outline:2px solid white;outline-offset:1px;' : ''}`
      } else {
        const size = isActive ? 20 : 14
        pin.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:pointer;`
      }
      if (point.label) pin.title = point.label
      if (point.id !== undefined) {
        const id = point.id
        pin.addEventListener('click', () => emit('marker-click', id))
        pin.addEventListener('mouseenter', () => emit('marker-hover', id))
        pin.addEventListener('mouseleave', () => emit('marker-leave'))
      }

      map.addChild(new YMapMarker({ coordinates: [point.lng, point.lat] }, pin))
    }

    // Best-effort "search this area" support — wrapped separately so a
    // failure here (e.g. an API surface change) never takes the whole map
    // down with it; the pins above have already rendered by this point.
    try {
      map.addChild(
        new YMapListener({
          onActionEnd: ({ location }: { location: { center: [number, number]; zoom: number } }) => {
            const bounds = viewportBounds(location.center, location.zoom, container.value)
            if (bounds) emit('bounds-change', bounds)
          },
        }),
      )
    } catch {
      // "search this area" just won't appear — not worth failing the map for.
    }
  } catch {
    failed.value = true
  }
}

/**
 * ymaps3's YMap has no bounds getter and its action-end listener only
 * reports center/zoom, not a viewport rectangle — so this approximates one
 * from the standard Web Mercator tile math (256px tiles), using the
 * container's actual rendered size. Good enough for a "search this area"
 * convenience button; not pixel-exact at the poles, irrelevant at Tajik
 * latitudes.
 */
function viewportBounds(
  center: [number, number],
  zoom: number,
  container: HTMLElement | null,
): { minLat: number; minLng: number; maxLat: number; maxLng: number } | null {
  if (!container) return null
  const [lng, lat] = center
  const worldPx = 256 * 2 ** zoom
  const lngPerPx = 360 / worldPx
  const metersPerPxAtEquator = 40075016.686 / worldPx
  const latPerPx = (metersPerPxAtEquator / 111320) * Math.cos((lat * Math.PI) / 180)
  const lngDelta = (container.clientWidth / 2) * lngPerPx
  const latDelta = (container.clientHeight / 2) * latPerPx
  return { minLat: lat - latDelta, maxLat: lat + latDelta, minLng: lng - lngDelta, maxLng: lng + lngDelta }
}

onMounted(renderMap)
watch(() => props.points, renderMap)
watch(
  () => props.activeId,
  () => renderMap(),
)
onBeforeUnmount(() => mapInstance?.destroy?.())
</script>

<template>
  <div
    v-if="!failed"
    ref="container"
    class="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
    :style="{ height }"
  />
  <div
    v-else
    class="flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
    :style="{ height }"
  >
    <span>🗺️ Карта временно недоступна</span>
    <span v-if="points[0]" class="text-xs">{{ points[0].lat.toFixed(4) }}, {{ points[0].lng.toFixed(4) }}</span>
  </div>
</template>
