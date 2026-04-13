<template>
  <div class="danmu-container" ref="containerRef">
    <div class="danmu-track">
      <div
        v-for="danmu in displayedDanmus"
        :key="danmu.id"
        class="danmu-item"
        :style="danmu.style"
        :class="{ highlight: danmu.highlight }"
      >
        {{ danmu.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  danmus: {
    type: Array,
    default: () => []
  },
  enabled: {
    type: Boolean,
    default: true
  },
  maxVisible: {
    type: Number,
    default: 20
  }
})

const containerRef = ref(null)
const visibleDanmus = ref([])
let animationFrame = null
let lastId = 0

const displayedDanmus = computed(() => {
  return visibleDanmus.value.slice(0, props.maxVisible)
})

const addDanmu = (text, isHighlight = false) => {
  if (!props.enabled) return
  
  const id = ++lastId
  const style = {
    left: '100%',
    animationDuration: `${8 + Math.random() * 4}s`,
    animationTimingFunction: 'linear',
    color: getRandomColor(),
    fontSize: isHighlight ? '24px' : (18 + Math.random() * 4) + 'px',
    fontWeight: isHighlight ? 600 : 400
  }
  
  if (isHighlight) {
    style.textShadow = '0 0 10px rgba(255,255,255,0.8)'
  }
  
  visibleDanmus.value.push({ id, text, style, highlight: isHighlight })
  
  setTimeout(() => {
    visibleDanmus.value = visibleDanmus.value.filter(d => d.id !== id)
  }, 10000)
}

const getRandomColor = () => {
  const colors = [
    '#ffffff', '#40d8c5', '#ffb454', '#ffd93d',
    '#6bcb77', '#ff6b6b', '#a855f7', '#3b82f6'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

const clearDanmus = () => {
  visibleDanmus.value = []
}

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})

defineExpose({
  addDanmu,
  clearDanmus
})
</script>

<style scoped>
.danmu-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 10;
}

.danmu-track {
  position: relative;
  width: 100%;
  height: 100%;
}

.danmu-item {
  position: absolute;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  animation: danmuMove 10s linear forwards;
}

.danmu-item.highlight {
  z-index: 100;
}

@keyframes danmuMove {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100vw - 100%));
  }
}
</style>