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
    mostActiveDayOfWeek?: number
    activeDays?: number
    activityRate?: number
  }
}>()

const weekdayName = computed(() => {
  const dow = props.extraStats.mostActiveDayOfWeek
  if (dow == null) return ''
  const key = `analysis.funFacts.weekdays.${dow}`
  return t(key)
})

const facts = computed(() => {
  const e = props.extraStats
  const items: Array<{ icon: string; label: string; value: string; color: string }> = []

  if (e.mostActiveDay.count > 0) {
    items.push({
      icon: '🔥',
      label: t('analysis.funFacts.mostActiveDay'),
      value: `${e.mostActiveDay.date} (${e.mostActiveDay.count})`,
      color: CHART_COLORS[0],
    })
  }

  if (e.longestStreak > 0) {
    items.push({
      icon: '📅',
      label: t('analysis.funFacts.chatStreak'),
      value: t('analysis.funFacts.days', { count: e.longestStreak }),
      color: CHART_COLORS[3],
    })
  }

  items.push({
    icon: '📝',
    label: t('analysis.funFacts.avgMessageLength'),
    value: t('analysis.funFacts.chars', { count: e.avgMessageLength }),
    color: CHART_COLORS[4],
  })

  if (e.emojiCount > 0) {
    items.push({
      icon: '😀',
      label: t('analysis.funFacts.emojisUsed'),
      value: e.emojiCount.toLocaleString(),
      color: CHART_COLORS[1],
    })
  }

  items.push({
    icon: '⏰',
    label: t('analysis.funFacts.peakHour'),
    value: `${e.peakHour}:00 - ${e.peakHour + 1}:00`,
    color: CHART_COLORS[5],
  })

  items.push({
    icon: '🏖️',
    label: t('analysis.funFacts.weekendRatio'),
    value: `${Math.round(e.weekendRatio * 100)}%`,
    color: CHART_COLORS[7],
  })

  // New stats
  if (e.mostActiveDayOfWeek != null) {
    items.push({
      icon: '📆',
      label: t('analysis.funFacts.mostActiveDayOfWeek'),
      value: weekdayName.value,
      color: CHART_COLORS[2],
    })
  }

  if (e.activeDays != null && e.activeDays > 0) {
    const dateRange = props.result.dateRange
    const totalDays = Math.max(1, Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1)
    items.push({
      icon: '📊',
      label: t('analysis.funFacts.activeDays'),
      value: `${e.activeDays} / ${totalDays}${locale.value === 'ja' ? '日' : locale.value === 'zh-TW' ? '天' : ' days'}`,
      color: CHART_COLORS[8],
    })
  }

  if (e.activityRate != null) {
    items.push({
      icon: '📈',
      label: t('analysis.funFacts.activityRate'),
      value: `${Math.round(e.activityRate * 100)}%`,
      color: CHART_COLORS[9],
    })
  }

  return items
})


</script>

<template>
  <div>
    <h3 class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ t('analysis.funFacts.title') }}
    </h3>
    <div class="rounded-lg border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-neutral-900">

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
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
