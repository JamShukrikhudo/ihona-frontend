<script setup lang="ts">
const auth = useAuthStore()
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

// NuxtLinkLocale is a no-op when you're already on "/" (Vue Router doesn't
// re-navigate to the current route) — so scrolled down on the homepage,
// clicking the logo did nothing. Scroll to top ourselves in that case.
function onLogoClick() {
  if (route.path === localePath('/')) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// The nav links + locale switcher + login/favorites don't fit next to the
// full-size logo below md — collapsed into this panel instead of squeezing
// everything into one row (which overflowed the viewport on phones).
const mobileMenuOpen = ref(false)
watch(() => route.fullPath, () => (mobileMenuOpen.value = false))
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
    <div class="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
      <NuxtLinkLocale to="/" class="flex items-center" @click="onLogoClick">
        <AppLogo class="text-[62px]" />
      </NuxtLinkLocale>

      <nav class="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
        <NuxtLinkLocale :to="{ path: '/properties', query: { deal: 'sale' } }" class="hover:text-brand-700 dark:hover:text-brand-400">{{ t('nav.buy') }}</NuxtLinkLocale>
        <NuxtLinkLocale :to="{ path: '/properties', query: { deal: 'rent' } }" class="hover:text-brand-700 dark:hover:text-brand-400">{{ t('nav.rent') }}</NuxtLinkLocale>
        <NuxtLinkLocale :to="{ path: '/properties', query: { type: 'commercial' } }" class="hover:text-brand-700 dark:hover:text-brand-400">{{ t('nav.commercial') }}</NuxtLinkLocale>
        <NuxtLinkLocale :to="{ path: '/properties', query: { deal: 'rent', type: 'guesthouse' } }" class="inline-flex items-center gap-1 text-slate-400 hover:text-brand-700 dark:text-slate-500 dark:hover:text-brand-400">
          <AppIcon name="mountain-view" class="h-4 w-4" /> {{ t('nav.tourism') }}
        </NuxtLinkLocale>
      </nav>

      <div class="ml-auto flex items-center gap-2 sm:gap-3">
        <NuxtLinkLocale
          v-if="auth.isAuthenticated"
          to="/favorites"
          class="hidden items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand-700 dark:text-slate-300 dark:hover:text-brand-400 sm:inline-flex"
        >
          <AppIcon name="favorite" class="h-4 w-4 [&>svg]:fill-current" /> {{ t('nav.favorites') }}
        </NuxtLinkLocale>
        <ThemeToggle />
        <LocaleSwitcher />
        <NuxtLinkLocale
          v-if="!auth.isAuthenticated"
          to="/account/login"
          class="hidden rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 md:inline-block"
        >
          {{ t('nav.login') }}
        </NuxtLinkLocale>
        <button
          v-else
          class="hidden rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 md:inline-block"
          @click="auth.logout()"
        >
          {{ t('nav.logout') }}
        </button>

        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
          :aria-label="mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'"
          :aria-expanded="mobileMenuOpen"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
            <path v-if="!mobileMenuOpen" d="M4 7h16M4 12h16M4 17h16" />
            <path v-else d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="mobileMenuOpen" class="border-t border-slate-200 px-4 py-4 dark:border-slate-800 md:hidden">
      <nav class="flex flex-col gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
        <NuxtLinkLocale :to="{ path: '/properties', query: { deal: 'sale' } }">{{ t('nav.buy') }}</NuxtLinkLocale>
        <NuxtLinkLocale :to="{ path: '/properties', query: { deal: 'rent' } }">{{ t('nav.rent') }}</NuxtLinkLocale>
        <NuxtLinkLocale :to="{ path: '/properties', query: { type: 'commercial' } }">{{ t('nav.commercial') }}</NuxtLinkLocale>
        <NuxtLinkLocale :to="{ path: '/properties', query: { deal: 'rent', type: 'guesthouse' } }" class="inline-flex items-center gap-1 text-slate-400">
          <AppIcon name="mountain-view" class="h-4 w-4" /> {{ t('nav.tourism') }}
        </NuxtLinkLocale>
        <NuxtLinkLocale v-if="auth.isAuthenticated" to="/favorites" class="inline-flex items-center gap-1">
          <AppIcon name="favorite" class="h-4 w-4 [&>svg]:fill-current" /> {{ t('nav.favorites') }}
        </NuxtLinkLocale>
      </nav>

      <div class="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <NuxtLinkLocale
          v-if="!auth.isAuthenticated"
          to="/account/login"
          class="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {{ t('nav.login') }}
        </NuxtLinkLocale>
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
