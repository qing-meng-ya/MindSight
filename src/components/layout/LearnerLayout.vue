<template>
  <div class="layout">
    <header class="top-nav">
      <div class="nav-inner">
        <router-link class="brand" to="/learner">法医学习者</router-link>
        <nav class="nav-links">
          <router-link to="/learner">学习中心</router-link>
          <router-link to="/learner/tools">工具练习</router-link>
          <router-link to="/learner/knowledge">知识库</router-link>
          <router-link to="/learner/cases">案例</router-link>
          <router-link to="/learner/community">社区</router-link>
          <router-link to="/learner/video-publish">发布视频</router-link>
          <router-link to="/learner/profile">个人空间</router-link>
        </nav>
        <div class="nav-auth">
          <span class="nav-greet">你好，{{ authStore.user?.name || '学习者' }}</span>
          <button class="btn" @click="handleLogout">退出</button>
        </div>
      </div>
    </header>
    <main class="main-content">
      <router-view />
    </main>
    <footer class="site-footer">
      <p>&copy; {{ currentYear }} 法医助手</p>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const currentYear = new Date().getFullYear()

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: min(1200px, calc(100% - 32px));
  margin: 0 auto;
  padding: 24px 16px;
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-greet {
  font-size: 14px;
  color: var(--text-muted);
}

.site-footer {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
  font-size: 13px;
  border-top: 1px solid var(--line);
}
</style>