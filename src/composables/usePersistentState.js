import { ref, watch } from 'vue'
import { storage } from '@/utils/storage.js'

/**
 * 持久化状态组合式函数
 * 自动将 ref 的值同步到 localStorage
 * @param {string} key - 存储键名（自动添加前缀）
 * @param {*} defaultValue - 默认值
 * @returns {Ref} 响应式引用
 */
export function usePersistentState(key, defaultValue) {
  const state = ref(storage.get(key, defaultValue))

  watch(
    state,
    (val) => {
      storage.set(key, val)
    },
    { deep: true }
  )

  return state
}

/**
 * 持久化数组状态（带合并策略）
 * @param {string} key
 * @param {Array} defaultValue
 * @param {number} maxSize - 最大保存条数
 */
export function usePersistentList(key, defaultValue = [], maxSize = 50) {
  const state = ref(storage.get(key, defaultValue))

  watch(
    state,
    (val) => {
      if (Array.isArray(val) && val.length > maxSize) {
        state.value = val.slice(0, maxSize)
      }
      storage.set(key, state.value)
    },
    { deep: true }
  )

  return state
}

export default usePersistentState
