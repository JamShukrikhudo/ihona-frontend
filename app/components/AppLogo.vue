<script setup lang="ts">
// Animated header lockup — brand mark scales in, then "ıhona" letters slide
// in one by one with a colour sweep, settling into ink; hovering turns the
// letters green. The scale/fade-in animation (.ihona-logo__house in
// main.css) is shape-agnostic, so it works unchanged regardless of what
// mark is dropped into this <svg>.
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

// AppLogo renders twice per page (header + footer) — SVG gradient/filter ids
// are document-global, so a shared literal id here would make the second
// instance silently borrow (or fight over) the first's <defs>. useId() gives
// each instance its own SSR-safe, hydration-safe prefix.
const uid = useId()
</script>

<template>
  <span class="ihona-logo" :class="{ 'ihona-logo--dark': theme.dark }">
    <svg class="ihona-logo__house" viewBox="0 0 32 32">
      <defs>
        <radialGradient :id="`${uid}-glow`" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="55%" stop-color="#FFFFFF" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#E4F3EC" stop-opacity="0" />
        </radialGradient>
        <linearGradient :id="`${uid}-g1`" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#8DB8A6" /><stop offset="100%" stop-color="#2B7556" />
        </linearGradient>
        <linearGradient :id="`${uid}-g2`" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#86B4A0" /><stop offset="100%" stop-color="#2E7D5C" />
        </linearGradient>
        <linearGradient :id="`${uid}-g3`" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#8DB8A6" /><stop offset="100%" stop-color="#3B8566" />
        </linearGradient>
        <linearGradient :id="`${uid}-g4`" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#3B8566" /><stop offset="100%" stop-color="#123527" />
        </linearGradient>
        <filter :id="`${uid}-soft`" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="0.35" stdDeviation="0.45" flood-color="#0E2B20" flood-opacity="0.38" />
        </filter>
      </defs>
      <g transform="rotate(0 16 16)"><rect x="5" y="5" width="22" height="22" :fill="`url(#${uid}-g1)`" :filter="`url(#${uid}-soft)`" /></g>
      <g transform="rotate(45 16 16)"><rect x="8.67" y="8.67" width="14.67" height="14.67" :fill="`url(#${uid}-g2)`" :filter="`url(#${uid}-soft)`" /></g>
      <g transform="rotate(0 16 16)"><rect x="11.11" y="11.11" width="9.78" height="9.78" :fill="`url(#${uid}-g3)`" :filter="`url(#${uid}-soft)`" /></g>
      <g transform="rotate(45 16 16)"><rect x="12.74" y="12.74" width="6.52" height="6.52" :fill="`url(#${uid}-g4)`" :filter="`url(#${uid}-soft)`" /></g>
      <circle cx="16" cy="16" r="2.1" :fill="`url(#${uid}-glow)`" />
    </svg>
    <span class="ihona-logo__letters">
      <span class="ihona-logo__dot">ı</span><span>h</span><span>o</span><span>n</span><span>a</span>
    </span>
  </span>
</template>
