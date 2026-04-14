<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseCard from '@/components/common/BaseCard.vue'
import { CHART_COLORS } from '@/utils/colors'
import type { MemberCatchphrases } from '@/composables/useAnalysis'

const { t } = useI18n()

const props = defineProps<{
  data: MemberCatchphrases[]
}>()

const TYPE_LABELS: Record<string, string> = {
  sticker: 'analysis.catchphrases.sticker',
  image: 'analysis.catchphrases.image',
  emoji: 'analysis.catchphrases.emoji',
}

const top = computed(() => props.data.slice(0, 10))

function displayWord(phrase: { word: string; type?: string }): string {
  if (phrase.type && TYPE_LABELS[phrase.type]) {
    return t(TYPE_LABELS[phrase.type])
  }
  return phrase.word
}
</script>

<template>
  <div>
    <h3 class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ t('analysis.catchphrases.title') }}
    </h3>
    <BaseCard>
    <div class="space-y-3">
      <div v-for="(member, idx) in top" :key="member.name" class="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
        <span class="w-20 shrink-0 truncate text-xs font-medium text-gray-700 dark:text-gray-200">
          {{ member.name }}
        </span>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="phrase in member.phrases"
            :key="phrase.word"
            class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
            :style="{
              backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] + '18',
              color: CHART_COLORS[idx % CHART_COLORS.length],
              border: `1px solid ${CHART_COLORS[idx % CHART_COLORS.length]}30`,
            }"
          >
            {{ displayWord(phrase) }}
            <span class="opacity-60">{{ phrase.count }}</span>
          </span>
        </div>
      </div>
    </div>
    </BaseCard>
  </div>
</template>
