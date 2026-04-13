<template>
  <div class="community-page">
    <div class="section-head">
      <h1 class="section-title">学习社区</h1>
      <p class="section-note">与同行交流、分享学习心得</p>
    </div>

    <div class="action-bar panel">
      <button class="btn btn-primary" @click="showPostForm = true">发布新帖</button>
      <button class="btn" @click="showMyPosts = !showMyPosts">
        {{ showMyPosts ? '查看全部' : '我的帖子' }}
      </button>
      <div class="filter-tags">
        <span class="tag" :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</span>
        <span class="tag" :class="{ active: filter === 'question' }" @click="filter = 'question'">提问</span>
        <span class="tag" :class="{ active: filter === 'share' }" @click="filter = 'share'">分享</span>
        <span class="tag" :class="{ active: filter === 'discussion' }" @click="filter = 'discussion'">讨论</span>
      </div>
    </div>

    <div class="post-list">
      <div v-for="post in filteredPosts" :key="post.id" class="post-card panel" @click="viewPost(post)">
        <div class="post-header">
          <div class="post-avatar">{{ post.avatar }}</div>
          <div class="post-info">
            <span class="post-author">{{ post.author }}</span>
            <span class="post-time">{{ post.time }}</span>
          </div>
          <span class="post-type">{{ post.typeLabel }}</span>
        </div>
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-content">{{ post.content }}</p>
        <div class="post-footer">
          <button @click.stop="likePost(post)">
            {{ post.liked ? '❤️' : '🤍' }} {{ post.likes }}
          </button>
          <button @click.stop="openComment(post)">
            💬 {{ post.comments }}
          </button>
          <button @click.stop="collectPost(post)">
            {{ post.collected ? '⭐' : '☆' }}
          </button>
          <span class="post-views">👀 {{ post.views }}</span>
        </div>
      </div>
    </div>

    <!-- 发帖弹窗 -->
    <div v-if="showPostForm" class="modal" @click.self="showPostForm = false">
      <div class="modal-content panel">
        <div class="modal-header">
          <h2>发布新帖</h2>
          <button class="close-btn" @click="showPostForm = false">&times;</button>
        </div>
        <div class="post-form">
          <div class="form-group">
            <label>标题 <span class="required">*</span></label>
            <input 
              v-model="newPost.title" 
              type="text" 
              placeholder="请输入标题，2-50个字符"
              class="form-input"
              maxlength="50"
            />
          </div>
          <div class="form-group">
            <label>类型 <span class="required">*</span></label>
            <select v-model="newPost.type" class="form-select">
              <option value="question">提问</option>
              <option value="share">分享</option>
              <option value="discussion">讨论</option>
            </select>
          </div>
          <div class="form-group">
            <label>内容 <span class="required">*</span></label>
            <textarea 
              v-model="newPost.content" 
              placeholder="分享你的学习心得、问题或经验..."
              class="form-textarea"
              rows="6"
              maxlength="1000"
            ></textarea>
          </div>
          <div class="form-group">
            <label>标签</label>
            <div class="tags-input">
              <span v-for="(tag, idx) in newPost.tags" :key="idx" class="tag">
                {{ tag }}
                <button @click="removeTag(idx)">&times;</button>
              </span>
              <input 
                v-model="tagInput" 
                type="text" 
                placeholder="添加标签"
                @keydown.enter="addTag"
              />
            </div>
          </div>
          <div class="form-actions">
            <button class="btn" @click="showPostForm = false">取消</button>
            <button class="btn btn-primary" :disabled="!canPost" @click="submitPost">发布</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 帖子详情弹窗 -->
    <div v-if="selectedPost" class="modal" @click.self="selectedPost = null">
      <div class="modal-content panel post-detail">
        <div class="modal-header">
          <h2>帖子详情</h2>
          <button class="close-btn" @click="selectedPost = null">&times;</button>
        </div>
        <div class="detail-post">
          <div class="post-header">
            <div class="post-avatar">{{ selectedPost.avatar }}</div>
            <div class="post-info">
              <span class="post-author">{{ selectedPost.author }}</span>
              <span class="post-time">{{ selectedPost.time }}</span>
            </div>
            <span class="post-type">{{ selectedPost.typeLabel }}</span>
          </div>
          <h3>{{ selectedPost.title }}</h3>
          <p class="post-content">{{ selectedPost.content }}</p>
          <div class="post-tags">
            <span v-for="tag in selectedPost.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="post-footer">
            <button @click="likePost(selectedPost)">
              {{ selectedPost.liked ? '❤️' : '🤍' }} {{ selectedPost.likes }}
            </button>
            <button @click="collectPost(selectedPost)">
              {{ selectedPost.collected ? '⭐' : '☆' }} 收藏
            </button>
            <span>👀 {{ selectedPost.views }} 次浏览</span>
          </div>
        </div>

        <div class="comments-section">
          <h3>评论 {{ selectedPost.commentList?.length || 0 }}</h3>
          <div class="comment-form">
            <textarea 
              v-model="newComment" 
              placeholder="发表你的看法..."
              rows="2"
            ></textarea>
            <button class="btn btn-primary btn-sm" @click="submitComment">发表评论</button>
          </div>
          <div class="comments-list">
            <div v-for="comment in selectedPost.commentList" :key="comment.id" class="comment-item">
              <div class="comment-avatar">{{ comment.avatar }}</div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.author }}</span>
                  <span class="comment-time">{{ comment.time }}</span>
                </div>
                <p>{{ comment.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const showPostForm = ref(false)
const showMyPosts = ref(false)
const filter = ref('all')
const selectedPost = ref(null)
const newComment = ref('')
const tagInput = ref('')

const newPost = reactive({
  title: '',
  type: 'discussion',
  content: '',
  tags: []
})

const posts = ref([
  {
    id: 1,
    avatar: '问',
    author: '案例研习组',
    time: '2 小时前',
    type: 'question',
    typeLabel: '提问',
    title: '多发肋骨骨折在伤残评级里最容易漏看什么？',
    content: '我在复盘案例时发现自己总是只看骨折数量，容易忽略呼吸功能影响，想听听大家怎么建立判断顺序。',
    likes: 12,
    comments: 5,
    views: 86,
    liked: false,
    collected: false,
    tags: ['损伤鉴定', '伤残评级'],
    commentList: [
      { id: 1, avatar: '王', author: '学员王', time: '1小时前', text: '我的经验是先把骨折位置和数量列出来，再看功能影响。' },
      { id: 2, avatar: '李', author: '学员李', time: '30分钟前', text: '同意楼上观点，功能检查很重要。' }
    ]
  },
  {
    id: 2,
    avatar: '享',
    author: '病理学习小组',
    time: '昨天',
    type: 'share',
    typeLabel: '分享',
    title: '整理了一份切片判读入门思路图',
    content: '把常见染色表现和描述语言放在一张图里，适合新手刚开始复习时快速建立框架。',
    likes: 28,
    comments: 11,
    views: 164,
    liked: true,
    collected: false,
    tags: ['病理学', '切片'],
    commentList: [
      { id: 1, avatar: '张', author: '学员张', time: '昨天', text: '太有用了，感谢分享！' }
    ]
  },
  {
    id: 3,
    avatar: '议',
    author: '实务讨论区',
    time: '昨天',
    type: 'discussion',
    typeLabel: '讨论',
    title: '学习端要不要把案例答案默认折叠？',
    content: '我倾向于先独立作答再看解析，这样更像真实判断过程，也更能暴露自己的思路漏洞。',
    likes: 19,
    comments: 9,
    views: 103,
    liked: false,
    collected: true,
    tags: ['案例学习', '方法讨论'],
    commentList: []
  },
  {
    id: 4,
    avatar: '问',
    author: '工具练习组',
    time: '3天前',
    type: 'question',
    typeLabel: '提问',
    title: '关节活动度测量有什么技巧？',
    content: '每次测量都感觉不够准确，尤其是肩关节的活动范围，求指导。',
    likes: 8,
    comments: 6,
    views: 72,
    liked: false,
    collected: false,
    tags: ['工具使用', '测量'],
    commentList: [
      { id: 1, avatar: '赵', author: '学员赵', time: '2天前', text: '可以用量角器辅助，记得对比对侧。' }
    ]
  }
])

const typeMap = {
  question: '提问',
  share: '分享',
  discussion: '讨论'
}

const filteredPosts = computed(() => {
  let result = posts.value
  
  if (showMyPosts.value) {
    result = result.filter(p => p.author === '当前用户')
  }
  
  if (filter.value !== 'all') {
    result = result.filter(p => p.type === filter.value)
  }
  
  return result
})

const canPost = computed(() => {
  return newPost.title.length >= 2 && newPost.content.length >= 5
})

const viewPost = (post) => {
  post.views++
  selectedPost.value = post
}

const likePost = (post) => {
  post.liked = !post.liked
  post.likes += post.liked ? 1 : -1
}

const collectPost = (post) => {
  post.collected = !post.collected
}

const openComment = (post) => {
  selectedPost.value = post
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !newPost.tags.includes(tag) && newPost.tags.length < 3) {
    newPost.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index) => {
  newPost.tags.splice(index, 1)
}

const submitPost = () => {
  if (!canPost.value) return
  
  posts.value.unshift({
    id: Date.now(),
    avatar: '我',
    author: '当前用户',
    time: '刚刚',
    type: newPost.type,
    typeLabel: typeMap[newPost.type],
    title: newPost.title,
    content: newPost.content,
    likes: 0,
    comments: 0,
    views: 0,
    liked: false,
    collected: false,
    tags: [...newPost.tags],
    commentList: []
  })
  
  newPost.title = ''
  newPost.type = 'discussion'
  newPost.content = ''
  newPost.tags = []
  showPostForm.value = false
}

const submitComment = () => {
  if (!newComment.value.trim() || !selectedPost.value) return
  
  if (!selectedPost.value.commentList) {
    selectedPost.value.commentList = []
  }
  
  selectedPost.value.commentList.push({
    id: Date.now(),
    avatar: '我',
    author: '当前用户',
    time: '刚刚',
    text: newComment.value.trim()
  })
  
  selectedPost.value.comments++
  newComment.value = ''
}
</script>

<style scoped>
.community-page {
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

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-tags {
  display: flex;
  gap: 8px;
}

.tag {
  padding: 6px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 13px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag:hover, .tag.active {
  border-color: var(--accent);
  color: var(--accent);
}

.tag button {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  margin-left: 4px;
}

.post-list {
  display: grid;
  gap: 16px;
}

.post-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-card:hover {
  border-color: var(--accent);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.post-avatar {
  width: 40px;
  height: 40px;
  background: rgba(64, 216, 197, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--accent);
}

.post-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-author {
  font-size: 14px;
  font-weight: 500;
}

.post-time {
  font-size: 12px;
  color: var(--text-muted);
}

.post-type {
  padding: 2px 10px;
  background: rgba(64, 216, 197, 0.15);
  border-radius: 999px;
  font-size: 12px;
  color: var(--accent);
}

.post-title {
  margin: 0 0 8px;
  font-size: 17px;
}

.post-content {
  margin: 0 0 12px;
  color: var(--text-muted);
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  gap: 16px;
}

.post-footer button {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-footer button:hover {
  color: var(--accent);
}

.post-views {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-muted);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  width: min(640px, calc(100% - 32px));
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 24px;
  cursor: pointer;
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

.tags-input input {
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 14px;
  flex: 1;
  min-width: 80px;
}

.tags-input input:focus {
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.post-detail h3 {
  margin: 0 0 12px;
  font-size: 20px;
}

.post-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.comments-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

.comments-section h3 {
  margin: 0 0 16px;
  font-size: 16px;
}

.comment-form {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.comment-form textarea {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-size: 14px;
  resize: vertical;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

.comments-list {
  display: grid;
  gap: 12px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  background: rgba(64, 216, 197, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--accent);
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
  font-size: 13px;
  font-weight: 500;
}

.comment-time {
  font-size: 11px;
  color: var(--text-muted);
}

.comment-content p {
  margin: 0;
  font-size: 13px;
}
</style>