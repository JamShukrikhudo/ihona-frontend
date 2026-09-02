<script setup lang="ts">
const auth = useAuthStore()
const { t } = useI18n()
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
    <div class="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
      <NuxtLink to="/" class="flex items-center">
        <AppLogo class="h-11" />
      </NuxtLink>

      <nav class="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
        <NuxtLink :to="{ path: '/properties', query: { deal: 'sale' } }" class="hover:text-brand-700 dark:hover:text-brand-400">{{ t('nav.buy') }}</NuxtLink>
        <NuxtLink :to="{ path: '/properties', query: { deal: 'rent' } }" class="hover:text-brand-700 dark:hover:text-brand-400">{{ t('nav.rent') }}</NuxtLink>
        <NuxtLink :to="{ path: '/properties', query: { type: 'commercial' } }" class="hover:text-brand-700 dark:hover:text-brand-400">{{ t('nav.commercial') }}</NuxtLink>
        <NuxtLink :to="{ path: '/properties', query: { deal: 'rent', type: 'guesthouse' } }" class="inline-flex items-center gap-1 text-slate-400 hover:text-brand-700 dark:text-slate-500 dark:hover:text-brand-400">
          <AppIcon name="mountain-view" class="h-4 w-4" /> {{ t('nav.tourism') }}
        </NuxtLink>
      </nav>

      <div class="ml-auto flex items-center gap-3">
        <NuxtLink
          v-if="auth.isAuthenticated"
          to="/favorites"
          class="hidden items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand-700 dark:text-slate-300 dark:hover:text-brand-400 sm:inline-flex"
        >
          <AppIcon name="favorite" class="h-4 w-4 [&>svg]:fill-current" /> {{ t('nav.favorites') }}
        </NuxtLink>
        <ThemeToggle />
        <LocaleSwitcher />
        <NuxtLink
          v-if="!auth.isAuthenticated"
          to="/account/login"
          class="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {{ t('nav.login') }}
        </NuxtLink>
        <button
          v-else
          class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          @click="auth.logout()"
        >
          {{ t('nav.logout') }}
        </button>
      </div>
    </div>
  </header>
</template>
