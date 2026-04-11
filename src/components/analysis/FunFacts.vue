<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AnalysisResult } from '@/types'
import { CHART_COLORS } from '@/utils/colors'

const { t, locale } = useI18n()

const props = defineProps<{
  result: AnalysisResult
  extraStats: {
    mostActiveDay: { date: string; count: number }
    longestStreak: number
    avgMessageLength: number
    emojiCount: number
    topEmojis: Array<{ emoji: string; count: number }>
    peakHour: number
    weekendRatio: number
  }
}>()

const facts = computed(() => {
  const r = props.result
  const e = props.extraStats
  const items: Array<{ icon: string; label: string; value: string; color: string }> = []

  if (e.mostActiveDay.count > 0) {
    items.push({
      icon: '🔥',
      label: locale.value === 'ja' ? '最もアクティブな日' : locale.value === 'zh-TW' ? '最活躍的一天' : 'Most Active Day',
      value: `${e.mostActiveDay.date} (${e.mostActiveDay.count})`,
      color: CHART_COLORS[0],
    })
  }

  if (e.longestStreak > 0) {
    items.push({
      icon: '📅',
      label: locale.value === 'ja' ? '連続チャット日数' : locale.value === 'zh-TW' ? '連續聊天天數' : 'Chat Streak',
      value: locale.value === 'ja' ? `${e.longestStreak} 日` : locale.value === 'zh-TW' ? `${e.longestStreak} 天` : `${e.longestStreak} days`,
      color: CHART_COLORS[3],
    })
  }

  items.push({
    icon: '📝',
    label: locale.value === 'ja' ? '平均メッセージ長' : locale.value === 'zh-TW' ? '平均訊息長度' : 'Avg Message Length',
    value: locale.value === 'ja' ? `${e.avgMessageLength} 文字` : locale.value === 'zh-TW' ? `${e.avgMessageLength} 字` : `${e.avgMessageLength} chars`,
    color: CHART_COLORS[4],
  })

  if (e.emojiCount > 0) {
    items.push({
      icon: '😀',
      label: locale.value === 'ja' ? '絵文字使用数' : locale.value === 'zh-TW' ? '表情符號數' : 'Emojis Used',
      value: e.emojiCount.toLocaleString(),
      color: CHART_COLORS[1],
    })
  }

  items.push({
    icon: '⏰',
    label: locale.value === 'ja' ? '最も活発な時間帯' : locale.value === 'zh-TW' ? '最活躍時段' : 'Peak Hour',
    value: `${e.peakHour}:00 - ${e.peakHour + 1}:00`,
    color: CHART_COLORS[5],
  })

  items.push({
    icon: '🏖️',
    label: locale.value === 'ja' ? '週末チャット率' : locale.value === 'zh-TW' ? '週末聊天比例' : 'Weekend Ratio',
    value: `${Math.round(e.weekendRatio * 100)}%`,
    color: CHART_COLORS[7],
  })

  return items
})


</script>

<template>
  <div>
    <h3 class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ locale === 'ja' ? '面白い統計' : locale === 'zh-TW' ? '有趣的統計' : 'Fun Facts' }}
    </h3>
    <div class="rounded-lg border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-neutral-900">

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <div
        v-for="(fact, i) in facts"
        :key="i"
        class="rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-neutral-800"
      >
        <div class="flex items-center gap-1.5">
          <span class="text-sm">{{ fact.icon }}</span>
          <span class="text-[10px] text-gray-500 dark:text-gray-400">{{ fact.label }}</span>
        </div>
        <p class="mt-0.5 text-sm font-medium" :style="{ color: fact.color }">
          {{ fact.value }}
        </p>
      </div>
    </div>
    </div>
  </div>
</template>
