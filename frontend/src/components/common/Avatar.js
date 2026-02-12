import React from 'react';

const sizeMap = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 80,
  xxl: 120,
};

const fontSizeMap = {
  xs: 11,
  sm: 13,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const stringToColor = (str) => {
  if (!str) return '#0088FF';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['#0088FF', '#00D4AA', '#7B61FF', '#FF6B6B', '#FFB347', '#E040FB', '#26C6DA'];
  return colors[Math.abs(hash) % colors.length];
};

const Avatar = ({
  src,
  name,
  size = 'md',
  isOnline,
  showOnlineIndicator = false,
  className = '',
  onClick,
  style = {},
}) => {
  const dimension = typeof size === 'number' ? size : sizeMap[size] || 44;
  const fontSize = typeof size === 'number' ? size * 0.38 : fontSizeMap[size] || 16;
  const bgColor = stringToColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={`avatar avatar-${typeof size === 'string' ? size : 'md'} ${className}`}
      style={{
        width: dimension,
        height: dimension,
        minWidth: dimension,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}
    >
      {src && src !== '/api/placeholder/150/150' ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%',
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div
        style={{
          display: src && src !== '/api/placeholder/150/150' ? 'none' : 'flex',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${bgColor}, ${bgColor}88)`,
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: fontSize,
          fontWeight: 600,
          color: '#fff',
          userSelect: 'none',
          letterSpacing: '0.5px',
        }}
      >
        {initials}
      </div>
      {showOnlineIndicator && (
        <div
          className={`avatar-online-indicator ${isOnline ? 'online' : 'offline'}`}
          style={{
            position: 'absolute',
            bottom: dimension > 40 ? 2 : 0,
            right: dimension > 40 ? 2 : 0,
            width: Math.max(8, dimension * 0.2),
            height: Math.max(8, dimension * 0.2),
            borderRadius: '50%',
            backgroundColor: isOnline ? '#00D4AA' : '#5A5F7D',
            border: `2px solid var(--bg-primary, #0A0E27)`,
          }}
        />
      )}
    </div>
  );
};

export default Avatar;
