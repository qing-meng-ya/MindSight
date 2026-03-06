import React from 'react';
import TransitionLink from '../components/TransitionLink';
import {
  buildPortalPath,
  countLeafModules,
  roleList,
} from '../data/portalTree';

const PortalHome = () => {
  return (
    <div className="portal-home">
      <section className="hero-banner">
        <p className="hero-kicker">目标对象</p>
        <h1>法医学习者、法医工作者、法医咨询者</h1>
        <p>
          按角色分层进入模块，逐级跳转，不把所有功能堆在同一页面。
          所有卡片点击都使用粒子过渡，单次时长控制在 0.1 秒内。
        </p>
      </section>

      <section className="role-grid">
        {roleList.map((role) => (
          <TransitionLink
            key={role.key}
            to={buildPortalPath(role.key)}
            className="role-card"
            ariaLabel={`进入${role.title}`}
          >
            <span className="role-subtitle">{role.subtitle}</span>
            <h2>{role.title}</h2>
            <p>{role.description}</p>
            <div className="role-meta">
              <span>一级模块 {role.children.length}</span>
              <span>叶子功能 {countLeafModules(role)}</span>
            </div>
          </TransitionLink>
        ))}
      </section>
    </div>
  );
};

export default PortalHome;
