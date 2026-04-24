/**
 * 本地持久化存储封装
 * 基于 localStorage，带命名空间和 JSON 序列化
 */

const PREFIX = 'forensic-helper:'

export const storage = {
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : defaultValue
    } catch (e) {
      console.warn('Storage get error:', e)
      return defaultValue
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.warn('Storage set error:', e)
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key)
  },

  clear() {
    // 只清除本应用前缀的数据
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k))
  },

  keys() {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .map(k => k.slice(PREFIX.length))
  }
}

// 快捷方法
export function getItem(key, defaultValue) {
  return storage.get(key, defaultValue)
}

export function setItem(key, value) {
  storage.set(key, value)
}

export function removeItem(key) {
  storage.remove(key)
}

export default storage
