<template>
  <div class="dashboard-page">
    <section class="hero panel">
      <div class="hero-copy">
        <span class="eyebrow">咨询者入口</span>
        <h1>先自测，再咨询，最后看清下一步该怎么做</h1>
        <p class="hero-text">
          这里不直接堆专业术语，而是先帮你用简单步骤了解当前情况，再决定是否进入专家咨询流程。
        </p>
        <div class="hero-actions">
          <router-link class="btn btn-primary" to="/client/check">快速自测</router-link>
          <router-link class="btn" to="/client/consult">预约咨询</router-link>
        </div>
      </div>

      <div class="hero-aside">
        <div class="service-box">
          <span>平均自测时长</span>
          <strong>1 分钟</strong>
        </div>
        <div class="service-box">
          <span>人工咨询反馈</span>
          <strong>1-2 个工作日</strong>
        </div>
        <p class="aside-note">初步检测仅供参考，正式结论仍以专业法医鉴定为准。</p>
      </div>
    </section>

    <section class="process panel">
      <div class="section-header">
        <h2 class="section-title">服务流程</h2>
        <span class="text-muted">把复杂流程拆成 3 步，降低使用焦虑</span>
      </div>
      <div class="process-grid">
        <article v-for="step in processSteps" :key="step.id" class="process-item">
          <span class="process-index">0{{ step.id }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.desc }}</p>
          <router-link class="text-link" :to="step.link">{{ step.action }}</router-link>
        </article>
      </div>
    </section>

    <section class="entry-grid">
      <router-link v-for="entry in quickEntries" :key="entry.title" :to="entry.link" class="panel entry-card">
        <span class="entry-tag">{{ entry.tag }}</span>
        <h2>{{ entry.title }}</h2>
        <p>{{ entry.desc }}</p>
        <strong>{{ entry.meta }}</strong>
      </router-link>
    </section>

    <section class="dashboard-grid">
      <div class="panel">
        <div class="section-header">
          <h2 class="section-title">你最可能关心的问题</h2>
          <span class="text-muted">先给答案，再解释原因</span>
        </div>
        <div class="faq-list">
          <article v-for="faq in faqs" :key="faq.id" class="faq-item">
            <button class="faq-question" @click="toggleFaq(faq.id)">
              <span>{{ faq.q }}</span>
              <span>{{ faq.open ? '收起' : '展开' }}</span>
            </button>
            <p v-if="faq.open" class="faq-answer">{{ faq.a }}</p>
          </article>
        </div>
      </div>

      <div class="panel trust-panel">
        <div class="section-header">
          <h2 class="section-title">安心说明</h2>
          <span class="text-muted">让用户知道边界在哪里</span>
        </div>
        <div class="trust-list">
          <article v-for="item in trustPoints" :key="item.title" class="trust-item">
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="panel next-step">
      <div class="section-header">
        <h2 class="section-title">下一步建议</h2>
        <span class="text-muted">根据不同用户状态提供清晰动作</span>
      </div>
      <div class="next-grid">
        <article v-for="item in nextSteps" :key="item.title" class="next-item">
          <span class="next-label">{{ item.label }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
          <router-link class="btn" :to="item.link">{{ item.action }}</router-link>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const processSteps = ref([
  { id: 1, title: '快速自测', desc: '先做结构化问答，得到初步风险提示和材料建议。', action: '去自测', link: '/client/check' },
  { id: 2, title: '预约咨询', desc: '如果问题较复杂，进入预约或在线问答环节。', action: '去咨询', link: '/client/consult' },
  { id: 3, title: '查看知识说明', desc: '了解流程、材料准备和常见术语的通俗解释。', action: '去查看', link: '/client/knowledge' }
])

const quickEntries = ref([
  { tag: '主入口', title: '初步检测', desc: '适合想先快速判断伤情风险的用户。', meta: '分步填写，结果更易懂', link: '/client/check' },
  { tag: '服务', title: '在线咨询', desc: '适合已有材料、需要专家进一步解释或建议。', meta: '支持预约与问答', link: '/client/consult' },
  { tag: '科普', title: '知识百科', desc: '适合先了解流程、费用、术语和材料准备。', meta: '通俗解释优先', link: '/client/knowledge' }
])

const faqs = ref([
  { id: 1, q: '初步检测能代替正式鉴定吗？', a: '不能。初步检测只用于帮助你理解目前情况和判断是否需要进一步咨询，不能直接作为法律依据。', open: true },
  { id: 2, q: '需要提前准备什么材料？', a: '常见材料包括病历、影像资料、受伤部位照片和既往诊断结果。没有资料也可以先做自测，再按结果补充。', open: false },
  { id: 3, q: '在线咨询多久会有回复？', a: '基础咨询通常在 1 到 2 个工作日内得到回复；如果进入预约流程，会在确认时间后安排专家服务。', open: false },
  { id: 4, q: '费用会不会一开始就很高？', a: '不会。基础知识查询和部分初步问答可以先免费了解，正式服务会在页面中提前说明收费范围。', open: false }
])

const trustPoints = ref([
  { title: '先说人话', desc: '结果页先告诉你意味着什么，再解释专业术语。' },
  { title: '保护隐私', desc: '上传信息仅用于本次评估与咨询，不会公开展示。' },
  { title: '边界明确', desc: '每个结果都会说明适用范围、参考意义和不能替代的部分。' }
])

const nextSteps = ref([
  { label: '还不确定', title: '先做一次快速自测', desc: '如果你还不知道问题严重程度，先从最低门槛的分步检测开始。', action: '开始自测', link: '/client/check' },
  { label: '已有资料', title: '直接进入咨询服务', desc: '如果你已经有病历、影像或医生意见，可以更高效地进入专家咨询。', action: '预约咨询', link: '/client/consult' },
  { label: '想先了解', title: '先看流程与常见问题', desc: '如果你担心费用、时间或不清楚流程，可以先阅读科普和 FAQ。', action: '查看知识库', link: '/client/knowledge' }
])

const toggleFaq = (id) => {
  faqs.value = faqs.value.map((item) => (
    item.id === id
      ? { ...item, open: !item.open }
      : item
  ))
}
</script>

<style scoped>
.dashboard-page {
  display: grid;
  gap: 24px;
}

.hero {
  display: grid;
  grid-template-columns: 1.5fr minmax(260px, 340px);
  gap: 24px;
  align-items: stretch;
  background:
    radial-gradient(circle at top left, rgba(64, 216, 197, 0.22), transparent 36%),
    linear-gradient(135deg, rgba(17, 31, 49, 0.95), rgba(10, 21, 35, 0.94));
}

.eyebrow {
  display: inline-flex;
  margin-bottom: 10px;
  padding: 6px 12px;
  border: 1px solid rgba(64, 216, 197, 0.3);
  border-radius: 999px;
  color: var(--accent);
  font-size: 12px;
}

.hero h1,
.entry-card h2,
.section-title {
  margin: 0;
}

.hero h1 {
  font-size: 31px;
  line-height: 1.35;
}

.hero-text,
.text-muted,
.service-box span,
.aside-note,
.process-item p,
.entry-card p,
.faq-answer,
.trust-item p,
.next-item p {
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.hero-aside {
  display: grid;
  gap: 12px;
}

.service-box {
  padding: 18px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

.service-box strong {
  display: block;
  margin-top: 8px;
  font-size: 24px;
  color: var(--accent);
}

.aside-note {
  margin: 0;
  padding: 16px 18px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.04);
}

.process-grid,
.entry-grid,
.dashboard-grid,
.next-grid {
  display: grid;
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
  font-size: 20px;
}

.process-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.process-item,
.entry-card,
.trust-item,
.next-item {
  padding: 18px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.process-index,
.entry-tag,
.next-label {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(64, 216, 197, 0.14);
  color: var(--accent);
  font-size: 12px;
}

.process-item h3,
.faq-question span:first-child,
.trust-item h3,
.next-item h3 {
  font-size: 16px;
}

.entry-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.entry-card {
  display: grid;
  gap: 10px;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.entry-card:hover,
.next-item:hover {
  transform: translateY(-3px);
  border-color: rgba(64, 216, 197, 0.35);
}

.entry-card strong {
  color: var(--text-main);
  font-size: 13px;
}

.dashboard-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.faq-list,
.trust-list {
  display: grid;
  gap: 12px;
}

.faq-item {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
}

.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 16px;
  border: 0;
  background: transparent;
  color: var(--text-main);
  text-align: left;
  cursor: pointer;
}

.faq-answer {
  margin: 0;
  padding: 0 16px 16px;
}

.trust-panel {
  background:
    radial-gradient(circle at top right, rgba(255, 180, 84, 0.14), transparent 32%),
    rgba(17, 31, 49, 0.86);
}

.next-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.next-item {
  display: grid;
  gap: 12px;
}

.text-link {
  color: var(--accent);
  font-size: 13px;
}

@media (max-width: 1100px) {
  .hero,
  .process-grid,
  .entry-grid,
  .dashboard-grid,
  .next-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .hero h1 {
    font-size: 26px;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
