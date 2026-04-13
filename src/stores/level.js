import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLevelStore = defineStore('level', () => {
  const level = ref('A')
  const exp = ref(320)
  const totalExp = ref(2850)
  const streak = ref(5)

  const levelConfig = ref([
    { level: 'A', name: '入门', minExp: 0, maxExp: 500, color: '#6bcb77' },
    { level: 'B', name: '初级', minExp: 500, maxExp: 2000, color: '#40d8c5' },
    { level: 'C', name: '中级', minExp: 2000, maxExp: 5000, color: '#ffd93d' },
    { level: 'D', name: '高级', minExp: 5000, maxExp: 10000, color: '#ffb454' },
    { level: 'E', name: '专家', minExp: 10000, maxExp: Infinity, color: '#ff6b6b' }
  ])

  const achievements = ref([
    { id: 'first_learn', name: '初窥门径', desc: '完成首次学习', icon: '🎯', unlocked: true, date: '2024-01-15' },
    { id: 'daily_3', name: '三连胜', desc: '连续学习3天', icon: '🔥', unlocked: true, date: '2024-01-18' },
    { id: 'daily_7', name: '周而复始', desc: '连续学习7天', icon: '📅', unlocked: true, date: '2024-01-22' },
    { id: 'video_5', name: '视频控', desc: '观看5个视频', icon: '🎬', unlocked: true, date: '2024-01-20' },
    { id: 'tool_10', name: '工具达人', desc: '使用10次工具', icon: '🔧', unlocked: false, date: '' },
    { id: 'case_3', name: '案例新手', desc: '完成3个案例', icon: '📁', unlocked: true, date: '2024-01-19' },
    { id: 'post', name: '首发帖子', desc: '发布1篇帖子', icon: '📝', unlocked: false, date: '' },
    { id: 'reply', name: '热心回复', desc: '回复5次问题', icon: '💬', unlocked: false, date: '' },
    { id: 'collect_5', name: '收藏癖', desc: '收藏5个内容', icon: '⭐', unlocked: false, date: '' },
    { id: 'exam_pass', name: '及格飘过', desc: '通过首次测验', icon: '📋', unlocked: false, date: '' },
    { id: 'perfect', name: '满分通过', desc: '测验获得满分', icon: '💯', unlocked: false, date: '' },
    { id: 'master', name: '融会贯通', desc: '达到D级', icon: '🏆', unlocked: false, date: '' }
  ])

  const dailyTasks = ref([
    { id: 1, name: '每日登录', desc: '登录并浏览知识库', exp: 10, done: true },
    { id: 2, name: '观看视频', desc: '观看1个教学视频', exp: 15, done: true },
    { id: 3, name: '工具练习', desc: '使用1次计算工具', exp: 20, done: false },
    { id: 4, name: '完成案例', desc: '完成1个案例练习', exp: 30, done: false },
    { id: 5, name: '社区互动', desc: '回复或点赞1次', exp: 10, done: false }
  ])

  const weeklyTasks = ref([
    { id: 1, name: '本周学习', desc: '累计学习5小时', exp: 100, progress: 3, target: 5 },
    { id: 2, name: '视频学习', desc: '观看3个教学视频', exp: 50, progress: 2, target: 3 },
    { id: 3, name: '案例练习', desc: '完成5个案例', exp: 100, progress: 3, target: 5 },
    { id: 4, name: '工具练习', desc: '使用10次工具', exp: 80, progress: 6, target: 10 }
  ])

  const currentLevelInfo = computed(() => {
    return levelConfig.value.find(l => l.level === level.value) || levelConfig.value[0]
  })

  const expProgress = computed(() => {
    const current = levelConfig.value.find(l => l.level === level.value)
    if (!current) return 0
    const range = current.maxExp - current.minExp
    const progress = exp.value - current.minExp
    return Math.min(100, Math.round((progress / range) * 100))
  })

  const expToNextLevel = computed(() => {
    const current = levelConfig.value.find(l => l.level === level.value)
    if (!current) return 0
    return current.maxExp - exp.value
  })

  const unlockedAchievements = computed(() => {
    return achievements.value.filter(a => a.unlocked)
  })

  const lockedAchievements = computed(() => {
    return achievements.value.filter(a => !a.unlocked)
  })

  const addExp = (amount) => {
    exp.value += amount
    totalExp.value += amount
    checkLevelUp()
  }

  const checkLevelUp = () => {
    const currentIndex = levelConfig.value.findIndex(l => l.level === level.value)
    if (currentIndex < levelConfig.value.length - 1) {
      const nextLevel = levelConfig.value[currentIndex + 1]
      if (exp.value >= nextLevel.minExp) {
        level.value = nextLevel.level
        return true
      }
    }
    return false
  }

  const unlockAchievement = (achievementId) => {
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true
      achievement.date = new Date().toISOString().split('T')[0]
      return true
    }
    return false
  }

  const completeDailyTask = (taskId) => {
    const task = dailyTasks.value.find(t => t.id === taskId)
    if (task && !task.done) {
      task.done = true
      addExp(task.exp)
      return true
    }
    return false
  }

  const resetDailyTasks = () => {
    dailyTasks.value.forEach(task => {
      task.done = false
    })
  }

  return {
    level,
    exp,
    totalExp,
    streak,
    levelConfig,
    achievements,
    dailyTasks,
    weeklyTasks,
    currentLevelInfo,
    expProgress,
    expToNextLevel,
    unlockedAchievements,
    lockedAchievements,
    addExp,
    checkLevelUp,
    unlockAchievement,
    completeDailyTask,
    resetDailyTasks
  }
})