<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import BaseCard from '@/components/common/BaseCard.vue'
import { CHART_COLORS } from '@/utils/colors'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const { t, locale } = useI18n()
const { isDark } = useTheme()

const props = defineProps<{
  data: Array<{ emoji: string; count: number }>
}>()

const top = computed(() => props.data.slice(0, 10))

const option = computed(() => ({
  backgroundColor: 'transparent',
  textStyle: { fontFamily: 'Inter, Noto Sans JP, sans-serif', fontSize: 11 },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: isDark.value ? '#1f1f1f' : '#fff',
    borderColor: isDark.value ? '#333' : '#e5e5e5',
    textStyle: { color: isDark.value ? '#e5e5e5' : '#292524', fontSize: 12 },
  },
  grid: { left: 40, right: 40, top: 8, bottom: 8 },
  xAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: isDark.value ? '#1a1a1a' : '#f5f5f4' } },
    axisLabel: { color: isDark.value ? '#a3a3a3' : '#78716c', fontSize: 10 },
  },
  yAxis: {
    type: 'category',
    data: top.value.map((d) => d.emoji).reverse(),
    axisLabel: { fontSize: 16 },
    axisLine: { show: false },
    axisTick: { show: false },
  },
  series: [
    {
      type: 'bar',
      data: top.value.map((d, i) => ({
        value: d.count,
        itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
      })).reverse(),
      barWidth: 14,
      itemStyle: { borderRadius: [0, 4, 4, 0] },
    },
  ],
}))
</script>

<template>
  <div>
    <h3 class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ locale === 'ja' ? '絵文字ランキング' : locale === 'zh-TW' ? '表情符號排行' : 'Emoji Ranking' }}
    </h3>
    <BaseCard>
      <VChart v-if="data.length" :option="option" autoresize :style="{ height: `${Math.max(top.length * 28, 80)}px` }" />
      <div v-else class="flex h-20 items-center justify-center text-xs text-gray-500 dark:text-gray-500">
        {{ locale === 'ja' ? '絵文字なし' : locale === 'zh-TW' ? '無表情符號' : 'No emojis' }}
      </div>
    </BaseCard>
  </div>
</template>
