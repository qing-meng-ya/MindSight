<template>
  <div class="video-publish-page">
    <div class="section-head">
      <h1 class="section-title">发布视频</h1>
      <p class="section-note">上传您的教学内容，与社区分享</p>
    </div>

    <div class="publish-form panel">
      <div class="form-section">
        <h2>基本信息</h2>
        <div class="form-group">
          <label>标题 <span class="required">*</span></label>
          <input 
            v-model="form.title" 
            type="text" 
            placeholder="请输入视频标题，2-80个字符" 
            class="form-input"
            maxlength="80"
          />
          <span class="char-count">{{ form.title.length }}/80</span>
        </div>
        <div class="form-group">
          <label>简介</label>
          <textarea 
            v-model="form.description" 
            placeholder="简单介绍视频内容，帮助观众了解" 
            class="form-textarea"
            rows="4"
            maxlength="500"
          ></textarea>
          <span class="char-count">{{ form.description.length }}/500</span>
        </div>
      </div>

      <div class="form-section">
        <h2>视频上传</h2>
        <div class="upload-area" @click="triggerUpload" @drop.prevent="handleDrop" @dragover.prevent>
          <input 
            ref="fileInput" 
            type="file" 
            accept="video/*" 
            class="hidden-input"
            @change="handleFileSelect"
          />
          <div v-if="!form.videoFile" class="upload-prompt">
            <span class="upload-icon">🎬</span>
            <p>点击或拖拽视频文件到这里</p>
            <span class="upload-hint">支持 MP4, WebM, AVI 格式，最大 500MB</span>
          </div>
          <div v-else class="file-info">
            <span class="file-icon">📹</span>
            <div class="file-details">
              <span class="file-name">{{ form.videoFile.name }}</span>
              <span class="file-size">{{ formatFileSize(form.videoFile.size) }}</span>
            </div>
            <button class="btn btn-icon" @click.stop="removeVideo">删除</button>
          </div>
        </div>
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <span>上传中... {{ uploadProgress }}%</span>
        </div>
      </div>

      <div class="form-section">
        <h2>视频封面</h2>
        <div class="cover-area">
          <div class="cover-preview" :style="coverPreviewStyle">
            <span v-if="!form.coverUrl" class="cover-placeholder">点击上传封面</span>
          </div>
          <input 
            ref="coverInput"
            type="file" 
            accept="image/*" 
            class="hidden-input"
            @change="handleCoverSelect"
          />
          <button class="btn btn-secondary btn-sm" @click="triggerCoverUpload">选择图片</button>
          <button v-if="form.coverUrl" class="btn btn-icon btn-sm" @click="removeCover">删除封面</button>
        </div>
      </div>

      <div class="form-section">
        <h2>分类信息</h2>
        <div class="form-row">
          <div class="form-group">
            <label>难度等级 <span class="required">*</span></label>
            <select v-model="form.difficulty" class="form-select">
              <option value="A">A级 - 入门</option>
              <option value="B">B级 - 初级</option>
              <option value="C">C级 - 中级</option>
              <option value="D">D级 - 高级</option>
              <option value="E">E级 - 精通</option>
            </select>
          </div>
          <div class="form-group">
            <label>视频分类 <span class="required">*</span></label>
            <select v-model="form.category" class="form-select">
              <option value="theory">理论讲解</option>
              <option value="practice">实操演示</option>
              <option value="case">案例分析</option>
              <option value="tool">工具使用</option>
              <option value="other">其他</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>标签</label>
          <div class="tags-input">
            <div class="tags-list">
              <span 
                v-for="(tag, index) in form.tags" 
                :key="index" 
                class="tag"
              >
                {{ tag }}
                <button @click="removeTag(index)">&times;</button>
              </span>
            </div>
            <input 
              v-model="tagInput" 
              type="text" 
              placeholder="输入标签，回车添加"
              class="tag-input"
              @keydown.enter="addTag"
            />
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn" @click="saveDraft">保存草稿</button>
        <button 
          class="btn btn-primary" 
          :disabled="!canPublish"
          @click="publish"
        >
          发布视频
        </button>
      </div>
    </div>

    <!-- 我的视频列表 -->
    <section class="panel my-videos">
      <div class="section-header">
        <h2>我的视频</h2>
        <span class="text-muted">{{ videos.length }} 个视频</span>
      </div>
      <div class="videos-list">
        <div v-for="video in videos" :key="video.id" class="video-item">
          <div class="video-thumb" :style="video.coverStyle"></div>
          <div class="video-info">
            <h3>{{ video.title }}</h3>
            <div class="video-meta">
              <span :class="'difficulty-' + video.difficulty">{{ video.difficulty }}级</span>
              <span>{{ video.views }} 次观看</span>
              <span>{{ video.likes }} 点赞</span>
              <span>{{ video.date }}</span>
            </div>
          </div>
          <div class="video-actions">
            <button class="btn btn-sm" @click="editVideo(video)">编辑</button>
            <button class="btn btn-sm btn-danger" @click="deleteVideo(video)">删除</button>
          </div>
        </div>
        <div v-if="videos.length === 0" class="empty-videos">
          <p>暂无发布视频</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const fileInput = ref(null)
const coverInput = ref(null)
const uploadProgress = ref(0)

const form = reactive({
  title: '',
  description: '',
  videoFile: null,
  coverUrl: null,
  difficulty: 'B',
  category: 'theory',
  tags: [],
  status: 'draft'
})

const tagInput = ref('')

const videos = ref([
  { 
    id: 1, 
    title: '法医鉴定流程演示', 
    difficulty: 'C', 
    category: 'theory',
    views: 234, 
    likes: 15,
    date: '2024-01-20',
    coverStyle: 'linear-gradient(135deg, #40d8c5, #1a9a8a)'
  },
  { 
    id: 2, 
    title: '关节活动度测量教学', 
    difficulty: 'A', 
    category: 'practice',
    views: 156, 
    likes: 8,
    date: '2024-01-18',
    coverStyle: 'linear-gradient(135deg, #ffb454, #cc8030)'
  }
])

const canPublish = computed(() => {
  return form.title.length >= 2 && form.title.length <= 80 && form.videoFile
})

const coverPreviewStyle = computed(() => {
  if (form.coverUrl) {
    return { backgroundImage: `url(${form.coverUrl})` }
  }
  return {}
})

const triggerUpload = () => {
  fileInput.value?.click()
}

const triggerCoverUpload = () => {
  coverInput.value?.click()
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 500 * 1024 * 1024) {
      alert('文件大小不能超过 500MB')
      return
    }
    form.videoFile = file
    simulateUpload()
  }
}

const handleCoverSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      form.coverUrl = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleDrop = (e) => {
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('video/')) {
    form.videoFile = file
    simulateUpload()
  }
}

const removeVideo = () => {
  form.videoFile = null
  uploadProgress.value = 0
}

const removeCover = () => {
  form.coverUrl = null
}

const simulateUpload = () => {
  uploadProgress.value = 10
  const interval = setInterval(() => {
    uploadProgress.value += Math.random() * 20
    if (uploadProgress.value >= 100) {
      uploadProgress.value = 100
      clearInterval(interval)
    }
  }, 300)
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
    form.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index) => {
  form.tags.splice(index, 1)
}

const saveDraft = () => {
  alert('已保存草稿')
}

const publish = () => {
  if (!canPublish.value) return
  alert('发布成功！')
  form.title = ''
  form.description = ''
  form.videoFile = null
  form.coverUrl = null
  form.tags = []
}

const editVideo = (video) => {
  form.title = video.title
  form.difficulty = video.difficulty
}

const deleteVideo = (video) => {
  if (confirm('确定要删除这个视频吗？')) {
    videos.value = videos.value.filter(v => v.id !== video.id)
  }
}
</script>

<style scoped>
.video-publish-page {
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

.publish-form {
  display: grid;
  gap: 24px;
}

.form-section h2 {
  margin: 0 0 16px;
  font-size: 16px;
  color: var(--accent);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}

.required {
  color: var(--danger);
}

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-size: 14px;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: var(--accent);
}

.form-textarea {
  resize: vertical;
}

.char-count {
  display: block;
  text-align: right;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.upload-area {
  padding: 40px;
  border: 2px dashed var(--line);
  border-radius: var(--radius-md);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: var(--accent);
}

.hidden-input {
  display: none;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 48px;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-icon {
  font-size: 32px;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-name {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: var(--text-muted);
}

.upload-progress {
  margin-top: 16px;
  text-align: center;
}

.progress-track {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
}

.cover-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cover-preview {
  width: 200px;
  height: 120px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
}

.cover-placeholder {
  color: var(--text-muted);
  font-size: 13px;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  min-height: 48px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(64, 216, 197, 0.15);
  border-radius: 999px;
  font-size: 13px;
  color: var(--accent);
}

.tag button {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
}

.tag-input {
  flex: 1;
  min-width: 100px;
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 14px;
}

.tag-input:focus {
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
}

.videos-list {
  display: grid;
  gap: 12px;
}

.video-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
}

.video-thumb {
  width: 160px;
  height: 90px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  background-size: cover;
  background-position: center;
}

.video-info {
  flex: 1;
}

.video-info h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.video-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.difficulty-A { color: #6bcb77; }
.difficulty-B { color: #40d8c5; }
.difficulty-C { color: #ffd93d; }
.difficulty-D { color: #ffb454; }
.difficulty-E { color: #ff6b6b; }

.video-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--line);
  color: var(--text-main);
}

.btn-danger {
  color: var(--danger);
  border-color: rgba(255, 107, 107, 0.3);
}

.btn-danger:hover {
  background: rgba(255, 107, 107, 0.15);
}

.empty-videos {
  text-align: center;
  padding: 32px;
  color: var(--text-muted);
}

.text-muted {
  color: var(--text-muted);
  font-size: 13px;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .video-item {
    flex-direction: column;
  }

  .video-thumb {
    width: 100%;
    height: 180px;
  }
}
</style>