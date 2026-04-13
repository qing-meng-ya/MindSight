<template>
  <div class="video-play-page">
    <div class="player-section">
      <div class="video-player" @mousemove="showControls" @mouseleave="hideControls">
        <div class="player-placeholder" :style="video.coverStyle">
          <div class="play-button" @click="togglePlay" v-if="!isPlaying">
            <span>▶</span>
          </div>
        </div>
        <DanmuComponent 
          v-if="danmuEnabled"
          :danmus="danmus"
          :enabled="danmuEnabled"
        />
        <div class="player-controls" :class="{ visible: controlsVisible }">
          <button class="control-btn" @click="togglePlay">{{ isPlaying ? '⏸' : '▶' }}</button>
          <div class="progress-bar" @click="seek">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
          <button class="control-btn" @click="toggleDanmu">{{ danmuEnabled ? '🔤' : '🔇' }}</button>
          <button class="control-btn" @click="toggleFullscreen">⛶</button>
        </div>
      </div>

      <div class="danmu-input-area" v-if="danmuEnabled">
        <input 
          v-model="danmuText" 
          type="text" 
          placeholder="发送弹幕..."
          class="danmu-input"
          @keydown.enter="sendDanmu"
        />
        <button class="btn btn-primary btn-sm" @click="sendDanmu">发送</button>
      </div>
    </div>

    <div class="video-info panel">
      <div class="info-header">
        <h1>{{ video.title }}</h1>
        <div class="video-stats">
          <span>{{ video.views }} 次观看</span>
          <span>{{ video.likes }} 点赞</span>
          <span>{{ video.date }}</span>
        </div>
      </div>
      <div class="info-actions">
        <button class="action-btn" :class="{ active: video.liked }" @click="toggleLike">
          {{ video.liked ? '❤️' : '🤍' }} {{ video.likes }}
        </button>
        <button class="action-btn" :class="{ active: video.collected }" @click="toggleCollect">
          {{ video.collected ? '⭐' : '☆' }} 收藏
        </button>
        <button class="action-btn" @click="shareVideo">
          📤 分享
        </button>
      </div>
      <div class="author-info">
        <div class="author-avatar">{{ video.author.charAt(0) }}</div>
        <div class="author-detail">
          <span class="author-name">{{ video.author }}</span>
          <span class="author-desc">法医专业讲师</span>
        </div>
        <button class="btn btn-primary btn-sm">关注</button>
      </div>
      <div class="video-desc">
        <h3>视频简介</h3>
        <p>{{ video.description }}</p>
      </div>
      <div class="video-tags">
        <span v-for="tag in video.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>

    <div class="video-comments panel">
      <h2>评论 {{ comments.length }}</h2>
      <div class="comment-form">
        <textarea 
          v-model="newComment" 
          placeholder="发表你的看法..."
          class="comment-input"
          rows="3"
        ></textarea>
        <button class="btn btn-primary" @click="postComment">发表评论</button>
      </div>
      <div class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-avatar">{{ comment.author.charAt(0) }}</div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">{{ comment.author }}</span>
              <span class="comment-time">{{ comment.time }}</span>
            </div>
            <p class="comment-text">{{ comment.text }}</p>
            <div class="comment-actions">
              <button @click="likeComment(comment)">
                {{ comment.liked ? '❤️' : '🤍' }} {{ comment.likes }}
              </button>
              <button @click="replyComment(comment)">回复</button>
            </div>
            <div v-if="comment.replies && comment.replies.length > 0" class="comment-replies">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <span class="reply-author">{{ reply.author }}：</span>
                <span>{{ reply.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <section class="panel related-videos">
      <h2>相关推荐</h2>
      <div class="related-list">
        <div v-for="related in relatedVideos" :key="related.id" class="related-item" @click="playRelated(related)">
          <div class="related-thumb" :style="related.coverStyle"></div>
          <div class="related-info">
            <h3>{{ related.title }}</h3>
            <div class="related-meta">
              <span>{{ related.views }} 次观看</span>
              <span>{{ related.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import DanmuComponent from '@/components/Danmu.vue'

const isPlaying = ref(false)
const controlsVisible = ref(true)
const progress = ref(35)
const currentTime = ref(140)
const duration = ref(400)
const danmuEnabled = ref(true)
const danmuText = ref('')
const danmuInput = ref(null)

const video = reactive({
  title: '法医鉴定标准流程详解',
  views: 1234,
  likes: 56,
  date: '2024-01-20',
  author: '法医讲师李老师',
  description: '本视频详细介绍法医鉴定的标准流程，包括案件受理、现场勘查、尸体检验、鉴定意见出具等环节的要点和注意事项。',
  tags: ['法医鉴定', '流程讲解', '入门级'],
  difficulty: 'B',
  coverStyle: 'linear-gradient(135deg, #1a365d, #0d1a2b)',
  liked: false,
  collected: false
})

const danmus = ref([
  { id: 1, text: '讲得很清楚！' },
  { id: 2, text: '谢谢老师' },
  { id: 3, text: '这个知识点很重要' },
  { id: 4, text: 'mark一下' }
])

const newComment = ref('')

const comments = ref([
  { 
    id: 1, 
    author: '学习者小王', 
    time: '2024-01-21', 
    text: '讲得非常清晰，对新手很友好！',
    likes: 12,
    liked: false,
    replies: [
      { id: 1, author: '法医讲师李老师', text: '谢谢支持，有问题可以留言~' }
    ]
  },
  { 
    id: 2, 
    author: '医学生小张', 
    time: '2024-01-20', 
    text: '案例分析部分很实用，期待更新更多内容',
    likes: 8,
    liked: false,
    replies: []
  }
])

const relatedVideos = ref([
  { 
    id: 1, 
    title: '关节活动度测量实操', 
    views: 856, 
    date: '2024-01-18',
    coverStyle: 'linear-gradient(135deg, #40a0a0, #206060)'
  },
  { 
    id: 2, 
    title: '死亡时间推断方法', 
    views: 623, 
    date: '2024-01-15',
    coverStyle: 'linear-gradient(135deg, #8b5cf6, #5b21b6)'
  },
  { 
    id: 3, 
    title: '伤残评级标准解读', 
    views: 945, 
    date: '2024-01-12',
    coverStyle: 'linear-gradient(135deg, #f97316, #c2410c)'
  }
])

let controlsTimer = null

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

const seek = (e) => {
  const rect = e.target.getBoundingClientRect()
  progress.value = ((e.clientX - rect.left) / rect.width) * 100
}

const toggleDanmu = () => {
  danmuEnabled.value = !danmuEnabled.value
}

const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}

const showControls = () => {
  controlsVisible.value = true
  clearTimeout(controlsTimer)
  controlsTimer = setTimeout(() => {
    if (isPlaying.value) {
      controlsVisible.value = false
    }
  }, 3000)
}

const hideControls = () => {
  if (isPlaying.value) {
    controlsVisible.value = false
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const sendDanmu = () => {
  if (danmuText.value.trim()) {
    danmus.value.push({ 
      id: Date.now(), 
      text: danmuText.value.trim() 
    })
    danmuText.value = ''
  }
}

const toggleLike = () => {
  video.liked = !video.liked
  video.likes += video.liked ? 1 : -1
}

const toggleCollect = () => {
  video.collected = !video.collected
}

const shareVideo = () => {
  alert('分享链接已复制到剪贴板')
}

const postComment = () => {
  if (newComment.value.trim()) {
    comments.value.unshift({
      id: Date.now(),
      author: '当前用户',
      time: new Date().toISOString().split('T')[0],
      text: newComment.value.trim(),
      likes: 0,
      liked: false,
      replies: []
    })
    newComment.value = ''
  }
}

const likeComment = (comment) => {
  comment.liked = !comment.liked
  comment.likes += comment.liked ? 1 : -1
}

const replyComment = (comment) => {
  const reply = prompt('请输入回复内容')
  if (reply) {
    if (!comment.replies) {
      comment.replies = []
    }
    comment.replies.push({
      id: Date.now(),
      author: '当前用户',
      text: reply
    })
  }
}

const playRelated = (video) => {
  alert('播放: ' + video.title)
}
</script>

<style scoped>
.video-play-page {
  display: grid;
  gap: 24px;
}

.player-section {
  position: relative;
}

.video-player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.player-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-button {
  width: 80px;
  height: 80px;
  background: rgba(64, 216, 197, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.play-button:hover {
  transform: scale(1.1);
}

.play-button span {
  font-size: 32px;
  color: #000;
  margin-left: 4px;
}

.player-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.player-controls.visible {
  opacity: 1;
}

.control-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  cursor: pointer;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
}

.time-display {
  font-size: 12px;
  color: #fff;
}

.danmu-input-area {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.danmu-input {
  flex: 1;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-size: 14px;
}

.video-info {
  display: grid;
  gap: 16px;
}

.info-header h1 {
  margin: 0;
  font-size: 22px;
}

.video-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-muted);
}

.info-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover, .action-btn.active {
  border-color: var(--accent);
  color: var(--accent);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
}

.author-avatar {
  width: 48px;
  height: 48px;
  background: var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #000;
}

.author-detail {
  flex: 1;
}

.author-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
}

.author-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.video-desc h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.video-desc p {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.7;
}

.video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  background: rgba(64, 216, 197, 0.15);
  border-radius: 999px;
  font-size: 12px;
  color: var(--accent);
}

.video-comments h2 {
  margin: 0 0 16px;
  font-size: 18px;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.comment-input {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-size: 14px;
  resize: vertical;
}

.comments-list {
  display: grid;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  background: rgba(64, 216, 197, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--accent);
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.comment-author {
  font-size: 14px;
  font-weight: 500;
}

.comment-time {
  font-size: 12px;
  color: var(--text-muted);
}

.comment-text {
  margin: 0 0 8px;
  font-size: 14px;
  line-height: 1.6;
}

.comment-actions {
  display: flex;
  gap: 12px;
}

.comment-actions button {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
}

.comment-replies {
  margin-top: 12px;
  padding-left: 12px;
  border-left: 2px solid var(--line);
}

.reply-item {
  font-size: 13px;
  margin-bottom: 4px;
}

.reply-author {
  color: var(--accent);
  font-weight: 500;
}

.related-videos h2 {
  margin: 0 0 16px;
  font-size: 18px;
}

.related-list {
  display: grid;
  gap: 12px;
}

.related-item {
  display: flex;
  gap: 16px;
  cursor: pointer;
}

.related-thumb {
  width: 160px;
  height: 90px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.related-info h3 {
  margin: 0 0 8px;
  font-size: 14px;
}

.related-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}
</style>