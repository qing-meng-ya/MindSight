<template>
  <div class="ai-predict-page">
    <div class="section-head">
      <h1 class="section-title">AI 智能预测</h1>
      <p class="section-note">基于深度学习模型的专业预测分析</p>
    </div>
    <div class="predict-grid">
      <div class="input-section panel">
        <div class="section-header">
          <h2>输入数据</h2>
          <div class="import-actions">
            <button class="btn btn-sm" @click="showImportModal = true">导入</button>
            <button class="btn btn-sm" @click="loadDemoData">加载示例</button>
          </div>
        </div>
        <div class="predict-type-selector">
          <label>预测类型</label>
          <div class="type-options">
            <button v-for="t in predictTypes" :key="t.id" class="type-btn" :class="{ active: selectedType === t.id }" @click="selectedType = t.id">
              <span class="type-icon">{{ t.icon }}</span>
              <span>{{ t.name }}</span>
            </button>
          </div>
        </div>
        <div class="input-form">
          <div v-for="field in currentFields" :key="field.id" class="form-group">
            <label>{{ field.label }} <span v-if="field.required" class="required">*</span></label>
            <input v-if="field.type === 'text' || field.type === 'number'" v-model="formData[field.id]" :type="field.type" :placeholder="field.placeholder" />
            <select v-else-if="field.type === 'select'" v-model="formData[field.id]">
              <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <textarea v-else-if="field.type === 'textarea'" v-model="formData[field.id]" :placeholder="field.placeholder" rows="3"></textarea>
          </div>
        </div>
        <div class="batch-toggle">
          <label class="checkbox-label">
            <input type="checkbox" v-model="isBatchMode" />
            <span>批量预测模式（支持Excel/CSV导入）</span>
          </label>
        </div>
        <div v-if="isBatchMode" class="batch-area">
          <div class="upload-zone" @click="triggerFileUpload" @drop.prevent="handleDrop" @dragover.prevent>
            <input ref="fileInput" type="file" accept=".csv,.xlsx,.xls" class="hidden" @change="handleFileSelect" />
            <span class="upload-icon">[图表]</span>
            <p>拖拽或点击上传数据文件</p>
            <span class="upload-hint">支持 CSV、Excel 格式</span>
          </div>
          <div v-if="batchData.length > 0" class="batch-preview">
            <p>已加载 {{ batchData.length }} 条数据</p>
            <button class="btn btn-sm btn-outline" @click="clearBatch">清除</button>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn" @click="resetForm">重置</button>
          <button class="btn btn-primary" :disabled="!canPredict || isPredicting" @click="startPredict">{{ isPredicting ? '预测中...' : '开始预测' }}</button>
        </div>
      </div>
      <div class="result-section">
        <div v-if="!hasResult" class="result-placeholder panel">
          <div class="placeholder-icon">[水晶球]</div>
          <h3>等待预测</h3>
          <p>填写左侧数据并点击开始预测查看结果</p>
        </div>
        <div v-else-if="isPredicting" class="result-loading panel">
          <div class="spinner"></div>
          <h3>AI 分析中...</h3>
          <div class="progress-track"><div class="progress-fill" :style="{ width: predictProgress + '%' }"></div></div>
          <p class="loading-step">{{ loadingStep }}</p>
        </div>
        <div v-else class="result-content">
          <div class="result-card panel main-result">
            <div class="result-badge">AI 预测结果</div>
            <h2 class="result-title">{{ result.type }}</h2>
            <div class="confidence-display">
              <div class="confidence-value">{{ result.confidence }}%</div>
              <div class="confidence-label">置信度</div>
            </div>
            <div class="risk-badge" :class="'risk-' + result.riskLevel">{{ result.riskLabel }}</div>
            <p class="result-summary">{{ result.summary }}</p>
          </div>
          <div class="result-card panel">
            <h3>特征分析</h3>
            <div class="feature-list">
              <div v-for="feat in result.features" :key="feat.name" class="feature-item">
                <span class="feature-name">{{ feat.name }}</span>
                <div class="feature-bar"><div class="feature-fill" :style="{ width: feat.score + '%', background: feat.color }"></div></div>
                <span class="feature-score">{{ feat.score }}</span>
              </div>
            </div>
          </div>
          <div class="result-card panel">
            <h3>专业建议</h3>
            <ul class="advice-list">
              <li v-for="(advice, idx) in result.advices" :key="idx">{{ advice }}</li>
            </ul>
          </div>
          <div class="result-actions-bar">
            <button class="btn" @click="exportResult('pdf')">导出 PDF</button>
            <button class="btn" @click="exportResult('excel')">导出 Excel</button>
            <button class="btn" @click="exportResult('markdown')">导出 Markdown</button>
            <button class="btn btn-primary" @click="resetForm">新的预测</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showImportModal" class="modal" @click.self="showImportModal = false">
      <div class="modal-content panel">
        <div class="modal-header">
          <h3>导入数据</h3>
          <button class="close-btn" @click="showImportModal = false">x</button>
        </div>
        <div class="import-options">
          <div class="import-option" @click="importFromUrl"><span>[链接]</span><span>从链接导入</span></div>
          <div class="import-option" @click="triggerFileUpload"><span>[文件]</span><span>从文件导入</span></div>
          <div class="import-option" @click="importFromClipboard"><span>[剪贴板]</span><span>从剪贴板导入</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
const selectedType = ref('fracture')
const isBatchMode = ref(false)
const isPredicting = ref(false)
const hasResult = ref(false)
const predictProgress = ref(0)
const loadingStep = ref('初始化模型...')
const showImportModal = ref(false)
const fileInput = ref(null)
const batchData = ref([])
const predictTypes = [
  { id: 'fracture', name: '骨折预测', icon: '[骨]' },
  { id: 'slice', name: '切片分析', icon: '[镜]' },
  { id: 'injury', name: '损伤程度', icon: '[伤]' },
  { id: 'disability', name: '伤残评级', icon: '[评]' }
]
const fieldsMap = {
  fracture: [
    { id: 'injuryPart', label: '受伤部位', type: 'text', required: true, placeholder: '例如：左小腿胫骨' },
    { id: 'forceType', label: '受力类型', type: 'select', required: true, options: [{ value: 'direct', label: '直接暴力' }, { value: 'indirect', label: '间接暴力' }, { value: 'compression', label: '压缩暴力' }, { value: 'twist', label: '扭转暴力' }] },
    { id: 'symptoms', label: '主要症状', type: 'textarea', required: true, placeholder: '疼痛、肿胀、畸形、活动受限等' },
    { id: 'age', label: '患者年龄', type: 'number', required: true, placeholder: '年龄' },
    { id: 'hasImage', label: '是否有影像', type: 'select', required: false, options: [{ value: 'yes', label: '有' }, { value: 'no', label: '无' }] }
  ],
  slice: [
    { id: 'organ', label: '组织器官', type: 'text', required: true, placeholder: '例如：肝脏、肺组织' },
    { id: 'stain', label: '染色方法', type: 'select', required: true, options: [{ value: 'he', label: 'HE染色' }, { value: 'special', label: '特殊染色' }, { value: 'immuno', label: '免疫组化' }] },
    { id: 'description', label: '镜下描述', type: 'textarea', required: true, placeholder: '细胞形态、排列、异常征象等' }
  ],
  injury: [
    { id: 'injuryType', label: '损伤类型', type: 'select', required: true, options: [{ value: 'blunt', label: '钝器伤' }, { value: 'sharp', label: '锐器伤' }, { value: 'firearm', label: '火器伤' }, { value: 'burn', label: '烧伤' }] },
    { id: 'location', label: '损伤部位', type: 'text', required: true, placeholder: '部位描述' },
    { id: 'depth', label: '损伤深度', type: 'select', required: true, options: [{ value: 'skin', label: '皮肤层' }, { value: 'muscle', label: '肌肉层' }, { value: 'bone', label: '骨骼层' }, { value: 'organ', label: '脏器层' }] },
    { id: 'area', label: '损伤面积(cm2)', type: 'number', required: false, placeholder: '面积' }
  ],
  disability: [
    { id: 'injuryPart', label: '伤残部位', type: 'text', required: true, placeholder: '例如：左膝关节' },
    { id: 'functionLoss', label: '功能丧失比例(%)', type: 'number', required: true, placeholder: '0-100' },
    { id: 'dailyImpact', label: '日常生活影响', type: 'select', required: true, options: [{ value: 'none', label: '无影响' }, { value: 'slight', label: '轻度影响' }, { value: 'moderate', label: '中度影响' }, { value: 'severe', label: '重度影响' }] },
    { id: 'workImpact', label: '工作能力影响', type: 'select', required: true, options: [{ value: 'none', label: '无影响' }, { value: 'partial', label: '部分受限' }, { value: 'unable', label: '无法工作' }] }
  ]
}
const currentFields = computed(() => fieldsMap[selectedType.value] || [])
const formData = reactive({})
const canPredict = computed(() => {
  if (isBatchMode.value) return batchData.value.length > 0
  const required = currentFields.value.filter(f => f.required)
  return required.every(f => formData[f.id] !== undefined && formData[f.id] !== '')
})
const result = reactive({ type: '', confidence: 0, riskLevel: '', riskLabel: '', summary: '', features: [], advices: [] })
const loadDemoData = () => {
  Object.assign(formData, { injuryPart: '左小腿胫骨中下段', forceType: 'indirect', symptoms: '外伤后左小腿疼痛、肿胀明显，可见畸形，活动受限，无法负重行走', age: '35', hasImage: 'yes' })
}
const startPredict = () => {
  isPredicting.value = true
  hasResult.value = true
  predictProgress.value = 0
  const steps = [{ progress: 15, text: '数据预处理...' }, { progress: 35, text: '特征提取中...' }, { progress: 55, text: '模型推理中...' }, { progress: 75, text: '结果校准中...' }, { progress: 95, text: '生成报告...' }]
  let stepIdx = 0
  const interval = setInterval(() => {
    predictProgress.value += Math.random() * 12
    if (stepIdx < steps.length && predictProgress.value >= steps[stepIdx].progress) { loadingStep.value = steps[stepIdx].text; stepIdx++ }
    if (predictProgress.value >= 100) { predictProgress.value = 100; clearInterval(interval); setTimeout(() => { generateResult(); isPredicting.value = false }, 500) }
  }, 200)
}
const generateResult = () => {
  const map = { fracture: { type: '胫骨螺旋形骨折', risk: 'medium', label: '中等风险', summary: '根据受力类型和症状描述，预测为胫骨螺旋形骨折，建议进一步影像学确认。' }, slice: { type: '肝细胞脂肪变性', risk: 'low', label: '低风险', summary: '镜下征象符合脂肪变性表现，未见明显坏死或纤维化。' }, injury: { type: '钝器伤-皮下血肿伴肌肉挫裂', risk: 'medium', label: '中等风险', summary: '损伤深度达肌肉层，面积较大，建议评估功能障碍程度。' }, disability: { type: '九级伤残', risk: 'high', label: '需复核', summary: '功能丧失比例达45%，日常生活中度影响，初步评估为九级伤残。' } }
  const info = map[selectedType.value]
  result.type = info.type; result.confidence = Math.floor(75 + Math.random() * 20); result.riskLevel = info.risk; result.riskLabel = info.label; result.summary = info.summary
  result.features = [{ name: '形态匹配度', score: Math.floor(80 + Math.random() * 15), color: '#40d8c5' }, { name: '症状关联度', score: Math.floor(75 + Math.random() * 20), color: '#ffb454' }, { name: '数据完整度', score: Math.floor(85 + Math.random() * 10), color: '#6bcb77' }, { name: '模型置信度', score: result.confidence, color: '#40d8c5' }]
  result.advices = ['建议结合影像学检查进一步确认诊断', '关注患者年龄因素对恢复的影响', '建议记录完整病史以供后续评估', '结果仅供参考，正式结论需专业医师出具']
}
const resetForm = () => { Object.keys(formData).forEach(k => delete formData[k]); hasResult.value = false; isPredicting.value = false; predictProgress.value = 0; batchData.value = [] }
const triggerFileUpload = () => { fileInput.value?.click(); showImportModal.value = false }
const handleFileSelect = (e) => { if (e.target.files[0]) batchData.value = Array(5).fill({ status: 'ready' }) }
const handleDrop = (e) => { const f = e.dataTransfer.files[0]; if (f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx'))) batchData.value = Array(5).fill({ status: 'ready' }) }
const clearBatch = () => { batchData.value = [] }
const importFromUrl = () => { const url = prompt('请输入数据链接：'); if (url) { showImportModal.value = false; batchData.value = Array(3).fill({ status: 'ready' }) } }
const importFromClipboard = () => { navigator.clipboard.readText().then(text => { if (text) { showImportModal.value = false; batchData.value = Array(2).fill({ status: 'ready' }) } }).catch(() => alert('无法读取剪贴板')) }
const exportResult = (format) => { const msg = { pdf: 'PDF报告已生成', excel: 'Excel数据已导出', markdown: 'Markdown报告已生成' }; alert(msg[format] + '（演示功能）') }
</script>

<style scoped>
.ai-predict-page { display: grid; gap: 24px; }
.section-head { text-align: center; }
.section-title { margin: 0; font-size: 24px; }
.section-note { color: var(--text-muted); font-size: 14px; margin: 6px 0 0; }
.predict-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header h2 { margin: 0; font-size: 18px; }
.import-actions { display: flex; gap: 8px; }
.predict-type-selector { margin-bottom: 20px; }
.predict-type-selector > label { display: block; margin-bottom: 10px; font-size: 14px; font-weight: 500; }
.type-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.type-btn { display: flex; align-items: center; gap: 8px; padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text-muted); font-size: 14px; cursor: pointer; transition: all 0.2s ease; }
.type-btn:hover { border-color: var(--accent); }
.type-btn.active { border-color: var(--accent); background: rgba(64,216,197,0.1); color: var(--accent); }
.input-form { display: grid; gap: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 13px; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text-main); font-size: 14px; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--accent); }
.required { color: var(--danger); }
.batch-toggle { margin: 16px 0; padding: 12px; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); }
.checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; }
.upload-zone { padding: 32px; border: 2px dashed var(--line); border-radius: var(--radius-sm); text-align: center; cursor: pointer; transition: all 0.2s ease; }
.upload-zone:hover { border-color: var(--accent); }
.hidden { display: none; }
.batch-preview { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; font-size: 13px; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--line); }
.result-placeholder, .result-loading { text-align: center; padding: 60px 20px; }
.placeholder-icon { font-size: 48px; margin-bottom: 12px; }
.result-placeholder h3 { margin: 0 0 8px; font-size: 18px; }
.result-placeholder p { margin: 0; color: var(--text-muted); font-size: 14px; }
.spinner { width: 48px; height: 48px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.loading-step { font-size: 13px; color: var(--text-muted); }
.result-card { margin-bottom: 16px; }
.main-result { text-align: center; }
.result-badge { display: inline-block; padding: 4px 12px; background: rgba(64,216,197,0.15); color: var(--accent); font-size: 12px; border-radius: 999px; margin-bottom: 12px; }
.result-title { margin: 0 0 16px; font-size: 22px; }
.confidence-display { margin: 16px 0; }
.confidence-value { font-size: 36px; font-weight: 600; color: var(--accent); }
.confidence-label { font-size: 13px; color: var(--text-muted); }
.risk-badge { display: inline-block; padding: 6px 16px; border-radius: 999px; font-size: 14px; font-weight: 500; margin: 12px 0; }
.risk-low { background: rgba(95,212,143,0.2); color: #5fd48f; }
.risk-medium { background: rgba(255,209,102,0.2); color: #ffd166; }
.risk-high { background: rgba(255,107,107,0.2); color: #ff6b6b; }
.result-summary { margin: 12px 0 0; font-size: 14px; color: var(--text-muted); line-height: 1.6; }
.feature-list { display: grid; gap: 12px; }
.feature-item { display: grid; grid-template-columns: 100px 1fr 40px; align-items: center; gap: 12px; }
.feature-name { font-size: 13px; }
.feature-bar { height: 8px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; }
.feature-fill { height: 100%; border-radius: 999px; transition: width 0.6s ease; }
.feature-score { font-size: 13px; text-align: right; }
.advice-list { margin: 0; padding-left: 20px; }
.advice-list li { margin-bottom: 8px; font-size: 14px; color: var(--text-muted); line-height: 1.6; }
.result-actions-bar { display: flex; gap: 8px; flex-wrap: wrap; }
.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { width: min(400px, calc(100% - 32px)); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { margin: 0; font-size: 18px; }
.close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; }
.import-options { display: grid; gap: 10px; }
.import-option { display: flex; align-items: center; gap: 12px; padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--line); border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease; }
.import-option:hover { border-color: var(--accent); }
@media (max-width: 1000px) { .predict-grid { grid-template-columns: 1fr; } }
</style>
