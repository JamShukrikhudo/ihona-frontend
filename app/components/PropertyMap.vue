<script setup lang="ts">
/**
 * Yandex Maps JS API v3. Loaded client-side only, once per page (the script
 * tag is shared across every PropertyMap instance via a module-level
 * promise). Renders a plain-text placeholder instead of a broken map when
 * NUXT_PUBLIC_YANDEX_MAPS_API_KEY isn't set — get a key at
 * https://developer.tech.yandex.ru/services.
 *
 * Clustering (@yandex/ymaps3-clusterer) is not wired up yet — this renders
 * one marker per point, which is fine for now but should switch to a
 * clusterer once a real listing count makes that necessary.
 */
const props = withDefaults(
  defineProps<{
    points: { lat: number; lng: number; label?: string; color?: string }[]
    centerLat?: number
    centerLng?: number
    zoom?: number
    height?: string
  }>(),
  { zoom: 12, height: '320px' },
)

const config = useRuntimeConfig()
const container = ref<HTMLDivElement | null>(null)
const failed = ref(false)

let scriptPromise: Promise<void> | null = null

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

    const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = ymaps3

    const centerLat = props.centerLat ?? props.points[0].lat
    const centerLng = props.centerLng ?? props.points[0].lng

    const map = new YMap(container.value, {
      location: { center: [centerLng, centerLat], zoom: props.zoom },
    })
    map.addChild(new YMapDefaultSchemeLayer())
    map.addChild(new YMapDefaultFeaturesLayer())

    for (const point of props.points) {
      const pin = document.createElement('div')
      pin.style.cssText = `width:14px;height:14px;border-radius:50%;background:${point.color ?? '#0f8a4c'};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4);`
      if (point.label) pin.title = point.label

      map.addChild(new YMapMarker({ coordinates: [point.lng, point.lat] }, pin))
    }
  } catch {
    failed.value = true
  }
}

onMounted(renderMap)
watch(() => props.points, renderMap)
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
