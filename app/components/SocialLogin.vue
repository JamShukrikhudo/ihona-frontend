<script setup lang="ts">
// Backend and frontend share the same origin (ihona.tj, split by nginx path
// routing), so these are plain relative links/URLs — no cross-origin
// redirect or CORS concern. ?spa=1 tells the backend's
// SpaAwareOAuthResponse to mint a Sanctum token and bounce back to
// /account/oauth-callback instead of its normal session-flow redirect.
const config = useRuntimeConfig()
const telegramBotUsername = config.public.telegramBotUsername as string | undefined

const telegramWidget = useTemplateRef<HTMLDivElement>('telegramWidget')

onMounted(() => {
  if (!telegramBotUsername || !telegramWidget.value) return

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', telegramBotUsername)
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-radius', '10')
  script.setAttribute('data-auth-url', '/oauth/telegram/verify?spa=1')
  script.setAttribute('data-request-access', 'write')
  telegramWidget.value.appendChild(script)
})
</script>

<template>
  <div class="mt-6">
    <div class="relative flex items-center">
      <div class="flex-grow border-t border-slate-200 dark:border-slate-700" />
      <span class="flex-shrink px-4 text-xs text-slate-400 dark:text-slate-500">{{ $t('auth.or_continue_with') }}</span>
      <div class="flex-grow border-t border-slate-200 dark:border-slate-700" />
    </div>

    <div class="mt-4 flex flex-col items-center gap-3">
      <a
        href="/oauth/google?spa=1"
        class="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:text-slate-200"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v3h3.86c2.26-2.08 3.56-5.14 3.56-8.82Z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.86-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.11C3.25 21.3 7.31 24 12 24Z"/>
          <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.61H1.28A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l3.99-3.11Z"/>
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.61l3.99 3.11C6.22 6.86 8.87 4.75 12 4.75Z"/>
        </svg>
        {{ $t('auth.continue_with_google') }}
      </a>

      <div v-if="telegramBotUsername" ref="telegramWidget" class="flex justify-center" />
    </div>
  </div>
</template>
