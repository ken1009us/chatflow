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

use([CanvasRenderer, TooltipComponent])

const { t } = useI18n()
const { isDark } = useTheme()

const props = defineProps<{
  data: Array<{ word: string; count: number }>
}>()

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
      data: props.data.slice(0, 80).map((d) => ({
        name: d.word,
        value: d.count,
      })),
    },
  ],
}))
</script>

<template>
  <div>
    <h3 class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ t('analysis.charts.wordCloud') }}
    </h3>
    <BaseCard>
      <VChart :option="option" autoresize style="height: 280px" />
    </BaseCard>
  </div>
</template>
