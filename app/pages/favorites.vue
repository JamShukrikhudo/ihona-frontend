<script setup lang="ts">
const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

if (!auth.isAuthenticated) {
  await navigateTo({ path: '/account/login', query: { redirect: route.fullPath } })
}

const properties = ref<Awaited<ReturnType<typeof fetchFavorites>>>([])
const loading = ref(true)
const loadError = ref(false)

onMounted(async () => {
  try {
    properties.value = await fetchFavorites()
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
})

useHead({ title: t('favorites.title') })
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('favorites.title') }}</h1>

    <p v-if="loading" class="mt-6 text-sm text-slate-500 dark:text-slate-400">{{ t('favorites.loading') }}</p>
    <p v-else-if="loadError" class="mt-6 text-sm text-red-600">{{ t('favorites.error') }}</p>
    <p v-else-if="!properties.length" class="mt-6 text-sm text-slate-500 dark:text-slate-400">{{ t('favorites.empty') }}</p>
    <div v-else class="mt-6 flex flex-col gap-4">
      <PropertyCard v-for="property in properties" :key="property.id" :property="property" :initial-favorited="true" />
    </div>
  </div>
</template>
