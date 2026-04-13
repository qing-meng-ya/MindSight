<template>
  <div class="cases-page">
    <div class="section-head">
      <h1 class="section-title">案例学习</h1>
      <p class="section-note">经典案例分析、实战经验分享</p>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar panel">
      <div class="filter-group">
        <input v-model="search" type="text" placeholder="搜索案例..." class="search-input" />
      </div>
      <div class="filter-group">
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
    </div>

    <!-- 案例列表 -->
    <div class="case-list">
      <div v-for="c in filteredCases" :key="c.id" class="case-card panel" @click="viewCase(c)">
        <div class="case-header">
          <h3 class="case-title">{{ c.title }}</h3>
          <span class="case-difficulty" :class="'diff-' + c.difficulty">{{ c.difficulty }}级</span>
        </div>
        <p class="case-desc">{{ c.description }}</p>
        <div class="case-tags">
          <span class="tag" v-for="tag in c.tags" :key="tag">{{ tag }}</span>
        </div>
        <div class="case-meta">
          <span>{{ c.type }}</span>
          <span>{{ c.views }} 浏览</span>
          <span>{{ c.comments }} 评论</span>
          <span>{{ c.date }}</span>
        </div>
      </div>
    </div>

    <!-- 案例详情弹窗 -->
    <div v-if="selectedCase" class="modal" @click.self="selectedCase = null">
      <div class="modal-content panel case-detail">
        <div class="modal-header">
          <div>
            <h2>{{ selectedCase.title }}</h2>
            <div class="case-meta">
              <span class="case-difficulty" :class="'diff-' + selectedCase.difficulty">{{ selectedCase.difficulty }}级</span>
              <span>{{ selectedCase.type }}</span>
            </div>
          </div>
          <button class="close-btn" @click="selectedCase = null">&times;</button>
        </div>

        <div class="case-content">
          <div class="content-section">
            <h3>案件简介</h3>
            <p>{{ selectedCase.description }}</p>
          </div>
          
          <div class="content-section" v-if="!showAnswer">
            <h3>案件详情</h3>
            <div class="case-facts">
              <p v-for="(fact, idx) in selectedCase.facts" :key="idx">{{ fact }}</p>
            </div>
            <button class="btn btn-primary" @click="startAnswer">开始作答</button>
          </div>
          
          <div class="answer-section" v-else>
            <h3>我的答案</h3>
            <div class="answer-form">
              <div class="form-group">
                <label>鉴定意见</label>
                <textarea v-model="userAnswer.opinion" placeholder="请输入你的鉴定意见..."></textarea>
              </div>
              <div class="form-group">
                <label>伤残等级</label>
                <select v-model="userAnswer.level">
                  <option value="">请选择</option>
                  <option value="1">一级</option>
                  <option value="2">二级</option>
                  <option value="3">三级</option>
                  <option value="4">四级</option>
                  <option value="5">五级</option>
                  <option value="6">六级</option>
                  <option value="7">七级</option>
                  <option value="8">八级</option>
                  <option value="9">九级</option>
                  <option value="10">十级</option>
                </select>
              </div>
              <div class="form-group">
                <label>分析说明</label>
                <textarea v-model="userAnswer.reason" placeholder="请说明你的分析依据..." rows="4"></textarea>
              </div>
              <button class="btn btn-primary" @click="submitAnswer">提交答案</button>
            </div>
          </div>
          
          <div class="standard-answer" v-if="showAnswer && showStandard">
            <h3>标准答案</h3>
            <div class="answer-box">
              <div class="answer-item">
                <span class="answer-label">鉴定意见</span>
                <span class="answer-value">{{ selectedCase.standardAnswer.opinion }}</span>
              </div>
              <div class="answer-item">
                <span class="answer-label">伤残等级</span>
                <span class="answer-value">{{ selectedCase.standardAnswer.level }}级</span>
              </div>
              <div class="answer-item">
                <span class="answer-label">分析说明</span>
                <p class="answer-text">{{ selectedCase.standardAnswer.reason }}</p>
              </div>
            </div>
            <div class="answer-comparison">
              <h4>答案对比</h4>
              <div class="compare-item">
                <span>你的答案</span>
                <span>{{ userAnswer.opinion || '未填写' }}</span>
              </div>
              <div class="compare-item">
                <span>标准答案</span>
                <span>{{ selectedCase.standardAnswer.opinion }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const search = ref('')
const activeCategory = ref('all')
const selectedCase = ref(null)
const showAnswer = ref(false)
const showStandard = ref(false)

const categories = ref([
  { id: 'all', name: '全部' },
  { id: 'traffic', name: '交通事故' },
  { id: 'work', name: '工伤' },
  { id: 'medical', name: '医疗事故' },
  { id: 'injury', name: '人身损伤' }
])

const userAnswer = reactive({
  opinion: '',
  level: '',
  reason: ''
})

const cases = ref([
  {
    id: 1,
    title: '交通事故导致胫骨平台骨折案',
    description: '受害人因交通事故导致胫骨平台骨折，经手术治疗后遗留功能障碍。',
    type: '交通事故',
    difficulty: 'C',
    tags: ['骨折', '伤残', '关节功能'],
    views: 234,
    comments: 15,
    date: '2024-01-20',
    facts: [
      '伤者男性，45岁，因交通事故受伤',
      'CT示：左胫骨平台粉碎性骨折',
      '行切开复位内固定术',
      '术后3个月，左膝关节屈伸活动度0-85°',
      '对侧膝关节活动度0-135°'
    ],
    standardAnswer: {
      opinion: '胫骨平台骨折术后左膝关节功能部分受限',
      level: '九级',
      reason: '根据《人体损伤程度鉴定标准》，膝关节功能丧失未达25%但构成功能障碍，评定为九级伤残。'
    }
  },
  {
    id: 2,
    title: '工作中摔伤导致脊髓损伤案',
    description: '工人在施工过程中从脚手架摔下，导致胸椎骨折伴脊髓损伤。',
    type: '工伤',
    difficulty: 'D',
    tags: ['脊髓', '瘫痪', '工伤'],
    views: 189,
    comments: 12,
    date: '2024-01-18',
    facts: [
      '伤者男性，38岁，建筑工人',
      '从3米高处坠落',
      '胸椎MRI：T12椎体骨折，脊髓受压',
      '双下肢肌力3级',
      '大小便功能轻度障碍'
    ],
    standardAnswer: {
      opinion: '胸椎骨折伴脊髓损伤，双下肢瘫',
      level: '二级',
      reason: '根据《劳动能力鉴定 职工工伤与职业病致残等级》，脊髓损伤导致双下肢肌力3级，评定为二级伤残。'
    }
  },
  {
    id: 3,
    title: '医美手术失败导致眼球损伤案',
    description: '患者接受眼部美容手术后出现眼球转动受限、视物模糊。',
    type: '医疗事故',
    difficulty: 'C',
    tags: ['眼科', '手术', '医疗事故'],
    views: 156,
    comments: 8,
    date: '2024-01-15',
    facts: [
      '患者女性，32岁',
      '行重睑术+开眼角手术',
      '术后右眼转动受限',
      '眼球突出度差3mm',
      '视力下降至0.6'
    ],
    standardAnswer: {
      opinion: '右眼眼外肌损伤，视功能障碍',
      level: '十级',
      reason: '根据《人体损伤程度鉴定标准》，眼外伤导致视力下降，评定为十级伤残。'
    }
  },
  {
    id: 4,
    title: '被打导致肋骨多发骨折案',
    description: '因纠纷被多人围殴，致肋骨多处骨折。',
    type: '人身损伤',
    difficulty: 'B',
    tags: ['肋骨', '骨折', '故意伤害'],
    views: 312,
    comments: 22,
    date: '2024-01-12',
    facts: [
      '伤者男性，28岁',
      '被木棒击打',
      'CT示：左侧第4-7肋骨骨折',
      '部分断端错位',
      '伴少量血气胸'
    ],
    standardAnswer: {
      opinion: '左侧多发肋骨骨折',
      level: '轻伤二级',
      reason: '根据《人体损伤程度鉴定标准》，肋骨骨折4处以上，构成轻伤二级。'
    }
  },
  {
    id: 5,
    title: '烧伤后瘢痕增生案',
    description: '工作场所火灾导致全身多处烧伤，愈后瘢痕增生明显。',
    type: '工伤',
    difficulty: 'E',
    tags: ['烧伤', '瘢痕', '工伤'],
    views: 98,
    comments: 6,
    date: '2024-01-10',
    facts: [
      '伤者男性，42岁',
      '工厂火灾中烧伤',
      '全身TBSA 35%，深II度-III度',
      '愈后面部及四肢瘢痕增生',
      '瘢痕面积约12%体表面积'
    ],
    standardAnswer: {
      opinion: '全身多处瘢痕形成',
      level: '五级',
      reason: '根据《劳动能力鉴定 职工工伤与职业病致残等级》，瘢痕面积>10%体表面积，评定为五级伤残。'
    }
  }
])

const filteredCases = computed(() => {
  let result = cases.value
  
  if (search.value) {
    const keyword = search.value.toLowerCase()
    result = result.filter(c => 
      c.title.toLowerCase().includes(keyword) || 
      c.description.toLowerCase().includes(keyword)
    )
  }
  
  if (activeCategory.value !== 'all') {
    result = result.filter(c => c.type === activeCategory.value)
  }
  
  return result
})

const viewCase = (c) => {
  selectedCase.value = c
  showAnswer.value = false
  showStandard.value = false
  userAnswer.opinion = ''
  userAnswer.level = ''
  userAnswer.reason = ''
}

const startAnswer = () => {
  showAnswer.value = true
}

const submitAnswer = () => {
  showStandard.value = true
}
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

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.search-input {
  width: 200px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-size: 14px;
}

.filter-group {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover, .filter-btn.active {
  border-color: var(--accent);
  color: var(--accent);
}

.case-list {
  display: grid;
  gap: 16px;
}

.case-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.case-card:hover {
  border-color: var(--accent);
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.case-title {
  margin: 0;
  font-size: 18px;
}

.case-difficulty {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.diff-A { background: rgba(107, 203, 119, 0.15); color: #6bcb77; }
.diff-B { background: rgba(64, 216, 197, 0.15); color: #40d8c5; }
.diff-C { background: rgba(255, 217, 61, 0.15); color: #ffd93d; }
.diff-D { background: rgba(255, 180, 84, 0.15); color: #ffb454; }
.diff-E { background: rgba(255, 107, 107, 0.15); color: #ff6b6b; }

.case-desc {
  margin: 0 0 12px;
  color: var(--text-muted);
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.case-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tag {
  padding: 4px 10px;
  background: rgba(64, 216, 197, 0.15);
  border-radius: 999px;
  font-size: 11px;
  color: var(--accent);
}

.case-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-muted);
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
  overflow-y: auto;
}

.modal-content {
  width: min(700px, calc(100% - 32px));
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.case-content {
  display: grid;
  gap: 24px;
}

.content-section h3, .answer-section h3, .standard-answer h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: var(--accent);
}

.case-facts {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
}

.case-facts p {
  margin: 0 0 8px;
  font-size: 14px;
  line-height: 1.7;
}

.answer-form {
  display: grid;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group textarea, .form-group select {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-size: 14px;
}

.answer-box {
  padding: 16px;
  background: rgba(107, 203, 119, 0.1);
  border: 1px solid rgba(107, 203, 119, 0.3);
  border-radius: var(--radius-md);
}

.answer-item {
  margin-bottom: 12px;
}

.answer-label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.answer-value {
  font-size: 15px;
  font-weight: 600;
}

.answer-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
}

.answer-comparison {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
}

.answer-comparison h4 {
  margin: 0 0 12px;
  font-size: 14px;
}

.compare-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
}
</style>