<template>
  <div class="consult-page">
    <div class="section-head">
      <h1 class="section-title">咨询服务</h1>
      <p class="section-note">预约咨询、在线问答与实时聊天</p>
    </div>
    <div class="consult-tabs">
      <button class="tab-btn" :class="{ active: activeTab === 'book' }" @click="activeTab = 'book'">预约咨询</button>
      <button class="tab-btn" :class="{ active: activeTab === 'chat' }" @click="activeTab = 'chat'">实时聊天</button>
      <button class="tab-btn" :class="{ active: activeTab === 'qa' }" @click="activeTab = 'qa'">在线问答</button>
      <button class="tab-btn" :class="{ active: activeTab === 'progress' }" @click="activeTab = 'progress'">服务进度</button>
    </div>
    <div v-if="activeTab === 'book'" class="book-section">
      <div class="experts-grid">
        <div v-for="exp in experts" :key="exp.id" class="expert-card panel">
          <div class="expert-avatar">{{ exp.avatar }}</div>
          <div class="expert-info">
            <h3>{{ exp.name }}</h3>
            <p class="expert-title">{{ exp.title }}</p>
            <p class="expert-desc">{{ exp.desc }}</p>
            <div class="expert-tags">
              <span v-for="tag in exp.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <div class="expert-stats">
              <span>咨询量 {{ exp.consultCount }}</span>
              <span>评分 {{ exp.rating }}</span>
            </div>
          </div>
          <button class="btn btn-primary" @click="bookAppointment(exp)">预约</button>
        </div>
      </div>
    </div>
    <div v-if="activeTab === 'chat'" class="chat-section">
      <div class="chat-layout panel">
        <div class="chat-sidebar">
          <div class="chat-search">
            <input v-model="chatSearch" type="text" placeholder="搜索会话..." />
          </div>
          <div class="chat-list">
            <div v-for="session in filteredSessions" :key="session.id" class="chat-session" :class="{ active: currentSession?.id === session.id }" @click="selectSession(session)">
              <div class="session-avatar">{{ session.avatar }}</div>
              <div class="session-info">
                <div class="session-name">{{ session.name }}</div>
                <div class="session-preview">{{ session.lastMessage }}</div>
              </div>
              <div class="session-meta">
                <span class="session-time">{{ session.lastTime }}</span>
                <span v-if="session.unread > 0" class="unread-badge">{{ session.unread }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="chat-main">
          <div v-if="currentSession" class="chat-room">
            <div class="chat-header">
              <span class="chat-name">{{ currentSession.name }}</span>
              <span class="chat-status" :class="{ online: currentSession.online }">{{ currentSession.online ? '在线' : '离线' }}</span>
            </div>
            <div class="chat-messages" ref="messageContainer">
              <div v-for="msg in currentSession.messages" :key="msg.id" class="message" :class="{ self: msg.isSelf }">
                <div class="message-avatar">{{ msg.isSelf ? '我' : msg.avatar }}</div>
                <div class="message-content">
                  <div class="message-bubble">{{ msg.text }}</div>
                  <div class="message-time">{{ msg.time }}</div>
                </div>
              </div>
            </div>
            <div class="chat-input-area">
              <textarea v-model="chatInput" placeholder="输入消息..." rows="2" @keydown.enter.prevent="sendMessage"></textarea>
              <button class="btn btn-primary" @click="sendMessage">发送</button>
            </div>
          </div>
          <div v-else class="chat-empty"><p>选择一个会话开始聊天</p></div>
        </div>
      </div>
    </div>
    <div v-if="activeTab === 'qa'" class="qa-section">
      <div class="qa-form panel">
        <h3>提交问题</h3>
        <div class="form-group">
          <label>问题标题</label>
          <input v-model="qaForm.title" type="text" placeholder="简要描述您的问题" />
        </div>
        <div class="form-group">
          <label>问题详情</label>
          <textarea v-model="qaForm.content" placeholder="请详细描述您的情况和疑问..." rows="4"></textarea>
        </div>
        <div class="form-group">
          <label>相关类型</label>
          <select v-model="qaForm.type">
            <option value="injury">损伤鉴定</option>
            <option value="disability">伤残评级</option>
            <option value="compensation">赔偿计算</option>
            <option value="process">流程咨询</option>
            <option value="other">其他</option>
          </select>
        </div>
        <button class="btn btn-primary" @click="submitQuestion">提交问题</button>
      </div>
      <div class="qa-list">
        <div v-for="q in questions" :key="q.id" class="qa-item panel">
          <div class="qa-header">
            <span class="qa-type">{{ q.typeLabel }}</span>
            <span class="qa-status" :class="q.status">{{ q.statusLabel }}</span>
          </div>
          <h4 class="qa-title">{{ q.title }}</h4>
          <p class="qa-content">{{ q.content }}</p>
          <div class="qa-meta"><span>{{ q.author }} - {{ q.time }}</span></div>
          <div v-if="q.reply" class="qa-reply">
            <div class="reply-author">{{ q.replyAuthor }} 回复：</div>
            <p>{{ q.reply }}</p>
            <span class="reply-time">{{ q.replyTime }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="activeTab === 'progress'" class="progress-section">
      <div class="progress-list">
        <div v-for="item in serviceProgress" :key="item.id" class="progress-card panel">
          <div class="progress-header">
            <h3>{{ item.title }}</h3>
            <span class="progress-status" :class="item.status">{{ item.statusLabel }}</span>
          </div>
          <div class="progress-timeline">
            <div v-for="(step, idx) in item.steps" :key="idx" class="timeline-item" :class="{ done: step.done, current: step.current }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-title">{{ step.title }}</span>
                <span class="timeline-time">{{ step.time }}</span>
              </div>
            </div>
          </div>
          <div class="progress-next" v-if="item.nextAction">
            <span>下一步：{{ item.nextAction }}</span>
            <button class="btn btn-sm" v-if="item.actionable" @click="handleAction(item)">{{ item.actionLabel }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
const activeTab = ref('book')
const chatSearch = ref('')
const chatInput = ref('')
const currentSession = ref(null)
const messageContainer = ref(null)
const experts = ref([
  { id: 1, name: '李法医', avatar: '李', title: '主任法医师', desc: '从事法医鉴定20年，擅长损伤程度鉴定与伤残评级', tags: ['损伤鉴定', '伤残评级'], consultCount: 128, rating: 4.9 },
  { id: 2, name: '王专家', avatar: '王', title: '副主任法医师', desc: '专注病理切片分析与死亡原因鉴定', tags: ['病理分析', '死亡鉴定'], consultCount: 96, rating: 4.8 },
  { id: 3, name: '张医师', avatar: '张', title: '主检法医师', desc: '擅长交通事故损伤鉴定与赔偿计算', tags: ['交通事故', '赔偿计算'], consultCount: 215, rating: 4.7 }
])
const chatSessions = ref([
  { id: 1, name: '李法医', avatar: '李', lastMessage: '请把影像资料发给我看看', lastTime: '10:23', unread: 2, online: true, messages: [
    { id: 1, avatar: '李', text: '您好，我是李法医，请问有什么可以帮您？', time: '10:00', isSelf: false },
    { id: 2, avatar: '我', text: '您好，我想咨询一下关于膝关节损伤鉴定的问题', time: '10:05', isSelf: true },
    { id: 3, avatar: '李', text: '好的，请描述一下您的受伤情况', time: '10:08', isSelf: false },
    { id: 4, avatar: '我', text: '三个月前车祸导致左膝受伤，现在活动还是受限', time: '10:15', isSelf: true },
    { id: 5, avatar: '李', text: '请把影像资料发给我看看', time: '10:23', isSelf: false }
  ]},
  { id: 2, name: '客服小助手', avatar: '客', lastMessage: '您的预约已确认', lastTime: '昨天', unread: 0, online: true, messages: [
    { id: 1, avatar: '客', text: '您好，客服小助手为您服务', time: '昨天', isSelf: false },
    { id: 2, avatar: '客', text: '您的预约已确认', time: '昨天', isSelf: false }
  ]}
])
const filteredSessions = computed(() => chatSessions.value.filter(s => s.name.includes(chatSearch.value)))
const selectSession = (s) => { currentSession.value = s; s.unread = 0; nextTick(() => { if (messageContainer.value) messageContainer.value.scrollTop = messageContainer.value.scrollHeight }) }
const sendMessage = () => { if (!chatInput.value.trim() || !currentSession.value) return; currentSession.value.messages.push({ id: Date.now(), avatar: '我', text: chatInput.value, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), isSelf: true }); chatInput.value = ''; nextTick(() => { if (messageContainer.value) messageContainer.value.scrollTop = messageContainer.value.scrollHeight }) }
const bookAppointment = (exp) => { alert('预约 ' + exp.name + ' 的服务') }
const qaForm = ref({ title: '', content: '', type: 'injury' })
const questions = ref([
  { id: 1, typeLabel: '损伤鉴定', status: 'answered', statusLabel: '已回复', title: '肋骨骨折如何评定伤残等级？', content: '请问多发肋骨骨折在伤残评定中一般是什么等级？', author: '用户A', time: '2024-01-20', reply: '多发肋骨骨折（6根以上）一般可评定为十级伤残，具体需结合功能障碍程度。', replyAuthor: '李法医', replyTime: '2024-01-21' },
  { id: 2, typeLabel: '赔偿计算', status: 'pending', statusLabel: '待回复', title: '交通事故护理期如何计算？', content: '胫骨骨折术后护理期一般是多久？', author: '用户B', time: '2024-01-22' }
])
const submitQuestion = () => { if (!qaForm.value.title.trim() || !qaForm.value.content.trim()) return; const typeMap = { injury: '损伤鉴定', disability: '伤残评级', compensation: '赔偿计算', process: '流程咨询', other: '其他' }; questions.value.unshift({ id: Date.now(), typeLabel: typeMap[qaForm.value.type], status: 'pending', statusLabel: '待回复', title: qaForm.value.title, content: qaForm.value.content, author: '我', time: new Date().toISOString().split('T')[0] }); qaForm.value = { title: '', content: '', type: 'injury' } }
const serviceProgress = ref([
  { id: 1, title: '膝关节损伤鉴定咨询', status: 'processing', statusLabel: '处理中', nextAction: '补充影像资料', actionable: true, actionLabel: '上传资料', steps: [
    { title: '提交咨询申请', time: '2024-01-15', done: true },
    { title: '专家受理', time: '2024-01-16', done: true },
    { title: '补充材料', time: '进行中', current: true },
    { title: '出具意见', time: '待完成', done: false }
  ]},
  { id: 2, title: '交通事故赔偿评估', status: 'completed', statusLabel: '已完成', nextAction: '', actionable: false, steps: [
    { title: '提交资料', time: '2024-01-10', done: true },
    { title: '专家评估', time: '2024-01-12', done: true },
    { title: '出具报告', time: '2024-01-14', done: true }
  ]}
])
const handleAction = (item) => { alert('执行操作: ' + item.actionLabel) }
</script>

<style scoped>
.consult-page { display: grid; gap: 24px; }
.section-head { text-align: center; }
.section-title { margin: 0; font-size: 24px; }
.section-note { color: var(--text-muted); font-size: 14px; margin: 6px 0 0; }
.consult-tabs { display: flex; gap: 10px; justify-content: center; }
.tab-btn { padding: 10px 24px; border: 1px solid var(--line); border-radius: 999px; background: transparent; color: var(--text-muted); font-size: 14px; cursor: pointer; transition: all 0.2s ease; }
.tab-btn:hover, .tab-btn.active { border-color: var(--accent); color: var(--accent); background: rgba(64,216,197,0.1); }
.experts-grid { display: grid; gap: 16px; }
.expert-card { display: flex; align-items: center; gap: 16px; }
.expert-avatar { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; background: var(--accent); border-radius: 50%; font-size: 20px; color: #000; flex-shrink: 0; }
.expert-info { flex: 1; }
.expert-info h3 { margin: 0 0 4px; font-size: 17px; }
.expert-title { margin: 0 0 6px; font-size: 13px; color: var(--accent); }
.expert-desc { margin: 0 0 8px; font-size: 13px; color: var(--text-muted); }
.expert-tags { display: flex; gap: 8px; margin-bottom: 8px; }
.tag { padding: 2px 10px; background: rgba(64,216,197,0.15); border-radius: 999px; font-size: 12px; color: var(--accent); }
.expert-stats { display: flex; gap: 16px; font-size: 12px; color: var(--text-muted); }
.chat-layout { display: grid; grid-template-columns: 280px 1fr; padding: 0; overflow: hidden; min-height: 500px; }
.chat-sidebar { border-right: 1px solid var(--line); display: flex; flex-direction: column; }
.chat-search { padding: 12px; border-bottom: 1px solid var(--line); }
.chat-search input { width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text-main); font-size: 13px; }
.chat-list { flex: 1; overflow-y: auto; }
.chat-session { display: flex; align-items: center; gap: 10px; padding: 12px; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid rgba(255,255,255,0.04); }
.chat-session:hover, .chat-session.active { background: rgba(255,255,255,0.06); }
.session-avatar { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: rgba(64,216,197,0.2); border-radius: 50%; font-size: 14px; color: var(--accent); flex-shrink: 0; }
.session-info { flex: 1; min-width: 0; }
.session-name { font-size: 14px; font-weight: 500; }
.session-preview { font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.session-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.session-time { font-size: 11px; color: var(--text-muted); }
.unread-badge { min-width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; background: var(--danger); color: #fff; font-size: 11px; border-radius: 999px; padding: 0 5px; }
.chat-main { display: flex; flex-direction: column; }
.chat-room { display: flex; flex-direction: column; height: 100%; }
.chat-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--line); }
.chat-name { font-size: 15px; font-weight: 500; }
.chat-status { font-size: 12px; color: var(--text-muted); }
.chat-status.online { color: #5fd48f; }
.chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.message { display: flex; gap: 10px; }
.message.self { flex-direction: row-reverse; }
.message-avatar { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(64,216,197,0.2); border-radius: 50%; font-size: 12px; color: var(--accent); flex-shrink: 0; }
.message.self .message-avatar { background: rgba(255,180,84,0.2); color: var(--accent-2); }
.message-content { max-width: 70%; }
.message-bubble { padding: 10px 14px; background: rgba(255,255,255,0.06); border-radius: var(--radius-sm); font-size: 14px; line-height: 1.5; }
.message.self .message-bubble { background: rgba(64,216,197,0.15); }
.message-time { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
.chat-input-area { display: flex; gap: 10px; padding: 12px 16px; border-top: 1px solid var(--line); }
.chat-input-area textarea { flex: 1; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text-main); font-size: 14px; resize: none; }
.chat-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); }
.qa-form { display: grid; gap: 16px; margin-bottom: 24px; }
.qa-form h3 { margin: 0; font-size: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 13px; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text-main); font-size: 14px; }
.qa-list { display: grid; gap: 16px; }
.qa-item { display: flex; flex-direction: column; gap: 10px; }
.qa-header { display: flex; gap: 10px; }
.qa-type { padding: 2px 10px; background: rgba(64,216,197,0.15); border-radius: 999px; font-size: 12px; color: var(--accent); }
.qa-status { padding: 2px 10px; border-radius: 999px; font-size: 12px; }
.qa-status.pending { background: rgba(255,209,102,0.15); color: #ffd166; }
.qa-status.answered { background: rgba(95,212,143,0.15); color: #5fd48f; }
.qa-title { margin: 0; font-size: 16px; }
.qa-content { margin: 0; font-size: 14px; color: var(--text-muted); line-height: 1.6; }
.qa-meta { font-size: 12px; color: var(--text-muted); }
.qa-reply { padding: 12px; background: rgba(64,216,197,0.08); border-radius: var(--radius-sm); }
.reply-author { font-size: 13px; color: var(--accent); margin-bottom: 4px; }
.qa-reply p { margin: 0 0 4px; font-size: 14px; }
.reply-time { font-size: 11px; color: var(--text-muted); }
.progress-list { display: grid; gap: 16px; }
.progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.progress-header h3 { margin: 0; font-size: 17px; }
.progress-status { padding: 4px 12px; border-radius: 999px; font-size: 12px; }
.progress-status.processing { background: rgba(255,209,102,0.15); color: #ffd166; }
.progress-status.completed { background: rgba(95,212,143,0.15); color: #5fd48f; }
.progress-timeline { display: flex; gap: 8px; margin-bottom: 16px; }
.timeline-item { display: flex; align-items: center; gap: 8px; flex: 1; position: relative; }
.timeline-item:not(:last-child)::after { content: ''; position: absolute; top: 12px; left: 24px; right: -8px; height: 2px; background: var(--line); }
.timeline-item.done:not(:last-child)::after { background: var(--accent); }
.timeline-dot { width: 24px; height: 24px; border-radius: 50%; background: var(--line); display: flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0; z-index: 1; }
.timeline-item.done .timeline-dot { background: var(--accent); color: #000; }
.timeline-item.current .timeline-dot { background: var(--accent-2); color: #000; }
.timeline-content { display: flex; flex-direction: column; gap: 2px; }
.timeline-title { font-size: 13px; }
.timeline-time { font-size: 11px; color: var(--text-muted); }
.progress-next { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--line); font-size: 13px; color: var(--text-muted); }
@media (max-width: 800px) { .chat-layout { grid-template-columns: 1fr; } }
</style>
