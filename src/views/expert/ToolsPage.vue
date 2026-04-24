<template>
  <div class="tools-page">
    <div class="section-head">
      <h1 class="section-title">专业工具库</h1>
      <p class="section-note">法医鉴定专业计算工具，支持批量处理与结果导出</p>
    </div>

    <!-- 顶部搜索 -->
    <div class="search-bar panel">
      <input 
        v-model="searchKeyword" 
        type="text" 
        placeholder="搜索工具名称、适用场景..." 
        class="search-input"
      />
    </div>

    <!-- 工具分组 -->
    <div class="tool-groups">
      <!-- 高频工具 -->
      <section class="tool-category panel" v-if="highFrequencyTools.length > 0">
        <div class="category-header">
          <h2>高频工具</h2>
          <span class="category-hint">您最常用的工具</span>
        </div>
        <div class="tool-grid">
          <div 
            v-for="tool in highFrequencyTools" 
            :key="tool.id" 
            class="tool-card"
            @click="openTool(tool)"
          >
            <div class="tool-header">
              <span class="tool-name">{{ tool.name }}</span>
              <span class="tool-badge" v-if="tool.supportBatch">批量</span>
            </div>
            <p class="tool-desc">{{ tool.desc }}</p>
            <div class="tool-meta">
              <span class="meta-item">
                <span class="meta-label">输入项</span>
                <span class="meta-value">{{ tool.inputs }} 项</span>
              </span>
              <span class="meta-item">
                <span class="meta-label">适用场景</span>
                <span class="meta-value">{{ tool.scenario }}</span>
              </span>
              <span class="meta-item">
                <span class="meta-label">依据标准</span>
                <span class="meta-value">{{ tool.standardNames }}</span>
              </span>
            </div>
            <div class="tool-actions">
              <button class="btn btn-sm btn-primary" @click.stop="openTool(tool)">使用</button>
              <button class="btn btn-sm btn-outline" @click.stop="toggleFavorite(tool)" :class="{ active: tool.favorited }">
                {{ tool.favorited ? '已收藏' : '收藏' }}
              </button>
              <button class="btn btn-sm btn-ghost" v-if="tool.supportBatch" @click.stop="openBatch(tool)">批量处理</button>
            </div>
          </div>
        </div>
      </section>

      <!-- 预测分析 -->
      <section class="tool-category panel">
        <div class="category-header">
          <h2>预测分析</h2>
          <span class="category-hint">损伤类型与程度预测</span>
        </div>
        <div class="tool-grid">
          <div 
            v-for="tool in predictTools" 
            :key="tool.id" 
            class="tool-card"
            @click="openTool(tool)"
          >
            <div class="tool-header">
              <span class="tool-name">{{ tool.name }}</span>
              <span class="tool-badge" v-if="tool.supportBatch">批量</span>
            </div>
            <p class="tool-desc">{{ tool.desc }}</p>
            <div class="tool-meta">
              <span class="meta-item">
                <span class="meta-label">输入项</span>
                <span class="meta-value">{{ tool.inputs }} 项</span>
              </span>
              <span class="meta-item">
                <span class="meta-label">适用场景</span>
                <span class="meta-value">{{ tool.scenario }}</span>
              </span>
              <span class="meta-item">
                <span class="meta-label">依据标准</span>
                <span class="meta-value">{{ tool.standardNames }}</span>
              </span>
              <span class="meta-item">
                <span class="meta-label">更新时间</span>
                <span class="meta-value">{{ tool.updateTime }}</span>
              </span>
            </div>
            <div class="tool-actions">
              <button class="btn btn-sm btn-primary" @click.stop="openTool(tool)">使用</button>
              <button class="btn btn-sm btn-outline" @click.stop="toggleFavorite(tool)" :class="{ active: tool.favorited }">
                {{ tool.favorited ? '已收藏' : '收藏' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 法医估算 -->
      <section class="tool-category panel">
        <div class="category-header">
          <h2>法医估算</h2>
          <span class="category-hint">专业估算与计算</span>
        </div>
        <div class="tool-grid">
          <div 
            v-for="tool in forensicTools" 
            :key="tool.id" 
            class="tool-card"
            @click="openTool(tool)"
          >
            <div class="tool-header">
              <span class="tool-name">{{ tool.name }}</span>
              <span class="tool-badge" v-if="tool.supportBatch">批量</span>
            </div>
            <p class="tool-desc">{{ tool.desc }}</p>
            <div class="tool-meta">
              <span class="meta-item">
                <span class="meta-label">输入项</span>
                <span class="meta-value">{{ tool.inputs }} 项</span>
              </span>
              <span class="meta-item">
                <span class="meta-label">适用场景</span>
                <span class="meta-value">{{ tool.scenario }}</span>
              </span>
              <span class="meta-item">
                <span class="meta-label">依据标准</span>
                <span class="meta-value">{{ tool.standardNames }}</span>
              </span>
            </div>
            <div class="tool-actions">
              <button class="btn btn-sm btn-primary" @click.stop="openTool(tool)">使用</button>
              <button class="btn btn-sm btn-outline" @click.stop="toggleFavorite(tool)" :class="{ active: tool.favorited }">
                {{ tool.favorited ? '已收藏' : '收藏' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 赔偿相关 -->
      <section class="tool-category panel">
        <div class="category-header">
          <h2>赔偿相关</h2>
          <span class="category-hint">赔偿金额计算</span>
        </div>
        <div class="tool-grid">
          <div 
            v-for="tool in compensationTools" 
            :key="tool.id" 
            class="tool-card"
            @click="openTool(tool)"
          >
            <div class="tool-header">
              <span class="tool-name">{{ tool.name }}</span>
              <span class="tool-badge" v-if="tool.supportBatch">批量</span>
            </div>
            <p class="tool-desc">{{ tool.desc }}</p>
            <div class="tool-meta">
              <span class="meta-item">
                <span class="meta-label">输入项</span>
                <span class="meta-value">{{ tool.inputs }} 项</span>
              </span>
              <span class="meta-item">
                <span class="meta-label">适用场景</span>
                <span class="meta-value">{{ tool.scenario }}</span>
              </span>
              <span class="meta-item">
                <span class="meta-label">依据标准</span>
                <span class="meta-value">{{ tool.standardNames }}</span>
              </span>
            </div>
            <div class="tool-actions">
              <button class="btn btn-sm btn-primary" @click.stop="openTool(tool)">使用</button>
              <button class="btn btn-sm btn-outline" @click.stop="toggleFavorite(tool)" :class="{ active: tool.favorited }">
                {{ tool.favorited ? '已收藏' : '收藏' }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 最近使用 + 收藏工具 -->
    <div class="sidebar-tools">
      <section class="recent-tools panel" v-if="recentUsedTools.length > 0">
        <h3>最近使用</h3>
        <div class="recent-list">
          <div 
            v-for="tool in recentUsedTools" 
            :key="tool.id" 
            class="recent-item"
            @click="openTool(tool)"
          >
            <span class="tool-name">{{ tool.name }}</span>
            <span class="tool-time">{{ tool.lastUsed }}</span>
          </div>
        </div>
      </section>

      <section class="favorite-tools panel" v-if="favoriteTools.length > 0">
        <h3>我的收藏</h3>
        <div class="recent-list">
          <div 
            v-for="tool in favoriteTools" 
            :key="tool.id" 
            class="recent-item"
            @click="openTool(tool)"
          >
            <span class="tool-name">{{ tool.name }}</span>
          </div>
        </div>
      </section>
    </div>

    <!-- 结果页统一规范说明 -->
    <section class="result-standard panel">
      <h3>结果页统一规范</h3>
      <div class="standard-list">
        <div class="standard-item">
          <span class="standard-num">1</span>
          <div class="standard-content">
            <h4>主结论卡</h4>
            <p>清晰展示计算结果或预测结论</p>
          </div>
        </div>
        <div class="standard-item">
          <span class="standard-num">2</span>
          <div class="standard-content">
            <h4>计算过程明细</h4>
            <p>展示完整计算步骤和中间结果</p>
          </div>
        </div>
        <div class="standard-item">
          <span class="standard-num">3</span>
          <div class="standard-content">
            <h4>参数表</h4>
            <p>列出所有输入参数及其值</p>
          </div>
        </div>
        <div class="standard-item">
          <span class="standard-num">4</span>
          <div class="standard-content">
            <h4>引用标准</h4>
            <p>标注依据的标准文件或参考文献</p>
          </div>
        </div>
        <div class="standard-item">
          <span class="standard-num">5</span>
          <div class="standard-content">
            <h4>风险提示</h4>
            <p>说明异常值、限制条件和注意事项</p>
          </div>
        </div>
        <div class="standard-item">
          <span class="standard-num">6</span>
          <div class="standard-content">
            <h4>导出功能</h4>
            <p>支持PDF/Word/Excel导出报告</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAllTools, searchTools } from '../../utils/toolDataService.js'
import { usePersistentState, usePersistentList } from '../../composables/usePersistentState.js'

const router = useRouter()

const searchKeyword = ref('')

// 从真实文档数据构建工具列表
const allTools = getAllTools()

// 持久化：收藏工具ID列表
const favoriteToolIds = usePersistentList('expert:favoriteToolIds', [])

// 持久化：最近使用记录 [{id, name, time}]
const recentToolUsages = usePersistentList('expert:recentToolUsages', [], 20)

// 判断工具是否已收藏
const isFavorited = (toolId) => favoriteToolIds.value.includes(toolId)

// 高频工具：临床+赔偿类常用工具（支持批量处理）
const highFrequencyTools = computed(() => {
  let result
  if (searchKeyword.value) {
    result = searchTools(searchKeyword.value).filter(t => t.supportBatch)
  } else {
    result = allTools.filter(t => t.supportBatch).slice(0, 6)
  }
  // 注入收藏状态
  return result.map(t => ({ ...t, favorited: isFavorited(t.id) }))
})

// 预测分析类工具
const predictTools = computed(() => {
  let result
  if (searchKeyword.value) {
    result = searchTools(searchKeyword.value).filter(t => 
      t.formulaType.includes('predict') || 
      t.formulaType.includes('estimation') ||
      t.formulaType.includes('inference') ||
      t.formulaType.includes('pmi') ||
      t.formulaType.includes('diatom') ||
      t.formulaType.includes('weapon')
    )
  } else {
    result = allTools.filter(t => 
      t.formulaType.includes('predict') || 
      t.formulaType.includes('estimation') ||
      t.formulaType.includes('inference') ||
      t.formulaType.includes('pmi') ||
      t.formulaType.includes('diatom') ||
      t.formulaType.includes('weapon')
    )
  }
  return result.map(t => ({ ...t, favorited: isFavorited(t.id) }))
})

// 法医估算工具：法医病理+毒物+人类学
const forensicTools = computed(() => {
  let result
  if (searchKeyword.value) {
    result = searchTools(searchKeyword.value).filter(t => t.category === 'forensic' || t.category === 'evidence')
  } else {
    result = allTools.filter(t => t.category === 'forensic' || t.category === 'evidence')
  }
  return result.map(t => ({ ...t, favorited: isFavorited(t.id) }))
})

// 赔偿相关工具
const compensationTools = computed(() => {
  let result
  if (searchKeyword.value) {
    result = searchTools(searchKeyword.value).filter(t => t.category === 'compensation' || t.category === 'traffic' || t.category === 'clinical')
  } else {
    result = allTools.filter(t => t.category === 'compensation' || t.category === 'traffic' || t.category === 'clinical')
  }
  return result.map(t => ({ ...t, favorited: isFavorited(t.id) }))
})

const recentUsedTools = computed(() => {
  return recentToolUsages.value
    .slice(0, 5)
    .map(r => {
      const tool = allTools.find(t => t.id === r.id)
      return tool ? { ...tool, lastUsed: r.time } : null
    })
    .filter(Boolean)
})

const favoriteTools = computed(() => {
  return allTools
    .filter(t => isFavorited(t.id))
    .map(t => ({ ...t, favorited: true }))
})

const openTool = (tool) => {
  // 记录最近使用
  const existing = recentToolUsages.value.findIndex(r => r.id === tool.id)
  if (existing >= 0) recentToolUsages.value.splice(existing, 1)
  recentToolUsages.value.unshift({ id: tool.id, name: tool.name, time: '刚刚' })
  
  router.push({ name: 'tool-detail', params: { id: tool.id } })
}

const toggleFavorite = (tool) => {
  const idx = favoriteToolIds.value.indexOf(tool.id)
  if (idx >= 0) {
    favoriteToolIds.value.splice(idx, 1)
  } else {
    favoriteToolIds.value.push(tool.id)
  }
}

const openBatch = (tool) => {
  console.log('批量处理:', tool.name)
}
</script>

<style scoped>
.tools-page {
  display: grid;
  gap: 24px;
}

.section-head {
  text-align: center;
  margin-bottom: 8px;
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

.search-bar {
  padding: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  color: var(--text);
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
}

.tool-category {
  margin-bottom: 16px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.category-header h2 {
  margin: 0;
  font-size: 18px;
  color: var(--accent);
}

.category-hint {
  font-size: 13px;
  color: var(--text-muted);
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.tool-card {
  padding: 18px;
  background: rgba(8, 14, 24, 0.5);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  cursor: pointer;
}

.tool-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  background: rgba(64, 216, 197, 0.08);
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tool-name {
  font-size: 16px;
  font-weight: 500;
}

.tool-badge {
  padding: 2px 8px;
  background: rgba(64, 216, 197, 0.15);
  color: var(--accent);
  font-size: 11px;
  border-radius: 4px;
}

.tool-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--text-muted);
}

.tool-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 80px;
}

.meta-label {
  font-size: 11px;
  color: var(--text-muted);
}

.meta-value {
  font-size: 12px;
}

.tool-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-primary {
  background: var(--accent);
  border: none;
  color: var(--bg-0);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--text);
}

.btn-outline.active {
  border-color: var(--accent);
  color: var(--accent);
}

.btn-ghost {
  background: transparent;
  border: none;
  color: var(--text-muted);
}

.btn-ghost:hover {
  color: var(--accent);
}

.sidebar-tools {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.sidebar-tools h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--text-muted);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.recent-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.recent-item .tool-name {
  font-size: 14px;
}

.tool-time {
  font-size: 12px;
  color: var(--text-muted);
}

.result-standard {
  background: rgba(64, 216, 197, 0.05);
}

.result-standard h3 {
  margin: 0 0 16px;
  font-size: 16px;
}

.standard-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.standard-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
}

.standard-num {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--bg-0);
  font-size: 12px;
  font-weight: 600;
  border-radius: 50%;
  flex-shrink: 0;
}

.standard-content h4 {
  margin: 0 0 4px;
  font-size: 13px;
}

.standard-content p {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .sidebar-tools {
    grid-template-columns: 1fr;
  }
  
  .standard-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .tool-grid {
    grid-template-columns: 1fr;
  }
  
  .standard-list {
    grid-template-columns: 1fr;
  }
}
</style>