import React from 'react';

const shimmerStyle = {
  background: 'linear-gradient(90deg, #151937 0%, #1E234D 50%, #151937 100%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: '8px',
};

const SkeletonLoader = ({ variant = 'card', count = 1, className = '' }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  const renderSkeleton = (key) => {
    switch (variant) {
      case 'event-card':
        return (
          <div
            key={key}
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: '#151937',
              marginBottom: '16px',
            }}
          >
            <div style={{ ...shimmerStyle, height: '200px', borderRadius: '16px 16px 0 0' }} />
            <div style={{ padding: '16px' }}>
              <div style={{ ...shimmerStyle, height: '12px', width: '80px', marginBottom: '10px' }} />
              <div style={{ ...shimmerStyle, height: '20px', width: '85%', marginBottom: '12px' }} />
              <div style={{ ...shimmerStyle, height: '14px', width: '60%', marginBottom: '8px' }} />
              <div style={{ ...shimmerStyle, height: '14px', width: '45%', marginBottom: '16px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ ...shimmerStyle, height: '14px', width: '100px' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ ...shimmerStyle, height: '24px', width: '24px', borderRadius: '50%' }} />
                  <div style={{ ...shimmerStyle, height: '24px', width: '24px', borderRadius: '50%' }} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'event-compact':
        return (
          <div
            key={key}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#151937',
              borderRadius: '12px',
              marginBottom: '8px',
            }}
          >
            <div style={{ ...shimmerStyle, width: '80px', height: '80px', borderRadius: '10px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ ...shimmerStyle, height: '10px', width: '60px', marginBottom: '8px' }} />
              <div style={{ ...shimmerStyle, height: '16px', width: '80%', marginBottom: '8px' }} />
              <div style={{ ...shimmerStyle, height: '12px', width: '50%', marginBottom: '6px' }} />
              <div style={{ ...shimmerStyle, height: '12px', width: '40%' }} />
            </div>
          </div>
        );

      case 'chat-item':
        return (
          <div
            key={key}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '14px 16px',
              alignItems: 'center',
            }}
          >
            <div style={{ ...shimmerStyle, width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ ...shimmerStyle, height: '16px', width: '50%', marginBottom: '8px' }} />
              <div style={{ ...shimmerStyle, height: '12px', width: '70%' }} />
            </div>
            <div style={{ ...shimmerStyle, height: '10px', width: '30px' }} />
          </div>
        );

      case 'profile':
        return (
          <div key={key}>
            <div style={{ ...shimmerStyle, height: '200px', borderRadius: '0' }} />
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ ...shimmerStyle, width: '80px', height: '80px', borderRadius: '50%', margin: '-50px auto 16px' }} />
              <div style={{ ...shimmerStyle, height: '24px', width: '160px', margin: '0 auto 8px' }} />
              <div style={{ ...shimmerStyle, height: '14px', width: '100px', margin: '0 auto 16px' }} />
              <div style={{ ...shimmerStyle, height: '12px', width: '200px', margin: '0 auto' }} />
            </div>
          </div>
        );

      case 'notification':
        return (
          <div
            key={key}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '14px 16px',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ ...shimmerStyle, width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ ...shimmerStyle, height: '14px', width: '60%', marginBottom: '6px' }} />
              <div style={{ ...shimmerStyle, height: '12px', width: '80%', marginBottom: '6px' }} />
              <div style={{ ...shimmerStyle, height: '10px', width: '40px' }} />
            </div>
          </div>
        );

      default: // card
        return (
          <div
            key={key}
            style={{
              backgroundColor: '#151937',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '12px',
            }}
          >
            <div style={{ ...shimmerStyle, height: '16px', width: '70%', marginBottom: '12px' }} />
            <div style={{ ...shimmerStyle, height: '12px', width: '90%', marginBottom: '8px' }} />
            <div style={{ ...shimmerStyle, height: '12px', width: '55%' }} />
          </div>
        );
    }
  };

  return (
    <div className={`skeleton-loader ${className}`}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      {items.map((_, i) => renderSkeleton(i))}
    </div>
  );
};

export default SkeletonLoader;
