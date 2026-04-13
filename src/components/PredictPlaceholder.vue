<template>
  <div class="predict-placeholder" :class="{ loading: state === 'loading', error: state === 'error' }">
    <div class="placeholder-content" v-if="state === 'idle'">
      <div class="placeholder-icon">🔮</div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      <button class="btn btn-primary" @click="startPredict">开始预测</button>
    </div>
    
    <div class="loading-content" v-else-if="state === 'loading'">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <h3>正在分析中...</h3>
      <p class="loading-text">{{ loadingText }}</p>
      <div class="loading-progress">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <span>{{ progress }}%</span>
      </div>
      <p class="loading-tip">{{ loadingTip }}</p>
    </div>
    
    <div class="result-content" v-else-if="state === 'result'">
      <div class="result-icon">✅</div>
      <h3>预测完成</h3>
      <div class="result-summary">
        <div class="result-item">
          <span class="result-label">预测类型</span>
          <span class="result-value">{{ predictionResult.type }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">置信度</span>
          <span class="result-value confidence" :class="getConfidenceClass(predictionResult.confidence)">
            {{ predictionResult.confidence }}%
          </span>
        </div>
        <div class="result-item">
          <span class="result-label">风险等级</span>
          <span class="result-value risk" :class="'risk-' + predictionResult.riskLevel">
            {{ predictionResult.riskLevelLabel }}
          </span>
        </div>
      </div>
      <p class="result-note">{{ predictionResult.note }}</p>
      <div class="result-actions">
        <button class="btn" @click="reset">重新预测</button>
        <button class="btn btn-primary" @click="viewDetail">查看详情</button>
      </div>
    </div>
    
    <div class="error-content" v-else-if="state === 'error'">
      <div class="error-icon">⚠️</div>
      <h3>预测失败</h3>
      <p>{{ errorMessage }}</p>
      <button class="btn btn-primary" @click="retry">重试</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'AI 智能预测'
  },
  description: {
    type: String,
    default: '基于深度学习模型进行智能分析预测'
  }
})

const emit = defineEmits(['predict', 'viewDetail'])

const state = ref('idle')
const progress = ref(0)
const loadingText = ref('正在加载模型...')
const loadingTip = ref('请耐心等待，模型正在分析输入数据')
const errorMessage = ref('预测过程出现错误，请重试')

const predictionResult = reactive({
  type: '骨折类型预测',
  confidence: 87,
  riskLevel: 'medium',
  riskLevelLabel: '中等风险',
  note: '根据输入的伤情数据，预测为胫骨平台骨折，建议结合影像进一步确认。'
})

const tips = [
  '请耐心等待，模型正在分析输入数据',
  '正在提取关键特征...',
  '深度学习模型推理中...',
  '结���校准中...'
]

const startPredict = async () => {
  state.value = 'loading'
  progress.value = 0
  
  const interval = setInterval(() => {
    progress.value += Math.random() * 15
    
    if (progress.value >= 30 && progress.value < 50) {
      loadingText.value = '正在提取关键特征...'
      loadingTip.value = tips[1]
    } else if (progress.value >= 50 && progress.value < 80) {
      loadingText.value = '深度学习模型推理中...'
      loadingTip.value = tips[2]
    } else if (progress.value >= 80) {
      loadingText.value = '结果校准中...'
      loadingTip.value = tips[3]
    }
    
    if (progress.value >= 100) {
      progress.value = 100
      clearInterval(interval)
      setTimeout(() => {
        state.value = 'result'
      }, 500)
    }
  }, 200)
}

const reset = () => {
  state.value = 'idle'
  progress.value = 0
}

const retry = () => {
  reset()
  startPredict()
}

const viewDetail = () => {
  emit('viewDetail', predictionResult)
}

const getConfidenceClass = (confidence) => {
  if (confidence >= 80) return 'high'
  if (confidence >= 60) return 'medium'
  return 'low'
}
</script>

<style scoped>
.predict-placeholder {
  padding: 40px;
  background: rgba(17, 31, 49, 0.86);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  text-align: center;
}

.placeholder-content,
.loading-content,
.result-content,
.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.placeholder-icon,
.result-icon,
.error-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

h3 {
  margin: 0;
  font-size: 20px;
}

p {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 8px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring:nth-child(2) {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  border-top-color: var(--accent-2);
  animation-duration: 1.2s;
  animation-direction: reverse;
}

.spinner-ring:nth-child(3) {
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  border-top-color: var(--accent);
  animation-duration: 0.8s;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: var(--text-main);
}

.loading-progress {
  width: 100%;
  max-width: 300px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-track {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  transition: width 0.3s ease;
}

.loading-progress span {
  font-size: 13px;
  color: var(--accent);
  min-width: 40px;
}

.loading-tip {
  font-size: 12px;
}

.result-summary {
  width: 100%;
  max-width: 320px;
  display: grid;
  gap: 12px;
  margin: 16px 0;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
}

.result-label {
  color: var(--text-muted);
  font-size: 14px;
}

.result-value {
  font-weight: 600;
  font-size: 14px;
}

.confidence.high { color: #6bcb77; }
.confidence.medium { color: #ffd93d; }
.confidence.low { color: #ff6b6b; }

.risk-low { color: #6bcb77; }
.risk-medium { color: #ffd93d; }
.risk-high { color: #ff6b6b; }

.result-note {
  font-size: 13px;
  line-height: 1.7;
}

.result-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.error-content .btn-primary {
  margin-top: 8px;
}
</style>