import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const locale = ref<'ja' | 'zh-TW' | 'en'>('ja')
    const theme = ref<'dark' | 'light'>('dark')

    function setLocale(l: 'ja' | 'zh-TW' | 'en') {
      locale.value = l
    }

    function setTheme(t: 'dark' | 'light') {
      theme.value = t
    }

    return { locale, theme, setLocale, setTheme }
  },
  {
    persist: true,
  }
)
