<template>
  <div class="nursing-page">
    <div class="section-head">
      <h1 class="section-title">护理计算</h1>
      <p class="section-note">误工/护理/营养期 + 护理依赖程度</p>
    </div>

    <div class="calc-form panel">
      <h2>三期计算</h2>
      <div class="form-grid">
        <div class="form-group">
          <label>损伤类型</label>
          <select v-model="form.injuryType">
            <option value="">请选择</option>
            <option value="bone">骨折</option>
            <option value="head">颅脑损伤</option>
            <option value="organ">内脏损伤</option>
            <option value="burn">烧伤</option>
            <option value="other">其他</option>
          </select>
        </div>
        <div class="form-group">
          <label>损伤程度</label>
          <select v-model="form.severity">
            <option value="">请选择</option>
            <option value="light">轻微伤</option>
            <option value="minor">轻伤二级</option>
            <option value="major">重伤二级</option>
            <option value="severe">重伤一级</option>
          </select>
        </div>
        <div class="form-group">
          <label>治疗方式</label>
          <select v-model="form.treatment">
            <option value="">请选择</option>
            <option value="conservative">保守治疗</option>
            <option value="surgery">手术治疗</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary" @click="calculate">计算</button>

      <div v-if="result" class="result-box">
        <h3>计算结果</h3>
        <div class="result-grid">
          <div class="result-item">
            <span class="result-label">误工期</span>
            <span class="result-value">{{ result.work }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">护理期</span>
            <span class="result-value">{{ result.nursing }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">营养期</span>
            <span class="result-value">{{ result.nutrition }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="dependency-form panel">
      <h2>护理依赖程度评定</h2>
      <div class="form-grid">
        <div class="form-group">
          <label>生活自理能力</label>
          <select v-model="form.selfCare">
            <option value="">请选择</option>
            <option value="0">完全不能自理</option>
            <option value="1">大部分不能自理</option>
            <option value="2">部分不能自理</option>
            <option value="3">基本能自理</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary" @click="calculateDep">评定</button>

      <div v-if="depResult" class="result-box">
        <h3>护理依赖评定</h3>
        <div class="result-item full">
          <span class="result-label">护理依赖等级</span>
          <span class="result-value">{{ depResult.level }}</span>
          <span class="result-desc">{{ depResult.desc }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const form = reactive({
  injuryType: '',
  severity: '',
  treatment: '',
  selfCare: ''
})

const result = ref(null)
const depResult = ref(null)

const calculate = () => {
  const rules = {
    bone: { minor: { conservative: { work: '60-90天', nursing: '30-60天', nutrition: '30-60天' }, surgery: { work: '90-120天', nursing: '60-90天', nutrition: '60-90天' } } },
    head: { minor: { conservative: { work: '90-180天', nursing: '30-60天', nutrition: '30-60天' }, surgery: { work: '180-365天', nursing: '60-90天', nutrition: '60-90天' } } },
    burn: { minor: { conservative: { work: '30-60天', nursing: '30天', nutrition: '30天' }, surgery: { work: '90-120天', nursing: '60天', nutrition: '60天' } } }
  }
  
  const rule = rules[form.injuryType]?.[form.severity]?.[form.treatment]
  if (rule) {
    result.value = rule
  } else {
    result.value = { work: '待评估', nursing: '待评估', nutrition: '待评估' }
  }
}

const calculateDep = () => {
  const levels = {
    '0': { level: '完全护理依赖', desc: '生活完全不能自理，需要他人长期专职护理' },
    '1': { level: '大部分护理依赖', desc: '生活大部分不能自理，需要他人长期护理' },
    '2': { level: '部分护理依赖', desc: '生活部分不能自理，需要他人定期护理' },
    '3': { level: '无护理依赖', desc: '生活基本能自理，不需要护理' }
  }
  depResult.value = levels[form.selfCare] || { level: '待评估', desc: '' }
}
</script>

<style scoped>
.nursing-page {
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

.calc-form, .dependency-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.calc-form h2, .dependency-form h2 {
  margin: 0;
  font-size: 18px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  color: var(--text-muted);
}

.form-group select {
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: rgba(8, 14, 24, 0.5);
  color: var(--text-main);
  font-size: 14px;
}

.result-box {
  margin-top: 16px;
  padding: 16px;
  background: rgba(64, 216, 197, 0.1);
  border-radius: var(--radius-md);
}

.result-box h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: var(--accent);
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-item.full {
  flex-direction: row;
  align-items: center;
  gap: 16px;
}

.result-label {
  font-size: 13px;
  color: var(--text-muted);
}

.result-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--accent);
}

.result-desc {
  font-size: 13px;
  color: var(--text-muted);
}
</style>