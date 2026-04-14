<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseCard from '@/components/common/BaseCard.vue'
import { CHART_COLORS } from '@/utils/colors'
import type { ReplySpeedEntry } from '@/composables/useAnalysis'

const { locale } = useI18n()

const props = defineProps<{
  data: ReplySpeedEntry[]
}>()

const title = computed(() =>
  locale.value === 'ja' ? '返信スピード' : locale.value === 'zh-TW' ? '回覆速度排行' : 'Reply Speed'
)

const top = computed(() => props.data.slice(0, 10))
const maxAvg = computed(() => Math.max(...top.value.map(d => d.avgMinutes), 1))

function formatTime(minutes: number): string {
  if (minutes < 1) {
    return locale.value === 'ja' ? '1分未満' : locale.value === 'zh-TW' ? '<1分' : '<1m'
  }
  if (minutes < 60) {
    const m = Math.round(minutes)
    return locale.value === 'ja' ? `${m}分` : locale.value === 'zh-TW' ? `${m}分` : `${m}m`
  }
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return locale.value === 'ja' ? `${h}時間${m}分` : locale.value === 'zh-TW' ? `${h}時${m}分` : `${h}h ${m}m`
}

function getLabel(index: number): string | null {
  if (index === 0) {
    return locale.value === 'ja' ? '即レス王' : locale.value === 'zh-TW' ? '秒回王' : 'Speed King'
  }
  if (index === top.value.length - 1 && top.value.length > 1) {
    return locale.value === 'ja' ? 'スロー王' : locale.value === 'zh-TW' ? '慢回王' : 'Slow King'
  }
  return null
}
</script>

<template>
  <div class="flex flex-col">
    <h3 class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ title }}
    </h3>
    <BaseCard class="flex-1">
    <div class="space-y-2">
      <div v-for="(entry, idx) in top" :key="entry.name" class="flex items-center gap-3">
        <span class="w-16 shrink-0 truncate text-xs text-gray-700 dark:text-gray-200">
          {{ entry.name }}
        </span>
        <div class="relative flex-1">
          <div class="h-4 rounded-full bg-gray-100 dark:bg-neutral-800">
            <div
              class="h-4 rounded-full transition-all"
              :style="{
                width: `${Math.max((1 - entry.avgMinutes / maxAvg) * 100, 8)}%`,
                backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
              }"
            />
          </div>
        </div>
        <span class="w-16 shrink-0 text-right text-[11px] font-medium tabular-nums text-gray-600 dark:text-gray-300">
          {{ formatTime(entry.avgMinutes) }}
        </span>
        <span
          v-if="getLabel(idx)"
          class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
          :style="{
            backgroundColor: idx === 0 ? '#10b98120' : '#ef444420',
            color: idx === 0 ? '#10b981' : '#ef4444',
          }"
        >
          {{ getLabel(idx) }}
        </span>
      </div>
    </div>
    </BaseCard>
  </div>
</template>
