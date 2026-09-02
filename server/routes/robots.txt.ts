// Was a static public/robots.txt — moved here so it flips with the same
// runtimeConfig.public.launched pre-launch guard as the X-Robots-Tag
// header in routeRules (nuxt.config.ts), instead of needing a manual edit
// (and a rebuild) to un-disallow crawling on launch day.
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  if (!config.public.launched) {
    return 'User-Agent: *\nDisallow: /\n'
  }

  return 'User-Agent: *\nDisallow:\n\nSitemap: https://ihona.tj/sitemap_index.xml\n'
})
