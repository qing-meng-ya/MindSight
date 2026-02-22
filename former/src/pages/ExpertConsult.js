import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';

const ExpertConsult = () => {
  const [activeTab, setActiveTab] = useState('experts');
  const { user } = useAuth();

  const tabs = [
    { id: 'experts', label: '专家列表' },
    { id: 'qa', label: '在线问答' },
    { id: 'booking', label: '预约咨询' },
    { id: 'history', label: '咨询记录' },
    { id: 'notice', label: '咨询须知' },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'experts':
        return <ExpertList user={user} />;
      case 'qa':
        return <OnlineQA user={user} />;
      case 'booking':
        return <BookingConsult user={user} />;
      case 'history':
        return <ConsultHistory user={user} />;
      case 'notice':
        return <ConsultNotice />;
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👨‍⚕️ 专家咨询</h1>
        <p>联系资深法医专家，获取专业鉴定意见</p>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <div 
            key={tab.id} 
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {renderTab()}
    </div>
  );
};

const experts = [
  { id: 1, name: '张主任', title: '主任法医师', specialty: '法医病理', experience: '30年', cases: 5000, rating: 4.9, avatar: '张' },
  { id: 2, name: '李教授', title: '教授', specialty: '法医临床', experience: '25年', cases: 4200, rating: 4.8, avatar: '李' },
  { id: 3, name: '王博士', title: '副主任法医师', specialty: '法医毒物', experience: '20年', cases: 3800, rating: 4.9, avatar: '王' },
  { id: 4, name: '赵老师', title: '高级实验师', specialty: '法医物证', experience: '22年', cases: 3500, rating: 4.7, avatar: '赵' },
  { id: 5, name: '刘教授', title: '教授', specialty: '法医精神病', experience: '28年', cases: 3000, rating: 4.8, avatar: '刘' },
];

const ExpertList = ({ user }) => {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? experts : experts.filter(e => e.specialty.includes(filter));

  return (
    <div>
      <div className="search-bar" style={{ marginBottom: '20px' }}>
        <select 
          className="filter-select" 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '150px' }}
        >
          <option value="all">全部专家</option>
          <option value="法医病理">法医病理</option>
          <option value="法医临床">法医临床</option>
          <option value="法医毒物">法医毒物</option>
          <option value="法医物证">法医物证</option>
          <option value="法医精神病">法医精神病</option>
        </select>
      </div>

      <div className="tool-grid">
        {filtered.map(expert => (
          <div key={expert.id} className="expert-card">
            <div className="expert-avatar">{expert.avatar}</div>
            <div className="expert-info">
              <h3>{expert.name}</h3>
              <p className="title">{expert.title}</p>
              <p className="specialty">擅长: {expert.specialty}</p>
              <div className="expert-stats">
                <span>📅 {expert.experience}</span>
                <span>📋 {expert.cases}例</span>
                <span>⭐ {expert.rating}</span>
              </div>
              <div className="expert-actions">
                <button onClick={() => alert('跳转咨询中...')}>立即咨询</button>
                <button className="secondary" onClick={() => alert('跳转预约...')}>预约</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OnlineQA = ({ user }) => {
  const [question, setQuestion] = useState('');
  const [type, setType] = useState('text');
  const [history, setHistory] = useState([
    { id: 1, q: '肋骨骨折几根可以评定伤残？', a: '根据《人体损伤程度鉴定标准》，肋骨骨折2根以上可评定为轻伤二级，6根以上可评定为轻伤一级。具体伤残等级需要根据恢复情况综合评定。', time: '2小时前', expert: '张主任' },
    { id: 2, q: '尸检可以委托哪些机构？', a: '具有法医病理鉴定资质的司法鉴定机构均可接受委托。建议选择经省级以上司法行政部门登记的机构。', time: '1天前', expert: '李教授' },
  ]);

  const handleSubmit = () => {
    if (!question.trim()) return;
    if (!user) {
      alert('请先登录后提问');
      return;
    }
    setHistory([{ id: Date.now(), q: question, a: '专家正在回复中...', time: '刚刚', expert: '待分配' }, ...history]);
    setQuestion('');
  };

  return (
    <div className="form-card">
      <h2>💬 在线问答</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>提出您的法医鉴定问题，专家将尽快解答</p>

      <div className="form-group">
        <label>咨询方式</label>
        <div className="tabs" style={{ marginBottom: '16px' }}>
          {['text', 'voice', 'video'].map(t => (
            <div key={t} className={`tab ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>
              {t === 'text' ? '📝 图文' : t === 'voice' ? '🎤 语音' : '📹 视频'}
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>问题描述</label>
        <textarea 
          rows="4" 
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="请详细描述您的问题..."
          style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
        />
      </div>

      <div className="form-actions">
        <button onClick={handleSubmit}>提交问题</button>
      </div>

      <h3 style={{ marginTop: '30px', marginBottom: '16px' }}>历史问答</h3>
      <div>
        {history.map(item => (
          <div key={item.id} className="qa-item">
            <div className="qa-question">Q: {item.q}</div>
            <div className="qa-answer">
              <strong>{item.expert}：</strong>{item.a}
            </div>
            <div className="qa-meta">
              <span>{item.time}</span>
              <span>有帮助 (0)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BookingConsult = ({ user }) => {
  const [form, setForm] = useState({ expert: '', date: '', time: '', type: '图文', desc: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!user) {
      alert('请先登录后预约');
      return;
    }
    if (!form.expert || !form.date || !form.time) {
      alert('请填写完整信息');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="form-card" style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
        <h2>预约成功！</h2>
        <p style={{ color: '#666', marginTop: '10px' }}>您的预约已提交，专家确认后将发送通知</p>
        <button onClick={() => setSubmitted(false)} style={{ marginTop: '20px' }}>返回预约</button>
      </div>
    );
  }

  return (
    <div className="form-card">
      <h2>📅 预约咨询</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>选择专家和时间进行预约</p>

      <div className="form-grid">
        <div className="form-group">
          <label>选择专家</label>
          <select value={form.expert} onChange={(e) => setForm({ ...form, expert: e.target.value })}>
            <option value="">请选择专家</option>
            {experts.map(e => <option key={e.id} value={e.id}>{e.name} - {e.specialty}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>预约日期</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="form-group">
          <label>预约时间</label>
          <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
            <option value="">请选择时间</option>
            <option value="09:00">09:00 - 10:00</option>
            <option value="10:00">10:00 - 11:00</option>
            <option value="14:00">14:00 - 15:00</option>
            <option value="15:00">15:00 - 16:00</option>
            <option value="16:00">16:00 - 17:00</option>
          </select>
        </div>
        <div className="form-group">
          <label>咨询方式</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="图文">图文咨询</option>
            <option value="语音">语音咨询</option>
            <option value="视频">视频咨询</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>问题描述</label>
        <textarea 
          rows="4" 
          value={form.desc}
          onChange={(e) => setForm({ ...form, desc: e.target.value })}
          placeholder="请简要描述您的问题..."
          style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
        />
      </div>

      <div className="form-actions">
        <button onClick={handleSubmit}>提交预约</button>
      </div>
    </div>
  );
};

const ConsultHistory = ({ user }) => {
  const history = [
    { id: 1, title: '关于伤残等级评定', expert: '张主任', status: '已完成', date: '2026-01-15', type: '图文' },
    { id: 2, title: '病理切片分析咨询', expert: '李教授', status: '已完成', date: '2026-01-10', type: '视频' },
    { id: 3, title: '酒精检测疑问', expert: '王博士', status: '待回复', date: '2026-01-20', type: '图文' },
  ];

  if (!user) {
    return (
      <div className="form-card" style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
        <h2>请先登录</h2>
        <p style={{ color: '#666', marginTop: '10px' }}>登录后可查看您的咨询记录</p>
      </div>
    );
  }

  return (
    <div className="form-card">
      <h2>📋 咨询记录</h2>
      <div className="data-list">
        {history.map(item => (
          <div key={item.id} className="data-list-item">
            <div className="list-avatar">{item.expert.charAt(0)}</div>
            <div className="list-content">
              <h4>{item.title}</h4>
              <p>{item.expert} · {item.type}</p>
            </div>
            <div className="list-meta">
              <div>{item.date}</div>
              <div style={{ color: item.status === '已完成' ? '#28a745' : '#f39c12' }}>{item.status}</div>
            </div>
            <div className="list-actions">
              <button onClick={() => alert('查看详情')}>查看</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ConsultNotice = () => {
  return (
    <div className="form-card">
      <h2>📝 咨询须知</h2>

      <div className="standard-card">
        <h3>服务流程</h3>
        <ol style={{ marginLeft: '20px', color: '#666', lineHeight: '1.8' }}>
          <li>选择专家或提交问题</li>
          <li>选择咨询方式（图文/语音/视频）</li>
          <li>完成咨询并获取回复</li>
          <li>如需正式鉴定报告，请到线下机构办理</li>
        </ol>
      </div>

      <div className="standard-card">
        <h3>咨询费用</h3>
        <ul style={{ marginLeft: '20px', color: '#666', lineHeight: '1.8' }}>
          <li>图文咨询：99-199元/次</li>
          <li>语音咨询：199-399元/30分钟</li>
          <li>视频咨询：299-599元/30分钟</li>
          <li>预约专家：面议</li>
        </ul>
      </div>

      <div className="standard-card">
        <h3>免责声明</h3>
        <ul style={{ marginLeft: '20px', color: '#666', lineHeight: '1.8' }}>
          <li>在线咨询意见仅供参考，不具备法律效力</li>
          <li>正式鉴定需到具有资质的司法鉴定机构办理</li>
          <li>咨询过程中请勿提供敏感个人信息</li>
          <li>本平台对咨询内容严格保密</li>
        </ul>
      </div>

      <div className="standard-card">
        <h3>工作时间</h3>
        <p style={{ color: '#666' }}>周一至周五 9:00-18:00（节假日除外）</p>
        <p style={{ color: '#666' }}>专家回复将在24小时内完成</p>
      </div>
    </div>
  );
};

export default ExpertConsult;
