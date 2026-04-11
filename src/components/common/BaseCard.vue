<script setup lang="ts">
defineProps<{
  padding?: boolean
}>()
</script>

<template>
  <div
    :class="[
      'rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-neutral-900',
      { 'px-5 py-4': padding !== false },
    ]"
  >
    <slot />
  </div>
</template>
