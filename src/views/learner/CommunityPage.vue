<template>
  <div class="community-page">
    <div class="section-head">
      <h1 class="section-title">学习社区</h1>
      <p class="section-note">与同行交流、分享学习心得</p>
    </div>

    <div class="action-bar panel">
      <button class="btn btn-primary" @click="showPostForm = true">发布新帖</button>
      <div class="filter-tags">
        <span class="tag" :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</span>
        <span class="tag" :class="{ active: filter === 'question' }" @click="filter = 'question'">提问</span>
        <span class="tag" :class="{ active: filter === 'share' }" @click="filter = 'share'">分享</span>
        <span class="tag" :class="{ active: filter === 'discussion' }" @click="filter = 'discussion'">讨论</span>
      </div>
    </div>

    <div class="post-list">
      <div v-for="post in filteredPosts" :key="post.id" class="post-card panel">
        <div class="post-header">
          <div class="post-avatar">{{ post.avatar }}</div>
          <div class="post-info">
            <span class="post-author">{{ post.author }}</span>
            <span class="post-time">{{ post.time }}</span>
          </div>
          <span class="post-type">{{ post.type }}</span>
        </div>
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-content">{{ post.content }}</p>
        <div class="post-footer">
          <span>{{ post.likes }}</span>
          <span>{{ post.comments }}</span>
          <span>{{ post.views }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showPostForm = ref(false)
const filter = ref('all')

const posts = ref([
  {
    id: 1,
    avatar: '问',
    author: '案例研习组',
    time: '2 小时前',
    type: 'question',
    title: '多发肋骨骨折在伤残评级里最容易漏看什么？',
    content: '我在复盘案例时发现自己总是只看骨折数量，容易忽略呼吸功能影响，想听听大家怎么建立判断顺序。',
    likes: '12 赞',
    comments: '5 条评论',
    views: '86 次浏览'
  },
  {
    id: 2,
    avatar: '享',
    author: '病理学习小组',
    time: '昨天',
    type: 'share',
    title: '整理了一份切片判读入门思路图',
    content: '把常见染色表现和描述语言放在一张图里，适合新手刚开始复习时快速建立框架。',
    likes: '28 赞',
    comments: '11 条评论',
    views: '164 次浏览'
  },
  {
    id: 3,
    avatar: '议',
    author: '实务讨论区',
    time: '昨天',
    type: 'discussion',
    title: '学习端要不要把案例答案默认折叠？',
    content: '我倾向于先独立作答再看解析，这样更像真实判断过程，也更能暴露自己的思路漏洞。',
    likes: '19 赞',
    comments: '9 条评论',
    views: '103 次浏览'
  }
])

const filteredPosts = computed(() => {
  if (filter.value === 'all') return posts.value
  return posts.value.filter(p => p.type === filter.value)
})
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

.post-list {
  display: grid;
  gap: 16px;
}

.post-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.post-avatar {
  font-size: 24px;
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
  margin: 0;
  font-size: 17px;
}

.post-content {
  margin: 0;
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
  font-size: 13px;
  color: var(--text-muted);
}
</style>
