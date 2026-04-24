<template>
  <div class="knowledge-page">
    <div class="section-head">
      <h1 class="section-title">知识库</h1>
      <p class="section-note">系统化学习法医知识，从这里开始</p>
    </div>

    <div class="search-box panel">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索术语、法规、案例、疾病、损伤类型..."
        class="search-input"
      />
    </div>

    <div class="filter-bar panel">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="filter-btn"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        {{ cat.name }}
      </button>
    </div>

    <section class="path-recommend panel" v-if="!searchKeyword && !activeCategory">
      <h2>推荐学习路径</h2>
      <p class="path-hint">根据您的学习阶段推荐</p>
      <div class="path-cards">
        <div v-for="path in learningPaths" :key="path.id" class="path-card" @click="startPath(path)">
          <div class="path-header">
            <h3>{{ path.name }}</h3>
            <span class="path-level">{{ path.level }}</span>
          </div>
          <p class="path-desc">{{ path.desc }}</p>
          <div class="path-meta">
            <span>{{ path.duration }}</span>
            <span>{{ path.count }} 资源</span>
          </div>
        </div>
      </div>
    </section>

    <div class="resource-list">
      <div v-for="item in filteredResources" :key="item.id" class="resource-card panel">
        <div class="card-header">
          <span class="resource-type">{{ item.type }}</span>
          <span class="resource-difficulty" :class="item.difficulty">
            {{ getDifficultyLabel(item.difficulty) }}
          </span>
        </div>

        <h3 class="resource-title">{{ item.title }}</h3>
        <p class="resource-desc">{{ item.desc }}</p>

        <div class="resource-meta">
          <span class="meta-item">
            <span class="meta-label">前置知识</span>
            <span class="meta-value">{{ item.prerequisites || '无' }}</span>
          </span>
          <span class="meta-item">
            <span class="meta-label">时长</span>
            <span class="meta-value">{{ item.duration }}</span>
          </span>
          <span class="meta-item">
            <span class="meta-label">阅读</span>
            <span class="meta-value">{{ item.views }} 次</span>
          </span>
          <span class="meta-item" v-if="item.progress">
            <span class="meta-label">进度</span>
            <span class="meta-value">{{ item.progress }}%</span>
          </span>
        </div>

        <div class="card-actions">
          <button class="btn btn-primary" @click="startLearning(item)">
            {{ item.progress ? '继续学习' : '开始学习' }}
          </button>
          <button class="btn btn-icon" @click="toggleCollect(item)" :class="{ collected: item.collected }">
            {{ item.collected ? '已收藏' : '收藏' }}
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state panel" v-if="filteredResources.length === 0">
      <h3>暂无相关资源</h3>
      <p>试试调整搜索条件或浏览其他分类</p>
      <button class="btn btn-outline" @click="resetSearch">重置筛选</button>
    </div>

    <section class="related-section panel" v-if="currentResource">
      <h3>相关推荐</h3>
      <div class="related-list">
        <div
          v-for="rel in relatedResources"
          :key="rel.id"
          class="related-item"
          @click="startLearning(rel)"
        >
          <span class="related-type">{{ rel.type }}</span>
          <span class="related-title">{{ rel.title }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getStandards, getSubjects } from '../../utils/toolDataService.js'
import documentIndex from '../../data/documentIndex.json'

const searchKeyword = ref('')
const activeCategory = ref('')
const currentResource = ref(null)

const categories = ref([
  { id: '', name: '全部' },
  { id: 'law', name: '法规标准' },
  { id: 'book', name: '教材资料' },
  { id: 'article', name: '专题文章' },
  { id: 'video', name: '教学视频' }
])

const subjects = getSubjects()
const standards = getStandards()
const documents = documentIndex.documents ?? []

const learningPaths = computed(() =>
  subjects.map((subject, idx) => ({
    id: subject.id,
    name: subject.name,
    level: idx < 2 ? '入门' : idx < 4 ? '进阶' : '精通',
    desc: subject.description,
    duration: `${Math.max(1, Math.ceil(subject.tools.length / 2))}小时`,
    count: subject.tools.length + subject.relatedBooks.length + subject.atlas.length
  }))
)

const resources = computed(() => {
  const result = []
  let id = 1

  standards.forEach((standard, idx) => {
    result.push({
      id: id++,
      type: '法规标准',
      difficulty: 'A',
      title: `${standard.code} ${standard.name}`,
      desc:
        standard.applicable && standard.applicable.length
          ? `适用：${standard.applicable.join('、')}`
          : '法医标准与规范资料',
      prerequisites: '无',
      duration: '20分钟',
      views: 600 + ((idx + 3) * 37) % 1200,
      progress: 0,
      collected: false,
      category: 'law'
    })
  })

  documents.slice(0, 18).forEach((doc, idx) => {
    result.push({
      id: id++,
      type: '教材资料',
      difficulty: idx % 3 === 0 ? 'B' : 'C',
      title: doc.title || doc.filename,
      desc: doc.subCategory ? `${doc.subCategory}相关资料` : '法医学参考资料',
      prerequisites: '法医入门',
      duration: `${(idx % 3) + 1}小时`,
      views: 300 + ((idx + 5) * 47) % 900,
      progress: 0,
      collected: false,
      category: 'book'
    })
  })

  subjects.forEach((subject, idx) => {
    result.push({
      id: id++,
      type: '专题文章',
      difficulty: subject.tools.some((tool) => tool.difficulty === 'A') ? 'D' : 'C',
      title: `${subject.name}专题导读`,
      desc: subject.description,
      prerequisites: idx === 0 ? '无' : '法医入门',
      duration: '1小时',
      views: 240 + ((idx + 7) * 53) % 700,
      progress: 0,
      collected: false,
      category: 'article'
    })
  })

  return result
})

const filteredResources = computed(() => {
  let result = resources.value

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      (resource) =>
        resource.title.toLowerCase().includes(keyword) ||
        resource.desc.toLowerCase().includes(keyword)
    )
  }

  if (activeCategory.value) {
    result = result.filter((resource) => resource.type === getCategoryName(activeCategory.value))
  }

  return result
})

const relatedResources = computed(() => {
  if (!currentResource.value) return []

  return resources.value
    .filter(
      (resource) =>
        resource.id !== currentResource.value.id && resource.type === currentResource.value.type
    )
    .slice(0, 4)
})

const getDifficultyLabel = (difficulty) => {
  const map = { A: 'A级', B: 'B级', C: 'C级', D: 'D级', E: 'E级' }
  return map[difficulty] || difficulty
}

const getCategoryName = (id) => {
  const category = categories.value.find((item) => item.id === id)
  return category ? category.name : ''
}

const startPath = (path) => {
  console.log('开始学习路径:', path.name)
}

const startLearning = (item) => {
  currentResource.value = item
  console.log('开始学习:', item.title)
}

const toggleCollect = (item) => {
  item.collected = !item.collected
}

const resetSearch = () => {
  searchKeyword.value = ''
  activeCategory.value = ''
}
</script>

<style scoped>
.knowledge-page {
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

.search-box {
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

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  border-color: var(--accent);
}

.filter-btn.active {
  background: rgba(64, 216, 197, 0.15);
  border-color: var(--accent);
  color: var(--accent);
}

.path-recommend {
  background: linear-gradient(135deg, rgba(64, 216, 197, 0.1), rgba(64, 216, 197, 0.05));
}

.path-recommend h2 {
  margin: 0;
  font-size: 18px;
}

.path-hint {
  margin: 4px 0 16px;
  font-size: 13px;
  color: var(--text-muted);
}

.path-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.path-card {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.path-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.path-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.path-header h3 {
  margin: 0;
  font-size: 16px;
}

.path-level {
  padding: 2px 8px;
  background: rgba(64, 216, 197, 0.15);
  color: var(--accent);
  font-size: 11px;
  border-radius: 4px;
}

.path-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--text-muted);
}

.path-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-muted);
}

.resource-list {
  display: grid;
  gap: 16px;
}

.resource-card {
  padding: 20px;
}

.card-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.resource-type {
  display: inline-flex;
  padding: 2px 10px;
  background: rgba(64, 216, 197, 0.15);
  border-radius: 999px;
  font-size: 12px;
  color: var(--accent);
}

.resource-difficulty {
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 4px;
}

.resource-difficulty.A {
  background: rgba(107, 203, 119, 0.15);
  color: #6bcb77;
}

.resource-difficulty.B {
  background: rgba(64, 216, 197, 0.15);
  color: #40d8c5;
}

.resource-difficulty.C {
  background: rgba(255, 217, 61, 0.15);
  color: #ffd93d;
}

.resource-difficulty.D {
  background: rgba(255, 180, 84, 0.15);
  color: #ffb454;
}

.resource-difficulty.E {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}

.resource-title {
  margin: 0 0 8px;
  font-size: 18px;
}

.resource-desc {
  margin: 0 0 16px;
  color: var(--text-muted);
  font-size: 14px;
}

.resource-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
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
  font-size: 13px;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
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

.btn-icon:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.btn-icon.collected {
  border-color: var(--accent);
  color: var(--accent);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--text);
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

.related-section h3 {
  margin: 0 0 12px;
  font-size: 16px;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.related-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.related-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.related-type {
  font-size: 12px;
  color: var(--accent);
}

.related-title {
  font-size: 14px;
}

@media (max-width: 768px) {
  .path-cards {
    grid-template-columns: 1fr;
  }
}
</style>
