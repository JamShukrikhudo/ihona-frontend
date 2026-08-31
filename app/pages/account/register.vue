<script setup lang="ts">
// POST /v1/auth/register (identity-core-api) reuses Fortify's own
// CreatesNewUsers action, so the same password policy the web registration
// form enforces applies here too: min 12 chars, upper+lower case, a number,
// a symbol (jetstream-bridge's FortifyServiceProvider).
const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const error = ref('')
const loading = ref(false)

interface ValidationErrorBody {
  message?: string
  errors?: Record<string, string[]>
}

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const res = await apiFetch<{ plainTextToken: string }>('/v1/auth/register', {
      method: 'POST',
      body: {
        name: name.value,
        email: email.value,
        password: password.value,
        password_confirmation: passwordConfirmation.value,
      },
    })
    auth.token = res.plainTextToken
    if (import.meta.client) localStorage.setItem('ihona_token', res.plainTextToken)

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.push(redirect)
  } catch (err: unknown) {
    const body = (err as { data?: ValidationErrorBody })?.data
    const firstError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined
    error.value = firstError ?? body?.message ?? t('auth.error')
  } finally {
    loading.value = false
  }
}

useHead({ title: t('auth.register_title') })
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('auth.register_title') }}</h1>
    <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('auth.register_subtitle') }}</p>

    <form class="mt-8 flex flex-col gap-4" @submit.prevent="submit">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('auth.name') }}</label>
        <input
          v-model="name"
          type="text"
          required
          class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('auth.email') }}</label>
        <input
          v-model="email"
          type="email"
          required
          class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('auth.password') }}</label>
        <input
          v-model="password"
          type="password"
          required
          minlength="12"
          class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <p class="mt-1 text-xs text-slate-400">{{ t('auth.password_requirements') }}</p>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('auth.password_confirmation') }}</label>
        <input
          v-model="passwordConfirmation"
          type="password"
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
        {{ loading ? t('auth.loading') : t('auth.submit_register') }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
      {{ t('auth.have_account') }}
      <NuxtLink to="/account/login" class="font-medium text-accent-700 hover:underline dark:text-accent-400">{{ t('auth.login_link') }}</NuxtLink>
    </p>
  </div>
</template>
