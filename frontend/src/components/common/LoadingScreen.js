import React from 'react';
import FluttrrLogo from './FluttrrLogo';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
        background: 'linear-gradient(180deg, #0A0E27 0%, #111638 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <style>{`
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 136, 255, 0.2); }
          50% { box-shadow: 0 0 40px rgba(0, 136, 255, 0.4); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0); opacity: 0; }
          40% { transform: scale(1); opacity: 1; }
        }
        .loading-logo { animation: logoPulse 2s ease-in-out infinite; }
        .loading-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #0088FF; display: inline-block; margin: 0 4px;
          animation: dotPulse 1.4s infinite ease-in-out both;
        }
        .loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }
        .loading-dot:nth-child(3) { animation-delay: 0; }
      `}</style>
      <div className="loading-logo" style={{ marginBottom: '24px' }}>
        <FluttrrLogo size={64} />
      </div>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #0088FF, #00D4AA)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        Fluttrr
      </h2>
      <p style={{ color: '#8B8FAE', fontSize: '14px', marginBottom: '24px' }}>
        {message}
      </p>
      <div>
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
      </div>
    </div>
  );
};

export default LoadingScreen;
