<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { TooltipComponent } from 'echarts/components'
import 'echarts-wordcloud'
import BaseCard from '@/components/common/BaseCard.vue'
import { WORD_CLOUD_COLORS } from '@/utils/colors'
import { STOP_WORDS } from '@/utils/stopwords'

use([CanvasRenderer, TooltipComponent])

const { t } = useI18n()
const { isDark } = useTheme()

const STICKER_RE = /^[a-zA-Z_]+$/

const props = defineProps<{
  data: Array<{ word: string; count: number }>
  totalMessages?: number
  totalWords?: number
  uniqueWords?: number
}>()

const filteredData = computed(() =>
  props.data.filter(d => !STICKER_RE.test(d.word) && !STOP_WORDS.has(d.word) && !STOP_WORDS.has(d.word.toLowerCase()))
)

const option = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    show: true,
    backgroundColor: isDark.value ? '#262626' : '#fff',
    borderColor: isDark.value ? '#404040' : '#e5e5e5',
    textStyle: { color: isDark.value ? '#e5e5e5' : '#292524', fontSize: 12 },
    formatter: (params: any) => `${params.name}: ${params.value}`,
  },
  series: [
    {
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '90%',
      height: '90%',
      sizeRange: [12, 48],
      rotationRange: [-45, 45],
      rotationStep: 15,
      gridSize: 6,
      drawOutOfBound: false,
      textStyle: {
        fontFamily: 'Inter, Noto Sans JP, sans-serif',
        fontWeight: 500,
        color: () => WORD_CLOUD_COLORS[Math.floor(Math.random() * WORD_CLOUD_COLORS.length)],
      },
      emphasis: {
        textStyle: {
          shadowBlur: 8,
          shadowColor: 'rgba(0,0,0,0.3)',
        },
      },
      data: filteredData.value.slice(0, 80).map((d) => ({
        name: d.word,
        value: d.count,
      })),
    },
  ],
}))

const hasStats = computed(() =>
  props.totalMessages != null || props.totalWords != null || props.uniqueWords != null
)
</script>

<template>
  <div>
    <h3 class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ t('analysis.charts.wordCloud') }}
    </h3>
    <BaseCard>
      <VChart :option="option" autoresize style="height: 280px" />
      <div v-if="hasStats" class="mt-2 flex justify-center gap-6 border-t border-gray-100 pt-2 text-[11px] text-gray-500 dark:border-gray-800 dark:text-gray-400">
        <span v-if="totalMessages != null">{{ t('analysis.wordCloud.totalMessages') }}: {{ totalMessages?.toLocaleString() }}</span>
        <span v-if="totalWords != null">{{ t('analysis.wordCloud.totalWords') }}: {{ totalWords?.toLocaleString() }}</span>
        <span v-if="uniqueWords != null">{{ t('analysis.wordCloud.uniqueWords') }}: {{ uniqueWords?.toLocaleString() }}</span>
      </div>
    </BaseCard>
  </div>
</template>
