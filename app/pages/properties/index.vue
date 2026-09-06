<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <PropertyCatalog base-path="/properties" :page-title="t('properties.title')" :page-description="t('properties.meta_description')" />
</template>
