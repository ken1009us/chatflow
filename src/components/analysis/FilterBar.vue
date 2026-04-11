<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export interface DateFilter {
  preset: 'all' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
  start?: string
  end?: string
}

const { t } = useI18n()

const model = defineModel<DateFilter>({ required: true })

const presets = ['all', 'week', 'month', 'quarter', 'year'] as const

const customStart = ref('')
const customEnd = ref('')

function selectPreset(preset: typeof presets[number]) {
  customStart.value = ''
  customEnd.value = ''
  model.value = { preset }
}

watch([customStart, customEnd], () => {
  if (customStart.value || customEnd.value) {
    model.value = {
      preset: 'custom',
      start: customStart.value || undefined,
      end: customEnd.value || undefined,
    }
  }
})
</script>

<template>
  <div class="space-y-2">
    <!-- Preset buttons -->
    <div class="flex gap-1">
      <button
        v-for="f in presets"
        :key="f"
        :class="[
          'whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition-colors',
          model.preset === f
            ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
        ]"
        @click="selectPreset(f)"
      >
        {{ t(`analysis.filter.${f}`) }}
      </button>
    </div>

    <!-- Custom date range -->
    <div class="flex items-center gap-2">
      <input
        v-model="customStart"
        type="date"
        :class="[
          'rounded-md border px-2 py-1 text-xs',
          'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300',
        ]"
      />
      <span class="text-xs text-gray-400">~</span>
      <input
        v-model="customEnd"
        type="date"
        :class="[
          'rounded-md border px-2 py-1 text-xs',
          'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300',
        ]"
      />
    </div>
  </div>
</template>
