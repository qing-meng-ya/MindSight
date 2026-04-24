import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(true)

  // 初始化 - 从localStorage恢复
  function init() {
    const saved = localStorage.getItem('forensic_theme')
    if (saved !== null) {
      isDark.value = saved === 'dark'
    } else {
      isDark.value = true
    }
    applyTheme()
  }

  function applyTheme() {
    const html = document.documentElement
    if (isDark.value) {
      html.removeAttribute('data-theme')
    } else {
      html.setAttribute('data-theme', 'light')
    }
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme()
    localStorage.setItem('forensic_theme', isDark.value ? 'dark' : 'light')
  }

  function setDark(value) {
    isDark.value = value
    applyTheme()
    localStorage.setItem('forensic_theme', isDark.value ? 'dark' : 'light')
  }

  init()

  return {
    isDark,
    toggleTheme,
    setDark
  }
})
