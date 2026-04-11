<script setup lang="ts">
defineProps<{
  progress: number
  label?: string
}>()
</script>

<template>
  <div class="w-full">
    <div v-if="label" class="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
      <span>{{ label }}</span>
      <span>{{ Math.round(progress) }}%</span>
    </div>
    <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
      <div
        class="h-full rounded-full bg-gray-500 transition-all duration-300 dark:bg-gray-400"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>
