import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'

import ja from './locales/ja.json'
import zhTW from './locales/zh-TW.json'
import en from './locales/en.json'

import './assets/styles/main.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const savedLocale = (() => {
  try {
    const stored = localStorage.getItem('settings')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.locale
    }
  } catch {
    // ignore
  }
  return 'ja'
})()

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { ja, 'zh-TW': zhTW, en },
})

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(i18n)
app.mount('#app')
