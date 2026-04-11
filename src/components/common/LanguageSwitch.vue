<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'

const { locale } = useI18n()
const settings = useSettingsStore()

const languages = [
  { code: 'ja', label: '日本語' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en', label: 'English' },
] as const

function setLanguage(code: 'ja' | 'zh-TW' | 'en') {
  locale.value = code
  settings.setLocale(code)
}
</script>

<template>
  <div class="flex gap-1 rounded-lg border border-gray-200 p-1 dark:border-gray-800">
    <button
      v-for="lang in languages"
      :key="lang.code"
      :class="[
        'rounded-md px-2 py-1 text-xs transition-colors',
        locale === lang.code
          ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
      ]"
      @click="setLanguage(lang.code)"
    >
      {{ lang.label }}
    </button>
  </div>
</template>
