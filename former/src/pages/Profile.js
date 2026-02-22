import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analyses');

  const tabs = [
    { id: 'analyses', label: '我的分析' },
    { id: 'consults', label: '我的咨询' },
    { id: 'favorites', label: '我的收藏' },
    { id: 'notifications', label: '消息通知' },
    { id: 'settings', label: '账号设置' },
  ];

  const analyses = [
    { id: 1, type: '肋骨骨折AI诊断', result: '左侧第4、5、6肋骨骨折', date: '2026-01-20', status: '已完成' },
    { id: 2, type: '护理依赖评估', result: '二级护理依赖', date: '2026-01-18', status: '已完成' },
    { id: 3, type: '病理切片分析', result: '损伤病理改变', date: '2026-01-15', status: '已完成' },
    { id: 4, type: '伤情自测', result: '中度损伤', date: '2026-01-10', status: '已完成' },
  ];

  const consults = [
    { id: 1, title: '关于伤残等级评定', expert: '张主任', date: '2026-01-20', status: '待回复' },
    { id: 2, title: '病理切片分析咨询', expert: '李教授', date: '2026-01-15', status: '已完成' },
  ];

  const favorites = [
    { id: 1, title: '法医临床技术标准', type: '标准' },
    { id: 2, title: '器官重量参考', type: '工具' },
    { id: 3, title: 'PMI计算器', type: '工具' },
    { id: 4, title: 'STR分型知识', type: '知识' },
  ];

  const notifications = [
    { id: 1, content: '您的咨询问题已收到回复', time: '2小时前', read: false, icon: '💬' },
    { id: 2, content: '专家"张主任"已接受您的预约', time: '1天前', read: false, icon: '✅' },
    { id: 3, content: '您的分析报告已生成', time: '3天前', read: true, icon: '📋' },
    { id: 4, content: '欢迎使用司法鉴定助手', time: '5天前', read: true, icon: '👋' },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'analyses':
        return <MyAnalyses data={analyses} />;
      case 'consults':
        return <MyConsults data={consults} />;
      case 'favorites':
        return <MyFavorites data={favorites} />;
      case 'notifications':
        return <MyNotifications data={notifications} />;
      case 'settings':
        return <AccountSettings user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div className="profile-header">
        <div className="profile-avatar">{user?.name?.charAt(0) || 'U'}</div>
        <div className="profile-info">
          <h2>{user?.name || '用户'}</h2>
          <p>{user?.role === 'admin' ? '管理员' : user?.role === 'expert' ? '专家' : user?.role === 'forensic' ? '法医' : '普通用户'}</p>
        </div>
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="number">{analyses.length}</div>
            <div className="label">分析记录</div>
          </div>
          <div className="profile-stat">
            <div className="number">{consults.length}</div>
            <div className="label">咨询记录</div>
          </div>
          <div className="profile-stat">
            <div className="number">{favorites.length}</div>
            <div className="label">收藏</div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        {tabs.map(tab => (
          <div 
            key={tab.id} 
            className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
              <span className="notification-badge">
                <span className="count">{notifications.filter(n => !n.read).length}</span>
              </span>
            )}
            {tab.label}
          </div>
        ))}
      </div>

      {renderTab()}
    </div>
  );
};

const MyAnalyses = ({ data }) => {
  const handleExport = (id) => {
    alert(`导出分析报告 #${id}`);
  };

  return (
    <div className="form-card">
      <h2>📊 我的分析</h2>
      <div className="data-list">
        {data.map(item => (
          <div key={item.id} className="data-list-item">
            <div className="list-avatar">🔬</div>
            <div className="list-content">
              <h4>{item.type}</h4>
              <p>{item.result}</p>
            </div>
            <div className="list-meta">
              <div>{item.date}</div>
              <div style={{ color: '#28a745' }}>{item.status}</div>
            </div>
            <div className="list-actions">
              <button onClick={() => handleExport(item.id)}>导出报告</button>
              <button className="secondary" onClick={() => alert('查看详情')}>详情</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MyConsults = ({ data }) => {
  return (
    <div className="form-card">
      <h2>💬 我的咨询</h2>
      <div className="data-list">
        {data.map(item => (
          <div key={item.id} className="data-list-item">
            <div className="list-avatar">👨‍⚕️</div>
            <div className="list-content">
              <h4>{item.title}</h4>
              <p>{item.expert}</p>
            </div>
            <div className="list-meta">
              <div>{item.date}</div>
              <div style={{ color: item.status === '已完成' ? '#28a745' : '#f39c12' }}>{item.status}</div>
            </div>
            <div className="list-actions">
              <button onClick={() => alert('查看对话')}>查看</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MyFavorites = ({ data }) => {
  return (
    <div className="form-card">
      <h2>⭐ 我的收藏</h2>
      <div className="data-list">
        {data.map(item => (
          <div key={item.id} className="data-list-item">
            <div className="list-avatar">📚</div>
            <div className="list-content">
              <h4>{item.title}</h4>
              <p>{item.type}</p>
            </div>
            <div className="list-actions">
              <button onClick={() => alert('跳转查看')}>查看</button>
              <button className="secondary" onClick={() => alert('取消收藏')}>取消</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MyNotifications = ({ data }) => {
  const [notifications, setNotifications] = useState(data);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="form-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🔔 消息通知 {unreadCount > 0 && <span style={{ fontSize: '14px', color: '#e74c3c' }}>({unreadCount}未读)</span>}</h2>
        {unreadCount > 0 && <button onClick={markAllRead} style={{ width: 'auto', padding: '8px 16px' }}>全部已读</button>}
      </div>
      
      <div className="notification-list">
        {notifications.map(item => (
          <div key={item.id} className={`notification-item ${item.read ? '' : 'unread'}`}>
            <div className="notification-icon">{item.icon}</div>
            <div className="notification-content">
              <p>{item.content}</p>
              <span className="time">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AccountSettings = ({ user }) => {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'user',
  });

  const handleSave = () => {
    alert('保存成功');
  };

  return (
    <div className="form-card">
      <h2>⚙️ 账号设置</h2>
      
      <div className="form-grid">
        <div className="form-group">
          <label>用户名</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>邮箱</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label>手机号</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="form-group">
          <label>用户角色</label>
          <input type="text" value={form.role === 'admin' ? '管理员' : form.role === 'expert' ? '专家' : form.role === 'forensic' ? '法医' : '普通用户'} disabled />
        </div>
      </div>

      <div className="form-actions">
        <button onClick={handleSave}>保存修改</button>
      </div>

      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
        <h3 style={{ marginBottom: '16px' }}>安全设置</h3>
        <div className="form-actions">
          <button className="secondary">修改密码</button>
          <button className="secondary">绑定手机</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
