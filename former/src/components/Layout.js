import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const navItems = [
    { path: '/', label: '首页', public: true },
    { path: '/clinical', label: '法医临床', public: false },
    { path: '/pathology', label: '法医病理', public: false },
    { path: '/toxicology', label: '法医毒化', public: true },
    { path: '/psychiatry', label: '法医精神病', public: true },
    { path: '/evidence', label: '法医物证', public: true },
    { path: '/expert', label: '专家咨询', public: true },
    { path: '/profile', label: '个人中心', public: false },
  ];

  const handleNavClick = (item) => {
    if (!item.public && !user) {
      navigate('/login');
      return;
    }
    setActiveMenu(item.path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-left">
          <Link to="/" className="logo">
            <span className="logo-icon">⚖️</span>
            <span className="logo-text">司法鉴定助手</span>
          </Link>
          <span className="partner-badge">湘雅司法鉴定中心合作</span>
        </div>
        
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav ${mobileMenuOpen ? 'open' : ''}`}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''} ${!item.public ? 'protected' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              {item.label}
              {!item.public && <span className="lock-icon">🔒</span>}
            </Link>
          ))}
        </nav>

        <div className="header-right">
          {user ? (
            <>
              <Link to="/profile" className="user-info">
                <span className="user-avatar">{user.name?.charAt(0) || 'U'}</span>
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role === 'admin' ? '管理员' : user.role === 'expert' ? '专家' : user.role === 'forensic' ? '法医' : '用户'}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn">退出</button>
            </>
          ) : (
            <Link to="/login" className="login-btn">登录</Link>
          )}
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-content">
          <p>© 2026 司法鉴定助手 | 湘雅司法鉴定中心合作</p>
          <p className="footer-desc">专业法医鉴定辅助平台</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
