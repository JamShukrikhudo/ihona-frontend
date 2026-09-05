// Rendered isomorphically (not .client.ts) so the script tag and its
// noscript fallback are present in the server-rendered HTML, same as gtag.
// Yandex Metrika does not auto-track SPA route changes the way it does full
// page loads, so every client-side navigation is reported as a manual "hit"
// in router.afterEach below. Loads only when an ID is actually set, so a dev
// checkout with no NUXT_PUBLIC_YANDEX_METRIKA_ID env var sends nothing.
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const id = config.public.yandexMetrikaId
  if (!id) {
    return
  }

  useHead({
    script: [
      {
        key: 'yandex-metrika',
        innerHTML: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

ym(${JSON.stringify(id)}, "init", {
  clickmap: true,
  trackLinks: true,
  accurateTrackBounce: true
});`,
      },
    ],
    noscript: [
      {
        key: 'yandex-metrika-noscript',
        innerHTML: `<div><img src="https://mc.yandex.ru/watch/${id}" style="position:absolute; left:-9999px;" alt="" /></div>`,
      },
    ],
  })

  if (import.meta.client) {
    const router = useRouter()
    router.afterEach((to) => {
      const ym = (window as unknown as { ym?: (id: string, action: string, url: string) => void }).ym
      ym?.(id, 'hit', to.fullPath)
    })
  }
})
