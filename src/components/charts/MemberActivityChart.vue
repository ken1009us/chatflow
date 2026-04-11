<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import BaseCard from '@/components/common/BaseCard.vue'
import { CHART_COLORS } from '@/utils/colors'

use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const { locale } = useI18n()
const { isDark } = useTheme()

const props = defineProps<{
  data: Array<{
    name: string
    textCount: number
    imageCount: number
    stickerCount: number
    otherCount: number
  }>
}>()

const sorted = computed(() => [...props.data].sort((a, b) =>
  (b.textCount + b.imageCount + b.stickerCount + b.otherCount) -
  (a.textCount + a.imageCount + a.stickerCount + a.otherCount)
).slice(0, 10))

const typeLabels = computed(() => ({
  text: locale.value === 'ja' ? 'テキスト' : locale.value === 'zh-TW' ? '文字' : 'Text',
  image: locale.value === 'ja' ? '画像' : locale.value === 'zh-TW' ? '圖片' : 'Image',
  sticker: locale.value === 'ja' ? 'スタンプ' : locale.value === 'zh-TW' ? '貼圖' : 'Sticker',
  other: locale.value === 'ja' ? 'その他' : locale.value === 'zh-TW' ? '其他' : 'Other',
}))

const option = computed(() => ({
  backgroundColor: 'transparent',
  textStyle: { fontFamily: 'Inter, Noto Sans JP, sans-serif', fontSize: 11 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: isDark.value ? '#1f1f1f' : '#fff',
    borderColor: isDark.value ? '#333' : '#e5e5e5',
    textStyle: { color: isDark.value ? '#e5e5e5' : '#292524', fontSize: 12 },
  },
  legend: {
    bottom: 0,
    textStyle: { color: isDark.value ? '#d4d4d4' : '#525252', fontSize: 10 },
    itemWidth: 8,
    itemHeight: 8,
  },
  grid: { left: 80, right: 40, top: 8, bottom: 48 },
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
      name: typeLabels.value.text,
      type: 'bar',
      stack: 'total',
      data: sorted.value.map((d) => d.textCount).reverse(),
      itemStyle: { color: CHART_COLORS[0] },
      barWidth: 12,
    },
    {
      name: typeLabels.value.image,
      type: 'bar',
      stack: 'total',
      data: sorted.value.map((d) => d.imageCount).reverse(),
      itemStyle: { color: CHART_COLORS[3] },
    },
    {
      name: typeLabels.value.sticker,
      type: 'bar',
      stack: 'total',
      data: sorted.value.map((d) => d.stickerCount).reverse(),
      itemStyle: { color: CHART_COLORS[1] },
    },
    {
      name: typeLabels.value.other,
      type: 'bar',
      stack: 'total',
      data: sorted.value.map((d) => d.otherCount).reverse(),
      itemStyle: { color: CHART_COLORS[5], borderRadius: [0, 4, 4, 0] },
    },
  ],
}))
</script>

<template>
  <div>
    <h3 class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ locale === 'ja' ? 'メンバー別メッセージ種類' : locale === 'zh-TW' ? '成員訊息類型' : 'Member Message Types' }}
    </h3>
    <BaseCard>
      <VChart :option="option" autoresize :style="{ height: `${Math.max(sorted.length * 28 + 28, 120)}px` }" />
    </BaseCard>
  </div>
</template>
