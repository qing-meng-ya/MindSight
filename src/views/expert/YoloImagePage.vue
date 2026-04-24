<template>
  <div class="yolo-image-page">
    <div class="section-head">
      <h1 class="section-title">YOLO 超声影像分析</h1>
      <p class="section-note">基于深度学习的目标检测，自动识别超声影像中的关键结构</p>
    </div>

    <!-- Backend Status -->
    <div class="status-bar" :class="backendStatus">
      <span class="status-dot"></span>
      <span class="status-text">{{ statusText }}</span>
    </div>

    <div class="yolo-layout">
      <!-- Left: Upload & Preview -->
      <div class="yolo-main panel">
        <!-- Upload Zone -->
        <div v-if="!previewUrl" class="upload-zone"
             @click="triggerUpload"
             @drop.prevent="handleDrop"
             @dragover.prevent="dragOver = true"
             @dragleave.prevent="dragOver = false"
             :class="{ active: dragOver }">
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
          <span class="upload-icon">[图片]</span>
          <p>拖拽或点击上传超声影像</p>
          <span class="upload-hint">支持 JPG、PNG 格式，单张不超过 20MB</span>
        </div>

        <!-- Image Preview with Canvas Overlay -->
        <div v-else class="preview-area">
          <div class="preview-header">
            <span class="preview-name">{{ selectedFile?.name }}</span>
            <button class="btn btn-sm btn-outline" @click="clearImage">清除</button>
          </div>
          <div class="image-comparison">
            <div class="image-box">
              <span class="image-label">原始图像</span>
              <img :src="previewUrl" alt="原始图像" class="preview-img" />
            </div>
            <div v-if="annotatedImage" class="image-box">
              <span class="image-label">检测结果</span>
              <img :src="annotatedImage" alt="检测结果" class="preview-img" />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="yolo-actions">
          <button class="btn" @click="clearImage" :disabled="!previewUrl">重置</button>
          <button class="btn btn-primary" :disabled="!canPredict || isPredicting" @click="startPredict">
            {{ isPredicting ? '推理中...' : '开始检测' }}
          </button>
        </div>
      </div>

      <!-- Right: Results -->
      <div class="yolo-sidebar">
        <!-- Loading State -->
        <div v-if="isPredicting" class="panel result-loading">
          <div class="spinner"></div>
          <h3>YOLO 模型推理中...</h3>
          <div class="progress-track"><div class="progress-fill" :style="{ width: predictProgress + '%' }"></div></div>
          <p class="loading-step">{{ loadingStep }}</p>
        </div>

        <!-- Result Summary -->
        <div v-else-if="result" class="panel result-summary-card">
          <h3>检测结果概览</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-value">{{ result.total_detections }}</span>
              <span class="summary-label">检出目标</span>
            </div>
            <div class="summary-item">
              <span class="summary-value">{{ Object.keys(result.class_counts).length }}</span>
              <span class="summary-label">涉及类别</span>
            </div>
          </div>
          <div v-if="result.total_detections === 0" class="empty-result">
            <p>未检测到目标结构</p>
            <span class="empty-hint">请尝试上传更清晰的超声影像</span>
          </div>
        </div>

        <!-- Class Distribution -->
        <div v-if="result && result.total_detections > 0" class="panel class-distribution">
          <h3>类别分布</h3>
          <div class="class-bars">
            <div v-for="(count, clsId) in result.class_counts" :key="clsId" class="class-bar-item">
              <div class="class-bar-header">
                <span class="class-badge" :style="{ background: getClassColor(clsId) }">
                  {{ getClassName(clsId) }}
                </span>
                <span class="class-count">{{ count }} 个</span>
              </div>
              <div class="class-bar-track">
                <div class="class-bar-fill" :style="{
                  width: `${(count / result.total_detections) * 100}%`,
                  background: getClassColor(clsId)
                }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detection List -->
        <div v-if="result && result.detections.length > 0" class="panel detection-list-panel">
          <h3>检测详情</h3>
          <div class="detection-table-wrap">
            <table class="detection-table">
              <thead>
                <tr>
                  <th>类别</th>
                  <th>置信度</th>
                  <th>位置</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(det, idx) in result.detections" :key="idx">
                  <td>
                    <span class="det-badge" :style="{ background: getClassColor(det.class_id) }">
                      {{ det.class_name }}
                    </span>
                  </td>
                  <td>{{ (det.confidence * 100).toFixed(1) }}%</td>
                  <td class="det-bbox">
                    x:{{ det.bbox.x.toFixed(2) }} y:{{ det.bbox.y.toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="errorMessage" class="panel error-panel">
          <h3>错误</h3>
          <p class="error-text">{{ errorMessage }}</p>
          <button class="btn btn-sm" @click="errorMessage = ''">清除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { checkHealth, predictImage } from '@/utils/yoloApi.js'
import classMap from '@/data/yoloClasses.json'

// --- State ---
const fileInput = ref(null)
const dragOver = ref(false)
const selectedFile = ref(null)
const previewUrl = ref('')
const isPredicting = ref(false)
const predictProgress = ref(0)
const loadingStep = ref('')
const result = ref(null)
const errorMessage = ref('')
const annotatedImage = ref('')

const backendStatus = ref('unknown') // 'ok' | 'error' | 'unknown'
const statusText = computed(() => {
  if (backendStatus.value === 'ok') return '后端服务正常'
  if (backendStatus.value === 'error') return '后端服务未连接（请运行 YOLOovo/api/main.py）'
  return '检查后端状态中...'
})

const canPredict = computed(() => !!selectedFile.value && backendStatus.value === 'ok')

// --- Lifecycle ---
onMounted(async () => {
  try {
    await checkHealth()
    backendStatus.value = 'ok'
  } catch {
    backendStatus.value = 'error'
  }
})

// --- Methods ---
function triggerUpload() {
  fileInput.value?.click()
}

function handleDrop(e) {
  dragOver.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) loadFile(files[0])
}

function handleFileSelect(e) {
  const files = e.target.files
  if (files.length > 0) loadFile(files[0])
}

function loadFile(file) {
  if (!file.type.startsWith('image/')) {
    errorMessage.value = '请上传图片文件（JPG/PNG）'
    return
  }
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  result.value = null
  annotatedImage.value = ''
  errorMessage.value = ''
}

function clearImage() {
  selectedFile.value = null
  previewUrl.value = ''
  result.value = null
  annotatedImage.value = ''
  errorMessage.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

async function startPredict() {
  if (!selectedFile.value) return
  isPredicting.value = true
  predictProgress.value = 0
  loadingStep.value = '上传图像...'
  errorMessage.value = ''
  result.value = null
  annotatedImage.value = ''

  const interval = setInterval(() => {
    if (predictProgress.value < 90) predictProgress.value += 5
  }, 200)

  try {
    loadingStep.value = 'YOLO 模型推理中...'
    const data = await predictImage(selectedFile.value)
    clearInterval(interval)
    predictProgress.value = 100
    result.value = data
    annotatedImage.value = data.annotated_image || ''
  } catch (err) {
    clearInterval(interval)
    errorMessage.value = err.message || '预测失败，请检查后端服务是否运行'
  } finally {
    isPredicting.value = false
  }
}

function getClassName(id) {
  return classMap[String(id)]?.name || `类别${id}`
}

function getClassColor(id) {
  return classMap[String(id)]?.color || '#999'
}
</script>

<style scoped>
.yolo-image-page {
  padding-bottom: 40px;
}

/* Status Bar */
.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}
.status-bar.ok { background: rgba(46, 204, 113, 0.1); color: #27ae60; }
.status-bar.error { background: rgba(231, 76, 60, 0.1); color: #c0392b; }
.status-bar.unknown { background: rgba(149, 165, 166, 0.1); color: #7f8c8d; }

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

/* Layout */
.yolo-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
}

@media (max-width: 960px) {
  .yolo-layout {
    grid-template-columns: 1fr;
  }
}

/* Upload Zone */
.upload-zone {
  border: 2px dashed var(--line);
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-muted);
}
.upload-zone:hover,
.upload-zone.active {
  border-color: var(--accent);
  background: rgba(59, 130, 246, 0.05);
}
.upload-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}
.upload-hint {
  font-size: 12px;
  opacity: 0.7;
}

/* Preview */
.preview-area {
  padding: 16px;
}
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.preview-name {
  font-size: 14px;
  color: var(--text-muted);
  word-break: break-all;
}
.image-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 600px) {
  .image-comparison {
    grid-template-columns: 1fr;
  }
}
.image-box {
  position: relative;
  background: var(--bg-tertiary);
  border-radius: 8px;
  overflow: hidden;
  min-height: 200px;
}
.image-label {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  z-index: 1;
}
.preview-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

/* Actions */
.yolo-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid var(--line);
}

/* Loading */
.result-loading {
  text-align: center;
  padding: 40px 20px;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--line);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.progress-track {
  width: 100%;
  height: 6px;
  background: var(--line);
  border-radius: 3px;
  margin: 12px 0;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width 0.3s;
}
.loading-step {
  font-size: 14px;
  color: var(--text-muted);
}

/* Summary */
.result-summary-card {
  padding: 16px;
}
.result-summary-card h3,
.class-distribution h3,
.detection-list-panel h3,
.error-panel h3 {
  font-size: 16px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line);
}
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
.summary-item {
  text-align: center;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 8px;
}
.summary-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
}
.summary-label {
  font-size: 12px;
  color: var(--text-muted);
}
.empty-result {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
}
.empty-hint {
  font-size: 12px;
  opacity: 0.7;
}

/* Class Distribution */
.class-distribution {
  padding: 16px;
}
.class-bar-item {
  margin-bottom: 10px;
}
.class-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.class-badge {
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}
.class-count {
  font-size: 12px;
  color: var(--text-muted);
}
.class-bar-track {
  width: 100%;
  height: 6px;
  background: var(--line);
  border-radius: 3px;
  overflow: hidden;
}
.class-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s;
}

/* Detection Table */
.detection-list-panel {
  padding: 16px;
}
.detection-table-wrap {
  max-height: 300px;
  overflow-y: auto;
}
.detection-table {
  width: 100%;
  font-size: 13px;
  border-collapse: collapse;
}
.detection-table th {
  text-align: left;
  padding: 8px 6px;
  color: var(--text-muted);
  font-weight: 500;
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  background: var(--bg-secondary);
}
.detection-table td {
  padding: 8px 6px;
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}
.det-badge {
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}
.det-bbox {
  font-family: monospace;
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
}

/* Error */
.error-panel {
  padding: 16px;
  border-left: 4px solid #e74c3c;
}
.error-text {
  color: #c0392b;
  font-size: 14px;
  margin-bottom: 10px;
}

.hidden {
  display: none;
}
</style>
