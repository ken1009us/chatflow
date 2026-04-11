<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseCard from '@/components/common/BaseCard.vue'
import type { NightOwlEntry } from '@/composables/useAnalysis'

const { locale } = useI18n()

const props = defineProps<{
  data: NightOwlEntry[]
}>()

const title = computed(() =>
  locale.value === 'ja' ? '深夜チャット指数' : locale.value === 'zh-TW' ? '深夜聊天指數' : 'Night Owl Index'
)

const subtitle = computed(() =>
  locale.value === 'ja' ? '0:00〜5:00 のメッセージ比率' : locale.value === 'zh-TW' ? '0:00-5:00 訊息比例' : '0:00-5:00 message ratio'
)

const top = computed(() => props.data.filter(d => d.totalCount > 0).slice(0, 10))
</script>

<template>
  <div>
    <h3 class="mb-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ title }}
    </h3>
    <p class="mb-2 text-[10px] text-gray-400 dark:text-gray-500">{{ subtitle }}</p>
    <BaseCard>
    <div class="space-y-2">
      <div v-for="entry in top" :key="entry.name" class="flex items-center gap-3">
        <span class="w-16 shrink-0 truncate text-xs text-gray-700 dark:text-gray-200">
          {{ entry.name }}
        </span>
        <div class="flex-1">
          <div class="h-4 rounded-full bg-gray-100 dark:bg-neutral-800">
            <div
              class="flex h-4 items-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all"
              :style="{ width: `${Math.max(entry.ratio * 100, 4)}%` }"
            >
              <span
                v-if="entry.ratio > 0.08"
                class="pl-2 text-[10px] font-medium text-white"
              >
                {{ entry.nightCount }}
              </span>
            </div>
          </div>
        </div>
        <span class="w-10 shrink-0 text-right text-[11px] font-medium tabular-nums text-gray-600 dark:text-gray-300">
          {{ Math.round(entry.ratio * 100) }}%
        </span>
      </div>
    </div>
    </BaseCard>
  </div>
</template>
