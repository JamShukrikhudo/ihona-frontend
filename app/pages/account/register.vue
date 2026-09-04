<script setup lang="ts">
// POST /v1/auth/register (identity-core-api) reuses Fortify's own
// CreatesNewUsers action, so the same password policy the web registration
// form enforces applies here too: min 12 chars, upper+lower case, a number,
// a symbol (jetstream-bridge's FortifyServiceProvider).
const { t } = useI18n()
const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const error = ref('')
const loading = ref(false)

// Maps to a real Spatie role on the backend (identity-core-api's
// AuthTokenController::INTENT_TO_ROLE) — 'tourist' has no distinct
// permission role and resolves to 'buyer' there, but is kept as its own
// option here since it's a real, distinct persona for this market.
const SIGNUP_INTENTS = ['buyer', 'landlord', 'seller', 'tenant', 'tourist'] as const
const signupIntent = ref<(typeof SIGNUP_INTENTS)[number]>('buyer')

interface ValidationErrorBody {
  message?: string
  errors?: Record<string, string[]>
}
interface RegisterResponse {
  plainTextToken: string
  user: { id: number; name: string; email: string }
}

async function submit() {
  error.value = ''

  // Caught server-side too (password_confirmation validation), but that
  // round-trip is pure waste for a mismatch anyone can see before
  // submitting — check it here first.
  if (password.value !== passwordConfirmation.value) {
    error.value = t('auth.password_mismatch')
    return
  }

  loading.value = true
  try {
    const res = await apiFetch<RegisterResponse>('/v1/auth/register', {
      method: 'POST',
      body: {
        name: name.value,
        email: email.value,
        password: password.value,
        password_confirmation: passwordConfirmation.value,
        signup_intent: signupIntent.value,
      },
    })
    auth.setSession(res.plainTextToken, res.user)
    toast.show(t('auth.toast_welcome_new', { name: res.user.name }))

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : localePath('/')
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
          autocomplete="name"
          required
          class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('auth.intent_label') }}</label>
        <select
          v-model="signupIntent"
          class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option v-for="intent in SIGNUP_INTENTS" :key="intent" :value="intent">{{ t(`auth.intent_${intent}`) }}</option>
        </select>
      </div>
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
          autocomplete="new-password"
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
          autocomplete="new-password"
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
      <NuxtLinkLocale to="/account/login" class="font-medium text-accent-700 hover:underline dark:text-accent-400">{{ t('auth.login_link') }}</NuxtLinkLocale>
    </p>
  </div>
</template>
