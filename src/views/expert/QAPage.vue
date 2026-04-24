<template>
  <div class="qa-page">
    <div class="section-head">
      <h1 class="section-title">在线答疑</h1>
      <p class="section-note">沉淀专业知识与协作经验</p>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar panel">
      <button class="btn btn-primary" @click="showAskForm = true">我要提问</button>
      <div class="view-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: viewMode === 'pending' }"
          @click="viewMode = 'pending'"
        >
          待回答 ({{ pendingCount }})
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: viewMode === 'answered' }"
          @click="viewMode = 'answered'"
        >
          已解决 ({{ answeredCount }})
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: viewMode === 'featured' }"
          @click="viewMode = 'featured'"
        >
          高质量回答
        </button>
      </div>
    </div>

    <!-- 按专题浏览 -->
    <div class="topic-nav panel" v-if="viewMode === 'pending'">
      <span class="topic-label">按专题：</span>
      <div class="topic-list">
        <button 
          v-for="topic in topics" 
          :key="topic.id"
          class="topic-btn"
          :class="{ active: activeTopic === topic.id }"
          @click="activeTopic = activeTopic === topic.id ? '' : topic.id"
        >
          {{ topic.name }}
          <span class="topic-count">{{ topic.count }}</span>
        </button>
      </div>
    </div>

    <!-- 问题列表 -->
    <div class="qa-list">
      <div v-for="q in filteredQuestions" :key="q.id" class="qa-card panel">
        <div class="qa-header">
          <span class="qa-tag">{{ q.tag }}</span>
          <span class="qa-status" :class="q.status">
            {{ getStatusLabel(q.status) }}
            <span class="answer-type" v-if="q.answerType">{{ getAnswerTypeLabel(q.answerType) }}</span>
          </span>
        </div>
        
        <h3 class="qa-title">{{ q.title }}</h3>
        <p class="qa-content">{{ q.content }}</p>
        
        <div class="qa-meta">
          <span class="meta-author">{{ q.author }}</span>
          <span class="meta-time">{{ q.date }}</span>
          <span class="meta-replies">{{ q.replies }} 回答</span>
          <span class="meta-case" v-if="q.caseType">案件类型：{{ q.caseType }}</span>
        </div>
        
        <!-- 已回答显示答案 -->
        <div v-if="q.answer" class="qa-answer">
          <div class="answer-header">
            <span class="answer-label">回复</span>
            <span class="answer-type-badge" :class="q.answerType">{{ getAnswerTypeLabel(q.answerType) }}</span>
          </div>
          <p>{{ q.answer }}</p>
        </div>
        
        <!-- 待回答显示回答按钮 -->
        <div v-if="q.status === 'pending'" class="qa-actions">
          <button class="btn btn-sm btn-primary" @click="answerQuestion(q)">我来回答</button>
          <button class="btn btn-sm btn-outline" @click="markStandard(q)">标为标准答案</button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state panel" v-if="filteredQuestions.length === 0">
      <h3>{{ viewMode === 'pending' ? '暂无待回答问题' : '暂无相关问题' }}</h3>
      <p>看看其他专题的问题吧</p>
    </div>

    <!-- 提问弹窗 -->
    <div v-if="showAskForm" class="modal-overlay" @click.self="showAskForm = false">
      <div class="modal-content panel">
        <h2>发布问题</h2>
        
        <div class="form-group">
          <label>选择专题</label>
          <select v-model="newQuestion.topic">
            <option value="">请选择专题</option>
            <option v-for="topic in topics" :key="topic.id" :value="topic.id">{{ topic.name }}</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>选择案件类型（可选）</label>
          <select v-model="newQuestion.caseType">
            <option value="">请选择案件类型</option>
            <option value="traffic">交通事故</option>
            <option value="injury">人身伤害</option>
            <option value="medical">医疗纠纷</option>
            <option value="work">工伤鉴定</option>
            <option value="other">其他</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>问题标题</label>
          <input v-model="newQuestion.title" type="text" placeholder="简明扼要地描述问题" />
        </div>
        
        <div class="form-group">
          <label>问题详情</label>
          <textarea v-model="newQuestion.content" rows="5" placeholder="详细描述问题背景和具体情况"></textarea>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showAskForm = false">取消</button>
          <button class="btn btn-primary" @click="submitQuestion" :disabled="!canSubmit">发布</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getSubjects } from '../../utils/toolDataService.js'

const showAskForm = ref(false)
const viewMode = ref('pending')
const activeTopic = ref('')

// 使用真实学科数据作为专题
const subjects = getSubjects()
const topics = ref(subjects.map(s => ({
  id: s.id,
  name: s.name,
  count: s.tools.length + 2
})))

const newQuestion = ref({
  topic: '',
  caseType: '',
  title: '',
  content: ''
})

const questions = ref([
  { 
    id: 1, 
    tag: '法医临床学', 
    status: 'answered', 
    title: '关于肋骨骨折伤残评级的疑问', 
    content: '患者双侧多发肋骨骨折（共计8根），但没有达到胸廓畸形程度，应该评几级伤残？',
    author: '鉴定医师张', 
    date: '2024-03-15', 
    replies: 3, 
    caseType: '交通事故',
    answerType: 'standard',
    answer: '根据SF/T 0111-2021《法医临床学检验规范》及GB/T 16180-2014《劳动能力鉴定》标准，8根肋骨骨折可评定为九级伤残。如合并胸廓畸形可考虑八级。具体需要结合影像资料和功能丧失情况综合评定。'
  },
  { 
    id: 2, 
    tag: '赔偿计算', 
    status: 'pending', 
    title: '护理依赖程度如何评定？', 
    content: '脑外伤后植物生存状态的患者，护理依赖程度如何划分？是否需要24小时陪护？',
    author: '李法医', 
    date: '2024-03-14', 
    replies: 0, 
    caseType: '人身伤害',
    answer: ''
  },
  { 
    id: 3, 
    tag: '法医临床学', 
    status: 'answered', 
    title: '外伤性鼓膜穿孔的损伤程度鉴定', 
    content: '外伤性鼓膜穿孔愈合后，听力恢复正常，如何评定损伤程度？',
    author: '王医生', 
    date: '2024-03-12', 
    replies: 2, 
    caseType: '人身伤害',
    answerType: 'experience',
    answer: '根据GB/T 44893-2024《听觉功能障碍法医临床鉴定技术规范》，外伤性鼓膜穿孔评定为轻微伤。如愈合后听力完全恢复，可不评定损伤程度。建议关注是否有遗留后遗症。'
  },
  { 
    id: 4, 
    tag: '法医病理学', 
    status: 'pending', 
    title: '尸体腐败对PMI判断的影响', 
    content: '在高温环境下，尸体腐败进程加快，PMI推断误差会增大多少？',
    author: '刘法医', 
    date: '2024-03-10', 
    replies: 0, 
    caseType: '其他',
    answer: ''
  }
])

const pendingCount = computed(() => questions.value.filter(q => q.status === 'pending').length)
const answeredCount = computed(() => questions.value.filter(q => q.status === 'answered').length)

const filteredQuestions = computed(() => {
  let result = questions.value
  
  if (viewMode.value === 'pending') {
    result = result.filter(q => q.status === 'pending')
  } else if (viewMode.value === 'answered') {
    result = result.filter(q => q.status === 'answered')
  } else if (viewMode.value === 'featured') {
    result = result.filter(q => q.answerType === 'standard' || q.answerType === 'experience')
  }
  
  if (activeTopic.value) {
    result = result.filter(q => q.tag === getTopicName(activeTopic.value))
  }
  
  return result
})

const canSubmit = computed(() => {
  return newQuestion.value.topic && newQuestion.value.title && newQuestion.value.content
})

const getStatusLabel = (status) => {
  return status === 'answered' ? '已回复' : '待回复'
}

const getAnswerTypeLabel = (type) => {
  const map = { standard: '标准答案', experience: '经验建议', pending: '待核实' }
  return map[type] || ''
}

const getTopicName = (id) => {
  const topic = topics.value.find(t => t.id === id)
  return topic ? topic.name : ''
}

const answerQuestion = (q) => {
  console.log('回答问题:', q.id)
}

const markStandard = (q) => {
  q.answerType = 'standard'
}

const submitQuestion = () => {
  questions.value.unshift({
    id: Date.now(),
    tag: getTopicName(newQuestion.value.topic),
    status: 'pending',
    title: newQuestion.value.title,
    content: newQuestion.value.content,
    author: '我',
    date: new Date().toISOString().split('T')[0],
    replies: 0,
    caseType: newQuestion.value.caseType,
    answer: ''
  })
  showAskForm.value = false
  newQuestion.value = { topic: '', caseType: '', title: '', content: '' }
}
</script>

<style scoped>
.qa-page {
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

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
}

.view-tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  border-color: var(--accent);
}

.tab-btn.active {
  background: rgba(64, 216, 197, 0.15);
  border-color: var(--accent);
  color: var(--accent);
}

.topic-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  overflow-x: auto;
}

.topic-label {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
}

.topic-list {
  display: flex;
  gap: 8px;
}

.topic-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.topic-btn:hover {
  border-color: var(--accent);
}

.topic-btn.active {
  background: rgba(64, 216, 197, 0.15);
  border-color: var(--accent);
  color: var(--accent);
}

.topic-count {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 10px;
}

.qa-list {
  display: grid;
  gap: 16px;
}

.qa-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
}

.qa-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.qa-tag {
  padding: 2px 10px;
  background: rgba(64, 216, 197, 0.15);
  border-radius: 999px;
  font-size: 12px;
  color: var(--accent);
}

.qa-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.qa-status.answered {
  background: rgba(107, 203, 119, 0.15);
  color: #6bcb77;
}

.qa-status.pending {
  background: rgba(255, 180, 84, 0.15);
  color: #ffb454;
}

.answer-type {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 10px;
}

.qa-title {
  margin: 0;
  font-size: 17px;
}

.qa-content {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.qa-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: var(--text-muted);
}

.qa-answer {
  margin-top: 8px;
  padding: 16px;
  background: rgba(64, 216, 197, 0.1);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--accent);
}

.answer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.answer-label {
  font-size: 12px;
  color: var(--accent);
  font-weight: 500;
}

.answer-type-badge {
  padding: 2px 6px;
  font-size: 10px;
  border-radius: 4px;
}

.answer-type-badge.standard {
  background: rgba(64, 216, 197, 0.2);
  color: var(--accent);
}

.answer-type-badge.experience {
  background: rgba(255, 217, 61, 0.2);
  color: #ffd93d;
}

.qa-answer p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

.qa-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-sm {
  padding: 8px 14px;
  font-size: 13px;
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

.btn-outline:hover {
  border-color: var(--accent);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 40px;
}

.empty-state h3 {
  margin: 0 0 8px;
}

.empty-state p {
  margin: 0;
  color: var(--text-muted);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  padding: 24px;
}

.modal-content h2 {
  margin: 0 0 20px;
  font-size: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--text-muted);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>