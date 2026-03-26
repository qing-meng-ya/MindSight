<template>
  <div class="library-page">
    <div class="section-head">
      <h1 class="section-title">资料库</h1>
      <p class="section-note">快速查找权威标准、模板和参考资料</p>
    </div>

    <!-- 分类导航 -->
    <div class="nav-tabs panel">
      <button 
        v-for="cat in categories" 
        :key="cat.id"
        class="nav-tab"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        {{ cat.name }}
        <span class="tab-count" v-if="cat.count">{{ cat.count }}</span>
      </button>
    </div>

    <!-- 高级筛选 -->
    <div class="filter-section panel">
      <div class="filter-row">
        <div class="filter-group">
          <label>类型</label>
          <select v-model="filters.type">
            <option value="">全部</option>
            <option value="standard">标准文件</option>
            <option value="template">文书模板</option>
            <option value="guide">鉴定依据</option>
            <option value="case">历史案例</option>
          </select>
        </div>
        <div class="filter-group">
          <label>年份</label>
          <select v-model="filters.year">
            <option value="">全部</option>
            <option value="2024">2024年</option>
            <option value="2023">2023年</option>
            <option value="2022">2022年</option>
            <option value="older">更早</option>
          </select>
        </div>
        <div class="filter-group">
          <label>状态</label>
          <select v-model="filters.status">
            <option value="">全部</option>
            <option value="effective">现行有效</option>
            <option value="updated">已更新</option>
            <option value="obsolete">已废止</option>
          </select>
        </div>
        <button class="btn btn-outline btn-sm" @click="resetFilters">重置</button>
      </div>
    </div>

    <!-- 文档列表 -->
    <div class="doc-list">
      <div v-for="doc in filteredDocs" :key="doc.id" class="doc-card panel">
        <div class="doc-icon">
          <span class="icon-file"></span>
        </div>
        <div class="doc-content">
          <div class="doc-header">
            <h3 class="doc-title">{{ doc.title }}</h3>
            <span class="doc-status" :class="doc.status">{{ getStatusLabel(doc.status) }}</span>
          </div>
          <p class="doc-desc">{{ doc.desc }}</p>
          <div class="doc-meta">
            <span class="meta-item">
              <span class="meta-label">适用场景</span>
              <span class="meta-value">{{ doc.scenario }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">更新时间</span>
              <span class="meta-value">{{ doc.updateDate }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">文件大小</span>
              <span class="meta-value">{{ doc.size }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">格式</span>
              <span class="meta-value">{{ doc.format }}</span>
            </span>
          </div>
        </div>
        <div class="doc-actions">
          <button class="btn btn-sm btn-primary" @click="viewDoc(doc)">查看</button>
          <button class="btn btn-sm btn-outline" @click="downloadDoc(doc)">下载</button>
          <button 
            class="btn btn-sm btn-icon" 
            @click="toggleFavorite(doc)" 
            :class="{ favorited: doc.favorited }"
          >
            {{ doc.favorited ? '已收藏' : '收藏' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state panel" v-if="filteredDocs.length === 0">
      <h3>暂无相关资料</h3>
      <p>试试调整筛选条件</p>
      <button class="btn btn-outline" @click="resetFilters">重置筛选</button>
    </div>

    <!-- 侧边栏：收藏夹 + 最近查看 -->
    <div class="sidebar">
      <section class="favorites panel">
        <h3>我的收藏</h3>
        <div class="fav-list" v-if="favorites.length > 0">
          <div 
            v-for="doc in favorites" 
            :key="doc.id" 
            class="fav-item"
            @click="viewDoc(doc)"
          >
            <span class="fav-title">{{ doc.title }}</span>
          </div>
        </div>
        <p v-else class="empty-hint">暂无收藏</p>
      </section>

      <section class="recent panel">
        <h3>最近查看</h3>
        <div class="recent-list" v-if="recentDocs.length > 0">
          <div 
            v-for="doc in recentDocs" 
            :key="doc.id" 
            class="recent-item"
            @click="viewDoc(doc)"
          >
            <span class="recent-title">{{ doc.title }}</span>
            <span class="recent-time">{{ doc.lastView }}</span>
          </div>
        </div>
        <p v-else class="empty-hint">暂无记录</p>
      </section>
    </div>

    <!-- 文书模板套用提示 -->
    <section class="template-tip panel" v-if="activeCategory === 'template'">
      <h4>提示</h4>
      <p>点击"查看"可预览文书模板内容，支持"一键套用到当前案件"功能</p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeCategory = ref('standard')
const filters = ref({
  type: '',
  year: '',
  status: ''
})

const categories = ref([
  { id: 'standard', name: '标准规范', count: 12 },
  { id: 'template', name: '文书模板', count: 8 },
  { id: 'guide', name: '鉴定依据', count: 15 },
  { id: 'case', name: '历史案例', count: 23 },
  { id: 'dispute', name: '常见争议', count: 6 }
])

const docs = ref([
  { 
    id: 1, 
    category: 'standard', 
    title: '人体损伤程度鉴定标准 GB/T 2023', 
    desc: '国家标准化管理委员会发布，适用于各级司法鉴定机构',
    scenario: '损伤程度鉴定',
    updateDate: '2024-01',
    size: '2.3 MB',
    format: 'PDF',
    status: 'effective',
    favorited: false
  },
  { 
    id: 2, 
    category: 'standard', 
    title: '法医临床检验技术规范 SF/T 0104-2021', 
    desc: '司法部行业标准，法医临床检验操作规范',
    scenario: '临床检验',
    updateDate: '2023-12',
    size: '1.8 MB',
    format: 'PDF',
    status: 'effective',
    favorited: true
  },
  { 
    id: 3, 
    category: 'template', 
    title: '伤残等级鉴定意见书模板', 
    desc: '标准化的伤残鉴定报告模板，包含所有必要字段',
    scenario: '伤残鉴定',
    updateDate: '2024-02',
    size: '156 KB',
    format: 'DOCX',
    status: 'effective',
    favorited: false
  },
  { 
    id: 4, 
    category: 'guide', 
    title: '司法鉴定程序通则', 
    desc: '司法部令第132号，司法鉴定程序基本规范',
    scenario: '程序规范',
    updateDate: '2023-11',
    size: '856 KB',
    format: 'PDF',
    status: 'effective',
    favorited: false
  },
  { 
    id: 5, 
    category: 'case', 
    title: '道路交通事故典型案例汇编', 
    desc: '收录近三年典型交通事故鉴定案例',
    scenario: '案例参考',
    updateDate: '2024-01',
    size: '15 MB',
    format: 'PDF',
    status: 'updated',
    favorited: false
  }
])

const filteredDocs = computed(() => {
  let result = docs.value.filter(d => d.category === activeCategory.value)
  
  if (filters.value.type) {
    result = result.filter(d => d.category === filters.value.type)
  }
  if (filters.value.year) {
    if (filters.value.year === 'older') {
      result = result.filter(d => parseInt(d.updateDate) < 2022)
    } else {
      result = result.filter(d => d.updateDate.startsWith(filters.value.year))
    }
  }
  if (filters.value.status) {
    result = result.filter(d => d.status === filters.value.status)
  }
  
  return result
})

const favorites = computed(() => docs.value.filter(d => d.favorited))

const recentDocs = computed(() => docs.value.slice(0, 3))

const getStatusLabel = (status) => {
  const map = { effective: '现行有效', updated: '已更新', obsolete: '已废止' }
  return map[status] || status
}

const viewDoc = (doc) => {
  console.log('查看文档:', doc.title)
  doc.lastView = '刚刚'
}

const downloadDoc = (doc) => {
  console.log('下载文档:', doc.title)
}

const toggleFavorite = (doc) => {
  doc.favorited = !doc.favorited
}

const resetFilters = () => {
  filters.value = { type: '', year: '', status: '' }
}
</script>

<style scoped>
.library-page {
  display: grid;
  gap: 24px;
}

.section-head {
  text-align: center;
}

.section-title {
  margin: 0;
  font-size: 24px;
}

.section-note {
  color: var(--text-muted);
  font-size: 14px;
  margin: 6px 0 0;
}

.nav-tabs {
  display: flex;
  gap: 8px;
  padding: 16px;
  overflow-x: auto;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.nav-tab:hover {
  border-color: var(--accent);
}

.nav-tab.active {
  background: rgba(64, 216, 197, 0.15);
  border-color: var(--accent);
  color: var(--accent);
}

.tab-count {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 11px;
}

.filter-section {
  padding: 16px;
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 12px;
  color: var(--text-muted);
}

.filter-group select {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 13px;
  min-width: 120px;
}

.filter-group select:focus {
  outline: none;
  border-color: var(--accent);
}

.btn-sm {
  padding: 8px 12px;
  font-size: 12px;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--text);
}

.btn-outline:hover {
  border-color: var(--accent);
}

.btn-primary {
  background: var(--accent);
  border: none;
  color: var(--bg-0);
}

.btn-icon {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--text-muted);
}

.btn-icon.favorited {
  border-color: var(--accent);
  color: var(--accent);
}

.doc-list {
  display: grid;
  gap: 16px;
}

.doc-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
}

.doc-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64, 216, 197, 0.1);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.icon-file {
  width: 24px;
  height: 24px;
  background: var(--line);
}

.doc-content {
  flex: 1;
}

.doc-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.doc-title {
  margin: 0;
  font-size: 17px;
}

.doc-status {
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 4px;
}

.doc-status.effective {
  background: rgba(107, 203, 119, 0.15);
  color: #6bcb77;
}

.doc-status.updated {
  background: rgba(255, 217, 61, 0.15);
  color: #ffd93d;
}

.doc-status.obsolete {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}

.doc-desc {
  margin: 0 0 12px;
  color: var(--text-muted);
  font-size: 13px;
}

.doc-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-size: 11px;
  color: var(--text-muted);
}

.meta-value {
  font-size: 12px;
}

.doc-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 40px;
}

.empty-state h3 {
  margin: 0 0 8px;
}

.empty-state p {
  margin: 0 0 16px;
  color: var(--text-muted);
}

.sidebar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.sidebar h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--text-muted);
}

.fav-list, .recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fav-item, .recent-item {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.fav-item:hover, .recent-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.fav-title, .recent-title {
  font-size: 13px;
}

.recent-time {
  font-size: 11px;
  color: var(--text-muted);
}

.empty-hint {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  padding: 20px;
}

.template-tip {
  background: rgba(64, 216, 197, 0.05);
}

.template-tip h4 {
  margin: 0 0 8px;
  font-size: 14px;
}

.template-tip p {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .sidebar {
    grid-template-columns: 1fr;
  }
  
  .doc-card {
    flex-direction: column;
  }
  
  .doc-actions {
    width: 100%;
  }
}
</style>