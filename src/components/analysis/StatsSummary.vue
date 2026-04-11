<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AnalysisResult } from '@/types'

const { t } = useI18n()

const props = defineProps<{
  result: AnalysisResult
}>()

function formatDate(date: Date): string {
  const d = new Date(date)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

const stats = computed(() => [
  { key: 'totalMessages', value: props.result.totalMessages.toLocaleString() },
  { key: 'members', value: props.result.memberCount.toString() },
  {
    key: 'dateRange',
    value: `${formatDate(props.result.dateRange.start)} — ${formatDate(props.result.dateRange.end)}`,
  },
  { key: 'dailyAvg', value: props.result.dailyAverage.toFixed(1) },
])
</script>

<template>
  <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
    <div
      v-for="stat in stats"
      :key="stat.key"
      class="rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-neutral-900"
    >
      <p class="text-[11px] text-gray-500 dark:text-gray-500">
        {{ t(`analysis.summary.${stat.key}`) }}
      </p>
      <p class="mt-0.5 text-lg font-light text-gray-800 dark:text-gray-100">
        {{ stat.value }}
      </p>
    </div>
  </div>
</template>
