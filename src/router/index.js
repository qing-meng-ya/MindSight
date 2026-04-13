import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomePage.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { title: '登录', guest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterPage.vue'),
    meta: { title: '注册', guest: true }
  },
  // 学习者路由
  {
    path: '/learner',
    component: () => import('@/components/layout/LearnerLayout.vue'),
    meta: { requiresAuth: true, role: 'learner' },
    children: [
      {
        path: '',
        name: 'learner-dashboard',
        component: () => import('@/views/learner/DashboardPage.vue'),
        meta: { title: '学习中心' }
      },
      {
        path: 'tools',
        name: 'learner-tools',
        component: () => import('@/views/learner/ToolsPage.vue'),
        meta: { title: '工具练习' }
      },
      {
        path: 'knowledge',
        name: 'learner-knowledge',
        component: () => import('@/views/learner/KnowledgePage.vue'),
        meta: { title: '知识库' }
      },
      {
        path: 'cases',
        name: 'learner-cases',
        component: () => import('@/views/learner/CasesPage.vue'),
        meta: { title: '案例学习' }
      },
      {
        path: 'community',
        name: 'learner-community',
        component: () => import('@/views/learner/CommunityPage.vue'),
        meta: { title: '学习社区' }
      },
      {
        path: 'profile',
        name: 'learner-profile',
        component: () => import('@/views/learner/ProfilePage.vue'),
        meta: { title: '个人空间' }
      },
      {
        path: 'video-publish',
        name: 'learner-video-publish',
        component: () => import('@/views/learner/VideoPublishPage.vue'),
        meta: { title: '发布视频' }
      },
      {
        path: 'video-play/:id',
        name: 'learner-video-play',
        component: () => import('@/views/learner/VideoPlayPage.vue'),
        meta: { title: '视频播放' }
      }
    ]
  },
  // 工作者路由
  {
    path: '/expert',
    component: () => import('@/components/layout/ExpertLayout.vue'),
    meta: { requiresAuth: true, role: 'expert' },
    children: [
      {
        path: '',
        name: 'expert-dashboard',
        component: () => import('@/views/expert/DashboardPage.vue'),
        meta: { title: '工作台' }
      },
      {
        path: 'tools',
        name: 'expert-tools',
        component: () => import('@/views/expert/ToolsPage.vue'),
        meta: { title: '专业工具库' }
      },
      {
        path: 'library',
        name: 'expert-library',
        component: () => import('@/views/expert/LibraryPage.vue'),
        meta: { title: '资料库' }
      },
      {
        path: 'qa',
        name: 'expert-qa',
        component: () => import('@/views/expert/QAPage.vue'),
        meta: { title: '在线答疑' }
      },
      {
        path: 'nursing',
        name: 'expert-nursing',
        component: () => import('@/views/expert/NursingPage.vue'),
        meta: { title: '护理计算' }
      }
    ]
  },
  // 咨询者路由
  {
    path: '/client',
    component: () => import('@/components/layout/ClientLayout.vue'),
    meta: { requiresAuth: true, role: 'client' },
    children: [
      {
        path: '',
        name: 'client-dashboard',
        component: () => import('@/views/client/DashboardPage.vue'),
        meta: { title: '咨询中心' }
      },
      {
        path: 'check',
        name: 'client-check',
        component: () => import('@/views/client/CheckPage.vue'),
        meta: { title: '初步检测' }
      },
      {
        path: 'consult',
        name: 'client-consult',
        component: () => import('@/views/client/ConsultPage.vue'),
        meta: { title: '咨询服务' }
      },
      {
        path: 'knowledge',
        name: 'client-knowledge',
        component: () => import('@/views/client/KnowledgePage.vue'),
        meta: { title: '知识百科' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 更新页面标题
  document.title = to.meta.title ? `${to.meta.title} - 法医助手` : '法医助手'
  
  // 需要登录的路由
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  // 已登录用户访问登录/注册页
  if (to.meta.guest && authStore.isAuthenticated) {
    const roleRoute = authStore.user?.role === 'expert' ? '/expert' : 
                     authStore.user?.role === 'client' ? '/client' : '/learner'
    next(roleRoute)
    return
  }
  
  // 角色权限检查
  if (to.meta.role && authStore.user?.role !== to.meta.role) {
    const roleRoute = authStore.user?.role === 'expert' ? '/expert' : 
                     authStore.user?.role === 'client' ? '/client' : '/learner'
    next(roleRoute)
    return
  }
  
  next()
})

export default router