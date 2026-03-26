<template>
  <div class="dashboard-page">
    <section class="hero panel">
      <div class="hero-copy">
        <span class="eyebrow">法医工作台</span>
        <h1>{{ authStore.user?.name || '法医工作者' }}，今天先处理高优先任务</h1>
        <p class="hero-text">
          工作台重点展示待补资料、待复核结论和最近使用工具，减少来回切换页面的成本。
        </p>
        <div class="hero-actions">
          <router-link class="btn btn-primary" to="/expert/tools">进入专业工具</router-link>
          <router-link class="btn" to="/expert/library">查看标准资料</router-link>
          <router-link class="btn" to="/expert/qa">处理咨询问题</router-link>
        </div>
      </div>

      <div class="hero-summary">
        <article v-for="item in summaryCards" :key="item.label" class="summary-item">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.note }}</p>
        </article>
      </div>
    </section>

    <section class="command-grid">
      <router-link v-for="entry in commandEntries" :key="entry.title" :to="entry.link" class="panel command-card">
        <span class="command-tag">{{ entry.tag }}</span>
        <h2>{{ entry.title }}</h2>
        <p>{{ entry.desc }}</p>
        <strong>{{ entry.meta }}</strong>
      </router-link>
    </section>

    <section class="dashboard-grid">
      <div class="panel">
        <div class="section-header">
          <h2 class="section-title">今日待办</h2>
          <span class="text-muted">{{ openTodoCount }} 项待处理</span>
        </div>
        <div class="todo-list">
          <article v-for="todo in todos" :key="todo.id" class="todo-item" :class="todo.priority">
            <div class="todo-mark"></div>
            <div class="todo-copy">
              <h3>{{ todo.title }}</h3>
              <p>{{ todo.desc }}</p>
              <span>{{ todo.deadline }}</span>
            </div>
            <button class="btn" @click="completeTodo(todo.id)">标记完成</button>
          </article>
        </div>
      </div>

      <div class="panel risk-panel">
        <div class="section-header">
          <h2 class="section-title">风险提醒</h2>
          <span class="text-muted">优先处理会影响结论的异常项</span>
        </div>
        <div class="risk-list">
          <article v-for="risk in risks" :key="risk.id" class="risk-item">
            <div class="risk-copy">
              <span class="risk-level" :class="risk.level">{{ risk.levelLabel }}</span>
              <h3>{{ risk.title }}</h3>
              <p>{{ risk.desc }}</p>
            </div>
            <router-link class="btn" :to="risk.link">去处理</router-link>
          </article>
        </div>
      </div>
    </section>

    <section class="panel board-panel">
      <div class="section-header">
        <h2 class="section-title">案件看板</h2>
        <span class="text-muted">先看状态，再决定进入哪个模块</span>
      </div>
      <div class="board-grid">
        <article v-for="group in caseBoard" :key="group.title" class="board-column">
          <div class="board-head">
            <h3>{{ group.title }}</h3>
            <strong>{{ group.count }}</strong>
          </div>
          <div class="board-list">
            <article v-for="item in group.items" :key="item.id" class="case-card">
              <div>
                <h4>{{ item.title }}</h4>
                <p>{{ item.type }}</p>
              </div>
              <span>{{ item.action }}</span>
            </article>
          </div>
        </article>
      </div>
    </section>

    <section class="dashboard-grid bottom-grid">
      <div class="panel">
        <div class="section-header">
          <h2 class="section-title">最近使用工具</h2>
          <router-link class="text-link" to="/expert/tools">打开工具库</router-link>
        </div>
        <div class="tool-list">
          <article v-for="tool in recentTools" :key="tool.id" class="tool-item">
            <div>
              <h3>{{ tool.name }}</h3>
              <p>{{ tool.scene }}</p>
            </div>
            <span>{{ tool.time }}</span>
          </article>
        </div>
      </div>

      <div class="panel">
        <div class="section-header">
          <h2 class="section-title">快捷入口</h2>
          <span class="text-muted">围绕高频操作组织</span>
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

const summaryCards = ref([
  { label: '进行中案件', value: '08', note: '其中 2 份待补关键材料' },
  { label: '待复核结论', value: '03', note: '建议今天内完成复核' },
  { label: '待回复咨询', value: '05', note: '2 条为高优先级咨询' }
])

const commandEntries = ref([
  { tag: '高频', title: '开始专业计算', desc: '直接进入法医计算与辅助判断工具。', meta: '含关节、烧伤、护理期等工具', link: '/expert/tools' },
  { tag: '依据', title: '查阅标准资料', desc: '快速定位标准规范、模板和案例参考。', meta: '适合复核前查依据', link: '/expert/library' },
  { tag: '协作', title: '处理咨询答疑', desc: '集中处理用户问题与专业问答。', meta: '统一沉淀常见问题', link: '/expert/qa' }
])

const todos = ref([
  { id: 1, title: '补充 CT 影像说明', desc: '交通事故损伤鉴定缺少影像描述摘要。', deadline: '今日 18:00 前', priority: 'high', done: false },
  { id: 2, title: '复核护理期结论', desc: '两份报告已完成计算，待结合病程复核。', deadline: '今日 20:00 前', priority: 'medium', done: false },
  { id: 3, title: '回复用户关于伤残评级咨询', desc: '需说明材料准备要求与正式流程。', deadline: '今日内回复', priority: 'low', done: false }
])

const risks = ref([
  { id: 1, title: '案件 2026-041 缺少年龄信息', desc: '年龄会影响护理期与伤残判断，建议先补录。', level: 'high', levelLabel: '高风险', link: '/expert/library' },
  { id: 2, title: '关节活动度出现异常值', desc: '上次录入右肩活动范围超出合理区间，需回看原始材料。', level: 'medium', levelLabel: '待核验', link: '/expert/tools' },
  { id: 3, title: '答疑结论未沉淀到资料库', desc: '近期高频问题建议整理成标准答复模板。', level: 'low', levelLabel: '可优化', link: '/expert/qa' }
])

const caseBoard = ref([
  {
    title: '待处理',
    count: 2,
    items: [
      { id: 1, title: '交通事故损伤鉴定', type: '待补资料', action: '先补材料' },
      { id: 2, title: '工伤鉴定咨询', type: '待判断适用标准', action: '先查依据' }
    ]
  },
  {
    title: '处理中',
    count: 4,
    items: [
      { id: 3, title: '故意伤害案件', type: '已完成计算', action: '待写结论' },
      { id: 4, title: '烧伤伤情评估', type: '护理期计算中', action: '继续计算' }
    ]
  },
  {
    title: '待复核',
    count: 3,
    items: [
      { id: 5, title: '术后功能障碍评估', type: '等待复核依据', action: '比对标准' },
      { id: 6, title: '营养期评估', type: '等待二审意见', action: '整理说明' }
    ]
  },
  {
    title: '已归档',
    count: 18,
    items: [
      { id: 7, title: '多发骨折鉴定', type: '报告已归档', action: '可作参考' },
      { id: 8, title: '软组织损伤评估', type: '模板完整', action: '可复用' }
    ]
  }
])

const recentTools = ref([
  { id: 1, name: '关节活动度计算', scene: '用于复核肩关节功能受限程度。', time: '刚刚' },
  { id: 2, name: '护理期计算', scene: '结合恢复周期和损伤部位判断。', time: '2 小时前' },
  { id: 3, name: '烧伤面积估算', scene: '输出面积、等级和注意事项。', time: '昨天' }
])

const quickEntries = ref([
  { title: '专业工具库', desc: '高频计算和专业估算入口', link: '/expert/tools' },
  { title: '资料库', desc: '标准文件、模板和历史参考', link: '/expert/library' },
  { title: '在线答疑', desc: '处理咨询并沉淀常见问题', link: '/expert/qa' },
  { title: '护理评估', desc: '误工、营养、依赖程度相关计算', link: '/expert/nursing' }
])

const openTodoCount = computed(() => todos.value.filter((item) => !item.done).length)

const completeTodo = (id) => {
  const target = todos.value.find((item) => item.id === id)
  if (target) {
    target.done = true
  }
}
</script>

<style scoped>
.dashboard-page {
  display: grid;
  gap: 24px;
}

.hero {
  display: grid;
  grid-template-columns: 1.4fr minmax(320px, 420px);
  gap: 24px;
  align-items: stretch;
  background:
    radial-gradient(circle at top left, rgba(255, 180, 84, 0.18), transparent 34%),
    linear-gradient(135deg, rgba(17, 31, 49, 0.95), rgba(12, 23, 38, 0.94));
}

.eyebrow {
  display: inline-flex;
  margin-bottom: 10px;
  padding: 6px 12px;
  border: 1px solid rgba(255, 180, 84, 0.3);
  border-radius: 999px;
  color: var(--accent-2);
  font-size: 12px;
}

.hero h1 {
  margin: 0 0 12px;
  font-size: 30px;
}

.hero-text,
.text-muted,
.summary-item p,
.command-card p,
.todo-copy p,
.risk-copy p,
.case-card p,
.tool-item p,
.quick-item span {
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.hero-summary {
  display: grid;
  gap: 12px;
}

.summary-item {
  padding: 16px 18px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

.summary-item strong,
.board-head strong {
  font-size: 28px;
  color: var(--accent);
}

.summary-item p {
  margin: 8px 0 0;
}

.command-grid,
.dashboard-grid,
.board-grid,
.quick-grid {
  display: grid;
  gap: 24px;
}

.command-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.command-card {
  display: grid;
  gap: 10px;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.command-card:hover,
.quick-item:hover {
  transform: translateY(-3px);
  border-color: rgba(64, 216, 197, 0.36);
}

.command-tag,
.risk-level {
  display: inline-flex;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
}

.command-tag {
  background: rgba(255, 180, 84, 0.14);
  color: var(--accent-2);
}

.command-card h2,
.section-title {
  margin: 0;
  font-size: 20px;
}

.command-card strong {
  color: var(--text-main);
  font-size: 13px;
}

.dashboard-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.todo-list,
.risk-list,
.tool-list {
  display: grid;
  gap: 14px;
}

.todo-item,
.risk-item,
.tool-item,
.quick-item,
.case-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.todo-item.done {
  opacity: 0.6;
}

.todo-mark {
  width: 10px;
  border-radius: 999px;
  background: var(--line);
}

.todo-item.high .todo-mark {
  background: var(--danger);
}

.todo-item.medium .todo-mark {
  background: var(--warn);
}

.todo-item.low .todo-mark {
  background: var(--ok);
}

.todo-copy,
.risk-copy {
  flex: 1;
}

.todo-copy h3,
.risk-copy h3,
.tool-item h3,
.case-card h4,
.quick-item strong {
  margin: 0 0 6px;
  font-size: 15px;
}

.todo-copy span,
.tool-item span,
.case-card span {
  color: var(--accent);
  font-size: 12px;
}

.risk-panel {
  border-color: rgba(255, 107, 107, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 107, 107, 0.05), rgba(255, 255, 255, 0.02)),
    rgba(17, 31, 49, 0.86);
}

.risk-level.high {
  background: rgba(255, 107, 107, 0.14);
  color: var(--danger);
}

.risk-level.medium {
  background: rgba(255, 209, 102, 0.14);
  color: var(--warn);
}

.risk-level.low {
  background: rgba(95, 212, 143, 0.14);
  color: var(--ok);
}

.board-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.board-column {
  padding: 16px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.board-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 14px;
}

.board-head h3 {
  margin: 0;
  font-size: 16px;
}

.board-list {
  display: grid;
  gap: 12px;
}

.case-card,
.tool-item {
  align-items: center;
}

.case-card h4 {
  margin: 0 0 4px;
}

.text-link {
  color: var(--accent);
  font-size: 13px;
}

.quick-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.quick-item {
  display: grid;
  gap: 6px;
}

@media (max-width: 1100px) {
  .hero,
  .command-grid,
  .dashboard-grid,
  .board-grid {
    grid-template-columns: 1fr;
  }

  .quick-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .hero h1 {
    font-size: 26px;
  }

  .todo-item,
  .risk-item,
  .tool-item,
  .case-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
