import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickLinks = [
    { 
      id: 'rib-fracture', 
      title: '肋骨骨折AI分析', 
      desc: '上传X光/CT图像，AI智能识别骨折', 
      icon: '🏥', 
      path: '/clinical',
      tag: 'AI核心功能',
      ai: true 
    },
    { 
      id: 'pathology', 
      title: '病理切片AI分析', 
      desc: '上传病理图像，智能分析损伤特征', 
      icon: '🔬', 
      path: '/pathology',
      tag: 'AI核心功能',
      ai: true 
    },
    { 
      id: 'injury-test', 
      title: '伤情自测工具', 
      desc: '根据症状初步评估损伤程度', 
      icon: '📋', 
      path: '/clinical',
      tag: '便捷工具',
      ai: false 
    },
    { 
      id: 'expert', 
      title: '专家咨询', 
      desc: '联系资深法医专家获取专业意见', 
      icon: '👨‍⚕️', 
      path: '/expert',
      tag: '付费咨询',
      ai: false 
    },
  ];

  const news = [
    { id: 1, title: '新功能上线：护理依赖程度评估工具', date: '2026-01-20' },
    { id: 2, title: '法医毒物数据库更新，新增50种常见毒物', date: '2026-01-18' },
    { id: 3, title: '湘雅司法鉴定中心专家入驻平台', date: '2026-01-15' },
  ];

  return (
    <div className="page-container">
      <div className="home-page">
        <section className="hero-section">
          <div className="hero-content">
            <h1>🔬 ForenHub</h1>
            <p className="hero-subtitle">湘雅司法鉴定中心合作平台</p>
            <p className="hero-desc">专业法医鉴定辅助工具平台，助力法医工作者和学习者提升工作效率</p>
            <div className="hero-actions">
              {!user && (
                <>
                  <button onClick={() => navigate('/login')}>立即登录</button>
                  <button className="secondary" onClick={() => navigate('/register')}>注册账号</button>
                </>
              )}
              {user && <button onClick={() => navigate('/clinical')}>开始使用</button>}
            </div>
          </div>
        </section>

        <section className="quick-access">
          <h2>核心服务</h2>
          <div className="tool-grid">
            {quickLinks.map(link => (
              <Link to={link.path} key={link.id} className="tool-card">
                <div className="tool-card-icon">{link.icon}</div>
                <h3>{link.title}</h3>
                <p>{link.desc}</p>
                <span className={`tool-card-tag ${link.ai ? 'ai' : ''}`}>{link.tag}</span>
              </Link>
            ))}
          </div>
        </section>



        <section className="nav-overview">
          <h2>功能导航</h2>
          <div className="tool-grid">
            <Link to="/clinical" className="tool-card">
              <div className="tool-card-icon">🏥</div>
              <h3>法医临床</h3>
              <p>活体损伤鉴定辅助工具库</p>
            </Link>
            <Link to="/pathology" className="tool-card">
              <div className="tool-card-icon">🔬</div>
              <h3>法医病理</h3>
              <p>死因鉴定辅助工具库</p>
            </Link>
            <Link to="/toxicology" className="tool-card">
              <div className="tool-card-icon">☠️</div>
              <h3>法医毒物</h3>
              <p>毒物分析辅助与知识库</p>
            </Link>
            <Link to="/psychiatry" className="tool-card">
              <div className="tool-card-icon">🧠</div>
              <h3>法医精神病</h3>
              <p>精神状态鉴定辅助知识</p>
            </Link>
            <Link to="/evidence" className="tool-card">
              <div className="tool-card-icon">🧬</div>
              <h3>法医物证</h3>
              <p>生物检材检验辅助知识</p>
            </Link>
            <Link to="/expert" className="tool-card">
              <div className="tool-card-icon">👨‍⚕️</div>
              <h3>专家咨询</h3>
              <p>付费咨询业务主阵地</p>
            </Link>
          </div>
        </section>

        <section className="news-section">
          <h2>📢 最新动态</h2>
          <div className="data-list">
            {news.map(item => (
              <div key={item.id} className="data-list-item">
                <div className="list-avatar">📰</div>
                <div className="list-content">
                  <h4>{item.title}</h4>
                </div>
                <div className="list-meta">{item.date}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;