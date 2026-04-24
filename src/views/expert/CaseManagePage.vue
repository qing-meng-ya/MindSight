<template>
  <div class="case-manage-page">
    <div class="section-head">
      <h1 class="section-title">案件管理</h1>
      <p class="section-note">多维度案件追踪与协作管理</p>
    </div>

    <div class="stats-bar">
      <div v-for="s in caseStats" :key="s.label" class="stat-card panel">
        <span class="stat-label">{{ s.label }}</span>
        <strong class="stat-value">{{ s.value }}</strong>
      </div>
    </div>

    <div class="filter-bar panel">
      <div class="filter-group">
        <input v-model="search" type="text" placeholder="搜索案件..." class="search-input" />
      </div>
      <div class="filter-group">
        <select v-model="filterType">
          <option value="">全部类型</option>
          <option value="traffic">交通事故</option>
          <option value="work">工伤</option>
          <option value="injury">人身损伤</option>
          <option value="medical">医疗事故</option>
        </select>
        <select v-model="filterStatus">
          <option value="">全部状态</option>
          <option value="pending">待处理</option>
          <option value="processing">进行中</option>
          <option value="review">待复核</option>
          <option value="completed">已归档</option>
        </select>
      </div>
      <button class="btn btn-primary" @click="showNewCase = true">+ 新建案件</button>
    </div>

    <div class="case-board">
      <div v-for="col in boardColumns" :key="col.status" class="board-column">
        <div class="column-header">
          <h3>{{ col.title }}</h3>
          <span class="column-count">{{ filteredCases.filter(c => c.status === col.status).length }}</span>
        </div>
        <div class="column-cards">
          <div v-for="c in filteredCases.filter(c => c.status === col.status)" :key="c.id" class="case-item panel" @click="viewCase(c)">
            <div class="case-priority" :class="c.priority"></div>
            <h4>{{ c.title }}</h4>
            <p>{{ c.typeLabel }} · {{ c.client }}</p>
            <div class="case-tags">
              <span v-for="tag in c.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <div class="case-footer">
              <span>{{ c.deadline }}</span>
              <div class="case-members">
                <span v-for="m in c.members" :key="m" class="member">{{ m }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showNewCase" class="modal" @click.self="showNewCase = false">
      <div class="modal-content panel">
        <div class="modal-header">
          <h2>新建案件</h2>
          <button class="close-btn" @click="showNewCase = false">x</button>
        </div>
        <div class="form-group">
          <label>案件标题</label>
          <input v-model="newCase.title" type="text" placeholder="输入案件标题" />
        </div>
        <div class="form-group">
          <label>案件类型</label>
          <select v-model="newCase.type">
            <option value="traffic">交通事故</option>
            <option value="work">工伤</option>
            <option value="injury">人身损伤</option>
            <option value="medical">医疗事故</option>
          </select>
        </div>
        <div class="form-group">
          <label>委托人</label>
          <input v-model="newCase.client" type="text" placeholder="委托人姓名" />
        </div>
        <div class="form-group">
          <label>优先级</label>
          <select v-model="newCase.priority">
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
        <div class="form-group">
          <label>截止日期</label>
          <input v-model="newCase.deadline" type="date" />
        </div>
        <div class="form-group">
          <label>案情描述</label>
          <textarea v-model="newCase.description" rows="3" placeholder="简要描述损伤情况，如：交通事故致左胫骨平台骨折..."></textarea>
        </div>
        <button class="btn btn-outline" @click="analyzeCase" :disabled="!newCase.description">
          🤖 分析案情并推荐
        </button>

        <!-- 智能推荐结果 -->
        <div v-if="matchResult.confidence > 0" class="recommendations">
          <h4>智能推荐</h4>
          <div v-if="matchResult.matchedInjuries.length > 0" class="rec-section">
            <span class="rec-label">识别损伤</span>
            <span v-for="inj in matchResult.matchedInjuries" :key="inj.id" class="rec-tag">{{ inj.name }}</span>
          </div>
          <div v-if="matchResult.standardDetails.length > 0" class="rec-section">
            <span class="rec-label">相关标准</span>
            <div class="rec-list">
              <div v-for="std in matchResult.standardDetails" :key="std.code" class="rec-item">
                <span class="rec-code">{{ std.code }}</span>
                <span class="rec-name">{{ std.name }}</span>
              </div>
            </div>
          </div>
          <div v-if="matchResult.toolDetails.length > 0" class="rec-section">
            <span class="rec-label">推荐工具</span>
            <div class="rec-list">
              <div v-for="tool in matchResult.toolDetails" :key="tool.id" class="rec-item rec-tool" @click="openTool(tool)">
                <span class="rec-tool-name">{{ tool.name }}</span>
                <span class="rec-arrow">→</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn" @click="showNewCase = false">取消</button>
          <button class="btn btn-primary" @click="createCase">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePersistentState } from '../../composables/usePersistentState.js'
import { matchCase } from '../../utils/caseMatcher.js'

const router = useRouter()
const search = ref('')
const filterType = ref('')
const filterStatus = ref('')
const showNewCase = ref(false)
const newCase = ref({ title: '', type: 'traffic', client: '', priority: 'medium', deadline: '', description: '' })
const matchResult = ref({ matchedInjuries: [], standards: [], tools: [], cases: [], confidence: 0, standardDetails: [], toolDetails: [] })
const caseStats = ref([
  { label: '进行中', value: '8' },
  { label: '待复核', value: '3' },
  { label: '本周截止', value: '5' },
  { label: '本月归档', value: '12' }
])
const boardColumns = ref([
  { status: 'pending', title: '待处理' },
  { status: 'processing', title: '进行中' },
  { status: 'review', title: '待复核' },
  { status: 'completed', title: '已归档' }
])
const typeMap = { traffic: '交通事故', work: '工伤', injury: '人身损伤', medical: '医疗事故' }

const defaultCases = [
  { id: 1, title: '2026-041 交通事故损伤鉴定', type: 'traffic', typeLabel: '交通事故', client: '王某', priority: 'high', status: 'processing', deadline: '2026-04-28', tags: ['骨折', '关节'], members: ['李', '张'] },
  { id: 2, title: '2026-042 工伤劳动能力鉴定', type: 'work', typeLabel: '工伤', client: '李某', priority: 'medium', status: 'pending', deadline: '2026-05-05', tags: ['脊髓', '瘫痪'], members: ['王'] },
  { id: 3, title: '2026-038 医疗损害鉴定复核', type: 'medical', typeLabel: '医疗事故', client: '张某', priority: 'high', status: 'review', deadline: '2026-04-25', tags: ['眼科', '手术'], members: ['李', '赵'] },
  { id: 4, title: '2026-039 人身损伤程度鉴定', type: 'injury', typeLabel: '人身损伤', client: '赵某', priority: 'low', status: 'completed', deadline: '2026-04-20', tags: ['肋骨', '轻伤'], members: ['张'] },
  { id: 5, title: '2026-043 烧伤瘢痕鉴定', type: 'work', typeLabel: '工伤', client: '孙某', priority: 'medium', status: 'processing', deadline: '2026-05-10', tags: ['烧伤', '瘢痕'], members: ['王', '李'] }
]

const cases = usePersistentState('caseManager:cases', defaultCases)
const filteredCases = computed(() => {
  let result = cases.value
  if (search.value) result = result.filter(c => c.title.includes(search.value) || c.client.includes(search.value))
  if (filterType.value) result = result.filter(c => c.type === filterType.value)
  if (filterStatus.value) result = result.filter(c => c.status === filterStatus.value)
  return result
})
const viewCase = (c) => { alert('查看案件: ' + c.title) }

const analyzeCase = () => {
  const typeMapToKey = { traffic: 'traffic-accident', work: 'work-injury', injury: 'personal-injury', medical: 'medical-malpractice' }
  const caseType = typeMapToKey[newCase.value.type]
  matchResult.value = matchCase(caseType, newCase.value.description)
}

const openTool = (tool) => {
  router.push({ name: 'tool-detail', params: { id: tool.id } })
}

const createCase = () => {
  if (!newCase.value.title || !newCase.value.client) return
  cases.value.push({
    id: Date.now(),
    title: newCase.value.title,
    type: newCase.value.type,
    typeLabel: typeMap[newCase.value.type],
    client: newCase.value.client,
    priority: newCase.value.priority,
    status: 'pending',
    deadline: newCase.value.deadline,
    description: newCase.value.description,
    tags: matchResult.value.matchedInjuries.map(i => i.name) || [],
    members: ['我']
  })
  showNewCase.value = false
  matchResult.value = { matchedInjuries: [], standards: [], tools: [], cases: [], confidence: 0, standardDetails: [], toolDetails: [] }
  newCase.value = { title: '', type: 'traffic', client: '', priority: 'medium', deadline: '', description: '' }
}
</script>

<style scoped>
.case-manage-page { display: grid; gap: 24px; }
.section-head { text-align: center; }
.section-title { margin: 0; font-size: 24px; }
.section-note { color: var(--text-muted); font-size: 14px; margin: 6px 0 0; }
.stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-card { text-align: center; padding: 20px; }
.stat-label { display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }
.stat-value { display: block; font-size: 28px; color: var(--accent); }
.filter-bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.search-input { padding: 10px 14px; background: rgba(255,255,255,0.05); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text-main); font-size: 14px; width: 200px; }
.filter-group { display: flex; gap: 10px; }
.filter-group select { padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text-main); font-size: 13px; }
.case-board { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.board-column { display: flex; flex-direction: column; gap: 12px; }
.column-header { display: flex; justify-content: space-between; align-items: center; padding: 0 4px; }
.column-header h3 { margin: 0; font-size: 15px; }
.column-count { padding: 2px 8px; background: rgba(255,255,255,0.08); border-radius: 999px; font-size: 12px; }
.column-cards { display: flex; flex-direction: column; gap: 10px; }
.case-item { padding: 16px; cursor: pointer; transition: all 0.2s ease; position: relative; overflow: hidden; }
.case-item:hover { border-color: var(--accent); transform: translateY(-2px); }
.case-priority { position: absolute; top: 0; left: 0; width: 4px; height: 100%; }
.case-priority.high { background: var(--danger); }
.case-priority.medium { background: var(--warn); }
.case-priority.low { background: var(--ok); }
.case-item h4 { margin: 0 0 6px; font-size: 14px; }
.case-item p { margin: 0 0 10px; font-size: 12px; color: var(--text-muted); }
.case-tags { display: flex; gap: 6px; margin-bottom: 10px; }
.tag { padding: 2px 8px; background: rgba(64,216,197,0.1); border-radius: 4px; font-size: 11px; color: var(--accent); }
.case-footer { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-muted); }
.case-members { display: flex; gap: 4px; }
.member { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; background: rgba(255,180,84,0.2); border-radius: 50%; font-size: 10px; color: var(--accent-2); }
.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { width: min(500px, calc(100% - 32px)); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h2 { margin: 0; font-size: 18px; }
.close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 13px; }
.form-group input, .form-group select { width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text-main); font-size: 14px; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
.form-group textarea { width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text-main); font-size: 14px; resize: vertical; }
.recommendations { margin-top: 16px; padding: 16px; background: rgba(64, 216, 197, 0.05); border: 1px solid rgba(64, 216, 197, 0.2); border-radius: var(--radius-sm); }
.recommendations h4 { margin: 0 0 12px; font-size: 14px; color: var(--accent); }
.rec-section { margin-bottom: 12px; }
.rec-section:last-child { margin-bottom: 0; }
.rec-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
.rec-tag { display: inline-block; padding: 4px 10px; background: rgba(64, 216, 197, 0.15); border-radius: 999px; font-size: 12px; color: var(--accent); margin-right: 6px; margin-bottom: 4px; }
.rec-list { display: flex; flex-direction: column; gap: 6px; }
.rec-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: rgba(255,255,255,0.03); border-radius: 4px; font-size: 12px; }
.rec-code { color: var(--accent); font-weight: 500; }
.rec-name { color: var(--text-muted); }
.rec-tool { cursor: pointer; transition: all 0.2s; }
.rec-tool:hover { background: rgba(64, 216, 197, 0.1); }
.rec-tool-name { flex: 1; }
.rec-arrow { color: var(--accent); }
@media (max-width: 1000px) { .case-board { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .stats-bar { grid-template-columns: repeat(2, 1fr); } .case-board { grid-template-columns: 1fr; } }
</style>
