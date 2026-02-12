import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, MapPin, ChevronDown } from 'lucide-react';
import FluttrrLogo from '../common/FluttrrLogo';

const Header = ({
  title,
  showLogo = false,
  showSearch = false,
  showNotifications = true,
  showLocation = false,
  location = 'Austin, TX',
  unreadNotifications = 3,
  transparent = false,
  onSearchClick,
  children
}) => {
  const navigate = useNavigate();

  return (
    <header className={`header ${transparent ? 'header-transparent' : ''}`}>
      <div className="header-inner">
        <div className="header-left">
          {showLogo ? (
            <div className="header-logo-section" onClick={() => navigate('/')}>
              <FluttrrLogo size={32} />
              <span className="header-brand">Fluttrr</span>
            </div>
          ) : (
            <h1 className="header-title">{title}</h1>
          )}
          {showLocation && (
            <button className="header-location-btn" onClick={() => {}}>
              <MapPin size={14} />
              <span>{location}</span>
              <ChevronDown size={12} />
            </button>
          )}
        </div>

        <div className="header-right">
          {children}
          {showSearch && (
            <button
              className="header-icon-btn"
              onClick={onSearchClick || (() => navigate('/search'))}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          )}
          {showNotifications && (
            <button
              className="header-icon-btn"
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="header-notification-badge">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
