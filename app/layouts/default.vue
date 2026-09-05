<template>
  <div class="flex min-h-screen flex-col">
    <SiteHeader />
    <GeoCityBanner />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
