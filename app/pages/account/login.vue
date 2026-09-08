<script setup lang="ts">
const { t } = useI18n()
const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    toast.show(t('auth.toast_welcome_back', { name: auth.user?.name ?? email.value }))
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : localePath('/')
    router.push(redirect)
  } catch {
    error.value = t('auth.error')
  } finally {
    loading.value = false
  }
}

useHead({ title: t('auth.login_title') })
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('auth.login_title') }}</h1>
    <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('auth.login_subtitle') }}</p>

    <form class="mt-8 flex flex-col gap-4" @submit.prevent="submit">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('auth.email') }}</label>
        <input
          v-model="email"
          type="email"
          autocomplete="email"
          required
          class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('auth.password') }}</label>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
          class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="mt-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {{ loading ? t('auth.loading') : t('auth.submit_login') }}
      </button>
    </form>

    <SocialLogin />

    <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
      {{ t('auth.no_account') }}
      <NuxtLinkLocale to="/account/register" class="font-medium text-accent-700 hover:underline dark:text-accent-400">{{ t('auth.register_link') }}</NuxtLinkLocale>
    </p>
  </div>
</template>
