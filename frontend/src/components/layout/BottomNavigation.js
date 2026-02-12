import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, MessageCircle, User, Sparkles } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/discover', icon: Sparkles, label: 'Discover' },
  { path: '/chat', icon: MessageCircle, label: 'Chat', badge: true },
  { path: '/profile', icon: User, label: 'Profile' },
];

const BottomNavigation = ({ unreadMessages = 3 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {navItems.map(({ path, icon: Icon, label, badge }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              className={`bottom-nav-item ${active ? 'active' : ''}`}
              onClick={() => navigate(path)}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <div className="bottom-nav-icon-wrapper">
                {active && <div className="bottom-nav-active-bg" />}
                <Icon
                  size={active ? 24 : 22}
                  strokeWidth={active ? 2.5 : 1.8}
                  className="bottom-nav-icon"
                />
                {badge && unreadMessages > 0 && (
                  <span className="bottom-nav-badge">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </div>
              <span className="bottom-nav-label">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
