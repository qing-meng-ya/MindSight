<template>
  <div class="profile-page">
    <section class="profile-header panel" :style="{ background: currentBackgroundStyle }">
      <div class="profile-main">
        <div class="avatar-section">
          <div class="avatar" :style="{ border: currentBorderStyle }">
            <span class="avatar-text">{{ authStore.user?.name?.charAt(0) || '学' }}</span>
          </div>
          <div class="decoration-container">
            <span v-for="dec in activeDecorations" :key="dec.id" class="decoration">{{ dec.icon }}</span>
          </div>
        </div>
        <div class="profile-info">
          <h1>{{ authStore.user?.name || '法医学习者' }}</h1>
          <div class="level-badge" :style="{ background: levelInfo.color }">
            {{ levelStore.level }}级 {{ levelInfo.name }}
          </div>
          <p class="user-bio">{{ bio }}</p>
        </div>
        <div class="profile-actions">
          <button class="btn btn-primary" @click="showCustomize = true">编辑资料</button>
          <button class="btn" @click="showAchievements = true">查看成就</button>
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
      <section class="panel stats-card">
        <h2 class="section-title">学习数据</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ levelStore.totalExp }}</span>
            <span class="stat-label">总经验</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ levelStore.streak }}</span>
            <span class="stat-label">连续学习</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ statsData.videos }}</span>
            <span class="stat-label">观看视频</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ statsData.cases }}</span>
            <span class="stat-label">完成案例</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ statsData.tools }}</span>
            <span class="stat-label">工具使用</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ statsData.posts }}</span>
            <span class="stat-label">发布帖子</span>
          </div>
        </div>
      </section>

      <section class="panel coins-card">
        <h2 class="section-title">学习币</h2>
        <div class="coins-display">
          <span class="coins-value">{{ customizeStore.coins }}</span>
          <button class="btn btn-primary" @click="showMall = true">前往商城</button>
        </div>
        <div class="coins-source">
          <p>今日可获得：<strong>+50</strong></p>
          <ul>
            <li>每日登录 +10</li>
            <li>观看视频 +15</li>
            <li>工具练习 +20</li>
            <li>社区互动 +5</li>
          </ul>
        </div>
      </section>
    </div>

    <section class="panel badges-card">
      <div class="section-header">
        <h2 class="section-title">成就徽章</h2>
        <span class="text-muted">已解锁 {{ levelStore.unlockedAchievements.length }} / {{ levelStore.achievements.length }}</span>
      </div>
      <div class="badges-grid">
        <div 
          v-for="badge in levelStore.achievements" 
          :key="badge.id" 
          class="badge-item"
          :class="{ locked: !badge.unlocked }"
        >
          <span class="badge-icon">{{ badge.icon }}</span>
          <span class="badge-name">{{ badge.name }}</span>
          <span class="badge-desc">{{ badge.desc }}</span>
          <span v-if="badge.unlocked" class="badge-date">{{ badge.date }}</span>
        </div>
      </div>
    </section>

    <section class="panel activity-card">
      <h2 class="section-title">最近动态</h2>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <span class="activity-icon">{{ activity.icon }}</span>
          <div class="activity-content">
            <span class="activity-title">{{ activity.title }}</span>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="panel content-card">
      <h2 class="section-title">我发布的内容</h2>
      <div class="content-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeContentTab === 'videos' }"
          @click="activeContentTab = 'videos'"
        >视频 ({{ myVideos.length }})</button>
        <button 
          class="tab-btn" 
          :class="{ active: activeContentTab === 'posts' }"
          @click="activeContentTab = 'posts'"
        >帖子 ({{ myPosts.length }})</button>
      </div>
      <div class="content-list">
        <div v-for="item in currentContentList" :key="item.id" class="content-item">
          <div class="content-thumb"></div>
          <div class="content-info">
            <h3>{{ item.title }}</h3>
            <div class="content-meta">
              <span>{{ item.views }} 次观看</span>
              <span>{{ item.likes }} 点赞</span>
              <span>{{ item.date }}</span>
            </div>
          </div>
        </div>
        <div v-if="currentContentList.length === 0" class="empty-content">
          <p>暂无发布内容</p>
          <button class="btn btn-primary" @click="goToPublish">开始发布</button>
        </div>
      </div>
    </section>

    <!-- 换装弹窗 -->
    <div v-if="showCustomize" class="modal" @click.self="showCustomize = false">
      <div class="modal-content panel">
        <div class="modal-header">
          <h2>个性化设置</h2>
          <button class="close-btn" @click="showCustomize = false">&times;</button>
        </div>
        <div class="customize-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: customizeTab === 'frame' }"
            @click="customizeTab = 'frame'"
          >头像框</button>
          <button 
            class="tab-btn" 
            :class="{ active: customizeTab === 'background' }"
            @click="customizeTab = 'background'"
          >背景皮肤</button>
          <button 
            class="tab-btn" 
            :class="{ active: customizeTab === 'decoration' }"
            @click="customizeTab = 'decoration'"
          >装饰物</button>
        </div>
        <div class="customize-content">
          <div v-if="customizeTab === 'frame'" class="customize-grid">
            <div 
              v-for="frame in customizeStore.frames" 
              :key="frame.id" 
              class="customize-item"
              :class="{ owned: customizeStore.ownedFrames.includes(frame.id), selected: customizeStore.selectedFrame === frame.id }"
              @click="selectFrame(frame)"
            >
              <div class="frame-preview" :style="{ background: frame.style }"></div>
              <span class="item-name">{{ frame.name }}</span>
              <span v-if="!customizeStore.ownedFrames.includes(frame.id)" class="item-price">{{ frame.price }}币</span>
              <span v-else class="item-owned">已拥有</span>
            </div>
          </div>
          <div v-if="customizeTab === 'background'" class="customize-grid">
            <div 
              v-for="bg in customizeStore.backgrounds" 
              :key="bg.id" 
              class="customize-item"
              :class="{ owned: customizeStore.ownedBackgrounds.includes(bg.id), selected: customizeStore.selectedBackground === bg.id }"
              @click="selectBackground(bg)"
            >
              <div class="bg-preview" :style="{ background: bg.style }"></div>
              <span class="item-name">{{ bg.name }}</span>
              <span v-if="!customizeStore.ownedBackgrounds.includes(bg.id)" class="item-price">{{ bg.price }}币</span>
              <span v-else class="item-owned">已拥有</span>
            </div>
          </div>
          <div v-if="customizeTab === 'decoration'" class="customize-grid">
            <div 
              v-for="dec in customizeStore.decorations" 
              :key="dec.id" 
              class="customize-item"
              :class="{ owned: customizeStore.ownedDecorations.includes(dec.id), selected: customizeStore.selectedDecorations.includes(dec.id) }"
              @click="toggleDecoration(dec)"
            >
              <span class="dec-preview">{{ dec.icon }}</span>
              <span class="item-name">{{ dec.name }}</span>
              <span v-if="!customizeStore.ownedDecorations.includes(dec.id)" class="item-price">{{ dec.price }}币</span>
              <span v-else class="item-owned">已拥有</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成就弹窗 -->
    <div v-if="showAchievements" class="modal" @click.self="showAchievements = false">
      <div class="modal-content panel achievements-modal">
        <div class="modal-header">
          <h2>成就徽章</h2>
          <button class="close-btn" @click="showAchievements = false">&times;</button>
        </div>
        <div class="achievements-list">
          <div 
            v-for="badge in levelStore.achievements" 
            :key="badge.id" 
            class="achievement-item"
            :class="{ locked: !badge.unlocked }"
          >
            <span class="achievement-icon">{{ badge.icon }}</span>
            <div class="achievement-info">
              <h3>{{ badge.name }}</h3>
              <p>{{ badge.desc }}</p>
              <span v-if="badge.unlocked" class="achievement-date">解锁于 {{ badge.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 商城弹窗 -->
    <div v-if="showMall" class="modal" @click.self="showMall = false">
      <div class="modal-content panel mall-modal">
        <div class="modal-header">
          <h2>学习币商城</h2>
          <div class="mall-coins">
            <span>余额：{{ customizeStore.coins }}币</span>
          </div>
          <button class="close-btn" @click="showMall = false">&times;</button>
        </div>
        <div class="mall-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: mallTab === 'frame' }"
            @click="mallTab = 'frame'"
          >头像框</button>
          <button 
            class="tab-btn" 
            :class="{ active: mallTab === 'background' }"
            @click="mallTab = 'background'"
          >背景</button>
          <button 
            class="tab-btn" 
            :class="{ active: mallTab === 'badge' }"
            @click="mallTab = 'badge'"
          >徽章</button>
        </div>
        <div class="mall-content">
          <div v-if="mallTab === 'frame'" class="mall-grid">
            <div 
              v-for="item in customizeStore.frames" 
              :key="item.id" 
              class="mall-item"
              :class="{ owned: customizeStore.ownedFrames.includes(item.id) }"
            >
              <div class="frame-preview" :style="{ background: item.style }"></div>
              <span class="item-name">{{ item.name }}</span>
              <button 
                v-if="!customizeStore.ownedFrames.includes(item.id)" 
                class="btn btn-primary btn-sm"
                :disabled="customizeStore.coins < item.price"
                @click="buyFrame(item)"
              >
                {{ item.price }}币
              </button>
              <span v-else class="item-owned">已拥有</span>
            </div>
          </div>
          <div v-if="mallTab === 'background'" class="mall-grid">
            <div 
              v-for="item in customizeStore.backgrounds" 
              :key="item.id" 
              class="mall-item"
              :class="{ owned: customizeStore.ownedBackgrounds.includes(item.id) }"
            >
              <div class="bg-preview" :style="{ background: item.style }"></div>
              <span class="item-name">{{ item.name }}</span>
              <button 
                v-if="!customizeStore.ownedBackgrounds.includes(item.id)" 
                class="btn btn-primary btn-sm"
                :disabled="customizeStore.coins < item.price"
                @click="buyBackground(item)"
              >
                {{ item.price }}币
              </button>
              <span v-else class="item-owned">已拥有</span>
            </div>
          </div>
          <div v-if="mallTab === 'badge'" class="mall-grid">
            <div 
              v-for="item in customizeStore.badges" 
              :key="item.id" 
              class="mall-item"
              :class="{ owned: customizeStore.ownedBadges.includes(item.id) }"
            >
              <span class="badge-large">{{ item.icon }}</span>
              <span class="item-name">{{ item.name }}</span>
              <p class="item-desc">{{ item.desc }}</p>
              <button 
                v-if="!customizeStore.ownedBadges.includes(item.id)" 
                class="btn btn-primary btn-sm"
                :disabled="customizeStore.coins < item.price"
                @click="buyBadge(item)"
              >
                {{ item.price }}币
              </button>
              <span v-else class="item-owned">已拥有</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCustomizeStore } from '@/stores/customize'
import { useLevelStore } from '@/stores/level'

const router = useRouter()
const authStore = useAuthStore()
const customizeStore = useCustomizeStore()
const levelStore = useLevelStore()

const bio = ref('法医学习者，持续学习中...')
const showCustomize = ref(false)
const showAchievements = ref(false)
const showMall = ref(false)
const customizeTab = ref('frame')
const activeContentTab = ref('videos')
const mallTab = ref('frame')

const statsData = ref({
  videos: 12,
  cases: 8,
  tools: 45,
  posts: 3
})

const myVideos = ref([
  { id: 1, title: '法医鉴定流程演示', views: 234, likes: 15, date: '2024-01-20' },
  { id: 2, title: '关节活动度测量教学', views: 156, likes: 8, date: '2024-01-18' }
])

const myPosts = ref([
  { id: 1, title: '分享一个实用的损伤鉴定技巧', views: 89, likes: 12, date: '2024-01-19' }
])

const recentActivities = ref([
  { id: 1, icon: '📚', title: '完成"关节活动损失"工具练习', time: '2小时前' },
  { id: 2, icon: '🎬', title: '观看了"法医鉴定流程演示"', time: '3小时前' },
  { id: 3, icon: '📝', title: '发布了帖子', time: '昨天' },
  { id: 4, icon: '✅', title: '完成了每日任务', time: '昨天' }
])

const currentBorderStyle = computed(() => {
  return customizeStore.getCurrentFrame.style
})

const currentBackgroundStyle = computed(() => {
  return customizeStore.getCurrentBackground.style
})

const levelInfo = computed(() => {
  return levelStore.currentLevelInfo
})

const activeDecorations = computed(() => {
  return customizeStore.decorations.filter(d => 
    customizeStore.selectedDecorations.includes(d.id)
  )
})

const currentContentList = computed(() => {
  return activeContentTab.value === 'videos' ? myVideos.value : myPosts.value
})

const goToPublish = () => {
  router.push('/learner/community')
}

const selectFrame = (frame) => {
  if (customizeStore.ownedFrames.includes(frame.id)) {
    customizeStore.selectFrame(frame.id)
  }
}

const selectBackground = (bg) => {
  if (customizeStore.ownedBackgrounds.includes(bg.id)) {
    customizeStore.selectBackground(bg.id)
  }
}

const toggleDecoration = (dec) => {
  if (customizeStore.selectedDecorations.includes(dec.id)) {
    customizeStore.removeDecoration(dec.id)
  } else {
    customizeStore.addDecoration(dec.id)
  }
}

const buyFrame = (frame) => {
  customizeStore.purchaseFrame(frame.id)
}

const buyBackground = (bg) => {
  customizeStore.purchaseBackground(bg.id)
}

const buyBadge = (badge) => {
  customizeStore.purchaseBadge(badge.id)
}
</script>

<style scoped>
.profile-page {
  display: grid;
  gap: 24px;
}

.profile-header {
  padding: 32px;
}

.profile-main {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.avatar-section {
  position: relative;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--panel);
}

.avatar-text {
  font-size: 40px;
  font-weight: 600;
}

.decoration-container {
  position: absolute;
  bottom: -8px;
  right: -8px;
  display: flex;
  gap: 4px;
}

.decoration {
  font-size: 20px;
}

.profile-info {
  flex: 1;
}

.profile-info h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.level-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  color: #000;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.user-bio {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

.profile-actions {
  display: flex;
  gap: 12px;
}

.exp-bar {
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.exp-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.progress-track {
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
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
  gap: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 18px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.coins-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.coins-value {
  font-size: 32px;
  font-weight: 600;
  color: var(--accent-2);
}

.coins-source {
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
}

.coins-source p {
  margin: 0 0 8px;
  font-size: 13px;
}

.coins-source strong {
  color: var(--accent);
}

.coins-source ul {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: var(--text-muted);
}

.coins-source li {
  margin-bottom: 4px;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.badge-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  text-align: center;
  transition: all 0.2s ease;
}

.badge-item.locked {
  opacity: 0.5;
}

.badge-icon {
  display: block;
  font-size: 28px;
  margin-bottom: 8px;
}

.badge-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.badge-desc {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
}

.badge-date {
  display: block;
  font-size: 10px;
  color: var(--accent);
  margin-top: 4px;
}

.activity-list {
  display: grid;
  gap: 12px;
}

.activity-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
}

.activity-icon {
  font-size: 20px;
}

.activity-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.activity-title {
  font-size: 14px;
}

.activity-time {
  font-size: 12px;
  color: var(--text-muted);
}

.content-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover, .tab-btn.active {
  border-color: var(--accent);
  color: var(--accent);
}

.content-list {
  display: grid;
  gap: 12px;
}

.content-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
}

.content-thumb {
  width: 120px;
  height: 68px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.content-info {
  flex: 1;
}

.content-info h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.content-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.empty-content {
  text-align: center;
  padding: 32px;
}

.empty-content p {
  color: var(--text-muted);
  margin-bottom: 16px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  width: min(640px, calc(100% - 32px));
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 24px;
  cursor: pointer;
}

.customize-tabs, .mall-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.customize-grid, .mall-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.customize-item, .mall-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.customize-item:hover, .mall-item:hover {
  border-color: var(--accent);
}

.customize-item.selected {
  border-color: var(--accent);
  background: rgba(64, 216, 197, 0.1);
}

.customize-item.owned, .mall-item.owned {
  border-color: rgba(95, 212, 143, 0.3);
}

.frame-preview {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 auto 12px;
}

.bg-preview {
  width: 100%;
  height: 60px;
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.dec-preview {
  display: block;
  font-size: 32px;
  margin-bottom: 8px;
}

.badge-large {
  display: block;
  font-size: 36px;
  margin-bottom: 8px;
}

.item-name {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
}

.item-price {
  display: block;
  font-size: 12px;
  color: var(--accent-2);
}

.item-owned {
  display: block;
  font-size: 12px;
  color: var(--accent);
}

.item-desc {
  margin: 0 0 8px;
  font-size: 11px;
  color: var(--text-muted);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.mall-coins span {
  font-size: 14px;
  color: var(--accent-2);
}

.achievements-modal {
  max-width: 700px;
}

.achievements-list {
  display: grid;
  gap: 12px;
}

.achievement-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
}

.achievement-item.locked {
  opacity: 0.6;
}

.achievement-icon {
  font-size: 36px;
}

.achievement-info h3 {
  margin: 0 0 4px;
  font-size: 15px;
}

.achievement-info p {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

.achievement-date {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--accent);
}

.text-muted {
  color: var(--text-muted);
  font-size: 13px;
}

@media (max-width: 768px) {
  .profile-main {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .badges-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .customize-grid, .mall-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>