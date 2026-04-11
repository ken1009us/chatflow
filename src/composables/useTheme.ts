import { ref, watchEffect } from 'vue'

type Theme = 'dark' | 'light'

const STORAGE_KEY = 'chatflow-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return 'dark'
}

const isDark = ref(getInitialTheme() === 'dark')

function applyTheme(dark: boolean) {
  const root = document.documentElement
  if (dark) {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.remove('dark')
    root.classList.add('light')
  }
  localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
}

export function useTheme() {
  watchEffect(() => {
    applyTheme(isDark.value)
  })

  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}
