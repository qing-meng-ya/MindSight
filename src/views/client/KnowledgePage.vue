<template>
  <div class="knowledge-page">
    <div class="section-head">
      <h1 class="section-title">知识百科</h1>
      <p class="section-note">通俗易懂，了解法医知识更安心</p>
    </div>

    <!-- 搜索 -->
    <div class="search-box panel">
      <input 
        v-model="search" 
        type="text" 
        placeholder="搜索常见问题、术语解释..." 
        class="search-input"
      />
    </div>

    <!-- 分类 -->
    <div class="category-tabs">
      <span 
        v-for="cat in categories" 
        :key="cat.id"
        class="tab" 
        :class="{ active: activeCategory === cat.id }" 
        @click="activeCategory = cat.id"
      >
        {{ cat.name }}
      </span>
    </div>

    <!-- 文章列表 -->
    <div class="article-list">
      <div v-for="article in filteredArticles" :key="article.id" class="article-card panel">
        <div class="article-header">
          <span class="article-tag">{{ article.category }}</span>
          <span class="article-views">{{ article.views }} 阅读</span>
        </div>
        <h3 class="article-title">{{ article.title }}</h3>
        <p class="article-summary">{{ article.summary }}</p>
        
        <!-- 先给结论 -->
        <div class="article-conclusion">
          <span class="conclusion-label">结论</span>
          <p>{{ article.conclusion }}</p>
        </div>
        
        <button class="btn-link" @click="showDetail(article)">阅读全文 →</button>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state panel" v-if="filteredArticles.length === 0">
      <h3>暂无相关内容</h3>
      <p>试试其他关键词或分类</p>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="selectedArticle" class="detail-modal" @click.self="selectedArticle = null">
      <div class="detail-content panel">
        <button class="close-btn" @click="selectedArticle = null">×</button>
        
        <div class="detail-header">
          <span class="detail-tag">{{ selectedArticle.category }}</span>
          <h2>{{ selectedArticle.title }}</h2>
        </div>
        
        <!-- 先给结论 -->
        <div class="detail-conclusion">
          <h4>结论</h4>
          <p>{{ selectedArticle.conclusion }}</p>
        </div>
        
        <!-- 再解释原因 -->
        <div class="detail-body">
          <h4>详细说明</h4>
          <p v-for="(para, idx) in selectedArticle.explanation" :key="idx">{{ para }}</p>
        </div>
        
        <!-- 底部入口 -->
        <div class="detail-footer">
          <button class="btn btn-primary" @click="goToConsult">我需要进一步咨询</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const search = ref('')
const activeCategory = ref('')
const selectedArticle = ref(null)

const categories = ref([
  { id: '', name: '全部' },
  { id: 'faq', name: '常见问题' },
  { id: 'process', name: '流程说明' },
  { id: 'risk', name: '风险预防' },
  { id: 'term', name: '术语解释' }
])

const articles = ref([
  { 
    id: 1, 
    category: '常见问题', 
    title: '骨折了一定要做鉴定吗？', 
    summary: '很多人受伤后不知道是否需要进行法医鉴定，这里给你一个判断标准。',
    conclusion: '不是所有骨折都需要做鉴定。只有当骨折可能涉及伤残评定、赔偿纠纷或诉讼时，才需要正式鉴定。',
    views: 1250,
    explanation: [
      '骨折是否需要鉴定，主要看伤情是否会影响日常生活和工作能力。',
      '如果骨折已经治愈，功能恢复良好，一般不需要进行伤残鉴定。',
      '但如果是涉及交通事故、工伤、人身伤害等需要赔偿的情况，建议及时鉴定。',
      '另外，如果骨折可能留下后遗症，也建议进行鉴定以便保留证据。'
    ]
  },
  { 
    id: 2, 
    category: '流程说明', 
    title: '法医鉴定流程是怎样的？', 
    summary: '第一次做鉴定不知道需要准备什么，看这篇就够了。',
    conclusion: '法医鉴定流程主要包括：预约→提交材料→检查→等结果→领取报告，整个过程通常需要1-2周。',
    views: 2340,
    explanation: [
      '第一步：预约鉴定。可以线上预约或现场排队，建议提前预约。',
      '第二步：提交材料。包括身份证、病历、影像资料等，越详细越好。',
      '第三步：法医检查。法医会进行体格检查，必要时要求补充检查。',
      '第四步：等待结果。根据伤情复杂程度，一般3-7个工作日出结果。',
      '第五步：领取报告。可以现场领取或邮寄，部分报告需要本人签字。'
    ]
  },
  { 
    id: 3, 
    category: '风险预防', 
    title: '伤后如何保留证据？', 
    summary: '及时保留证据对后续维权非常重要，这些要点要注意。',
    conclusion: '受伤后第一时间拍照、保留就医记录、保管好所有票据，这些是维权的重要证据。',
    views: 890,
    explanation: [
      '证据保留越早越好。受伤部位照片、患处对比照片都要及时拍摄。',
      '就医记录要完整。包括急诊记录、住院病历、检查报告、诊断证明等。',
      '所有费用票据要保存好。包括医疗费、护理费、交通费等。',
      '如果涉及交通事故，要保留事故认定书、交警联系方式等。',
      '如果伤情严重，建议及时咨询专业法医，了解鉴定时机。'
    ]
  },
  { 
    id: 4, 
    category: '术语解释', 
    title: '什么是伤残等级？', 
    summary: '经常听到"几级伤残"，这到底是怎么划分的？',
    conclusion: '伤残等级分为1-10级，1级最严重，10级最轻。等级越高，对生活工作的影响越大。',
    views: 1870,
    explanation: [
      '伤残等级是根据《人体损伤致残程度分级》标准评定的。',
      '1级：日常生活完全不能自理，比如植物人状态。',
      '2-3级：日常生活需要他人帮助。',
      '4-6级：日常生活明显受限或部分受限。',
      '7-10级：日常活动能力轻度受限。',
      '具体等级需要由专业法医根据检查结果评定，不是自己可以判断的。'
    ]
  },
  { 
    id: 5, 
    category: '常见问题', 
    title: '鉴定结果多久出来？', 
    summary: '做完检查后多久能拿到鉴定报告？',
    conclusion: '一般3-7个工作日出结果，复杂案件可能需要2-3周，加急可以提前。',
    views: 1560,
    explanation: [
      '普通鉴定：3-7个工作日，复杂案件可能延长。',
      '加急服务：1-2个工作日，需要额外支付费用。',
      '有些情况需要补充材料，时间会相应延长。',
      '如果是涉及诉讼的鉴定，可能需要等待法院指令。',
      '建议提前咨询鉴定机构了解具体时间安排。'
    ]
  }
])

const filteredArticles = computed(() => {
  let result = articles.value
  
  if (search.value) {
    const keyword = search.value.toLowerCase()
    result = result.filter(a => 
      a.title.toLowerCase().includes(keyword) || 
      a.summary.toLowerCase().includes(keyword) ||
      a.conclusion.toLowerCase().includes(keyword)
    )
  }
  
  if (activeCategory.value) {
    result = result.filter(a => a.category === getCategoryName(activeCategory.value))
  }
  
  return result
})

const getCategoryName = (id) => {
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.name : ''
}

const showDetail = (article) => {
  selectedArticle.value = article
}

const goToConsult = () => {
  router.push('/client/consult')
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

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tab {
  padding: 8px 16px;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 13px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab:hover, .tab.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(64, 216, 197, 0.15);
}

.article-list {
  display: grid;
  gap: 16px;
}

.article-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-tag {
  display: inline-flex;
  padding: 2px 10px;
  background: rgba(64, 216, 197, 0.15);
  border-radius: 999px;
  font-size: 12px;
  color: var(--accent);
}

.article-views {
  font-size: 12px;
  color: var(--text-muted);
}

.article-title {
  margin: 0;
  font-size: 18px;
}

.article-summary {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

.article-conclusion {
  padding: 12px;
  background: rgba(64, 216, 197, 0.1);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--accent);
}

.conclusion-label {
  display: block;
  font-size: 11px;
  color: var(--accent);
  margin-bottom: 4px;
}

.article-conclusion p {
  margin: 0;
  font-size: 14px;
  color: var(--text);
}

.btn-link {
  background: none;
  border: none;
  color: var(--accent);
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  padding: 0;
  width: fit-content;
}

.btn-link:hover {
  text-decoration: underline;
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

.detail-modal {
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

.detail-content {
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  padding: 32px;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-main);
  font-size: 24px;
  cursor: pointer;
  border-radius: 50%;
}

.detail-header {
  margin-bottom: 20px;
}

.detail-tag {
  display: inline-flex;
  padding: 2px 10px;
  background: rgba(64, 216, 197, 0.15);
  border-radius: 999px;
  font-size: 12px;
  color: var(--accent);
  margin-bottom: 12px;
}

.detail-content h2 {
  margin: 0;
  font-size: 22px;
}

.detail-conclusion {
  padding: 16px;
  background: rgba(64, 216, 197, 0.1);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--accent);
  margin-bottom: 20px;
}

.detail-conclusion h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--accent);
}

.detail-conclusion p {
  margin: 0;
  font-size: 15px;
  color: var(--text);
  font-weight: 500;
}

.detail-body h4 {
  margin: 0 0 12px;
  font-size: 15px;
}

.detail-body p {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.8;
}

.detail-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
  text-align: center;
}

.btn {
  padding: 12px 24px;
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

.btn-primary:hover {
  opacity: 0.9;
}
</style>