import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { buildPortalPath, roleList } from '../data/portalTree';
import { useAuth } from '../services/AuthContext';

const TRANSITION_MS = 90;
const PARTICLE_COUNT = 28;

const TransitionContext = createContext({ navigateWithParticles: () => {} });

const createParticles = () => {
  const seed = Date.now();
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const angle = ((Math.PI * 2) / PARTICLE_COUNT) * index + Math.random() * 0.4;
    const distance = 36 + Math.random() * 140;
    return {
      id: `${seed}-${index}`,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      dx: `${Math.cos(angle) * distance}px`,
      dy: `${Math.sin(angle) * distance}px`,
      size: `${2 + Math.random() * 5}px`,
      delay: `${Math.random() * 14}ms`,
    };
  });
};

export const useParticleNavigate = () => useContext(TransitionContext);

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const timerRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [transitionState, setTransitionState] = useState({
    active: false,
    particles: [],
  });

  const navItems = useMemo(
    () => [
      { to: '/', label: '首页' },
      ...roleList.map((role) => ({
        to: buildPortalPath(role.key),
        label: role.title,
      })),
    ],
    []
  );

  const navigateWithParticles = useCallback(
    (to) => {
      if (!to || to === location.pathname) {
        setMobileOpen(false);
        return;
      }

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      setMobileOpen(false);
      setTransitionState({ active: true, particles: createParticles() });

      timerRef.current = window.setTimeout(() => {
        navigate(to);
        setTransitionState({ active: false, particles: [] });
      }, TRANSITION_MS);
    },
    [location.pathname, navigate]
  );

  useEffect(
    () => () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    },
    []
  );

  const value = useMemo(() => ({ navigateWithParticles }), [navigateWithParticles]);

  const isActive = (to) => {
    if (to === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(to);
  };

  return (
    <TransitionContext.Provider value={value}>
      <div className="layout-shell">
        <header className="site-header">
          <button
            type="button"
            className="brand"
            onClick={() => navigateWithParticles('/')}
            aria-label="返回首页"
          >
            <span className="brand-mark">FH</span>
            <span className="brand-text">
              <strong>ForenHub</strong>
              <em>法医分层工作台</em>
            </span>
          </button>

          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="切换菜单"
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`site-nav ${mobileOpen ? 'open' : ''}`}>
            {navItems.map((item) => (
              <button
                key={item.to}
                type="button"
                className={`nav-link ${isActive(item.to) ? 'active' : ''}`}
                onClick={() => navigateWithParticles(item.to)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="auth-actions">
            {!user && (
              <>
                <button
                  type="button"
                  className={`auth-btn ${location.pathname === '/login' ? 'active' : ''}`}
                  onClick={() => navigateWithParticles('/login')}
                >
                  登录
                </button>
                <button
                  type="button"
                  className={`auth-btn primary ${location.pathname === '/register' ? 'active' : ''}`}
                  onClick={() => navigateWithParticles('/register')}
                >
                  注册
                </button>
              </>
            )}

            {user && (
              <>
                <span className="user-chip">{user.name || user.username || '已登录用户'}</span>
                <button
                  type="button"
                  className={`auth-btn ${location.pathname === '/profile' ? 'active' : ''}`}
                  onClick={() => navigateWithParticles('/profile')}
                >
                  个人中心
                </button>
              </>
            )}
          </div>
        </header>

        <main className="content-shell">
          <Outlet />
        </main>

        <footer className="site-footer">
          <p>ForenHub 模块化前端 | 粒子跳转过渡时长 0.09 秒</p>
        </footer>

        {transitionState.active && (
          <div className="particle-overlay" aria-hidden="true">
            {transitionState.particles.map((item) => (
              <span
                key={item.id}
                className="particle-dot"
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.size,
                  height: item.size,
                  animationDelay: item.delay,
                  '--dx': item.dx,
                  '--dy': item.dy,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </TransitionContext.Provider>
  );
};

export default Layout;
