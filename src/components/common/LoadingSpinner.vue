<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div
    :class="[
      'animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-300',
      {
        'h-4 w-4': size === 'sm',
        'h-6 w-6': size === 'md' || !size,
        'h-10 w-10': size === 'lg',
      },
    ]"
  />
</template>
