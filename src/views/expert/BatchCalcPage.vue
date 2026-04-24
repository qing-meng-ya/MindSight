<template>
  <div class="batch-calc-page">
    <div class="section-head">
      <h1 class="section-title">批量计算中心</h1>
      <p class="section-note">高效处理多条数据，支持多种结果导出格式</p>
    </div>
    <div class="calc-layout">
      <div class="calc-main panel">
        <div class="tool-selector">
          <label>选择计算工具</label>
          <select v-model="selectedTool" class="tool-select">
            <option v-for="tool in calcTools" :key="tool.id" :value="tool.id">{{ tool.name }}</option>
          </select>
        </div>
        <div class="input-methods">
          <div class="method-tabs">
            <button class="tab-btn" :class="{ active: inputMethod === 'manual' }" @click="inputMethod = 'manual'">手动输入</button>
            <button class="tab-btn" :class="{ active: inputMethod === 'import' }" @click="inputMethod = 'import'">文件导入</button>
          </div>
          <div v-if="inputMethod === 'manual'" class="manual-input">
            <div class="data-table">
              <table>
                <thead>
                  <tr>
                    <th>序号</th>
                    <th v-for="col in currentToolColumns" :key="col.key">{{ col.label }}</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in tableData" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td v-for="col in currentToolColumns" :key="col.key">
                      <input v-model="row[col.key]" :type="col.type || 'text'" :placeholder="col.placeholder" />
                    </td>
                    <td><button class="btn-icon" @click="removeRow(idx)">x</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button class="btn btn-outline btn-add" @click="addRow"><span>+</span> 添加一行</button>
          </div>
          <div v-else class="import-input">
            <div class="upload-zone" @click="triggerUpload" @drop.prevent="handleDrop" @dragover.prevent>
              <input ref="fileInput" type="file" accept=".csv,.xlsx,.xls" class="hidden" @change="handleFileSelect" />
              <span class="upload-icon">[UP]</span>
              <p>拖拽或点击上传 Excel/CSV 文件</p>
              <span class="upload-hint">请确保表格列名与输入项匹配</span>
            </div>
            <div class="template-download">
              <button class="btn btn-sm" @click="downloadTemplate">下载模板文件</button>
            </div>
          </div>
        </div>
        <div class="calc-actions">
          <button class="btn btn-primary btn-block" :disabled="!canCalculate || isCalculating" @click="startCalculate">{{ isCalculating ? '计算中...' : '开始批量计算' }}</button>
        </div>
      </div>
      <div class="calc-sidebar">
        <div class="panel params-panel">
          <h3>计算参数</h3>
          <div class="param-list">
            <div v-for="param in currentParams" :key="param.id" class="param-item">
              <label>{{ param.name }}</label>
              <input v-model="param.value" :type="param.type" />
            </div>
          </div>
        </div>
        <div class="panel history-panel" v-if="calcHistory.length > 0">
          <h3>计算历史</h3>
          <div class="history-list">
            <div v-for="h in calcHistory" :key="h.id" class="history-item" @click="loadHistory(h)">
              <span class="history-name">{{ h.toolName }}</span>
              <span class="history-time">{{ h.time }}</span>
              <span class="history-count">{{ h.count }}条</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="hasResults" class="results-section panel">
      <div class="results-header">
        <h2>计算结果</h2>
        <div class="export-actions">
          <button class="btn btn-sm" @click="exportResults('excel')">导出 Excel</button>
          <button class="btn btn-sm" @click="exportResults('pdf')">导出 PDF</button>
          <button class="btn btn-sm" @click="exportResults('markdown')">导出 Markdown</button>
        </div>
      </div>
      <div class="results-table-wrap">
        <table class="results-table">
          <thead>
            <tr>
              <th>序号</th>
              <th v-for="col in resultColumns" :key="col.key">{{ col.label }}</th>
              <th>结论</th>
              <th>置信度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in resultData" :key="idx">
              <td>{{ idx + 1 }}</td>
              <td v-for="col in resultColumns" :key="col.key">{{ row[col.key] }}</td>
              <td><span class="conclusion-tag" :class="row.conclusionClass">{{ row.conclusion }}</span></td>
              <td>{{ row.confidence }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="results-summary">
        <div class="summary-item"><span>总条数</span><strong>{{ resultData.length }}</strong></div>
        <div class="summary-item"><span>高风险</span><strong class="text-danger">{{ highRiskCount }}</strong></div>
        <div class="summary-item"><span>中风险</span><strong class="text-warn">{{ mediumRiskCount }}</strong></div>
        <div class="summary-item"><span>低风险</span><strong class="text-ok">{{ lowRiskCount }}</strong></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const selectedTool = ref('joint')
const inputMethod = ref('manual')
const isCalculating = ref(false)
const hasResults = ref(false)
const fileInput = ref(null)
const calcHistory = ref([])
const calcTools = [{ id: 'joint', name: '关节活动度批量计算' }, { id: 'burn', name: '烧伤面积批量估算' }, { id: 'nursing', name: '护理期批量评估' }, { id: 'compensation', name: '赔偿金额批量计算' }]
const toolColumnsMap = {
  joint: [{ key: 'name', label: '姓名', type: 'text', placeholder: '患者姓名' }, { key: 'part', label: '关节部位', type: 'text', placeholder: '如：左膝' }, { key: 'activeAngle', label: '主动活动度', type: 'number', placeholder: '度数' }, { key: 'passiveAngle', label: '被动活动度', type: 'number', placeholder: '度数' }, { key: 'normalAngle', label: '正常参考值', type: 'number', placeholder: '度数' }],
  burn: [{ key: 'name', label: '姓名', type: 'text', placeholder: '患者姓名' }, { key: 'head', label: '头颈(%)', type: 'number', placeholder: '面积%' }, { key: 'trunk', label: '躯干(%)', type: 'number', placeholder: '面积%' }, { key: 'limbs', label: '四肢(%)', type: 'number', placeholder: '面积%' }, { key: 'depth', label: '烧伤深度', type: 'text', placeholder: 'I/II/III度' }],
  nursing: [{ key: 'name', label: '姓名', type: 'text', placeholder: '患者姓名' }, { key: 'age', label: '年龄', type: 'number', placeholder: '岁' }, { key: 'injury', label: '损伤类型', type: 'text', placeholder: '如：骨折' }, { key: 'surgery', label: '是否手术', type: 'text', placeholder: '是/否' }],
  compensation: [{ key: 'name', label: '姓名', type: 'text', placeholder: '患者姓名' }, { key: 'level', label: '伤残等级', type: 'text', placeholder: '如：九级' }, { key: 'income', label: '月收入', type: 'number', placeholder: '元' }, { key: 'region', label: '地区', type: 'text', placeholder: '省市' }]
}
const toolParamsMap = {
  joint: [{ id: 'side', name: '对照侧', type: 'text', value: '健侧' }, { id: 'method', name: '测量方法', type: 'text', value: '量角器' }],
  burn: [{ id: 'formula', name: '计算公式', type: 'text', value: '中国九分法' }, { id: 'adult', name: '成人/儿童', type: 'text', value: '成人' }],
  nursing: [{ id: 'standard', name: '适用标准', type: 'text', value: 'GA/T 1193-2014' }],
  compensation: [{ id: 'year', name: '计算年度', type: 'text', value: '2026' }]
}
const currentToolColumns = computed(() => toolColumnsMap[selectedTool.value] || [])
const currentParams = computed(() => toolParamsMap[selectedTool.value] || [])
const tableData = ref([{ name: '张三', part: '左膝', activeAngle: '45', passiveAngle: '60', normalAngle: '135' }])
const canCalculate = computed(() => tableData.value.length > 0 && tableData.value.some(r => Object.values(r).some(v => v)))
const resultData = ref([])
const resultColumns = ref([])
const highRiskCount = computed(() => resultData.value.filter(r => r.conclusionClass === 'high').length)
const mediumRiskCount = computed(() => resultData.value.filter(r => r.conclusionClass === 'medium').length)
const lowRiskCount = computed(() => resultData.value.filter(r => r.conclusionClass === 'low').length)
const addRow = () => { const empty = {}; currentToolColumns.value.forEach(c => empty[c.key] = ''); tableData.value.push(empty) }
const removeRow = (idx) => { tableData.value.splice(idx, 1) }
const triggerUpload = () => fileInput.value?.click()
const handleFileSelect = (e) => { if (e.target.files[0]) { tableData.value = Array(3).fill(null).map((_, i) => ({ name: '患者' + (i + 1), part: '左膝', activeAngle: 40 + i * 5 + '', passiveAngle: 55 + i * 5 + '', normalAngle: '135' })) } }
const handleDrop = (e) => { const f = e.dataTransfer.files[0]; if (f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx'))) handleFileSelect({ target: { files: [f] } }) }
const downloadTemplate = () => { alert('模板文件下载中...') }
const startCalculate = () => {
  isCalculating.value = true
  setTimeout(() => {
    resultColumns.value = currentToolColumns.value
    resultData.value = tableData.value.map((row, i) => {
      const risk = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
      const labels = { low: '轻度受限', medium: '中度受限', high: '重度受限' }
      return { ...row, conclusion: labels[risk], conclusionClass: risk, confidence: Math.floor(70 + Math.random() * 25) }
    })
    hasResults.value = true
    isCalculating.value = false
    calcHistory.value.unshift({ id: Date.now(), toolName: calcTools.find(t => t.id === selectedTool.value)?.name, time: new Date().toLocaleString(), count: tableData.value.length })
  }, 1500)
}
const loadHistory = (h) => { alert('加载历史记录: ' + h.toolName) }
const exportResults = (format) => { const msg = { excel: 'Excel文件已导出', pdf: 'PDF报告已导出', markdown: 'Markdown文件已导出' }; alert(msg[format] + '（演示功能）') }
</script>

<style scoped>
.batch-calc-page { display: grid; gap: 24px; }
.section-head { text-align: center; }
.section-title { margin: 0; font-size: 24px; }
.section-note { color: var(--text-muted); font-size: 14px; margin: 6px 0 0; }
.calc-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; align-items: start; }
.tool-selector { margin-bottom: 20px; }
.tool-selector label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; }
.tool-select { width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text-main); font-size: 14px; }
.method-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.tab-btn { padding: 8px 16px; background: transparent; border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text-muted); font-size: 13px; cursor: pointer; transition: all 0.2s ease; }
.tab-btn:hover, .tab-btn.active { border-color: var(--accent); color: var(--accent); background: rgba(64,216,197,0.1); }
.data-table { overflow-x: auto; margin-bottom: 12px; }
.data-table table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th, .data-table td { padding: 10px; border: 1px solid var(--line); text-align: left; }
.data-table th { background: rgba(255,255,255,0.03); font-weight: 500; }
.data-table input { width: 100%; padding: 6px; background: transparent; border: none; color: var(--text-main); font-size: 13px; }
.btn-icon { width: 24px; height: 24px; background: none; border: none; color: var(--danger); cursor: pointer; font-size: 14px; }
.btn-add { width: 100%; margin-top: 8px; }
.upload-zone { padding: 32px; border: 2px dashed var(--line); border-radius: var(--radius-sm); text-align: center; cursor: pointer; }
.hidden { display: none; }
.template-download { margin-top: 12px; text-align: center; }
.calc-actions { margin-top: 20px; }
.btn-block { width: 100%; }
.params-panel h3 { margin: 0 0 16px; font-size: 16px; }
.param-list { display: grid; gap: 12px; }
.param-item label { display: block; margin-bottom: 4px; font-size: 13px; }
.param-item input { width: 100%; padding: 8px; background: rgba(255,255,255,0.05); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text-main); font-size: 13px; }
.history-panel { margin-top: 16px; }
.history-panel h3 { margin: 0 0 12px; font-size: 16px; }
.history-list { display: grid; gap: 8px; }
.history-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; }
.history-item:hover { background: rgba(255,255,255,0.06); }
.history-time { color: var(--text-muted); font-size: 11px; }
.results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.results-header h2 { margin: 0; font-size: 18px; }
.export-actions { display: flex; gap: 8px; }
.results-table-wrap { overflow-x: auto; }
.results-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.results-table th, .results-table td { padding: 10px; border: 1px solid var(--line); text-align: left; }
.results-table th { background: rgba(255,255,255,0.03); }
.conclusion-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.conclusion-tag.low { background: rgba(95,212,143,0.2); color: #5fd48f; }
.conclusion-tag.medium { background: rgba(255,209,102,0.2); color: #ffd166; }
.conclusion-tag.high { background: rgba(255,107,107,0.2); color: #ff6b6b; }
.results-summary { display: flex; gap: 24px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--line); }
.summary-item { display: flex; flex-direction: column; gap: 4px; }
.summary-item span { font-size: 12px; color: var(--text-muted); }
.summary-item strong { font-size: 20px; }
.text-danger { color: #ff6b6b; }
.text-warn { color: #ffd166; }
.text-ok { color: #5fd48f; }
@media (max-width: 1000px) { .calc-layout { grid-template-columns: 1fr; } }
</style>
