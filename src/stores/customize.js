import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCustomizeStore = defineStore('customize', () => {
  const coins = ref(500)
  const ownedFrames = ref(['default'])
  const ownedBackgrounds = ref(['default'])
  const ownedBadges = ref(['newbie'])
  const ownedDecorations = ref([])
  
  const selectedFrame = ref('default')
  const selectedBackground = ref('default')
  const selectedDecorations = ref([])

  const frames = ref([
    { 
      id: 'default', 
      name: '默认边框', 
      price: 0, 
      style: 'linear-gradient(135deg, #40d8c5, #40a0d8)' 
    },
    { 
      id: 'gold', 
      name: '金色年华', 
      price: 100, 
      style: 'linear-gradient(135deg, #ffd700, #ff8c00)' 
    },
    { 
      id: 'blue', 
      name: '深海蓝', 
      price: 80, 
      style: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' 
    },
    { 
      id: 'purple', 
      name: '紫禁之巅', 
      price: 120, 
      style: 'linear-gradient(135deg, #7c3aed, #a855f7)' 
    },
    { 
      id: 'red', 
      name: '赤焰', 
      price: 150, 
      style: 'linear-gradient(135deg, #dc2626, #f97316)' 
    },
    { 
      id: 'rainbow', 
      name: '彩虹', 
      price: 200, 
      style: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6)' 
    }
  ])

  const backgrounds = ref([
    { 
      id: 'default', 
      name: '默认背景', 
      price: 0, 
      style: 'linear-gradient(135deg, #111f31, #0d1a2b)' 
    },
    { 
      id: 'night', 
      name: '深夜星空', 
      price: 80, 
      style: 'linear-gradient(135deg, #0f172a, #1e1b4b)' 
    },
    { 
      id: 'forest', 
      name: '幽林', 
      price: 100, 
      style: 'linear-gradient(135deg, #064e3b, #111827)' 
    },
    { 
      id: 'sunset', 
      name: '落日', 
      price: 120, 
      style: 'linear-gradient(135deg, #7c2d12, #1f2937)' 
    },
    { 
      id: 'ocean', 
      name: '深海', 
      price: 150, 
      style: 'linear-gradient(135deg, #0c4a6e, #0f172a)' 
    },
    { 
      id: 'mountain', 
      name: '山川', 
      price: 200, 
      style: 'linear-gradient(135deg, #1e293b, #334155)' 
    }
  ])

  const badges = ref([
    { id: 'newbie', name: '新人入驻', icon: '🌱', desc: '首次注册用户', price: 0 },
    { id: 'learner', name: '学习之星', icon: '⭐', desc: '完成10次学习', price: 50 },
    { id: 'poster', name: '活跃发帖', icon: '📝', desc: '发布5篇帖子', price: 80 },
    { id: 'helper', name: '助人为乐', icon: '🤝', desc: '回复10次问题', price: 100 },
    { id: 'video', name: '视频达人', icon: '🎬', desc: '上传3个视频', price: 120 },
    { id: 'daily', name: '坚持不懈', icon: '📅', desc: '连续登录7天', price: 60 },
    { id: 'expert', name: '解题专家', icon: '🧠', desc: '被采纳10次', price: 150 },
    { id: 'first', name: '首充', icon: '💎', desc: '首次购买商品', price: 30 },
    { id: 'viewer', name: '观览者', icon: '👀', desc: '观看50个视频', price: 40 },
    { id: 'collector', name: '收藏家', icon: '📚', desc: '收藏10个内容', price: 60 },
    { id: 'vip', name: 'VIP会员', icon: '👑', desc: 'VIP身份', price: 500 },
    { id: 'legend', name: '传奇', icon: '🏆', desc: '累计1000学习币', price: 200 }
  ])

  const decorations = ref([
    { id: 'star', name: '星星', icon: '✨', price: 20 },
    { id: 'fire', name: '火焰', icon: '🔥', price: 30 },
    { id: 'heart', name: '爱心', icon: '❤️', price: 25 },
    { id: 'lightning', name: '闪电', icon: '⚡', price: 35 },
    { id: 'moon', name: '月亮', icon: '🌙', price: 40 },
    { id: 'sun', name: '太阳', icon: '☀️', price: 40 },
    { id: 'flower', name: '花朵', icon: '🌸', price: 30 },
    { id: 'crown', name: '皇冠', icon: '👑', price: 100 }
  ])

  const purchaseFrame = (frameId) => {
    const frame = frames.value.find(f => f.id === frameId)
    if (frame && !ownedFrames.value.includes(frameId) && coins.value >= frame.price) {
      coins.value -= frame.price
      ownedFrames.value.push(frameId)
      return true
    }
    return false
  }

  const purchaseBackground = (bgId) => {
    const bg = backgrounds.value.find(b => b.id === bgId)
    if (bg && !ownedBackgrounds.value.includes(bgId) && coins.value >= bg.price) {
      coins.value -= bg.price
      ownedBackgrounds.value.push(bgId)
      return true
    }
    return false
  }

  const purchaseBadge = (badgeId) => {
    const badge = badges.value.find(b => b.id === badgeId)
    if (badge && !ownedBadges.value.includes(badgeId) && coins.value >= badge.price) {
      coins.value -= badge.price
      ownedBadges.value.push(badgeId)
      return true
    }
    return false
  }

  const purchaseDecoration = (decId) => {
    const dec = decorations.value.find(d => d.id === decId)
    if (dec && !ownedDecorations.value.includes(decId) && coins.value >= dec.price) {
      coins.value -= dec.price
      ownedDecorations.value.push(decId)
      return true
    }
    return false
  }

  const selectFrame = (frameId) => {
    if (ownedFrames.value.includes(frameId)) {
      selectedFrame.value = frameId
    }
  }

  const selectBackground = (bgId) => {
    if (ownedBackgrounds.value.includes(bgId)) {
      selectedBackground.value = bgId
    }
  }

  const addDecoration = (decId) => {
    if (ownedDecorations.value.includes(decId) && !selectedDecorations.value.includes(decId)) {
      if (selectedDecorations.value.length < 3) {
        selectedDecorations.value.push(decId)
      }
    }
  }

  const removeDecoration = (decId) => {
    const index = selectedDecorations.value.indexOf(decId)
    if (index > -1) {
      selectedDecorations.value.splice(index, 1)
    }
  }

  const earnCoins = (amount) => {
    coins.value += amount
  }

  const getCurrentFrame = computed(() => {
    return frames.value.find(f => f.id === selectedFrame.value) || frames.value[0]
  })

  const getCurrentBackground = computed(() => {
    return backgrounds.value.find(b => b.id === selectedBackground.value) || backgrounds.value[0]
  })

  const getOwnedBadges = computed(() => {
    return badges.value.filter(b => ownedBadges.value.includes(b.id))
  })

  return {
    coins,
    ownedFrames,
    ownedBackgrounds,
    ownedBadges,
    ownedDecorations,
    selectedFrame,
    selectedBackground,
    selectedDecorations,
    frames,
    backgrounds,
    badges,
    decorations,
    purchaseFrame,
    purchaseBackground,
    purchaseBadge,
    purchaseDecoration,
    selectFrame,
    selectBackground,
    addDecoration,
    removeDecoration,
    earnCoins,
    getCurrentFrame,
    getCurrentBackground,
    getOwnedBadges
  }
})