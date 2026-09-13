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
 * property detail page) it's a plain dot. A point with an `image` additionally
 * shows a cian-style hover-preview card (photo, price, title) above the pin.
 */
const props = withDefaults(
  defineProps<{
    points: {
      id?: number | string
      lat: number
      lng: number
      label?: string
      color?: string
      price?: string
      image?: string
      subtitle?: string
    }[]
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
      // Yandex's branding mark defaults to bottom-left, separate from the
      // "© Яндекс / условия использования" copyright text (bottom-right
      // already). Moving it to join the copyright text is an official,
      // documented option — not hiding anything — so it stays ToS-compliant
      // while matching the single-corner layout cian.ru uses.
      copyrightsPosition: 'bottom right',
      distributionPosition: 'bottom right',
    })
    mapInstance = map
    map.addChild(new YMapDefaultSchemeLayer())
    map.addChild(new YMapDefaultFeaturesLayer())

    for (const point of props.points) {
      const isActive = point.id !== undefined && point.id === props.activeId
      const color = point.color ?? '#2E7D5C'
      // Anchor for the hover card below (position:absolute inside it) —
      // doesn't affect the pin's own map placement, YMapMarker positions
      // this whole element by [lng,lat] regardless of its internal layout.
      const pin = document.createElement('div')
      pin.style.position = 'relative'

      const pinInner = document.createElement('div')
      if (point.price) {
        // cian-style price bubble instead of a plain dot — the price is the
        // one thing worth showing before a click, so show it.
        pinInner.textContent = point.price
        pinInner.style.cssText = `background:${color};color:#fff;font:${isActive ? '700 13px' : '600 12px'} system-ui, sans-serif;padding:${isActive ? '6px 10px' : '4px 8px'};border-radius:999px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.35);cursor:pointer;${isActive ? 'outline:2px solid white;outline-offset:1px;' : ''}`
      } else {
        const size = isActive ? 20 : 14
        pinInner.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:pointer;`
      }
      if (point.label) pinInner.title = point.label
      pin.appendChild(pinInner)

      // cian-style preview card, shown on hover — only built for points that
      // carry enough to show (the single-marker property-detail-page map
      // passes neither image nor price, and stays a plain dot with no
      // card). Lives inside the pin element itself so YMapMarker's own
      // geo-positioning places it for free; known limitation: the map's
      // container clips overflow for its rounded corners, so a pin very
      // near the top edge can have its card clipped rather than flipped
      // below — acceptable for how sparse our maps actually are.
      let card: HTMLDivElement | null = null
      if (point.image) {
        card = document.createElement('div')
        card.style.cssText =
          'position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);width:180px;' +
          'background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.25);' +
          'opacity:0;visibility:hidden;transition:opacity .12s;pointer-events:none;z-index:20;'
        const img = document.createElement('img')
        img.loading = 'lazy'
        img.style.cssText = 'display:block;width:100%;height:110px;object-fit:cover;'
        img.alt = ''
        card.appendChild(img)
        const body = document.createElement('div')
        body.style.cssText = 'padding:8px 10px;'
        if (point.price) {
          const priceEl = document.createElement('div')
          priceEl.textContent = point.price
          priceEl.style.cssText = 'font:700 13px system-ui, sans-serif;color:#0f172a;'
          body.appendChild(priceEl)
        }
        if (point.label) {
          const titleEl = document.createElement('div')
          titleEl.textContent = point.label
          titleEl.style.cssText = 'margin-top:2px;font:12px system-ui, sans-serif;color:#334155;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'
          body.appendChild(titleEl)
        }
        if (point.subtitle) {
          const subtitleEl = document.createElement('div')
          subtitleEl.textContent = point.subtitle
          subtitleEl.style.cssText = 'margin-top:1px;font:11px system-ui, sans-serif;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'
          body.appendChild(subtitleEl)
        }
        card.appendChild(body)
        pin.appendChild(card)

        pin.addEventListener(
          'mouseenter',
          () => {
            // Deferred until first hover so dozens of map pins don't all
            // download their photo up front — most never get hovered.
            if (!img.src) img.src = point.image!
          },
          { once: true },
        )
      }

      pin.addEventListener('mouseenter', () => {
        if (card) {
          card.style.opacity = '1'
          card.style.visibility = 'visible'
        }
        pin.style.zIndex = '30'
      })
      pin.addEventListener('mouseleave', () => {
        if (card) {
          card.style.opacity = '0'
          card.style.visibility = 'hidden'
        }
        pin.style.zIndex = ''
      })

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
