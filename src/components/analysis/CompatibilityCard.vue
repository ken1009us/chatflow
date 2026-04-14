<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseCard from '@/components/common/BaseCard.vue'
import { CHART_COLORS } from '@/utils/colors'
import type { CompatibilityPair } from '@/composables/useAnalysis'

const { locale } = useI18n()

const props = defineProps<{
  data: CompatibilityPair[]
}>()

const title = computed(() =>
  locale.value === 'ja' ? 'やりとりバランス' : locale.value === 'zh-TW' ? '互動平衡' : 'Interaction Balance'
)

const balanceLabel = computed(() =>
  locale.value === 'ja' ? 'バランス度' : locale.value === 'zh-TW' ? '平衡度' : 'Balance'
)

const top = computed(() => props.data.slice(0, 5))
</script>

<template>
  <div class="flex flex-col">
    <h3 class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ title }}
    </h3>
    <BaseCard class="flex-1">
    <div class="space-y-4">
      <div v-for="(pair, idx) in top" :key="`${pair.memberA}-${pair.memberB}`">
        <div class="mb-1.5 flex items-center justify-between">
          <span class="text-xs font-medium text-gray-700 dark:text-gray-200">
            {{ pair.memberA }} &harr; {{ pair.memberB }}
          </span>
          <span class="rounded-full px-2 py-0.5 text-[10px] font-medium"
            :style="{
              backgroundColor: pair.balance > 0.7 ? '#10b98118' : pair.balance > 0.4 ? '#f59e0b18' : '#ef444418',
              color: pair.balance > 0.7 ? '#10b981' : pair.balance > 0.4 ? '#f59e0b' : '#ef4444',
            }"
          >
            {{ balanceLabel }} {{ Math.round(pair.balance * 100) }}%
          </span>
        </div>
        <!-- Balance bar -->
        <div class="flex h-5 overflow-hidden rounded-full">
          <div
            class="flex items-center justify-end pr-1.5 text-[10px] font-medium text-white"
            :style="{
              width: `${(pair.aToB / (pair.aToB + pair.bToA)) * 100}%`,
              backgroundColor: CHART_COLORS[idx * 2 % CHART_COLORS.length],
              minWidth: '20%',
            }"
          >
            {{ pair.aToB.toLocaleString() }}
          </div>
          <div
            class="flex items-center pl-1.5 text-[10px] font-medium text-white"
            :style="{
              width: `${(pair.bToA / (pair.aToB + pair.bToA)) * 100}%`,
              backgroundColor: CHART_COLORS[(idx * 2 + 1) % CHART_COLORS.length],
              minWidth: '20%',
            }"
          >
            {{ pair.bToA.toLocaleString() }}
          </div>
        </div>
        <div class="mt-1 flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
          <span>{{ pair.memberA }}</span>
          <span>{{ pair.memberB }}</span>
        </div>
      </div>
    </div>
    </BaseCard>
  </div>
</template>
