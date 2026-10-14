<script setup lang="ts">
import { territoryName } from '~/data/territories'
import { Button } from '~/components/ui/button'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()

const STORAGE_KEY = 'ihona_geo_banner_dismissed'
const detectedSlug = ref<string | null>(null)

onMounted(async () => {
  if (localStorage.getItem(STORAGE_KEY)) return

  let slug: string | null = null
  try {
    const res = await $fetch<{ territorySlug: string | null }>('/geo-city')
    slug = res.territorySlug
  } catch {
    return
  }
  if (!slug) return

  // Don't nag if they're already looking at that territory's listings.
  if (route.query.territory === slug || route.path.includes(`/territories/${slug}`)) return

  detectedSlug.value = slug
})

function dismiss() {
  detectedSlug.value = null
  if (import.meta.client) localStorage.setItem(STORAGE_KEY, '1')
}

function confirmCity() {
  const slug = detectedSlug.value
  dismiss()
  if (slug) router.push(localePath(`/territories/${slug}`))
}
</script>

<template>
  <div
    v-if="detectedSlug"
    class="flex flex-wrap items-center justify-center gap-3 bg-brand-50 px-4 py-2.5 text-center text-sm text-brand-800 dark:bg-brand-900/30 dark:text-brand-200"
  >
    <span>{{ t('geo.banner_question', { city: territoryName(detectedSlug, t) }) }}</span>
    <div class="flex items-center gap-2">
      <Button size="sm" class="bg-brand-600 text-white hover:bg-brand-700" @click="confirmCity">
        {{ t('geo.yes') }}
      </Button>
      <Button
        size="sm"
        variant="outline"
        class="border-brand-300 text-brand-700 hover:bg-brand-100 dark:border-brand-700 dark:text-brand-200 dark:hover:bg-brand-900/50"
        @click="dismiss"
      >
        {{ t('geo.change_city') }}
      </Button>
    </div>
  </div>
</template>
