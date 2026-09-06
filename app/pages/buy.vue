<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <PropertyCatalog
    base-path="/buy"
    locked-deal-type="sale"
    :page-title="t('buy.title')"
    :page-description="t('buy.meta_description')"
  />
</template>
