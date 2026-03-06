import React, { useMemo, useState } from 'react';
import { useParticleNavigate } from '../components/Layout';
import { useAuth } from '../services/AuthContext';

const tabs = [
  { id: 'analyses', label: '我的分析' },
  { id: 'consults', label: '我的咨询' },
  { id: 'favorites', label: '我的收藏' },
  { id: 'settings', label: '账号设置' },
];

const Profile = () => {
  const { user, logout } = useAuth();
  const { navigateWithParticles } = useParticleNavigate();
  const [activeTab, setActiveTab] = useState('analyses');

  const analyses = useMemo(
    () => [
      { id: 1, title: '骨折预测', summary: '左侧第 4 肋疑似骨折', date: '2026-03-14' },
      { id: 2, title: '烧伤面积计算', summary: '估算面积 12%', date: '2026-03-12' },
    ],
    []
  );

  const consults = useMemo(
    () => [
      { id: 1, title: '损伤等级咨询', summary: '等待专家回复', date: '2026-03-11' },
      { id: 2, title: '影像分析复核', summary: '已完成', date: '2026-03-08' },
    ],
    []
  );

  const favorites = useMemo(
    () => [
      { id: 1, title: '法医基础知识', type: '知识库' },
      { id: 2, title: '标准规范文件', type: '资料库' },
    ],
    []
  );

  const handleLogout = () => {
    logout();
    navigateWithParticles('/login');
  };

  return (
    <div className="page-container">
      <div className="profile-header">
        <div className="profile-avatar">{(user?.name || user?.username || 'U').charAt(0)}</div>
        <div className="profile-info">
          <h2>{user?.name || user?.username || '用户'}</h2>
          <p>{user?.role || 'forensic'}</p>
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
        <button type="button" className="header-logout-btn" onClick={handleLogout}>
          退出登录
        </button>
      </div>

      <div className="profile-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'analyses' && (
        <div className="form-card">
          <h2>我的分析</h2>
          <div className="data-list">
            {analyses.map((item) => (
              <div key={item.id} className="data-list-item">
                <div className="list-avatar">分</div>
                <div className="list-content">
                  <h4>{item.title}</h4>
                  <p>{item.summary}</p>
                </div>
                <div className="list-meta">{item.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'consults' && (
        <div className="form-card">
          <h2>我的咨询</h2>
          <div className="data-list">
            {consults.map((item) => (
              <div key={item.id} className="data-list-item">
                <div className="list-avatar">咨</div>
                <div className="list-content">
                  <h4>{item.title}</h4>
                  <p>{item.summary}</p>
                </div>
                <div className="list-meta">{item.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="form-card">
          <h2>我的收藏</h2>
          <div className="data-list">
            {favorites.map((item) => (
              <div key={item.id} className="data-list-item">
                <div className="list-avatar">藏</div>
                <div className="list-content">
                  <h4>{item.title}</h4>
                  <p>{item.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="form-card">
          <h2>账号设置</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>用户名</label>
              <input type="text" value={user?.username || ''} disabled />
            </div>
            <div className="form-group">
              <label>姓名</label>
              <input type="text" value={user?.name || ''} disabled />
            </div>
            <div className="form-group">
              <label>角色</label>
              <input type="text" value={user?.role || ''} disabled />
            </div>
          </div>

          <div className="logout-panel">
            <h3>账号操作</h3>
            <button type="button" className="danger-btn" onClick={handleLogout}>
              退出当前账号
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
