<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, DataZoomComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import BaseCard from '@/components/common/BaseCard.vue'

use([LineChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer])

const { t } = useI18n()
const { isDark } = useTheme()

const props = defineProps<{
  data: Array<{ date: string; count: number }>
}>()

const option = computed(() => ({
  backgroundColor: 'transparent',
  textStyle: { fontFamily: 'Inter, Noto Sans JP, sans-serif', fontSize: 11 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: isDark.value ? '#1f1f1f' : '#fff',
    borderColor: isDark.value ? '#333' : '#e5e5e5',
    textStyle: { color: isDark.value ? '#e5e5e5' : '#292524', fontSize: 12 },
  },
  grid: { left: 40, right: 24, top: 12, bottom: 56 },
  xAxis: {
    type: 'category',
    data: props.data.map((d) => d.date),
    axisLine: { lineStyle: { color: isDark.value ? '#333' : '#d4d4d4' } },
    axisLabel: { color: isDark.value ? '#a3a3a3' : '#78716c', fontSize: 10 },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: isDark.value ? '#1a1a1a' : '#f5f5f4' } },
    axisLabel: { color: isDark.value ? '#a3a3a3' : '#78716c', fontSize: 10 },
  },
  dataZoom: [
    { type: 'inside' },
    {
      type: 'slider',
      height: 20,
      bottom: 4,
      borderColor: 'transparent',
      backgroundColor: isDark.value ? '#1a1a1a' : '#f5f5f4',
      fillerColor: isDark.value ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.15)',
      handleStyle: { color: '#6366f1', borderColor: '#6366f1' },
      moveHandleStyle: { color: '#6366f1' },
      textStyle: { color: isDark.value ? '#a3a3a3' : '#78716c', fontSize: 10 },
      dataBackground: {
        lineStyle: { color: isDark.value ? '#333' : '#d4d4d4' },
        areaStyle: { color: isDark.value ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)' },
      },
    },
  ],
  series: [
    {
      type: 'line',
      data: props.data.map((d) => d.count),
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#6366f1', width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(99,102,241,0.25)' },
            { offset: 1, color: 'rgba(99,102,241,0.02)' },
          ],
        },
      },
    },
  ],
}))
</script>

<template>
  <div class="flex flex-col">
    <h3 class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ t('analysis.charts.activityTrend') }}
    </h3>
    <BaseCard class="flex-1">
      <VChart :option="option" autoresize style="height: 220px" />
    </BaseCard>
  </div>
</template>
