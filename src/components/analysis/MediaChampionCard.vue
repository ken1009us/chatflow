<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseCard from '@/components/common/BaseCard.vue'
import type { MediaChampionEntry } from '@/composables/useAnalysis'

const { locale } = useI18n()

const props = defineProps<{
  data: MediaChampionEntry[]
}>()

const title = computed(() =>
  locale.value === 'ja' ? 'メディア達人' : locale.value === 'zh-TW' ? '媒體達人' : 'Media Champion'
)

const stickerKing = computed(() => {
  const sorted = [...props.data].sort((a, b) => b.stickerCount - a.stickerCount)
  return sorted[0] ?? null
})

const photoKing = computed(() => {
  const sorted = [...props.data].sort((a, b) => b.imageCount - a.imageCount)
  return sorted[0] ?? null
})

const stickerLabel = computed(() =>
  locale.value === 'ja' ? 'スタンプ王' : locale.value === 'zh-TW' ? '貼圖王' : 'Sticker King'
)

const photoLabel = computed(() =>
  locale.value === 'ja' ? '写真王' : locale.value === 'zh-TW' ? '圖片王' : 'Photo King'
)

const countUnit = computed(() =>
  locale.value === 'ja' ? '件' : locale.value === 'zh-TW' ? '張' : ''
)
</script>

<template>
  <div class="flex flex-col">
    <h3 class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ title }}
    </h3>
    <BaseCard class="flex-1">
    <div class="grid grid-cols-2 gap-4">
      <!-- Sticker King -->
      <div v-if="stickerKing && stickerKing.stickerCount > 0" class="rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-4 dark:from-pink-500/5 dark:to-purple-500/5">
        <div class="mb-1 text-[10px] font-medium text-pink-500">{{ stickerLabel }}</div>
        <div class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ stickerKing.name }}</div>
        <div class="mt-1 text-lg font-light tabular-nums text-pink-500">
          {{ stickerKing.stickerCount.toLocaleString() }}
          <span class="text-xs">{{ countUnit }}</span>
        </div>
      </div>

      <!-- Photo King -->
      <div v-if="photoKing && photoKing.imageCount > 0" class="rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4 dark:from-blue-500/5 dark:to-cyan-500/5">
        <div class="mb-1 text-[10px] font-medium text-blue-500">{{ photoLabel }}</div>
        <div class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ photoKing.name }}</div>
        <div class="mt-1 text-lg font-light tabular-nums text-blue-500">
          {{ photoKing.imageCount.toLocaleString() }}
          <span class="text-xs">{{ countUnit }}</span>
        </div>
      </div>
    </div>
    </BaseCard>
  </div>
</template>
