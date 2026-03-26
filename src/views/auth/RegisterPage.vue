<template>
  <div class="auth-page">
    <div class="auth-card panel">
      <h1 class="auth-title">注册</h1>
      <p class="auth-desc">创建您的账号，选择您的角色</p>
      
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
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

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
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 440px;
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

.form-group input[type="text"],
.form-group input[type="password"] {
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

.role-select {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.role-option {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: rgba(8, 14, 24, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-option:hover {
  border-color: rgba(64, 216, 197, 0.4);
}

.role-option.active {
  border-color: var(--accent);
  background: rgba(64, 216, 197, 0.1);
}

.role-option input {
  display: none;
}

.role-name {
  font-size: 15px;
  font-weight: 500;
}

.role-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.btn-block {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  margin-top: 8px;
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