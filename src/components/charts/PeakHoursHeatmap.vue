<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { HeatmapChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import BaseCard from '@/components/common/BaseCard.vue'

use([HeatmapChart, GridComponent, TooltipComponent, VisualMapComponent, CanvasRenderer])

const { t } = useI18n()
const { isDark } = useTheme()

const props = defineProps<{
  data: number[][]
}>()

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hours = Array.from({ length: 24 }, (_, i) => `${i}`)

const heatmapData = computed(() => {
  const result: Array<[number, number, number]> = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      result.push([hour, day, props.data[day]?.[hour] ?? 0])
    }
  }
  return result
})

const maxVal = computed(() => Math.max(...heatmapData.value.map((d) => d[2]), 1))

const option = computed(() => ({
  backgroundColor: 'transparent',
  textStyle: { fontFamily: 'Inter, Noto Sans JP, sans-serif', fontSize: 11 },
  tooltip: {
    position: 'top',
    backgroundColor: isDark.value ? '#1f1f1f' : '#fff',
    borderColor: isDark.value ? '#333' : '#e5e5e5',
    textStyle: { color: isDark.value ? '#e5e5e5' : '#292524', fontSize: 12 },
    formatter: (params: any) => `${days[params.value[1]]} ${params.value[0]}:00 — ${params.value[2]}`,
  },
  grid: { left: 40, right: 16, top: 8, bottom: 24 },
  xAxis: {
    type: 'category',
    data: hours,
    splitArea: { show: false },
    axisLabel: { color: isDark.value ? '#a3a3a3' : '#78716c', fontSize: 9, interval: 5 },
    axisLine: { show: false },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'category',
    data: days,
    axisLabel: { color: isDark.value ? '#a3a3a3' : '#78716c', fontSize: 9 },
    axisLine: { show: false },
    axisTick: { show: false },
  },
  visualMap: {
    min: 0,
    max: maxVal.value,
    show: false,
    inRange: {
      color: isDark.value
        ? ['#0d1117', '#0e4429', '#006d32', '#26a641', '#39d353']
        : ['#f5f5f4', '#d1fae5', '#6ee7b7', '#34d399', '#059669'],
    },
  },
  series: [
    {
      type: 'heatmap',
      data: heatmapData.value,
      itemStyle: {
        borderColor: isDark.value ? '#0a0a0a' : '#fff',
        borderWidth: 2,
        borderRadius: 2,
      },
      emphasis: { itemStyle: { shadowBlur: 6, shadowColor: 'rgba(0,0,0,0.3)' } },
    },
  ],
}))
</script>

<template>
  <div class="flex flex-col">
    <h3 class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ t('analysis.charts.peakHours') }}
    </h3>
    <BaseCard class="flex-1">
      <VChart :option="option" autoresize style="height: 200px" />
    </BaseCard>
  </div>
</template>
