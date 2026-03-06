import React from 'react';
import { useParams } from 'react-router-dom';
import TransitionLink from '../components/TransitionLink';
import {
  buildPortalPath,
  findPortalNode,
  getRolePortal,
  resolvePortalTrail,
} from '../data/portalTree';

const PortalNodePage = () => {
  const params = useParams();
  const roleKey = params.role;
  const pathSegments = (params['*'] || '').split('/').filter(Boolean);
  const role = getRolePortal(roleKey);
  const node = findPortalNode(roleKey, pathSegments);
  const trail = resolvePortalTrail(roleKey, pathSegments);

  if (!role || !node) {
    return (
      <section className="node-page">
        <div className="node-empty">
          <h2>未找到模块</h2>
          <p>当前路径不存在，请返回首页重新选择目标对象。</p>
          <TransitionLink to="/" className="inline-action">
            返回首页
          </TransitionLink>
        </div>
      </section>
    );
  }

  const childNodes = node.children || [];
  const hasChildren = childNodes.length > 0;

  return (
    <section className="node-page">
      <div className="breadcrumbs">
        <TransitionLink to="/" className="crumb-link">
          首页
        </TransitionLink>
        {trail.map((item, index) => (
          <React.Fragment key={`${item.slug}-${index}`}>
            <span className="crumb-sep">/</span>
            <TransitionLink
              to={buildPortalPath(item.roleKey, item.segments)}
              className="crumb-link"
            >
              {item.title}
            </TransitionLink>
          </React.Fragment>
        ))}
      </div>

      <header className="node-header">
        <p className="node-role">{role.title}</p>
        <h1>{node.title}</h1>
        <p>{node.description || '该模块已拆分为独立页面入口。'}</p>
      </header>

      {hasChildren && (
        <div className="module-grid">
          {childNodes.map((child) => {
            const nextPath = buildPortalPath(roleKey, [...pathSegments, child.slug]);
            return (
              <TransitionLink
                key={child.slug}
                to={nextPath}
                className="module-card"
                ariaLabel={`进入${child.title}`}
              >
                <h2>{child.title}</h2>
                <p>{child.description || '点击进入该子模块。'}</p>
                <span className="module-chip">
                  {child.children && child.children.length ? `子模块 ${child.children.length}` : '终端功能页'}
                </span>
              </TransitionLink>
            );
          })}
        </div>
      )}

      {!hasChildren && (
        <div className="leaf-card">
          <h2>{node.title}</h2>
          <p>
            当前为独立功能页入口。后续可在该页面接入表单、计算器、模型推理或资料检索等具体业务组件。
          </p>
          <div className="leaf-actions">
            <TransitionLink
              to={buildPortalPath(roleKey)}
              className="inline-action"
            >
              返回角色首页
            </TransitionLink>
            <TransitionLink to="/" className="inline-action secondary">
              切换目标对象
            </TransitionLink>
          </div>
        </div>
      )}
    </section>
  );
};

export default PortalNodePage;
