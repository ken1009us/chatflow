<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import BaseCard from '@/components/common/BaseCard.vue'
import { CHART_COLORS } from '@/utils/colors'
import type { MessageType } from '@/types'

use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer])

const { t, locale } = useI18n()
const { isDark } = useTheme()

const props = defineProps<{
  data: Array<{ type: MessageType; count: number }>
}>()

const typeLabels: Record<string, Record<string, string>> = {
  text:    { ja: 'テキスト', 'zh-TW': '文字',  en: 'Text' },
  image:   { ja: '画像',     'zh-TW': '圖片',  en: 'Image' },
  sticker: { ja: 'スタンプ', 'zh-TW': '貼圖',  en: 'Sticker' },
  video:   { ja: '動画',     'zh-TW': '影片',  en: 'Video' },
  audio:   { ja: '音声',     'zh-TW': '語音',  en: 'Audio' },
  file:    { ja: 'ファイル', 'zh-TW': '檔案',  en: 'File' },
  call:    { ja: '通話',     'zh-TW': '通話',  en: 'Call' },
  system:  { ja: 'システム', 'zh-TW': '系統',  en: 'System' },
}

function getTypeLabel(type: string): string {
  return typeLabels[type]?.[locale.value] ?? type
}

const option = computed(() => ({
  backgroundColor: 'transparent',
  textStyle: { fontFamily: 'Inter, Noto Sans JP, sans-serif', fontSize: 11 },
  tooltip: {
    trigger: 'item',
    backgroundColor: isDark.value ? '#1f1f1f' : '#fff',
    borderColor: isDark.value ? '#333' : '#e5e5e5',
    textStyle: { color: isDark.value ? '#e5e5e5' : '#292524', fontSize: 12 },
    formatter: (params: any) => `${params.name}: ${params.value} (${params.percent}%)`,
  },
  legend: {
    orient: 'vertical',
    right: 12,
    top: 'center',
    textStyle: { color: isDark.value ? '#d4d4d4' : '#525252', fontSize: 11 },
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 8,
  },
  series: [
    {
      type: 'pie',
      radius: ['35%', '60%'],
      center: ['35%', '50%'],
      label: { show: false },
      data: props.data.map((d, i) => ({
        name: getTypeLabel(d.type),
        value: d.count,
        itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
      })),
      emphasis: { scaleSize: 4 },
    },
  ],
}))
</script>

<template>
  <div class="flex flex-col">
    <h3 class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ t('analysis.charts.messageTypes') }}
    </h3>
    <BaseCard class="flex-1">
      <VChart :option="option" autoresize style="height: 200px" />
    </BaseCard>
  </div>
</template>
