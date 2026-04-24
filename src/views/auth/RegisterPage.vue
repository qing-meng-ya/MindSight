<template>
  <div class="auth-page" :class="{ dark: themeStore.isDark }">
    <button class="theme-toggle" @click="themeStore.toggleTheme" :title="themeStore.isDark ? '切换浅色模式' : '切换深色模式'">
      {{ themeStore.isDark ? '☀️' : '🌙' }}
    </button>

    <div class="auth-left">
      <div class="auth-image-overlay"></div>
      <div class="auth-brand">
        <h1>法医助手</h1>
        <p>科学鉴定，公正司法</p>
      </div>
      <div class="auth-copyright">© {{ currentYear }} 法医助手</div>
    </div>

    <div class="auth-right">
      <div class="auth-form-box">
        <h2 class="auth-title">创建账号</h2>
        <p class="auth-subtitle">选择您的角色，开始法医之旅</p>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label>用户名</label>
            <input v-model="form.username" type="text" placeholder="请输入用户名" required />
          </div>

          <div class="form-group">
            <label>密码</label>
            <input v-model="form.password" type="password" placeholder="请输入密码" required />
          </div>

          <div class="form-group">
            <label>选择角色</label>
            <div class="role-select">
              <label class="role-option" :class="{ active: form.role === 'learner' }">
                <input type="radio" v-model="form.role" value="learner" />
                <span class="role-name">法医学习者</span>
                <span class="role-desc">学习知识、练习工具</span>
              </label>
              <label class="role-option" :class="{ active: form.role === 'expert' }">
                <input type="radio" v-model="form.role" value="expert" />
                <span class="role-name">法医工作者</span>
                <span class="role-desc">专业工具、资料管理</span>
              </label>
              <label class="role-option" :class="{ active: form.role === 'client' }">
                <input type="radio" v-model="form.role" value="client" />
                <span class="role-name">法医咨询者</span>
                <span class="role-desc">检测评估、咨询服务</span>
              </label>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? '注册中...' : '立即注册' }}
          </button>
        </form>

        <p class="auth-footer">
          已有账号？<router-link to="/login">立即登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const currentYear = new Date().getFullYear()
const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
  role: 'learner'
})

const handleRegister = async () => {
  loading.value = true
  const result = await authStore.register(form.username, form.password, form.role)
  loading.value = false

  if (result.success) {
    const redirect = result.user.role === 'expert' ? '/expert' :
                    result.user.role === 'client' ? '/client' : '/learner'
    router.push(redirect)
  } else {
    alert(result.message || '注册失败')
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  min-height: 100vh;
  background: var(--bg-0, #0a0e17);
}

/* 左侧图片区域 */
.auth-left {
  position: relative;
  width: 50%;
  min-height: 100vh;
  background: url('https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px;
}

.auth-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(10, 14, 23, 0.85) 0%, rgba(10, 14, 23, 0.6) 100%);
}

.auth-brand {
  position: relative;
  z-index: 1;
}

.auth-brand h1 {
  margin: 0 0 8px;
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
}

.auth-brand p {
  margin: 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 4px;
}

.auth-copyright {
  position: relative;
  z-index: 1;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

/* 右侧表单区域 */
.auth-right {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  overflow-y: auto;
}

.auth-form-box {
  width: 100%;
  max-width: 420px;
}

.auth-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
}

.auth-subtitle {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--text-muted);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.form-group input {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
}

/* 角色选择 */
.role-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-option {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid var(--line);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.role-option:hover {
  border-color: var(--accent);
}

.role-option.active {
  border-color: var(--accent);
  background: rgba(64, 216, 197, 0.08);
}

.role-option input[type="radio"] {
  position: absolute;
  opacity: 0;
}

.role-name {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 2px;
}

.role-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.btn-block {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  margin-top: 8px;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
}

.auth-footer a {
  color: var(--accent);
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* 主题切换按钮 */
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--line);
  color: var(--text);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

/* 浅色模式适配 */
.auth-page:not(.dark) {
  background: #f5f7fa;
}

.auth-page:not(.dark) .auth-right {
  background: #f5f7fa;
}

.auth-page:not(.dark) .form-group input {
  background: #fff;
  border-color: #e0e0e0;
  color: #333;
}

.auth-page:not(.dark) .auth-title {
  color: #1a1a2e;
}

.auth-page:not(.dark) .auth-footer {
  color: #666;
}

.auth-page:not(.dark) .role-option {
  background: #fff;
  border-color: #e0e0e0;
}

.auth-page:not(.dark) .role-option.active {
  background: rgba(64, 216, 197, 0.08);
}

/* 响应式 */
@media (max-width: 768px) {
  .auth-left {
    display: none;
  }

  .auth-right {
    width: 100%;
    padding: 24px;
  }
}
</style>
