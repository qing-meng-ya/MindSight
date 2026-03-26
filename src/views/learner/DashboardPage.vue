<template>
  <div class="dashboard-page">
    <section class="hero panel">
      <div class="hero-copy">
        <span class="eyebrow">学习者工作台</span>
        <h1>欢迎回来，{{ authStore.user?.name || '学习者' }}</h1>
        <p class="hero-text">
          当前阶段为“{{ currentStage.name }}”，今天建议先完成 1 个章节复习，再做 1 个案例推理，把知识点转成判断能力。
        </p>
        <div class="hero-actions">
          <router-link class="btn btn-primary" to="/learner/knowledge">继续当前章节</router-link>
          <router-link class="btn" to="/learner/cases">开始案例练习</router-link>
        </div>
      </div>

      <div class="hero-card">
        <div class="hero-card-head">
          <span class="hero-card-label">本周学习画像</span>
          <strong>{{ overallProgress }}%</strong>
        </div>
        <ul class="hero-metrics">
          <li v-for="metric in weeklyMetrics" :key="metric.label">
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
          </li>
        </ul>
        <p class="hero-note">下一里程碑：完成“{{ nextMilestone }}”后可解锁案例推理模块。</p>
      </div>
    </section>

    <section class="dashboard-grid">
      <div class="panel plan-card">
        <div class="section-header">
          <h2 class="section-title">本周计划</h2>
          <span class="status-pill">{{ weeklyPlan.mode }}</span>
        </div>
        <div class="plan-progress">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${weeklyPlan.percent}%` }"></div>
          </div>
          <span>{{ weeklyPlan.completed }}/{{ weeklyPlan.total }} 项完成</span>
        </div>
        <div class="plan-list">
          <article v-for="task in weeklyPlan.tasks" :key="task.id" class="plan-item" :class="{ done: task.done }">
            <div>
              <h3>{{ task.title }}</h3>
              <p>{{ task.detail }}</p>
            </div>
            <span class="plan-state">{{ task.done ? '已完成' : '待完成' }}</span>
          </article>
        </div>
      </div>

      <div class="panel resume-card">
        <div class="section-header">
          <h2 class="section-title">最近继续</h2>
          <router-link class="text-link" to="/learner/knowledge">查看全部</router-link>
        </div>
        <div class="resume-list">
          <article v-for="item in resumeItems" :key="item.id" class="resume-item">
            <div class="resume-badge" :class="item.type">{{ item.badge }}</div>
            <div class="resume-copy">
              <h3>{{ item.title }}</h3>
              <p>{{ item.subtitle }}</p>
            </div>
            <router-link class="btn" :to="item.link">继续</router-link>
          </article>
        </div>
      </div>
    </section>

    <section class="panel path-card">
      <div class="section-header">
        <h2 class="section-title">学习路径</h2>
        <span class="text-muted">先夯实基础，再进入综合判断</span>
      </div>
      <div class="path-track">
        <article
          v-for="stage in learningPath"
          :key="stage.id"
          class="path-step"
          :class="stage.state"
        >
          <div class="path-index">{{ stage.index }}</div>
          <div class="path-copy">
            <h3>{{ stage.name }}</h3>
            <p>{{ stage.desc }}</p>
            <span class="path-meta">{{ stage.meta }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="panel abilities-card">
      <div class="section-header">
        <h2 class="section-title">能力进度</h2>
        <span class="text-muted">不只看总进度，更看能力短板</span>
      </div>
      <div class="ability-grid">
        <article v-for="ability in abilities" :key="ability.id" class="ability-item">
          <div class="ability-head">
            <h3>{{ ability.name }}</h3>
            <span>{{ ability.progress }}%</span>
          </div>
          <div class="progress-track small">
            <div class="progress-fill" :style="{ width: `${ability.progress}%` }"></div>
          </div>
          <p>{{ ability.hint }}</p>
        </article>
      </div>
    </section>

    <section class="dashboard-grid bottom-grid">
      <div class="panel weakness-card">
        <div class="section-header">
          <h2 class="section-title">错题与薄弱项</h2>
          <router-link class="text-link" to="/learner/tools">去训练</router-link>
        </div>
        <div class="weakness-list">
          <article v-for="point in weakPoints" :key="point.id" class="weakness-item">
            <span class="topic-tag">{{ point.topic }}</span>
            <h3>{{ point.title }}</h3>
            <p>{{ point.reason }}</p>
          </article>
        </div>
      </div>

      <div class="panel quick-card">
        <div class="section-header">
          <h2 class="section-title">更多入口</h2>
          <span class="text-muted">按任务进入更快</span>
        </div>
        <div class="quick-grid">
          <router-link v-for="entry in quickEntries" :key="entry.title" :to="entry.link" class="quick-item">
            <strong>{{ entry.title }}</strong>
            <span>{{ entry.desc }}</span>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const currentStage = ref({
  name: '损伤鉴定',
  progress: 68
})

const weeklyMetrics = ref([
  { label: '已学章节', value: '6/9' },
  { label: '案例训练', value: '3 次' },
  { label: '工具练习', value: '5 项' }
])

const weeklyPlan = ref({
  mode: '标准节奏',
  completed: 3,
  total: 5,
  percent: 60,
  tasks: [
    { id: 1, title: '复习骨折分类标准', detail: '回看教材与伤情判定要点', done: true },
    { id: 2, title: '完成交通伤案例推理', detail: '先独立作答，再查看解析', done: true },
    { id: 3, title: '练习关节活动度计算', detail: '关注对侧对照与异常值', done: true },
    { id: 4, title: '整理错题卡片', detail: '复盘最近 5 道易错题', done: false },
    { id: 5, title: '完成阶段测验', detail: '检验损伤鉴定模块掌握度', done: false }
  ]
})

const resumeItems = ref([
  {
    id: 1,
    badge: '章',
    type: 'knowledge',
    title: '骨折类型与鉴定标准',
    subtitle: '上次停留在第三节：多发骨折的判读依据',
    link: '/learner/knowledge'
  },
  {
    id: 2,
    badge: '案',
    type: 'case',
    title: '交通事故损伤案例',
    subtitle: '已完成事实梳理，待进入鉴定意见比对',
    link: '/learner/cases'
  }
])

const learningPath = ref([
  { id: 1, index: '01', name: '基础理论', desc: '建立术语、流程和规范基础。', meta: '已完成', state: 'done' },
  { id: 2, index: '02', name: '损伤鉴定', desc: '围绕损伤程度、部位与等级建立判断框架。', meta: '当前阶段 68%', state: 'active' },
  { id: 3, index: '03', name: '病理判读', desc: '学习切片、征象与病理描述的对应关系。', meta: '待解锁', state: 'locked' },
  { id: 4, index: '04', name: '案例推理', desc: '在不完整信息里做出合理结论。', meta: '待解锁', state: 'locked' },
  { id: 5, index: '05', name: '工具实操', desc: '把公式、规则和案例判断连接起来。', meta: '待解锁', state: 'locked' }
])

const abilities = ref([
  { id: 1, name: '理论掌握', progress: 78, hint: '核心概念掌握较稳，建议补强法规细节。' },
  { id: 2, name: '案例分析', progress: 54, hint: '能提取事实，但依据引用还不够完整。' },
  { id: 3, name: '工具使用', progress: 66, hint: '计算步骤熟悉，异常值判断需继续训练。' },
  { id: 4, name: '知识回顾', progress: 42, hint: '建议建立错题复盘节奏，提高记忆留存。' }
])

const weakPoints = ref([
  { id: 1, topic: '损伤鉴定', title: '肋骨骨折伤残评级', reason: '容易忽略骨折数量与功能影响的联合判断。' },
  { id: 2, topic: '工具练习', title: '关节活动度计算', reason: '在录入对侧对照数据时出现漏填。' },
  { id: 3, topic: '案例推理', title: '烧伤等级判断', reason: '对面积与深度的综合判读还不够稳定。' }
])

const quickEntries = ref([
  { title: '工具练习', desc: '按专题进入公式与推导训练', link: '/learner/tools' },
  { title: '知识库', desc: '查法规、标准和专题文章', link: '/learner/knowledge' },
  { title: '案例学习', desc: '先判断，再看标准解析', link: '/learner/cases' },
  { title: '学习社区', desc: '交流问题与复盘经验', link: '/learner/community' }
])

const overallProgress = computed(() => {
  const total = abilities.value.reduce((sum, item) => sum + item.progress, 0)
  return Math.round(total / abilities.value.length)
})

const nextMilestone = computed(() => '损伤鉴定阶段测验')
</script>

<style scoped>
.dashboard-page {
  display: grid;
  gap: 24px;
}

.hero {
  display: grid;
  grid-template-columns: 1.5fr minmax(280px, 380px);
  gap: 24px;
  align-items: stretch;
  background:
    radial-gradient(circle at top left, rgba(64, 216, 197, 0.22), transparent 40%),
    linear-gradient(135deg, rgba(17, 31, 49, 0.95), rgba(12, 23, 38, 0.92));
}

.eyebrow {
  display: inline-flex;
  margin-bottom: 10px;
  padding: 6px 12px;
  border: 1px solid rgba(64, 216, 197, 0.35);
  border-radius: 999px;
  color: var(--accent);
  font-size: 12px;
}

.hero h1 {
  margin: 0 0 12px;
  font-size: 32px;
}

.hero-text {
  max-width: 700px;
  margin: 0;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.hero-card {
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.04);
}

.hero-card-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 18px;
}

.hero-card-head strong {
  font-size: 32px;
  color: var(--accent);
}

.hero-card-label,
.text-muted {
  color: var(--text-muted);
  font-size: 13px;
}

.hero-metrics {
  display: grid;
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.hero-metrics li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.hero-note {
  margin: 18px 0 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 20px;
}

.status-pill {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 180, 84, 0.15);
  color: var(--accent-2);
  font-size: 12px;
}

.text-link {
  color: var(--accent);
  font-size: 13px;
}

.plan-progress {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
  color: var(--text-muted);
  font-size: 13px;
}

.progress-track {
  position: relative;
  flex: 1;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}

.progress-track.small {
  height: 8px;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), #77e4d6);
}

.plan-list,
.resume-list,
.weakness-list {
  display: grid;
  gap: 14px;
}

.plan-item,
.resume-item,
.weakness-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
}

.plan-item.done {
  border-color: rgba(95, 212, 143, 0.28);
}

.plan-item h3,
.resume-copy h3,
.path-copy h3,
.ability-head h3,
.weakness-item h3,
.quick-item strong {
  margin: 0 0 6px;
  font-size: 15px;
}

.plan-item p,
.resume-copy p,
.path-copy p,
.ability-item p,
.weakness-item p,
.quick-item span {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.plan-state {
  flex-shrink: 0;
  color: var(--accent);
  font-size: 12px;
}

.resume-item {
  align-items: center;
}

.resume-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  flex-shrink: 0;
  font-weight: 700;
}

.resume-badge.knowledge {
  background: rgba(64, 216, 197, 0.16);
  color: var(--accent);
}

.resume-badge.case {
  background: rgba(255, 180, 84, 0.16);
  color: var(--accent-2);
}

.resume-copy {
  flex: 1;
}

.path-track {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.path-step {
  position: relative;
  min-height: 170px;
  padding: 18px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.path-step.done {
  background: linear-gradient(180deg, rgba(95, 212, 143, 0.14), rgba(255, 255, 255, 0.03));
}

.path-step.active {
  background: linear-gradient(180deg, rgba(64, 216, 197, 0.16), rgba(255, 255, 255, 0.04));
  border-color: rgba(64, 216, 197, 0.3);
}

.path-step.locked {
  opacity: 0.72;
}

.path-index {
  display: inline-flex;
  margin-bottom: 18px;
  color: var(--accent);
  font-size: 12px;
  letter-spacing: 0.12em;
}

.path-meta {
  display: inline-flex;
  margin-top: 14px;
  color: var(--accent);
  font-size: 12px;
}

.ability-grid,
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.ability-item,
.quick-item {
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.ability-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.ability-head span {
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
}

.topic-tag {
  display: inline-flex;
  margin-bottom: 10px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 180, 84, 0.16);
  color: var(--accent-2);
  font-size: 12px;
}

.quick-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.quick-item {
  display: grid;
  gap: 6px;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.quick-item:hover {
  transform: translateY(-3px);
  border-color: rgba(64, 216, 197, 0.35);
}

@media (max-width: 1100px) {
  .hero,
  .dashboard-grid,
  .ability-grid,
  .path-track {
    grid-template-columns: 1fr;
  }

  .quick-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .hero {
    gap: 18px;
  }

  .hero h1 {
    font-size: 26px;
  }

  .plan-item,
  .resume-item,
  .weakness-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
