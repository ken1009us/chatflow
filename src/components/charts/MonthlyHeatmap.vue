<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import BaseCard from '@/components/common/BaseCard.vue'
import type { MonthlyActivity } from '@/composables/useAnalysis'

const { locale } = useI18n()
const { isDark } = useTheme()

const props = defineProps<{
  data: MonthlyActivity[]
}>()

const title = computed(() =>
  locale.value === 'ja' ? '月別アクティビティ' : locale.value === 'zh-TW' ? '每月活躍度' : 'Monthly Activity'
)

const maxCount = computed(() => Math.max(...props.data.map(d => d.count), 1))

function getColor(count: number): string {
  if (count === 0) return isDark.value ? '#1a1a1a' : '#f5f5f4'
  const ratio = count / maxCount.value
  if (ratio < 0.25) return isDark.value ? '#064e3b' : '#d1fae5'
  if (ratio < 0.5) return isDark.value ? '#065f46' : '#6ee7b7'
  if (ratio < 0.75) return isDark.value ? '#047857' : '#34d399'
  return isDark.value ? '#10b981' : '#10b981'
}

const monthNames = computed(() => {
  if (locale.value === 'ja') return ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  if (locale.value === 'zh-TW') return ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
})

// Group by year
const yearGroups = computed(() => {
  const groups = new Map<string, MonthlyActivity[]>()
  for (const d of props.data) {
    const year = d.month.slice(0, 4)
    if (!groups.has(year)) groups.set(year, [])
    groups.get(year)!.push(d)
  }
  return Array.from(groups.entries()).map(([year, months]) => {
    // Fill in missing months
    const monthMap = new Map(months.map(m => [m.month, m.count]))
    const filled: MonthlyActivity[] = []
    for (let i = 0; i < 12; i++) {
      const key = `${year}-${String(i + 1).padStart(2, '0')}`
      filled.push({ month: key, count: monthMap.get(key) ?? 0 })
    }
    return { year, months: filled }
  })
})
</script>

<template>
  <div class="flex flex-col">
    <h3 class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ title }}
    </h3>
    <BaseCard class="flex-1">
    <div class="space-y-2">
      <div v-for="group in yearGroups" :key="group.year" class="flex items-center gap-2">
        <span class="w-10 shrink-0 text-[10px] tabular-nums text-gray-500 dark:text-gray-400">
          {{ group.year }}
        </span>
        <div class="flex gap-1">
          <div
            v-for="(m, idx) in group.months"
            :key="m.month"
            class="group relative"
          >
            <div
              class="h-5 w-5 rounded-sm transition-colors sm:h-6 sm:w-6"
              :style="{ backgroundColor: getColor(m.count) }"
            />
            <!-- Tooltip -->
            <div class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-[10px] text-white shadow group-hover:block dark:bg-gray-700">
              {{ monthNames[idx] }}: {{ m.count.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Legend -->
    <div class="mt-3 flex items-center justify-end gap-1 text-[10px] text-gray-400 dark:text-gray-500">
      <span>{{ locale === 'ja' ? '少' : locale === 'zh-TW' ? '少' : 'Less' }}</span>
      <div class="h-3 w-3 rounded-sm" :style="{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f4' }" />
      <div class="h-3 w-3 rounded-sm" :style="{ backgroundColor: isDark ? '#064e3b' : '#d1fae5' }" />
      <div class="h-3 w-3 rounded-sm" :style="{ backgroundColor: isDark ? '#065f46' : '#6ee7b7' }" />
      <div class="h-3 w-3 rounded-sm" :style="{ backgroundColor: isDark ? '#047857' : '#34d399' }" />
      <div class="h-3 w-3 rounded-sm" :style="{ backgroundColor: '#10b981' }" />
      <span>{{ locale === 'ja' ? '多' : locale === 'zh-TW' ? '多' : 'More' }}</span>
    </div>
    </BaseCard>
  </div>
</template>
