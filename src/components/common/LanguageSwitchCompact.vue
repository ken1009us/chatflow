<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'

const { locale } = useI18n()
const settings = useSettingsStore()

const languages = [
  { code: 'ja', label: 'JA' },
  { code: 'zh-TW', label: '中' },
  { code: 'en', label: 'EN' },
] as const

function setLanguage(code: 'ja' | 'zh-TW' | 'en') {
  locale.value = code
  settings.setLocale(code)
}
</script>

<template>
  <div class="flex shrink-0 gap-0.5 whitespace-nowrap rounded-lg border border-gray-200 p-0.5 dark:border-gray-800">
    <button
      v-for="lang in languages"
      :key="lang.code"
      :class="[
        'rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors',
        locale === lang.code
          ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
          : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
      ]"
      @click="setLanguage(lang.code)"
    >
      {{ lang.label }}
    </button>
  </div>
</template>
