<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseCard from '@/components/common/BaseCard.vue'
import { CHART_COLORS } from '@/utils/colors'
import type { ConversationStarterEntry } from '@/composables/useAnalysis'

const { t } = useI18n()

const props = defineProps<{
  data: ConversationStarterEntry[]
}>()

const top = computed(() => props.data.slice(0, 10))
const maxCount = computed(() => top.value[0]?.count ?? 1)
</script>

<template>
  <div class="flex flex-col">
    <h3 class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      {{ t('analysis.conversationStarter.title') }}
    </h3>
    <BaseCard class="flex-1">
      <div class="space-y-2">
        <div v-for="(entry, i) in top" :key="entry.name" class="flex items-center gap-3">
          <span class="w-20 shrink-0 truncate text-xs text-gray-600 dark:text-gray-300">
            {{ entry.name }}
          </span>
          <div class="relative flex-1">
            <div
              class="h-4 rounded-full"
              :style="{
                width: `${Math.max((entry.count / maxCount) * 100, 4)}%`,
                backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              }"
            />
          </div>
          <span class="w-8 text-right text-xs tabular-nums text-gray-500 dark:text-gray-400">
            {{ entry.count }}
          </span>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
