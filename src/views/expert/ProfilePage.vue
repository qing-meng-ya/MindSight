<template>
  <div class="profile-page">
    <!-- 个人信息头部 -->
    <section class="profile-header panel">
      <div class="profile-main">
        <div class="avatar-section">
          <div class="avatar">
            <span class="avatar-text">{{ authStore.user?.name?.charAt(0) || '工' }}</span>
          </div>
        </div>
        <div class="profile-info">
          <h1>{{ authStore.user?.name || '法医工作者' }}</h1>
          <div class="role-badge">工作者</div>
          <div class="level-badge" :style="{ background: levelInfo.color }">
            {{ levelStore.level }}级 {{ levelInfo.name }}
          </div>
        </div>
        <div class="profile-actions">
          <button class="btn btn-primary" @click="themeStore.toggleTheme">
            {{ themeStore.isDark ? '☀️ 浅色模式' : '🌙 深色模式' }}
          </button>
          <button class="btn" @click="handleLogout">退出登录</button>
        </div>
      </div>
      <div class="exp-bar">
        <div class="exp-info">
          <span>经验值</span>
          <span>{{ levelStore.exp }} / {{ levelInfo.maxExp }}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: levelStore.expProgress + '%', background: levelInfo.color }"></div>
        </div>
        <p class="exp-hint">距离下一等级还需 {{ levelStore.expToNextLevel }} 经验</p>
      </div>
    </section>

    <div class="profile-grid">
      <!-- 工作数据统计 -->
      <section class="panel stats-card">
        <h2 class="section-title">工作数据</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ caseCount }}</span>
            <span class="stat-label">处理案件</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ toolUsageCount }}</span>
            <span class="stat-label">工具使用</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ favoriteCount }}</span>
            <span class="stat-label">我的收藏</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ docViewCount }}</span>
            <span class="stat-label">文档查看</span>
          </div>
        </div>
      </section>

      <!-- 我的收藏 -->
      <section class="panel favorites-card">
        <h2 class="section-title">我的收藏</h2>
        <div class="favorites-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: favTab === 'tools' }"
            @click="favTab = 'tools'"
          >工具</button>
          <button 
            class="tab-btn" 
            :class="{ active: favTab === 'docs' }"
            @click="favTab = 'docs'"
          >文档</button>
        </div>
        <div class="favorites-list">
          <div v-if="favTab === 'tools'">
            <div v-for="tool in favoriteTools" :key="tool.id" class="fav-item" @click="openTool(tool)">
              <span class="fav-name">{{ tool.name }}</span>
              <span class="fav-meta">{{ tool.standardNames }}</span>
            </div>
            <p v-if="favoriteTools.length === 0" class="empty-text">暂无收藏工具</p>
          </div>
          <div v-else>
            <div v-for="doc in favoriteDocs" :key="doc.id" class="fav-item" @click="viewDoc(doc)">
              <span class="fav-name">{{ doc.title }}</span>
              <span class="fav-meta">{{ doc.scenario }}</span>
            </div>
            <p v-if="favoriteDocs.length === 0" class="empty-text">暂无收藏文档</p>
          </div>
        </div>
      </section>

      <!-- 最近活动 -->
      <section class="panel activity-card">
        <h2 class="section-title">最近活动</h2>
        <div class="activity-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activityTab === 'tools' }"
            @click="activityTab = 'tools'"
          >工具</button>
          <button 
            class="tab-btn" 
            :class="{ active: activityTab === 'docs' }"
            @click="activityTab = 'docs'"
          >文档</button>
          <button 
            class="tab-btn" 
            :class="{ active: activityTab === 'cases' }"
            @click="activityTab = 'cases'"
          >案件</button>
        </div>
        <div class="activity-list">
          <div v-if="activityTab === 'tools'">
            <div v-for="item in recentTools" :key="item.id" class="activity-item" @click="openTool(item)">
              <span class="activity-icon">🔧</span>
              <div class="activity-content">
                <span class="activity-title">{{ item.name }}</span>
                <span class="activity-time">{{ item.lastUsed || '最近' }}</span>
              </div>
            </div>
            <p v-if="recentTools.length === 0" class="empty-text">暂无使用记录</p>
          </div>
          <div v-else-if="activityTab === 'docs'">
            <div v-for="doc in recentDocViews" :key="doc.id" class="activity-item" @click="viewDoc(doc)">
              <span class="activity-icon">📄</span>
              <div class="activity-content">
                <span class="activity-title">{{ doc.title }}</span>
                <span class="activity-time">最近查看</span>
              </div>
            </div>
            <p v-if="recentDocViews.length === 0" class="empty-text">暂无查看记录</p>
          </div>
          <div v-else>
            <div v-for="c in recentCases" :key="c.id" class="activity-item">
              <span class="activity-icon">📁</span>
              <div class="activity-content">
                <span class="activity-title">{{ c.title }}</span>
                <span class="activity-time">{{ c.typeLabel }}</span>
              </div>
            </div>
            <p v-if="recentCases.length === 0" class="empty-text">暂无案件记录</p>
          </div>
        </div>
      </section>

      <!-- 成就展示 -->
      <section class="panel achievements-card">
        <h2 class="section-title">成就徽章</h2>
        <div class="achievements-grid">
          <div 
            v-for="ach in levelStore.unlockedAchievements.slice(0, 6)" 
            :key="ach.id" 
            class="achievement-badge"
            :title="ach.desc"
          >
            <span class="badge-icon">{{ ach.icon }}</span>
            <span class="badge-name">{{ ach.name }}</span>
          </div>
        </div>
        <p class="achievement-summary">
          已解锁 {{ levelStore.unlockedAchievements.length }} / {{ levelStore.achievements.length }} 个成就
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLevelStore } from '@/stores/level'
import { useThemeStore } from '@/stores/theme'
import { storage } from '@/utils/storage.js'
import { getAllTools } from '@/utils/toolDataService.js'

const router = useRouter()
const authStore = useAuthStore()
const levelStore = useLevelStore()
const themeStore = useThemeStore()

const allTools = getAllTools()

const levelInfo = computed(() => levelStore.currentLevelInfo)

// 标签切换
const favTab = ref('tools')
const activityTab = ref('tools')

// 读取持久化数据
const favoriteToolIds = storage.get('expert:favoriteToolIds', [])
const recentToolUsages = storage.get('expert:recentToolUsages', [])
const favoriteDocIds = storage.get('library:favoriteDocIds', [])
const recentDocViewData = storage.get('library:recentDocViews', [])
const casesData = storage.get('caseManager:cases', [])

// 收藏工具
const favoriteTools = computed(() => {
  return favoriteToolIds
    .map(id => allTools.find(t => t.id === id))
    .filter(Boolean)
})

// 收藏文档（从LibraryPage的docs数据模拟）
const favoriteDocs = computed(() => {
  // 这里简化处理，实际应从LibraryPage的docs中查找
  return favoriteDocIds.map(id => ({
    id,
    title: `标准文档 #${id}`,
    scenario: '标准规范'
  }))
})

// 最近使用工具
const recentTools = computed(() => {
  return recentToolUsages
    .slice(0, 5)
    .map(r => {
      const tool = allTools.find(t => t.id === r.id)
      return tool ? { ...tool, lastUsed: r.time || '最近' } : null
    })
    .filter(Boolean)
})

// 最近查看文档
const recentDocViews = computed(() => {
  return recentDocViewData.slice(0, 5).map(r => ({
    id: r.id,
    title: r.title || `文档 #${r.id}`
  }))
})

// 最近案件
const recentCases = computed(() => {
  return casesData.slice(-5).reverse()
})

// 统计数据
const caseCount = computed(() => casesData.length)
const toolUsageCount = computed(() => recentToolUsages.length)
const favoriteCount = computed(() => favoriteToolIds.length + favoriteDocIds.length)
const docViewCount = computed(() => recentDocViewData.length)

const openTool = (tool) => {
  if (tool?.id) router.push({ name: 'tool-detail', params: { id: tool.id } })
}

const viewDoc = (doc) => {
  // 文档查看逻辑
  console.log('查看文档:', doc.title)
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.profile-page {
  display: grid;
  gap: 24px;
}

.profile-header {
  padding: 24px;
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #2a9d8f);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  color: #fff;
}

.profile-info {
  flex: 1;
}

.profile-info h1 {
  margin: 0 0 6px;
  font-size: 22px;
}

.role-badge {
  display: inline-block;
  padding: 2px 10px;
  background: rgba(255, 180, 84, 0.15);
  color: #ffb454;
  font-size: 12px;
  border-radius: 4px;
  margin-right: 8px;
}

.level-badge {
  display: inline-block;
  padding: 2px 10px;
  color: var(--bg-0);
  font-size: 12px;
  border-radius: 4px;
}

.profile-actions {
  display: flex;
  gap: 10px;
}

.exp-bar {
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.exp-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.progress-track {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.exp-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.favorites-tabs,
.activity-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tab-btn {
  padding: 6px 14px;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  border-color: var(--accent);
}

.tab-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg-0);
}

.favorites-list,
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fav-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.fav-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.fav-name {
  font-size: 14px;
}

.fav-meta {
  font-size: 12px;
  color: var(--text-muted);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.activity-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.activity-icon {
  font-size: 18px;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-title {
  font-size: 14px;
}

.activity-time {
  font-size: 12px;
  color: var(--text-muted);
}

.empty-text {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
  font-size: 13px;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.achievement-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  cursor: help;
}

.badge-icon {
  font-size: 28px;
}

.badge-name {
  font-size: 12px;
  text-align: center;
}

.achievement-summary {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
}

@media (max-width: 768px) {
  .profile-main {
    flex-direction: column;
    text-align: center;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .achievements-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
