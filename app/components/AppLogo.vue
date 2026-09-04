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
          <stop offset="0%" stop-color="#FFFBF2" />
          <stop offset="55%" stop-color="#FFFBF2" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#F3E6CE" stop-opacity="0" />
        </radialGradient>
        <linearGradient :id="`${uid}-g1`" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#EAD2AC" /><stop offset="100%" stop-color="#B98F5C" />
        </linearGradient>
        <linearGradient :id="`${uid}-g2`" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#D2A66D" /><stop offset="100%" stop-color="#96652E" />
        </linearGradient>
        <linearGradient :id="`${uid}-g3`" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#A87A42" /><stop offset="100%" stop-color="#6B4321" />
        </linearGradient>
        <linearGradient :id="`${uid}-g4`" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#6B4321" /><stop offset="100%" stop-color="#2E1B0E" />
        </linearGradient>
        <filter :id="`${uid}-soft-1`" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0.22" stdDeviation="0.12" flood-color="#2E1B0E" flood-opacity="0.5" />
        </filter>
        <filter :id="`${uid}-soft-2`" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0.24" stdDeviation="0.2" flood-color="#2E1B0E" flood-opacity="0.45" />
        </filter>
        <filter :id="`${uid}-soft-3`" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="0.26" stdDeviation="0.3" flood-color="#2E1B0E" flood-opacity="0.4" />
        </filter>
        <filter :id="`${uid}-soft-4`" x="-70%" y="-70%" width="240%" height="240%">
          <feDropShadow dx="0" dy="0.28" stdDeviation="0.4" flood-color="#2E1B0E" flood-opacity="0.35" />
        </filter>
      </defs>
      <g transform="rotate(0 16 16)"><rect x="5" y="5" width="22" height="22" :fill="`url(#${uid}-g1)`" :filter="`url(#${uid}-soft-1)`" /></g>
      <g transform="rotate(45 16 16)"><rect x="8.67" y="8.67" width="14.67" height="14.67" :fill="`url(#${uid}-g2)`" :filter="`url(#${uid}-soft-2)`" /></g>
      <g transform="rotate(0 16 16)"><rect x="11.11" y="11.11" width="9.78" height="9.78" :fill="`url(#${uid}-g3)`" :filter="`url(#${uid}-soft-3)`" /></g>
      <g transform="rotate(45 16 16)"><rect x="12.74" y="12.74" width="6.52" height="6.52" :fill="`url(#${uid}-g4)`" :filter="`url(#${uid}-soft-4)`" /></g>
      <circle cx="16" cy="16" r="2.1" :fill="`url(#${uid}-glow)`" />
    </svg>
    <span class="ihona-logo__letters">
      <span class="ihona-logo__dot">ı</span><span>h</span><span>o</span><span>n</span><span>a</span>
    </span>
  </span>
</template>
