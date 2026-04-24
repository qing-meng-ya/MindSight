<template>
  <div class="layout">
    <header class="top-nav">
      <div class="nav-inner">
        <router-link class="brand" to="/expert">法医工作者</router-link>
        <nav class="nav-links">
          <router-link to="/expert">工作台</router-link>
          <router-link to="/expert/cases">案件</router-link>
          <router-link to="/expert/tools">工具库</router-link>
          <router-link to="/expert/ai-predict">AI预测</router-link>
          <router-link to="/expert/yolo-image">YOLO影像</router-link>
          <router-link to="/expert/batch-calc">批量计算</router-link>
          <router-link to="/expert/library">资料库</router-link>
          <router-link to="/expert/qa">答疑</router-link>
          <router-link to="/expert/profile">个人中心</router-link>
        </nav>
        <div class="nav-auth">
          <button class="theme-toggle" @click="themeStore.toggleTheme" :title="themeStore.isDark ? '切换浅色模式' : '切换深色模式'">
            {{ themeStore.isDark ? '☀️' : '🌙' }}
          </button>
          <span class="nav-greet">你好，{{ authStore.user?.name || '法医' }}</span>
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
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

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