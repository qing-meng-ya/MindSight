import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const token = ref(null)
  
  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || null)
  
  // 初始化 - 从localStorage恢复
  function init() {
    const savedToken = localStorage.getItem('forensic_token')
    const savedUser = localStorage.getItem('forensic_user')
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }
  
  // 登录
  async function login(username, password) {
    // 模拟登录 - 实际项目中应调用API
    if (username && password) {
      // 模拟返回数据
      const mockUser = {
        id: '1',
        username: username,
        role: username.includes('expert') ? 'expert' : 
              username.includes('client') ? 'client' : 'learner',
        name: username,
        email: `${username}@example.com`
      }
      const mockToken = 'mock_jwt_token_' + Date.now()
      
      // 保存状态
      user.value = mockUser
      token.value = mockToken
      
      // 持久化
      localStorage.setItem('forensic_token', mockToken)
      localStorage.setItem('forensic_user', JSON.stringify(mockUser))
      
      return { success: true, user: mockUser }
    }
    return { success: false, message: '用户名或密码错误' }
  }
  
  // 注册
  async function register(username, password, role) {
    if (username && password && role) {
      const newUser = {
        id: Date.now().toString(),
        username,
        role,
        name: username,
        email: `${username}@example.com`
      }
      const mockToken = 'mock_jwt_token_' + Date.now()
      
      user.value = newUser
      token.value = mockToken
      
      localStorage.setItem('forensic_token', mockToken)
      localStorage.setItem('forensic_user', JSON.stringify(newUser))
      
      return { success: true, user: newUser }
    }
    return { success: false, message: '请填写完整信息' }
  }
  
  // 登出
  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('forensic_token')
    localStorage.removeItem('forensic_user')
  }
  
  // 初始化
  init()
  
  return {
    user,
    token,
    isAuthenticated,
    userRole,
    login,
    register,
    logout,
    init
  }
})