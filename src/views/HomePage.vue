<template>
  <div class="home-page">
    <section class="hero-intro panel">
      <p class="section-note">司法辅助业务平台</p>
      <h1 class="gradient-title">法医专业辅助系统</h1>
      <p class="subtitle">面向法医学习者、工作者、咨询者的专业平台，提供工具、案例、知识与咨询服务。</p>
    </section>

    <section class="role-section">
      <div class="section-head">
        <h2 class="section-title">选择您的角色</h2>
        <span class="section-note">不同角色拥有不同的功能权限</span>
      </div>
      <div class="role-grid">
        <article class="role-card">
          <h3>法医学习者</h3>
          <p>学习法医知识、使用计算工具、浏览案例与社区交流</p>
          <ul class="role-features">
            <li>常用工具（预测 + 计算）</li>
            <li>知识库（法律文件、专业书籍）</li>
            <li>过往案例浏览</li>
            <li>社区讨论</li>
          </ul>
          <div class="role-action">
            <router-link to="/login" class="btn btn-primary">进入学习</router-link>
          </div>
        </article>

        <article class="role-card">
          <h3>法医工作者</h3>
          <p>专业工具库、资料库、在线答疑与护理计算</p>
          <ul class="role-features">
            <li>常用工具库（预测 + 计算）</li>
            <li>常用资料库（标准文件/书籍/案件）</li>
            <li>在线答疑（社区答疑/专业解答）</li>
            <li>护理计算（误工/护理/营养期）</li>
          </ul>
          <div class="role-action">
            <router-link to="/login" class="btn btn-primary">进入工作台</router-link>
          </div>
        </article>

        <article class="role-card">
          <h3>法医咨询者</h3>
          <p>初步检测、在线咨询与基础知识查询</p>
          <ul class="role-features">
            <li>初步检测（骨折/关节/烧伤/手足）</li>
            <li>在线咨询（预约/问答/鉴定师）</li>
            <li>知识库（基础知识/标准规范/FAQ）</li>
          </ul>
          <div class="role-action">
            <router-link to="/login" class="btn btn-primary">开始咨询</router-link>
          </div>
        </article>
      </div>
    </section>

    <section class="tools-overview">
      <div class="section-head">
        <h2 class="section-title">核心工具</h2>
        <span class="section-note">专业法医计算与预测工具</span>
      </div>
      <div class="tools-grid">
        <div class="tool-category">
          <h4>预测工具</h4>
          <div class="tool-list">
            <span class="tool-item">骨折预测</span>
            <span class="tool-item">切片预测</span>
          </div>
        </div>
        <div class="tool-category">
          <h4>计算估算工具</h4>
          <div class="tool-list">
            <span class="tool-item">关节活动损失</span>
            <span class="tool-item">死亡时间估算</span>
            <span class="tool-item">身高推算</span>
            <span class="tool-item">体表面积</span>
            <span class="tool-item">烧伤面积</span>
            <span class="tool-item">血液酒精</span>
            <span class="tool-item">车祸赔偿</span>
            <span class="tool-item">工伤赔偿</span>
            <span class="tool-item">瘢痕面积</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home-page {
  display: grid;
  gap: 28px;
}

.hero-intro {
  text-align: center;
  padding: 40px 24px;
}

.gradient-title {
  margin: 0 0 10px;
  font-size: 32px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--text-muted);
  font-size: 16px;
  margin: 0;
}

.role-section {
  display: grid;
  gap: 18px;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}

.role-card {
  background: rgba(17, 31, 49, 0.86);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 24px;
  transition: transform 0.22s ease, border-color 0.22s ease;
}

.role-card:hover {
  transform: translateY(-4px);
  border-color: rgba(64, 216, 197, 0.6);
}

.role-card h3 {
  margin: 0 0 10px;
  font-size: 22px;
}

.role-card > p {
  margin: 0 0 14px;
  color: var(--text-muted);
  font-size: 14px;
}

.role-features {
  margin: 0 0 18px;
  padding-left: 18px;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.8;
}

.role-features li {
  margin-bottom: 4px;
}

.role-action {
  display: flex;
  justify-content: center;
}

.tools-overview {
  display: grid;
  gap: 18px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}

.tool-category {
  background: rgba(17, 31, 49, 0.72);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 18px;
}

.tool-category h4 {
  margin: 0 0 14px;
  font-size: 16px;
  color: var(--accent);
}

.tool-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tool-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  font-size: 13px;
  color: var(--text-muted);
}

.section-head {
  text-align: center;
  margin-bottom: 8px;
}

.section-title {
  margin: 0 0 6px;
  font-size: 24px;
}

.section-note {
  color: var(--text-muted);
  font-size: 14px;
}

.section-head .section-note {
  display: block;
}

.section-title {
  margin: 0;
}

@media (max-width: 760px) {
  .role-grid, .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .gradient-title {
    font-size: 24px;
  }
}
</style>