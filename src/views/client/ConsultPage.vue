<template>
  <div class="consult-page">
    <div class="section-head">
      <h1 class="section-title">咨询服务</h1>
      <p class="section-note">预约咨询、在线问答</p>
    </div>

    <div class="consult-tabs">
      <button class="tab-btn" :class="{ active: activeTab === 'book' }" @click="activeTab = 'book'">预约咨询</button>
      <button class="tab-btn" :class="{ active: activeTab === 'qa' }" @click="activeTab = 'qa'">在线问答</button>
    </div>

    <div v-if="activeTab === 'book'" class="book-section">
      <div class="experts-grid">
        <div v-for="exp in experts" :key="exp.id" class="expert-card panel">
          <div class="expert-avatar">{{ exp.avatar }}</div>
          <div class="expert-info">
            <h3>{{ exp.name }}</h3>
            <p class="expert-title">{{ exp.title }}</p>
            <p class="expert-desc">{{ exp.desc }}</p>
            <div class="expert-tags">
              <span v-for="tag in exp.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
          <button class="btn btn-primary" @click="bookAppointment(exp)">预约</button>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'qa'" class="qa-section">
      <div class="qa-form panel">
        <h3>提交问题</h3>
        <textarea v-model="question" placeholder="请描述您的问题..." rows="4"></textarea>
        <button class="btn btn-primary" @click="submitQuestion">提交</button>
      </div>
      <div class="qa-list">
        <div v-for="q in questions" :key="q.id" class="qa-item panel">
          <div class="qa-header">
            <span class="qa-author">{{ q.author }}</span>
            <span class="qa-time">{{ q.time }}</span>
          </div>
          <p class="qa-content">{{ q.content }}</p>
          <div v-if="q.reply" class="qa-reply">
            <strong>回复：</strong>{{ q.reply }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('book')
const question = ref('')

const experts = ref([])

const questions = ref([])

const bookAppointment = (expert) => {
  alert(`预约 ${expert.name} 的服务`)
}

const submitQuestion = () => {
  if (!question.value.trim()) return
  questions.value.unshift({
    id: Date.now(),
    author: '我',
    time: '刚刚',
    content: question.value,
    reply: ''
  })
  question.value = ''
}
</script>

<style scoped>
.consult-page {
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

.consult-tabs {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.tab-btn {
  padding: 10px 24px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover, .tab-btn.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(64, 216, 197, 0.15);
}

.experts-grid {
  display: grid;
  gap: 16px;
}

.expert-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.expert-avatar {
  font-size: 48px;
}

.expert-info {
  flex: 1;
}

.expert-info h3 {
  margin: 0 0 4px;
  font-size: 17px;
}

.expert-title {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--accent);
}

.expert-desc {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--text-muted);
}

.expert-tags {
  display: flex;
  gap: 8px;
}

.tag {
  padding: 2px 10px;
  background: rgba(64, 216, 197, 0.15);
  border-radius: 999px;
  font-size: 12px;
  color: var(--accent);
}

.qa-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.qa-form h3 {
  margin: 0;
  font-size: 16px;
}

.qa-form textarea {
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: rgba(8, 14, 24, 0.5);
  color: var(--text-main);
  font-size: 14px;
  resize: vertical;
}

.qa-list {
  display: grid;
  gap: 16px;
}

.qa-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qa-header {
  display: flex;
  justify-content: space-between;
}

.qa-author {
  font-size: 14px;
  font-weight: 500;
}

.qa-time {
  font-size: 12px;
  color: var(--text-muted);
}

.qa-content {
  margin: 0;
  font-size: 14px;
}

.qa-reply {
  padding: 10px;
  background: rgba(64, 216, 197, 0.1);
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.qa-reply strong {
  color: var(--accent);
}
</style>