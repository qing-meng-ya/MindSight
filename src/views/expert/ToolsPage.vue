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
                <span class="meta-value">{{ tool.standard }}</span>
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
                <span class="meta-value">{{ tool.standard }}</span>
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
                <span class="meta-value">{{ tool.standard }}</span>
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
                <span class="meta-value">{{ tool.standard }}</span>
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

const router = useRouter()

const searchKeyword = ref('')

const highFrequencyTools = ref([
  { id: 1, name: '关节活动度计算', desc: '关节活动度损失程度计算', inputs: 8, scenario: '伤残鉴定', standard: 'GB/T 2023', supportBatch: true, favorited: false, lastUsed: '刚刚' },
  { id: 2, name: '伤残等级评定', desc: '根据伤情评定伤残等级', inputs: 12, scenario: '伤残鉴定', standard: 'GB/T 2023', supportBatch: true, favorited: true, lastUsed: '2小时前' },
  { id: 3, name: '护理期计算', desc: '护理期限评估', inputs: 6, scenario: '护理依赖', standard: 'GA/T 1193', supportBatch: false, favorited: false, lastUsed: '昨天' }
])

const predictTools = ref([
  { id: 4, name: '骨折预测', desc: '根据伤情预测骨折类型和程度', inputs: 10, scenario: '损伤鉴定', standard: 'SF/T 0104', supportBatch: true, favorited: false, updateTime: '2024-02' },
  { id: 5, name: '切片预测', desc: '组织切片AI辅助分析', inputs: 5, scenario: '病理鉴定', standard: '行业规范', supportBatch: false, favorited: false, updateTime: '2024-01' }
])

const forensicTools = ref([
  { id: 6, name: '死亡时间估算', desc: 'PMI计算与推断', inputs: 15, scenario: '死亡鉴定', standard: 'SF/T 0107', supportBatch: false, favorited: false },
  { id: 7, name: '身高推算', desc: '根据骨骼长度推算身高', inputs: 4, scenario: '个人识别', standard: '法医人类学', supportBatch: true, favorited: false },
  { id: 8, name: '体表面积估算', desc: 'Du Bois公式计算BSA', inputs: 3, scenario: '烧伤评估', standard: '医学标准', supportBatch: false, favorited: false },
  { id: 9, name: '烧伤面积计算', desc: '中国九分法估算烧伤面积', inputs: 8, scenario: '烧伤评估', standard: '临床标准', supportBatch: false, favorited: false },
  { id: 10, name: '血液酒精浓度', desc: 'BAC计算', inputs: 5, scenario: '毒物分析', standard: 'GA/T 842', supportBatch: false, favorited: false }
])

const compensationTools = ref([
  { id: 11, name: '车祸赔偿计算', desc: '交通事故赔偿金额估算', inputs: 18, scenario: '赔偿鉴定', standard: '民法典+交强险', supportBatch: true, favorited: false },
  { id: 12, name: '工伤赔偿计算', desc: '工伤保险待遇计算', inputs: 20, scenario: '工伤鉴定', standard: '工伤保险条例', supportBatch: true, favorited: false },
  { id: 13, name: '瘢痕面积计算', desc: '瘢痕面积与等级评估', inputs: 6, scenario: '伤残鉴定', standard: 'GB/T 2023', supportBatch: false, favorited: false }
])

const recentUsedTools = computed(() => highFrequencyTools.value.filter(t => t.lastUsed))

const favoriteTools = computed(() => [...highFrequencyTools.value, ...predictTools.value, ...forensicTools.value].filter(t => t.favorited))

const openTool = (tool) => {
  console.log('打开工具:', tool.name)
}

const toggleFavorite = (tool) => {
  tool.favorited = !tool.favorited
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