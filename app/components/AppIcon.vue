<script setup lang="ts">
// Inlines one of the 38 stroke icons (app/assets/icons/*.svg, all
// viewBox="0 0 24 24" stroke="currentColor") so it can be sized and
// coloured with normal Tailwind classes on the call site — an <img> can't
// pick up currentColor, so the SVG source is bundled and injected directly.
// Trusted, build-time-only content (no user input reaches this), so v-html
// here carries no XSS risk.
const modules = import.meta.glob('../assets/icons/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const icons: Record<string, string> = {}
for (const [path, content] of Object.entries(modules)) {
  const key = path.split('/').pop()!.replace('.svg', '')
  icons[key] = content
}

const props = defineProps<{ name: string }>()
const markup = computed(() => icons[props.name] ?? '')
</script>

<template>
  <span class="inline-block shrink-0 align-middle [&>svg]:h-full [&>svg]:w-full" v-html="markup" />
</template>
