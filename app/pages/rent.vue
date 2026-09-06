<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <PropertyCatalog
    base-path="/rent"
    locked-deal-type="rent"
    :page-title="t('rent.title')"
    :page-description="t('rent.meta_description')"
  />
</template>
