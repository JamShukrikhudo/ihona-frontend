<script setup lang="ts">
// Animated header lockup (design source: ihona-header-logo1.zip) — house
// icon scales in, then "ıhona" letters slide in one by one with a colour
// sweep, settling into ink; hovering turns the letters green. House is
// the small/no-second-peak mark (docs/brand README's 16-24px rule,
// applied here too as of this revision) — same shape AppMark.vue uses.
//
// CSS lives in app/assets/css/main.css, not a scoped <style> block here:
// this component renders inside layouts/default.vue (SiteHeader/
// SiteFooter), and Nuxt code-splits a layout-only component's scoped CSS
// into a chunk that's injected by JS during hydration rather than linked
// in the SSR'd <head> — a real, measured gap (checked the built output:
// the stylesheet was only reachable via a modulepreloaded JS chunk, not a
// <link rel="stylesheet">), which would show the logo unstyled/unanimated
// on first paint. Global CSS is already synchronously linked from the
// start, so it doesn't have that gap.
const theme = useThemeStore()
</script>

<template>
  <span class="ihona-logo" :class="{ 'ihona-logo--dark': theme.dark }">
    <svg class="ihona-logo__house" viewBox="0 0 46 60" fill="none" stroke="#2E7D5C" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 33 L23 13 L42 33" />
      <path d="M10.5 30 L10.5 53 L36.5 53 L36.5 30" />
    </svg>
    <span class="ihona-logo__letters">
      <span class="ihona-logo__dot">ı</span><span>h</span><span>o</span><span>n</span><span>a</span>
    </span>
  </span>
</template>
