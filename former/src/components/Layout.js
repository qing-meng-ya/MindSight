import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const navItems = [
    { path: '/', label: '首页', public: true },
    { path: '/clinical', label: '法医临床', public: true },
    { path: '/pathology', label: '法医病理', public: true },
    { path: '/toxicology', label: '法医毒化', public: true },
    { path: '/psychiatry', label: '法医精神病', public: true },
    { path: '/evidence', label: '法医物证', public: true },
    { path: '/expert', label: '专家咨询', public: true },
    { path: '/profile', label: '个人中心', public: true },
  ];

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
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu(item.path);
                setMobileMenuOpen(false);
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
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
