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

const { t } = useI18n()
const { isDark } = useTheme()

const props = defineProps<{
  data: Array<{ name: string; count: number }>
}>()

const sorted = computed(() => [...props.data].sort((a, b) => b.count - a.count).slice(0, 15))

const chartHeight = computed(() => `${Math.max(sorted.value.length * 28, 100)}px`)

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
  grid: { left: 80, right: 16, top: 4, bottom: 4 },
  xAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: isDark.value ? '#1a1a1a' : '#f5f5f4' } },
    axisLabel: { color: isDark.value ? '#a3a3a3' : '#78716c', fontSize: 10 },
  },
  yAxis: {
    type: 'category',
    data: sorted.value.map((d) => d.name).reverse(),
    axisLabel: { color: isDark.value ? '#e5e5e5' : '#525252', fontSize: 10, width: 70, overflow: 'truncate' },
    axisLine: { show: false },
    axisTick: { show: false },
  },
  series: [
    {
      type: 'bar',
      data: sorted.value.map((d, i) => ({
        value: d.count,
        itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
      })).reverse(),
      barWidth: 12,
      itemStyle: { borderRadius: [0, 4, 4, 0] },
    },
  ],
}))
</script>

<template>
  <div>
    <h3 class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ t('analysis.charts.memberRanking') }}
    </h3>
    <BaseCard>
      <VChart :option="option" autoresize :style="{ height: chartHeight }" />
    </BaseCard>
  </div>
</template>
