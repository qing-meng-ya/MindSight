<template>
  <div class="tool-detail-page">
    <!-- 头部 -->
    <div class="detail-header">
      <button class="btn btn-ghost back-btn" @click="router.back()">← 返回</button>
      <div class="header-info">
        <h1>{{ toolInfo?.name || '计算工具' }}</h1>
        <p class="standard-code">依据标准：{{ toolInfo?.standardNames || '' }}</p>
      </div>
    </div>

    <div class="detail-body">
      <!-- 参数输入区 -->
      <section class="input-panel panel">
        <h2>参数输入</h2>
        
        <!-- 血液酒精计算器 -->
        <div v-if="toolId === 'blood-alcohol'" class="form-grid">
          <div class="form-group">
            <label>饮酒量 (ml)</label>
            <input v-model.number="bacParams.volume" type="number" placeholder="如：500" />
            <span class="hint">例如：啤酒500ml，白酒50ml</span>
          </div>
          <div class="form-group">
            <label>酒精度数 (%)</label>
            <input v-model.number="bacParams.alcoholContent" type="number" step="0.1" placeholder="如：4.5" />
            <span class="hint">啤酒约3-5%，白酒约38-53%</span>
          </div>
          <div class="form-group">
            <label>体重 (kg)</label>
            <input v-model.number="bacParams.weight" type="number" placeholder="如：70" />
          </div>
          <div class="form-group">
            <label>性别</label>
            <select v-model="bacParams.gender">
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          <div class="form-group">
            <label>饮酒时长 (小时)</label>
            <input v-model.number="bacParams.drinkingDuration" type="number" step="0.5" placeholder="如：2" />
          </div>
          <div class="form-group">
            <label>距检测时间 (小时)</label>
            <input v-model.number="bacParams.timeSinceDrinking" type="number" step="0.5" placeholder="如：3" />
            <span class="hint">从开始饮酒到采血的时间</span>
          </div>
        </div>

        <!-- 关节活动度计算器 -->
        <div v-else-if="toolId === 'joint-range'" class="form-grid">
          <div class="form-group">
            <label>关节部位</label>
            <select v-model="jointParams.joint">
              <option v-for="opt in jointOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>测量方向</label>
            <select v-model="jointParams.direction">
              <option v-for="dir in currentJointDirections" :key="dir" :value="dir">{{ getDirectionLabel(dir) }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>测量方式</label>
            <select v-model="jointParams.measureMethod">
              <option value="active">主动活动度</option>
              <option value="passive">被动活动度</option>
            </select>
          </div>
          <div class="form-group">
            <label>健侧角度 (°)</label>
            <input v-model.number="jointParams.healthySide" type="number" placeholder="正常侧活动度" />
          </div>
          <div class="form-group">
            <label>患侧角度 (°)</label>
            <input v-model.number="jointParams.affectedSide" type="number" placeholder="患侧实测活动度" />
          </div>
        </div>

        <!-- 护理期计算器 -->
        <div v-else-if="toolId === 'care-period'" class="form-grid">
          <div class="form-group">
            <label>损伤类型</label>
            <select v-model="careParams.injuryType">
              <optgroup v-for="group in injuryOptions" :key="group.category" :label="group.category">
                <option v-for="item in group.items" :key="item.value" :value="item.value">{{ item.label }}</option>
              </optgroup>
            </select>
          </div>
          <div class="form-group">
            <label>患者年龄</label>
            <input v-model.number="careParams.age" type="number" placeholder="如：45" />
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input v-model="careParams.hasSurgery" type="checkbox" />
              <span>是否手术治疗</span>
            </label>
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input v-model="careParams.hasComplication" type="checkbox" />
              <span>是否有并发症</span>
            </label>
          </div>
        </div>

        <!-- YOLO超声影像AI检测 -->
        <div v-else-if="toolId === 'yolo-pathology'" class="yolo-redirect">
          <p class="yolo-desc">该工具使用 YOLO 深度学习模型进行超声影像的目标检测，支持自动识别影像中的关键结构并标注。</p>
          <router-link :to="{ name: 'expert-yolo-image' }" class="btn btn-primary">
            前往 YOLO 影像分析页面 →
          </router-link>
        </div>

        <div v-else class="empty-hint">
          <p>该工具的计算功能正在开发中</p>
        </div>

        <!-- 护理依赖评定（仅护理期工具显示） -->
        <div v-if="toolId === 'care-period'" class="dependency-section">
          <h3>护理依赖程度评定</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>生活自理能力</label>
              <select v-model="dependencyParams.selfCare">
                <option value="">请选择</option>
                <option value="0">完全不能自理</option>
                <option value="1">大部分不能自理</option>
                <option value="2">部分不能自理</option>
                <option value="3">基本能自理</option>
              </select>
            </div>
          </div>
          <button 
            class="btn btn-outline calc-btn" 
            @click="calculateDependency"
            :disabled="!dependencyParams.selfCare"
          >
            评定护理依赖
          </button>
        </div>

        <button 
          v-if="isSupportedTool" 
          class="btn btn-primary calc-btn" 
          @click="runCalculation"
          :disabled="!canCalculate"
        >
          开始计算
        </button>
      </section>

      <!-- 结果展示区 -->
      <section class="result-panel panel" v-if="calcResult">
        <h2>计算结果</h2>
        
        <!-- 主结论卡 -->
        <div class="conclusion-card" :class="resultClass">
          <div class="conclusion-main">
            <span class="conclusion-value">{{ mainConclusion }}</span>
            <span class="conclusion-label">{{ mainLabel }}</span>
          </div>
          <div class="conclusion-sub" v-if="subConclusion">
            {{ subConclusion }}
          </div>
        </div>

        <!-- 计算过程 -->
        <div class="result-section" v-if="calcSteps.length > 0">
          <h3>📋 计算过程</h3>
          <div class="steps-list">
            <div v-for="step in calcSteps" :key="step.step" class="step-item">
              <span class="step-num">{{ step.step }}</span>
              <div class="step-content">
                <h4>{{ step.title }}</h4>
                <p class="formula">{{ step.formula }}</p>
                <p class="calculation">{{ step.calculation }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 参数表 -->
        <div class="result-section" v-if="paramTable.length > 0">
          <h3>📊 参数表</h3>
          <table class="param-table">
            <tbody>
              <tr v-for="(row, idx) in paramTable" :key="idx">
                <td class="param-name">{{ row.name }}</td>
                <td class="param-value">{{ row.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 引用标准 -->
        <div class="result-section" v-if="toolInfo?.standardNames">
          <h3>📚 引用标准</h3>
          <p class="standard-ref">{{ toolInfo.standardNames }}</p>
          <p class="standard-desc" v-if="toolInfo?.standardDesc">{{ toolInfo.standardDesc }}</p>
        </div>

        <!-- 护理依赖评定结果 -->
        <div class="result-section" v-if="dependencyResult">
          <h3>🏥 护理依赖评定</h3>
          <div class="conclusion-card dependency-result">
            <div class="conclusion-main">
              <span class="conclusion-value">{{ dependencyResult.level }}</span>
            </div>
            <div class="conclusion-sub">
              {{ dependencyResult.desc }}
            </div>
          </div>
        </div>

        <!-- 风险提示 -->
        <div class="result-section" v-if="riskWarnings.length > 0">
          <h3>⚠️ 风险提示</h3>
          <ul class="warning-list">
            <li v-for="(w, idx) in riskWarnings" :key="idx">{{ w }}</li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAllTools } from '@/utils/toolDataService.js'

// 计算器模块
import {
  calculateBAC,
  getCalculationSteps as getBACSteps,
  getRiskWarnings as getBACWarnings
} from '@/utils/calculators/bloodAlcohol.js'

import {
  calculateJointRange,
  getCalculationSteps as getJointSteps,
  getRiskWarnings as getJointWarnings,
  getJointOptions,
  getDirectionLabel,
  NORMAL_RANGE
} from '@/utils/calculators/jointRange.js'

import {
  calculateCarePeriod,
  getCalculationSteps as getCareSteps,
  getRiskWarnings as getCareWarnings,
  getInjuryOptions
} from '@/utils/calculators/carePeriod.js'

const route = useRoute()
const router = useRouter()
const toolId = route.params.id

const allTools = getAllTools()
const toolInfo = computed(() => allTools.find(t => t.id === toolId))

const isSupportedTool = ['blood-alcohol', 'joint-range', 'care-period'].includes(toolId)

// ========== 血液酒精参数 ==========
const bacParams = ref({
  volume: 500,
  alcoholContent: 4.5,
  weight: 70,
  gender: 'male',
  drinkingDuration: 2,
  timeSinceDrinking: 3
})

// ========== 关节活动度参数 ==========
const jointOptions = getJointOptions()
const jointParams = ref({
  joint: 'knee',
  direction: 'flexion',
  healthySide: 135,
  affectedSide: 85,
  measureMethod: 'active'
})

const currentJointDirections = computed(() => {
  const jointData = NORMAL_RANGE[jointParams.value.joint]
  return jointData ? Object.keys(jointData).filter(k => k !== 'name') : []
})

// ========== 护理期参数 ==========
const injuryOptions = getInjuryOptions()
const careParams = ref({
  injuryType: 'tibia-fracture',
  hasSurgery: true,
  hasComplication: false,
  age: 45
})

// ========== 护理依赖评定参数 ==========
const dependencyParams = ref({
  selfCare: ''
})

const dependencyResult = ref(null)

const calculateDependency = () => {
  const levels = {
    '0': { level: '完全护理依赖', desc: '生活完全不能自理，需要他人长期专职护理。依据 GB/T 31147-2014《人身损害护理依赖程度评定》' },
    '1': { level: '大部分护理依赖', desc: '生活大部分不能自理，需要他人长期护理。护理费用按完全护理依赖的 80% 计算。' },
    '2': { level: '部分护理依赖', desc: '生活部分不能自理，需要他人定期护理。护理费用按完全护理依赖的 50% 计算。' },
    '3': { level: '无护理依赖', desc: '生活基本能自理，不需要护理。' }
  }
  dependencyResult.value = levels[dependencyParams.value.selfCare] || { level: '待评估', desc: '' }
}

// ========== 计算结果 ==========
const calcResult = ref(null)
const calcSteps = ref([])
const riskWarnings = ref([])

const canCalculate = computed(() => {
  if (toolId === 'blood-alcohol') {
    const p = bacParams.value
    return p.volume > 0 && p.alcoholContent > 0 && p.weight > 0 && p.timeSinceDrinking >= 0
  }
  if (toolId === 'joint-range') {
    const p = jointParams.value
    return p.healthySide > 0 && p.affectedSide >= 0
  }
  if (toolId === 'care-period') {
    return careParams.value.injuryType && careParams.value.age > 0
  }
  return false
})

const mainConclusion = computed(() => {
  if (!calcResult.value) return ''
  if (toolId === 'blood-alcohol') {
    return calcResult.value.currentBAC + ' mg/100ml'
  }
  if (toolId === 'joint-range') {
    return calcResult.value.lossPercentage + '%'
  }
  if (toolId === 'care-period') {
    return `误工期 ${calcResult.value.workDelay.min}-${calcResult.value.workDelay.max} 天`
  }
  return ''
})

const mainLabel = computed(() => {
  if (!calcResult.value) return ''
  if (toolId === 'blood-alcohol') {
    return calcResult.value.legalStatus
  }
  if (toolId === 'joint-range') {
    return calcResult.value.level
  }
  if (toolId === 'care-period') {
    return '参考期限'
  }
  return ''
})

const subConclusion = computed(() => {
  if (!calcResult.value) return ''
  if (toolId === 'blood-alcohol') {
    return `峰值BAC: ${calcResult.value.peakBAC} mg/100ml，约 ${calcResult.value.hoursToSober} 小时后完全代谢`
  }
  if (toolId === 'joint-range') {
    return `健侧 ${calcResult.value.healthySide}° → 患侧 ${calcResult.value.affectedSide}°，丧失 ${calcResult.value.lostAngle}°`
  }
  if (toolId === 'care-period') {
    return `护理期 ${calcResult.value.carePeriod.min}-${calcResult.value.carePeriod.max} 天 / 营养期 ${calcResult.value.nutritionPeriod.min}-${calcResult.value.nutritionPeriod.max} 天`
  }
  return ''
})

const resultClass = computed(() => {
  if (!calcResult.value) return ''
  if (toolId === 'blood-alcohol') {
    return calcResult.value.legalStatusClass
  }
  if (toolId === 'joint-range') {
    return calcResult.value.levelCode === 'none' ? 'normal' : 'warning'
  }
  return 'normal'
})

const paramTable = computed(() => {
  if (!calcResult.value) return []
  if (toolId === 'blood-alcohol') {
    const p = calcResult.value.params
    return [
      { name: '饮酒量', value: p.volume + ' ml' },
      { name: '酒精度数', value: p.alcoholContent + '%' },
      { name: '体重', value: p.weight + ' kg' },
      { name: '性别', value: p.gender === 'male' ? '男' : '女' },
      { name: '饮酒时长', value: p.drinkingDuration + ' 小时' },
      { name: '距检测时间', value: p.timeSinceDrinking + ' 小时' },
      { name: '摄入纯酒精', value: calcResult.value.pureAlcoholGrams + ' g' }
    ]
  }
  if (toolId === 'joint-range') {
    return [
      { name: '关节部位', value: calcResult.value.jointName },
      { name: '测量方向', value: getDirectionLabel(calcResult.value.direction) },
      { name: '测量方式', value: calcResult.value.measureMethod === 'active' ? '主动' : '被动' },
      { name: '健侧角度', value: calcResult.value.healthySide + '°' },
      { name: '患侧角度', value: calcResult.value.affectedSide + '°' },
      { name: '丧失角度', value: calcResult.value.lostAngle + '°' }
    ]
  }
  if (toolId === 'care-period') {
    return [
      { name: '损伤类型', value: calcResult.value.injuryName },
      { name: '患者年龄', value: calcResult.value.age + ' 岁' },
      { name: '是否手术', value: calcResult.value.hasSurgery ? '是' : '否' },
      { name: '是否有并发症', value: calcResult.value.hasComplication ? '是' : '否' },
      { name: '年龄调整系数', value: calcResult.value.ageFactor }
    ]
  }
  return []
})

function runCalculation() {
  if (toolId === 'blood-alcohol') {
    calcResult.value = calculateBAC(bacParams.value)
    calcSteps.value = getBACSteps(calcResult.value)
    riskWarnings.value = getBACWarnings(calcResult.value)
  } else if (toolId === 'joint-range') {
    calcResult.value = calculateJointRange(jointParams.value)
    calcSteps.value = getJointSteps(calcResult.value)
    riskWarnings.value = getJointWarnings(calcResult.value)
  } else if (toolId === 'care-period') {
    calcResult.value = calculateCarePeriod(careParams.value)
    calcSteps.value = getCareSteps(calcResult.value)
    riskWarnings.value = getCareWarnings(calcResult.value)
  }
}
</script>

<style scoped>
.tool-detail-page {
  display: grid;
  gap: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  padding: 8px 16px;
  font-size: 14px;
  white-space: nowrap;
}

.header-info h1 {
  margin: 0;
  font-size: 20px;
}

.standard-code {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-muted);
}

.detail-body {
  display: grid;
  gap: 20px;
}

.input-panel h2,
.result-panel h2 {
  margin: 0 0 16px;
  font-size: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  color: var(--text-muted);
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent);
}

.hint {
  font-size: 11px;
  color: var(--text-muted);
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.calc-btn {
  padding: 12px 32px;
  font-size: 15px;
}

.calc-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 结果区 */
.conclusion-card {
  padding: 24px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  text-align: center;
  background: rgba(107, 203, 119, 0.1);
  border: 1px solid rgba(107, 203, 119, 0.3);
}

.conclusion-card.warning {
  background: rgba(255, 180, 84, 0.1);
  border-color: rgba(255, 180, 84, 0.3);
}

.conclusion-card.drunk-driving {
  background: rgba(255, 217, 61, 0.1);
  border-color: rgba(255, 217, 61, 0.3);
}

.conclusion-card.severely-drunk {
  background: rgba(255, 107, 107, 0.1);
  border-color: rgba(255, 107, 107, 0.3);
}

.conclusion-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.conclusion-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--accent);
}

.conclusion-card.severely-drunk .conclusion-value {
  color: #ff6b6b;
}

.conclusion-label {
  font-size: 18px;
  font-weight: 600;
}

.conclusion-sub {
  margin-top: 12px;
  font-size: 14px;
  color: var(--text-muted);
}

.result-section {
  margin-bottom: 20px;
}

.result-section h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--accent);
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
}

.step-num {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--bg-0);
  font-size: 12px;
  font-weight: 600;
  border-radius: 50%;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 4px;
  font-size: 13px;
}

.formula {
  margin: 0 0 2px;
  font-size: 12px;
  color: var(--text-muted);
}

.calculation {
  margin: 0;
  font-size: 13px;
}

.param-table {
  width: 100%;
  border-collapse: collapse;
}

.param-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
  font-size: 13px;
}

.param-name {
  color: var(--text-muted);
  width: 40%;
}

.standard-ref {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.standard-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-muted);
}

.warning-list {
  margin: 0;
  padding-left: 20px;
}

.warning-list li {
  margin-bottom: 6px;
  font-size: 13px;
  color: #ffb454;
}

.empty-hint {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
}

.dependency-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

.dependency-section h3 {
  margin: 0 0 16px;
  font-size: 16px;
}

.dependency-result {
  background: rgba(64, 216, 197, 0.08) !important;
  border-color: rgba(64, 216, 197, 0.3) !important;
}

.yolo-redirect {
  text-align: center;
  padding: 40px 20px;
}
.yolo-desc {
  color: var(--text-muted);
  margin-bottom: 20px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
