import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const collapsed = ref(false)
  const theme = ref<'light' | 'dark'>('light')
  const language = ref<'zh-CN' | 'en-US'>('zh-CN')
  const loading = ref(false)
  const breadcrumbs = ref<Array<{ title: string; path?: string }>>([])
  const online = ref(navigator.onLine)

  // Getters
  const isDark = computed(() => theme.value === 'dark')
  const sidebarWidth = computed(() => (collapsed.value ? 80 : 200))

  // Actions
  const toggleCollapsed = () => {
    collapsed.value = !collapsed.value
  }

  const setCollapsed = (value: boolean) => {
    collapsed.value = value
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const setTheme = (value: 'light' | 'dark') => {
    theme.value = value
  }

  const setLanguage = (value: 'zh-CN' | 'en-US') => {
    language.value = value
  }

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setBreadcrumbs = (items: Array<{ title: string; path?: string }>) => {
    breadcrumbs.value = items
  }

  const setOnlineStatus = (value: boolean) => {
    online.value = value
  }

  // 监听网络状态
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setOnlineStatus(true))
    window.addEventListener('offline', () => setOnlineStatus(false))
  }

  return {
    collapsed,
    theme,
    language,
    loading,
    breadcrumbs,
    online,
    isDark,
    sidebarWidth,
    toggleCollapsed,
    setCollapsed,
    toggleTheme,
    setTheme,
    setLanguage,
    setLoading,
    setBreadcrumbs,
    setOnlineStatus
  }
})
