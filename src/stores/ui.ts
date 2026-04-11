import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)
  const loading = ref(false)
  const currentSessionId = ref<number | null>(null)

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  function setCurrentSession(id: number | null) {
    currentSessionId.value = id
  }

  return { sidebarOpen, loading, currentSessionId, toggleSidebar, setLoading, setCurrentSession }
})
