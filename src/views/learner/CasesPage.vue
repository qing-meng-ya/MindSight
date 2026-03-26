<template>
  <div class="cases-page">
    <div class="section-head">
      <h1 class="section-title">案例学习</h1>
      <p class="section-note">经典案例分析、实战经验分享</p>
    </div>

    <div class="search-bar panel">
      <input v-model="search" type="text" placeholder="搜索案例..." class="search-input" />
    </div>

    <div class="case-list">
      <div v-for="c in filteredCases" :key="c.id" class="case-card panel">
        <div class="case-header">
          <h3 class="case-title">{{ c.title }}</h3>
          <span class="case-tag">{{ c.tag }}</span>
        </div>
        <p class="case-desc">{{ c.desc }}</p>
        <div class="case-meta">
          <span>{{ c.date }}</span>
          <span>{{ c.views }} 浏览</span>
          <span>{{ c.comments }} 评论</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const search = ref('')

const cases = ref([])

const filteredCases = computed(() => {
  if (!search.value) return cases.value
  return cases.value.filter(c => c.title.includes(search.value) || c.desc.includes(search.value))
})
</script>

<style scoped>
.cases-page {
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

.search-bar {
  padding: 12px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: rgba(8, 14, 24, 0.5);
  color: var(--text-main);
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
}

.case-list {
  display: grid;
  gap: 16px;
}

.case-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.case-title {
  margin: 0;
  font-size: 18px;
}

.case-tag {
  padding: 4px 12px;
  background: rgba(255, 180, 84, 0.15);
  border-radius: 999px;
  font-size: 12px;
  color: var(--accent-2);
}

.case-desc {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

.case-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-muted);
}
</style>