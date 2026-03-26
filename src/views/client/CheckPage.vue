<template>
  <div class="check-page">
    <div class="section-head">
      <h1 class="section-title">初步检测</h1>
      <p class="section-note">分步式自助评估，仅供参考</p>
    </div>

    <!-- 步骤指示器 -->
    <div class="steps-indicator panel">
      <div 
        v-for="(step, index) in steps" 
        :key="step.id"
        class="step-item"
        :class="{ active: currentStep === index, completed: currentStep > index }"
      >
        <div class="step-dot">{{ index + 1 }}</div>
        <span class="step-label">{{ step.label }}</span>
      </div>
    </div>

    <!-- 步骤内容 -->
    <div class="step-content panel">
      <!-- 步骤1：选择问题类型 -->
      <div v-if="currentStep === 0" class="step-panel">
        <h2>选择您需要检测的问题类型</h2>
        <div class="type-grid">
          <div 
            v-for="type in checkTypes" 
            :key="type.id"
            class="type-card"
            :class="{ selected: formData.type === type.id }"
            @click="selectType(type.id)"
          >
            <div class="type-icon"></div>
            <h3>{{ type.name }}</h3>
            <p>{{ type.desc }}</p>
          </div>
        </div>
      </div>

      <!-- 步骤2：填写症状信息 -->
      <div v-if="currentStep === 1" class="step-panel">
        <h2>填写症状或伤情信息</h2>
        <p class="step-hint">请根据您的实际情况填写以下信息</p>
        
        <div class="form-group">
          <label>受伤部位</label>
          <input v-model="formData.injuryPart" type="text" placeholder="例如：左小腿、右手腕" />
        </div>
        
        <div class="form-group">
          <label>受伤时间</label>
          <input v-model="formData.injuryTime" type="date" />
        </div>
        
        <div class="form-group">
          <label>主要症状</label>
          <textarea v-model="formData.symptoms" placeholder="请描述您的症状，如疼痛、肿胀、活动受限等" rows="3"></textarea>
        </div>
        
        <div class="form-group">
          <label>是否有影像资料（X光/CT/MRI）</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" v-model="formData.hasImage" value="yes" /> 有
            </label>
            <label class="radio-label">
              <input type="radio" v-model="formData.hasImage" value="no" /> 没有
            </label>
          </div>
        </div>
        
        <div class="form-group" v-if="formData.hasImage === 'yes'">
          <label>上传影像资料（可选）</label>
          <div class="upload-area">
            <input type="file" accept="image/*" multiple @change="handleImageUpload" />
            <p>支持 JPG、PNG 格式，单个文件不超过 10MB</p>
          </div>
          <div v-if="formData.images.length > 0" class="image-preview">
            <div v-for="(img, idx) in formData.images" :key="idx" class="preview-item">
              <span>{{ img.name }}</span>
              <button @click="removeImage(idx)">×</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤3：补充信息 -->
      <div v-if="currentStep === 2" class="step-panel">
        <h2>补充信息（有助于更准确评估）</h2>
        
        <div class="form-group">
          <label>年龄</label>
          <input v-model="formData.age" type="number" placeholder="请输入年龄" />
        </div>
        
        <div class="form-group">
          <label>既往病史（可选）</label>
          <textarea v-model="formData.medicalHistory" placeholder="如有骨折、骨质疏松等相关病史请说明" rows="2"></textarea>
        </div>
        
        <div class="form-group">
          <label>是否就医过</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" v-model="formData.hasSeenDoctor" value="yes" /> 是
            </label>
            <label class="radio-label">
              <input type="radio" v-model="formData.hasSeenDoctor" value="no" /> 否
            </label>
          </div>
        </div>
        
        <div class="form-group" v-if="formData.hasSeenDoctor === 'yes'">
          <label>医生诊断（如有）</label>
          <input v-model="formData.doctorDiagnosis" type="text" placeholder="医生给出的诊断" />
        </div>
      </div>

      <!-- 步骤4：查看初步结果 -->
      <div v-if="currentStep === 3" class="step-panel">
        <h2>初步评估结果</h2>
        
        <div class="result-card">
          <div class="result-level">
            <span class="level-label">初步风险等级</span>
            <span class="level-value">{{ resultData.level }}</span>
            <span class="level-desc">{{ resultData.levelDesc }}</span>
          </div>
          
          <div class="result-section">
            <h4>结果解释</h4>
            <p>{{ resultData.explanation }}</p>
          </div>
          
          <div class="result-section">
            <h4>为什么得到这个结果</h4>
            <ul>
              <li v-for="(reason, idx) in resultData.reasons" :key="idx">{{ reason }}</li>
            </ul>
          </div>
          
          <div class="result-section">
            <h4>需要补充什么材料</h4>
            <ul>
              <li v-for="(item, idx) in resultData.materials" :key="idx">{{ item }}</li>
            </ul>
          </div>
          
          <div class="result-section">
            <h4>下一步建议</h4>
            <ul>
              <li v-for="(advice, idx) in resultData.advices" :key="idx">{{ advice }}</li>
            </ul>
          </div>
        </div>
        
        <div class="result-actions">
          <button class="btn btn-outline" @click="saveResult">保存结果</button>
          <button class="btn btn-primary" @click="goToConsult">预约专业咨询</button>
        </div>
      </div>

      <!-- 步骤5：选择是否咨询 -->
      <div v-if="currentStep === 4" class="step-panel">
        <h2>是否需要进一步咨询</h2>
        
        <div class="consult-options">
          <div class="consult-card" @click="finishAndConsult">
            <div class="consult-icon"></div>
            <h3>是，我想预约专业法医咨询</h3>
            <p>获取更准确的评估和专业建议</p>
          </div>
          
          <div class="consult-card" @click="finishOnly">
            <div class="consult-icon"></div>
            <h3>否，我先看看结果</h3>
            <p>保存结果，如有需要再咨询</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="step-buttons panel" v-if="currentStep < 3">
      <button class="btn btn-outline" @click="prevStep" :disabled="currentStep === 0">上一步</button>
      <button class="btn btn-primary" @click="nextStep" :disabled="!canProceed">下一步</button>
    </div>

    <!-- 自动保存提示 -->
    <div class="auto-save" v-if="showAutoSaveTip">
      <span>已自动保存</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentStep = ref(0)
const showAutoSaveTip = ref(false)

const steps = [
  { id: 1, label: '选择类型' },
  { id: 2, label: '填写症状' },
  { id: 3, label: '补充信息' },
  { id: 4, label: '查看结果' },
  { id: 5, label: '后续选择' }
]

const checkTypes = ref([
  { id: 'fracture', name: '骨折分析', desc: '根据症状初步判断骨折类型与程度' },
  { id: 'joint', name: '关节活动检测', desc: '评估关节活动受限程度' },
  { id: 'burn', name: '烧伤面积检测', desc: '烧伤面积估算与等级划分' },
  { id: 'handfoot', name: '手足功能评估', desc: '手足功能受损程度评估' }
])

const formData = ref({
  type: '',
  injuryPart: '',
  injuryTime: '',
  symptoms: '',
  hasImage: 'no',
  images: [],
  age: '',
  medicalHistory: '',
  hasSeenDoctor: '',
  doctorDiagnosis: ''
})

const resultData = ref({
  level: '中等',
  levelDesc: '建议进一步检查确认',
  explanation: '根据您提供的信息，需要进行影像学检查以明确诊断。',
  reasons: [
    '受伤部位存在明显疼痛和活动受限',
    '受伤时间较短，肿胀尚未完全消退',
    '缺乏影像学资料确认骨折情况'
  ],
  materials: [
    '受伤部位的X光片',
    '如有CT/MRI也请一并提供',
    '既往就医的相关病历'
  ],
  advices: [
    '建议尽快到正规医院进行影像学检查',
    '避免剧烈运动，保护受伤部位',
    '如疼痛加剧或出现肿胀加重，及时就医',
    '可预约专业法医进行详细评估'
  ]
})

const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return !!formData.value.type
  }
  if (currentStep.value === 1) {
    return formData.value.injuryPart && formData.value.symptoms
  }
  return true
})

const selectType = (typeId) => {
  formData.value.type = typeId
}

const handleImageUpload = (event) => {
  const files = event.target.files
  if (files) {
    for (let i = 0; i < files.length; i++) {
      if (files[i].size <= 10 * 1024 * 1024) {
        formData.value.images.push(files[i])
      }
    }
  }
}

const removeImage = (idx) => {
  formData.value.images.splice(idx, 1)
}

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
    autoSave()
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const autoSave = () => {
  localStorage.setItem('check_draft', JSON.stringify({
    step: currentStep.value,
    data: formData.value,
    time: new Date().toISOString()
  }))
  showAutoSaveTip.value = true
  setTimeout(() => {
    showAutoSaveTip.value = false
  }, 2000)
}

const saveResult = () => {
  localStorage.setItem('check_result', JSON.stringify({
    type: formData.value.type,
    result: resultData.value,
    time: new Date().toISOString()
  }))
  alert('结果已保存')
}

const goToConsult = () => {
  router.push('/client/consult')
}

const finishAndConsult = () => {
  saveResult()
  router.push('/client/consult')
}

const finishOnly = () => {
  saveResult()
  router.push('/client')
}

watch(formData, () => {
  autoSave()
}, { deep: true })
</script>

<style scoped>
.check-page {
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

.steps-indicator {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 20px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  opacity: 0.5;
}

.step-item.active,
.step-item.completed {
  opacity: 1;
}

.step-dot {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--line);
  border-radius: 50%;
  font-size: 13px;
  font-weight: 600;
}

.step-item.active .step-dot {
  background: var(--accent);
  color: var(--bg-0);
}

.step-item.completed .step-dot {
  background: var(--accent);
  color: var(--bg-0);
}

.step-label {
  font-size: 13px;
}

.step-content {
  min-height: 400px;
}

.step-panel h2 {
  margin: 0 0 8px;
  font-size: 20px;
  text-align: center;
}

.step-hint {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  margin: 0 0 24px;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.type-card {
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid var(--line);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.type-card:hover {
  border-color: var(--accent);
}

.type-card.selected {
  border-color: var(--accent);
  background: rgba(64, 216, 197, 0.1);
}

.type-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  background: rgba(64, 216, 197, 0.1);
  border-radius: var(--radius-md);
}

.type-card h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.type-card p {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.radio-group {
  display: flex;
  gap: 24px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-label input {
  width: auto;
}

.upload-area {
  padding: 20px;
  border: 2px dashed var(--line);
  border-radius: var(--radius-sm);
  text-align: center;
}

.upload-area p {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.image-preview {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
}

.preview-item button {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 18px;
}

.result-card {
  max-width: 600px;
  margin: 0 auto;
}

.result-level {
  text-align: center;
  padding: 24px;
  background: rgba(64, 216, 197, 0.1);
  border-radius: var(--radius-md);
  margin-bottom: 24px;
}

.level-label {
  display: block;
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.level-value {
  display: block;
  font-size: 32px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 4px;
}

.level-desc {
  font-size: 14px;
  color: var(--text-muted);
}

.result-section {
  margin-bottom: 20px;
}

.result-section h4 {
  margin: 0 0 8px;
  font-size: 15px;
  color: var(--accent);
}

.result-section p,
.result-section li {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
}

.result-section ul {
  margin: 0;
  padding-left: 20px;
}

.result-section li {
  margin-bottom: 6px;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.consult-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.consult-card {
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.consult-card:hover {
  border-color: var(--accent);
  background: rgba(64, 216, 197, 0.05);
}

.consult-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  background: rgba(64, 216, 197, 0.1);
  border-radius: 50%;
}

.consult-card h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.consult-card p {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

.step-buttons {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
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

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--text);
}

.btn-outline:hover {
  border-color: var(--accent);
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auto-save {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .type-grid,
  .consult-options {
    grid-template-columns: 1fr;
  }
  
  .steps-indicator {
    flex-wrap: wrap;
  }
}
</style>