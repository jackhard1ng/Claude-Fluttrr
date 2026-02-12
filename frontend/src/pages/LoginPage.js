import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Chrome, Smartphone } from 'lucide-react';
import FluttrrLogo from '../components/common/FluttrrLogo';
import { useAuth } from '../contexts/AuthContext';

// ---------------------------------------------------------------------------
// LoginPage
// ---------------------------------------------------------------------------
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ---- helpers ------------------------------------------------------------
  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validate = () => {
    const next = {};
    if (!email.trim()) {
      next.email = 'Email is required';
    } else if (!validateEmail(email)) {
      next.email = 'Please enter a valid email address';
    }
    if (!password) {
      next.password = 'Password is required';
    } else if (password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setErrors({ form: err.message || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@fluttrr.com');
    setPassword('demo1234');
    setErrors({});
  };

  // ---- styles -------------------------------------------------------------
  const inputContainerStyle = {
    position: 'relative',
    width: '100%',
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '14px 16px 14px 44px',
    backgroundColor: '#0D1230',
    border: `1.5px solid ${errors[field] ? '#FF6B6B' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '12px',
    color: '#E8EAFF',
    fontSize: '15px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  });

  const inputFocusProps = (field) => ({
    onFocus: (e) => {
      if (!errors[field]) {
        e.target.style.borderColor = '#0088FF';
        e.target.style.boxShadow = '0 0 0 3px rgba(0,136,255,0.15)';
      }
    },
    onBlur: (e) => {
      if (!errors[field]) {
        e.target.style.borderColor = 'rgba(255,255,255,0.08)';
        e.target.style.boxShadow = 'none';
      }
    },
  });

  const iconStyle = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#5A5F7D',
    pointerEvents: 'none',
  };

  // ---- render -------------------------------------------------------------
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0E27',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(0,136,255,0.08) 0%, rgba(0,136,255,0.02) 40%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <FluttrrLogo size={56} />
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              margin: '16px 0 8px',
              background: 'linear-gradient(135deg, #E8EAFF 0%, #0088FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: '#8A8FB5', fontSize: '14px', margin: 0 }}>
            Sign in to discover what's happening near you
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Form-level error */}
          {errors.form && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(255,107,107,0.1)',
                border: '1px solid rgba(255,107,107,0.3)',
                borderRadius: '10px',
                color: '#FF6B6B',
                fontSize: '13px',
                textAlign: 'center',
              }}
            >
              {errors.form}
            </div>
          )}

          {/* Email */}
          <div>
            <div style={inputContainerStyle}>
              <Mail size={18} style={iconStyle} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                style={inputStyle('email')}
                {...inputFocusProps('email')}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p style={{ color: '#FF6B6B', fontSize: '12px', margin: '4px 0 0 4px' }}>{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div style={inputContainerStyle}>
              <Lock size={18} style={iconStyle} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                style={{ ...inputStyle('password'), paddingRight: '44px' }}
                {...inputFocusProps('password')}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#5A5F7D',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p style={{ color: '#FF6B6B', fontSize: '12px', margin: '4px 0 0 4px' }}>{errors.password}</p>
            )}
          </div>

          {/* Remember me + Forgot password */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: '#8A8FB5',
                fontSize: '13px',
                userSelect: 'none',
              }}
            >
              <div
                onClick={() => setRememberMe(!rememberMe)}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: `1.5px solid ${rememberMe ? '#0088FF' : 'rgba(255,255,255,0.15)'}`,
                  backgroundColor: rememberMe ? '#0088FF' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {rememberMe && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              Remember me
            </label>

            <Link
              to="#"
              style={{
                color: '#0088FF',
                fontSize: '13px',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Forgot Password?
            </Link>
          </div>

          {/* Sign In button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              background: isLoading
                ? 'linear-gradient(135deg, #005BB5, #003D7A)'
                : 'linear-gradient(135deg, #0088FF, #0066CC)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 0.2s, transform 0.1s',
              opacity: isLoading ? 0.7 : 1,
              marginTop: '4px',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.opacity = '1';
            }}
            onMouseDown={(e) => {
              if (!isLoading) e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              if (!isLoading) e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isLoading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            margin: '24px 0',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: '#5A5F7D', fontSize: '13px', whiteSpace: 'nowrap' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Social login buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#0D1230',
              border: '1.5px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              color: '#E8EAFF',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'border-color 0.2s, background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.backgroundColor = '#111640';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.backgroundColor = '#0D1230';
            }}
          >
            <Chrome size={18} />
            Google
          </button>

          <button
            type="button"
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#0D1230',
              border: '1.5px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              color: '#E8EAFF',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'border-color 0.2s, background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.backgroundColor = '#111640';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.backgroundColor = '#0D1230';
            }}
          >
            <Smartphone size={18} />
            Apple
          </button>
        </div>

        {/* Demo hint */}
        <div
          style={{
            marginTop: '20px',
            padding: '10px 14px',
            backgroundColor: 'rgba(0,136,255,0.06)',
            border: '1px solid rgba(0,136,255,0.15)',
            borderRadius: '10px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#8A8FB5', fontSize: '12px', margin: 0 }}>
            Demo:{' '}
            <button
              type="button"
              onClick={fillDemo}
              style={{
                color: '#0088FF',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              demo@fluttrr.com / demo1234
            </button>
          </p>
        </div>

        {/* Sign up link */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '24px',
            color: '#8A8FB5',
            fontSize: '14px',
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            style={{
              color: '#0088FF',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Sign Up
          </Link>
        </p>
      </div>

      {/* Spin animation for loader */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
