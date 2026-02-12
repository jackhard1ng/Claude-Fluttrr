import React from 'react';

const FluttrrLogo = ({ size = 40, color = '#0088FF', className = '' }) => {
  const scale = size / 40;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`fluttrr-logo ${className}`}
    >
      <defs>
        <linearGradient id="wingGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0088FF" />
          <stop offset="100%" stopColor="#00D4AA" />
        </linearGradient>
        <linearGradient id="wingGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0066CC" />
          <stop offset="100%" stopColor="#0088FF" />
        </linearGradient>
        <linearGradient id="bodyGradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#00AAFF" />
          <stop offset="100%" stopColor="#0066CC" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Left upper wing */}
      <path
        d="M18 18C14 14 6 10 4 12C2 14 8 18 12 20C14 20.5 16 20 18 18Z"
        fill="url(#wingGradient1)"
        opacity="0.9"
        filter="url(#glow)"
      />
      {/* Right upper wing */}
      <path
        d="M22 18C26 14 34 10 36 12C38 14 32 18 28 20C26 20.5 24 20 22 18Z"
        fill="url(#wingGradient1)"
        opacity="0.9"
        filter="url(#glow)"
      />
      {/* Left lower wing */}
      <path
        d="M18 22C13 24 6 30 8 32C10 34 15 28 17 25C18 23.5 18 22.5 18 22Z"
        fill="url(#wingGradient2)"
        opacity="0.85"
      />
      {/* Right lower wing */}
      <path
        d="M22 22C27 24 34 30 32 32C30 34 25 28 23 25C22 23.5 22 22.5 22 22Z"
        fill="url(#wingGradient2)"
        opacity="0.85"
      />
      {/* Body */}
      <ellipse
        cx="20"
        cy="21"
        rx="2.5"
        ry="5"
        fill="url(#bodyGradient)"
      />
      {/* Head */}
      <circle cx="20" cy="15" r="2.2" fill="url(#bodyGradient)" />
      {/* Antennae */}
      <path
        d="M19 13C18 10 16 8 15 7.5"
        stroke="#0088FF"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M21 13C22 10 24 8 25 7.5"
        stroke="#0088FF"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      {/* Antennae tips */}
      <circle cx="14.5" cy="7" r="1" fill="#00D4AA" opacity="0.9" />
      <circle cx="25.5" cy="7" r="1" fill="#00D4AA" opacity="0.9" />
    </svg>
  );
};

export default FluttrrLogo;
