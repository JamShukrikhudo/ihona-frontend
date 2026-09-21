<script setup lang="ts">
const { t } = useI18n()

// Disclosure only, not a consent gate — GA4 already fires regardless (see
// nuxt.config.ts's nuxt-gtag setup). Dismissal is remembered per-browser;
// re-showing it on every visit would just train people to click through
// without reading it.
const dismissed = ref(true)

onMounted(() => {
  dismissed.value = localStorage.getItem('cookie-notice-dismissed') === '1'
})

function dismiss() {
  dismissed.value = true
  localStorage.setItem('cookie-notice-dismissed', '1')
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="!dismissed"
      class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"
    >
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-2">
        <p class="text-xs text-slate-600 dark:text-slate-300">
          {{ t('cookie_notice.text') }}
          <NuxtLinkLocale to="/privacy" class="font-medium text-accent-600 hover:underline">{{ t('cookie_notice.learn_more') }}</NuxtLinkLocale>
        </p>
        <button
          type="button"
          class="shrink-0 rounded-lg bg-accent-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-700"
          @click="dismiss"
        >
          {{ t('cookie_notice.accept') }}
        </button>
      </div>
    </div>
  </Transition>
</template>
