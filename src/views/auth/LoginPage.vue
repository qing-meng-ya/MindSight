<template>
  <div class="auth-page">
    <div class="auth-card panel">
      <h1 class="auth-title">登录</h1>
      <p class="auth-desc">欢迎回来，请登录您的账号</p>
      
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="form.username" type="text" placeholder="请输入用户名" required />
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="请输入密码" required />
        </div>
        
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <p class="auth-footer">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  const result = await authStore.login(form.username, form.password)
  loading.value = false
  
  if (result.success) {
    const redirect = route.query.redirect || getDefaultRoute(result.user.role)
    router.push(redirect)
  } else {
    alert(result.message || '登录失败')
  }
}

const getDefaultRoute = (role) => {
  if (role === 'expert') return '/expert'
  if (role === 'client') return '/client'
  return '/learner'
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 32px;
}

.auth-title {
  margin: 0 0 8px;
  font-size: 28px;
  text-align: center;
}

.auth-desc {
  margin: 0 0 24px;
  color: var(--text-muted);
  text-align: center;
  font-size: 14px;
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
  font-size: 14px;
  color: var(--text-muted);
}

.form-group input {
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: rgba(8, 14, 24, 0.5);
  color: var(--text-main);
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
}

.btn-block {
  width: 100%;
  padding: 14px;
  font-size: 15px;
}

.auth-footer {
  margin: 20px 0 0;
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
}

.auth-footer a {
  color: var(--accent);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>