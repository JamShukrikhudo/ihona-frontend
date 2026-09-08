<script setup lang="ts">
// Landing spot for the backend's SpaAwareOAuthResponse (identity-socialstream)
// after a Google/Telegram login initiated from SocialLogin.vue — see that
// component's ?spa=1 links for the other half of this bridge. The token and
// user fields arrive once, in the URL, exactly like a password-reset link;
// they're consumed immediately and the URL is replaced so they don't linger
// in browser history past this render.
const { t } = useI18n()
const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()

const failed = ref(false)

onMounted(() => {
  const token = route.query.token
  const id = route.query.id
  const name = route.query.name
  const email = route.query.email

  if (typeof token !== 'string' || typeof id !== 'string' || typeof name !== 'string' || typeof email !== 'string') {
    failed.value = true
    return
  }

  auth.setSession(token, { id: Number(id), name, email })
  toast.show(t('auth.toast_welcome_back', { name }))

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : localePath('/')
  router.replace(redirect)
})

useHead({ title: t('auth.login_title') })
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
    <template v-if="failed">
      <p class="text-sm text-red-600">{{ t('auth.oauth_error') }}</p>
      <NuxtLinkLocale to="/account/login" class="mt-4 font-medium text-accent-700 hover:underline dark:text-accent-400">
        {{ t('auth.login_link') }}
      </NuxtLinkLocale>
    </template>
    <p v-else class="text-sm text-slate-500 dark:text-slate-400">{{ t('auth.loading') }}</p>
  </div>
</template>
