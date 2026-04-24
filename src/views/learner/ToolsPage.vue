<template>
  <div class="tools-page">
    <div class="section-head">
      <h1 class="section-title">工具练习</h1>
      <p class="section-note">通过工具掌握法医计算方法，提升实践能力</p>
    </div>

    <div class="filter-bar panel">
      <div class="filter-group">
        <span class="filter-label">模式</span>
        <div class="filter-options">
          <button class="filter-btn" :class="{ active: filterMode === 'all' }" @click="filterMode = 'all'">
            全部
          </button>
          <button
            class="filter-btn"
            :class="{ active: filterMode === 'learn' }"
            @click="filterMode = 'learn'"
          >
            学习模式
          </button>
          <button
            class="filter-btn"
            :class="{ active: filterMode === 'quick' }"
            @click="filterMode = 'quick'"
          >
            快速计算
          </button>
        </div>
      </div>
      <div class="filter-group">
        <span class="filter-label">难度</span>
        <div class="filter-options">
          <button class="filter-btn" :class="{ active: filterDifficulty === '' }" @click="filterDifficulty = ''">
            全部
          </button>
          <button class="filter-btn" :class="{ active: filterDifficulty === 'A' }" @click="filterDifficulty = 'A'">
            A级
          </button>
          <button class="filter-btn" :class="{ active: filterDifficulty === 'B' }" @click="filterDifficulty = 'B'">
            B级
          </button>
          <button class="filter-btn" :class="{ active: filterDifficulty === 'C' }" @click="filterDifficulty = 'C'">
            C级
          </button>
          <button class="filter-btn" :class="{ active: filterDifficulty === 'D' }" @click="filterDifficulty = 'D'">
            D级
          </button>
          <button class="filter-btn" :class="{ active: filterDifficulty === 'E' }" @click="filterDifficulty = 'E'">
            E级
          </button>
        </div>
      </div>
    </div>

    <div class="tool-category panel">
      <h2>预测工具</h2>
      <p class="category-desc">基于伤情数据预测损伤类型和程度</p>
      <div class="tool-grid">
        <div v-for="tool in filteredPredictTools" :key="tool.id" class="tool-card" @click="openTool(tool)">
          <div class="tool-header">
            <span class="tool-name">{{ tool.name }}</span>
            <span class="tool-difficulty" :class="tool.difficulty">
              {{ getDifficultyLabel(tool.difficulty) }}
            </span>
          </div>
          <p class="tool-desc">{{ tool.desc }}</p>
          <div class="tool-meta">
            <span class="meta-item">
              <span class="meta-label">学习目标</span>
              <span class="meta-value">{{ tool.goal }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">预计耗时</span>
              <span class="meta-value">{{ tool.duration }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">输入项</span>
              <span class="meta-value">{{ tool.inputs }} 项</span>
            </span>
            <span class="meta-item" v-if="tool.hasExercise">
              <span class="meta-tag">含练习</span>
            </span>
          </div>
          <div class="tool-mode">
            <span class="mode-tag learn">学习模式</span>
            <span class="mode-tag quick">快速计算</span>
          </div>
        </div>
      </div>
    </div>

    <div class="tool-category panel">
      <h2>计算估算工具</h2>
      <p class="category-desc">专业法医计算与估算工具</p>
      <div class="tool-grid">
        <div v-for="tool in filteredCalcTools" :key="tool.id" class="tool-card" @click="openTool(tool)">
          <div class="tool-header">
            <span class="tool-name">{{ tool.name }}</span>
            <span class="tool-difficulty" :class="tool.difficulty">
              {{ getDifficultyLabel(tool.difficulty) }}
            </span>
          </div>
          <p class="tool-desc">{{ tool.desc }}</p>
          <div class="tool-meta">
            <span class="meta-item">
              <span class="meta-label">学习目标</span>
              <span class="meta-value">{{ tool.goal }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">预计耗时</span>
              <span class="meta-value">{{ tool.duration }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">输入项</span>
              <span class="meta-value">{{ tool.inputs }} 项</span>
            </span>
            <span class="meta-item" v-if="tool.hasExercise">
              <span class="meta-tag">含练习</span>
            </span>
          </div>
          <div class="tool-mode">
            <span class="mode-tag learn">学习模式</span>
            <span class="mode-tag quick">快速计算</span>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state panel" v-if="filteredTools.length === 0">
      <p>暂无符合条件的工具</p>
      <button class="btn btn-outline" @click="resetFilter">重置筛选</button>
    </div>

    <section class="mode-info panel">
      <h3>两种模式的区别</h3>
      <div class="mode-comparison">
        <div class="mode-col">
          <h4>学习模式</h4>
          <ul>
            <li>字段解释与帮助提示</li>
            <li>输入范围与异常提醒</li>
            <li>参考区间说明</li>
            <li>计算过程展示</li>
            <li>适用/不适用场景说明</li>
            <li>配套练习题</li>
            <li>教学解析</li>
          </ul>
        </div>
        <div class="mode-col">
          <h4>快速计算模式</h4>
          <ul>
            <li>简洁输入界面</li>
            <li>快速获取结果</li>
            <li>适合日常使用</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAllTools } from '../../utils/toolDataService.js'

const router = useRouter()

const filterMode = ref('all')
const filterDifficulty = ref('')
const allTools = getAllTools()

const predictTools = computed(() => {
  let result = allTools.filter(
    (tool) =>
      tool.toolType === 'predict' ||
      tool.formulaType.includes('predict') ||
      tool.formulaType.includes('estimation') ||
      tool.formulaType.includes('inference') ||
      tool.formulaType.includes('pmi') ||
      tool.formulaType.includes('diatom') ||
      tool.formulaType.includes('weapon')
  )

  if (filterDifficulty.value) {
    result = result.filter((tool) => tool.difficulty === filterDifficulty.value)
  }

  return result
})

const calcTools = computed(() => {
  const predictIds = new Set(predictTools.value.map((tool) => tool.id))
  let result = allTools.filter((tool) => !predictIds.has(tool.id))

  if (filterDifficulty.value) {
    result = result.filter((tool) => tool.difficulty === filterDifficulty.value)
  }

  return result
})

const filteredTools = computed(() => [...predictTools.value, ...calcTools.value])

const filteredPredictTools = computed(() => predictTools.value)

const filteredCalcTools = computed(() => calcTools.value)

const getDifficultyLabel = (difficulty) => {
  const map = { A: 'A级', B: 'B级', C: 'C级', D: 'D级', E: 'E级' }
  return map[difficulty] || difficulty
}

const openTool = (tool) => {
  router.push({ name: 'tool-detail', params: { id: tool.id } })
}

const resetFilter = () => {
  filterMode.value = 'all'
  filterDifficulty.value = ''
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

.filter-bar {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 13px;
  color: var(--text-muted);
}

.filter-options {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--text-muted);
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  border-color: var(--accent);
}

.filter-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg-0);
}

.tool-category h2 {
  margin: 0;
  font-size: 18px;
  color: var(--accent);
}

.category-desc {
  margin: 4px 0 16px;
  font-size: 13px;
  color: var(--text-muted);
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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

.tool-difficulty {
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 4px;
}

.tool-difficulty.A {
  background: rgba(107, 203, 119, 0.15);
  color: #6bcb77;
}

.tool-difficulty.B {
  background: rgba(64, 216, 197, 0.15);
  color: #40d8c5;
}

.tool-difficulty.C {
  background: rgba(255, 217, 61, 0.15);
  color: #ffd93d;
}

.tool-difficulty.D {
  background: rgba(255, 180, 84, 0.15);
  color: #ffb454;
}

.tool-difficulty.E {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
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
  margin-bottom: 12px;
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

.meta-tag {
  display: inline-block;
  padding: 2px 6px;
  background: rgba(64, 216, 197, 0.15);
  color: var(--accent);
  font-size: 11px;
  border-radius: 4px;
}

.tool-mode {
  display: flex;
  gap: 8px;
}

.mode-tag {
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 4px;
}

.mode-tag.learn {
  background: rgba(64, 216, 197, 0.1);
  color: var(--accent);
}

.mode-tag.quick {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 40px;
}

.empty-state p {
  margin: 0 0 16px;
  color: var(--text-muted);
}

.mode-info h3 {
  margin: 0 0 16px;
  font-size: 16px;
}

.mode-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.mode-col h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--accent);
}

.mode-col ul {
  margin: 0;
  padding-left: 20px;
}

.mode-col li {
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .filter-bar {
    flex-direction: column;
  }

  .mode-comparison {
    grid-template-columns: 1fr;
  }
}
</style>
