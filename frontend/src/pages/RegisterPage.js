import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Coffee,
  Music,
  Dumbbell,
  Palette,
  UtensilsCrossed,
  Dice5,
  Laugh,
  Trophy,
  Sparkles,
  Mic,
  Users,
  Beer,
  Heart,
  Sun,
  Store,
} from 'lucide-react';
import FluttrrLogo from '../components/common/FluttrrLogo';
import { useAuth } from '../contexts/AuthContext';

// ---------------------------------------------------------------------------
// Interest tags
// ---------------------------------------------------------------------------
const INTERESTS = [
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'trivia', label: 'Trivia', icon: Sparkles },
  { id: 'live_music', label: 'Live Music', icon: Music },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'art', label: 'Art', icon: Palette },
  { id: 'food', label: 'Food', icon: UtensilsCrossed },
  { id: 'board_games', label: 'Board Games', icon: Dice5 },
  { id: 'dance', label: 'Dance', icon: Music },
  { id: 'comedy', label: 'Comedy', icon: Laugh },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'yoga', label: 'Yoga', icon: Heart },
  { id: 'outdoor', label: 'Outdoor', icon: Sun },
  { id: 'karaoke', label: 'Karaoke', icon: Mic },
  { id: 'networking', label: 'Networking', icon: Users },
  { id: 'wellness', label: 'Wellness', icon: Heart },
  { id: 'happy_hour', label: 'Happy Hour', icon: Beer },
];

const CITIES = [
  'Austin, TX',
  'Dallas, TX',
  'Houston, TX',
  'San Antonio, TX',
  'Denver, CO',
  'Portland, OR',
  'Nashville, TN',
  'Other',
];

// ---------------------------------------------------------------------------
// Password strength helper
// ---------------------------------------------------------------------------
const getPasswordStrength = (pw) => {
  if (!pw) return { label: '', color: 'transparent', width: '0%' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { label: 'Weak', color: '#FF6B6B', width: '33%' };
  if (score <= 3) return { label: 'Fair', color: '#FFB347', width: '66%' };
  return { label: 'Strong', color: '#00D4AA', width: '100%' };
};

// ---------------------------------------------------------------------------
// RegisterPage
// ---------------------------------------------------------------------------
const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Step 1 fields
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 2 fields
  const [interests, setInterests] = useState([]);
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');

  // Step 3 fields
  const [accountType, setAccountType] = useState('user');

  // ---- validation ---------------------------------------------------------
  const validateStep1 = () => {
    const next = {};
    if (!displayName.trim()) next.displayName = 'Display name is required';
    if (!username.trim()) {
      next.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      next.username = 'Username must be 3-20 characters (letters, numbers, underscores)';
    }
    if (!email.trim()) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Please enter a valid email address';
    }
    if (!password) {
      next.password = 'Password is required';
    } else if (password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next = {};
    if (interests.length === 0) next.interests = 'Select at least one interest';
    if (!city) next.city = 'Please select your city';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ---- handlers -----------------------------------------------------------
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setErrors({});
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      setErrors({});
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const toggleInterest = (id) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    if (errors.interests) setErrors((p) => ({ ...p, interests: undefined }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await register({
        display_name: displayName,
        username,
        email,
        password,
        interests,
        city: city.split(',')[0],
        state: city.split(',')[1]?.trim(),
        bio,
        account_type: accountType,
      });
      navigate('/');
    } catch (err) {
      setErrors({ form: err.message || 'Registration failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  // ---- shared input styles ------------------------------------------------
  const inputContainerStyle = { position: 'relative', width: '100%' };

  const makeInputStyle = (field) => ({
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

  const focusProps = (field) => ({
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

  const passwordStrength = getPasswordStrength(password);

  // ---- step renderers -----------------------------------------------------
  const renderStep1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Display Name */}
      <div>
        <div style={inputContainerStyle}>
          <User size={18} style={iconStyle} />
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              if (errors.displayName) setErrors((p) => ({ ...p, displayName: undefined }));
            }}
            style={makeInputStyle('displayName')}
            {...focusProps('displayName')}
          />
        </div>
        {errors.displayName && (
          <p style={{ color: '#FF6B6B', fontSize: '12px', margin: '4px 0 0 4px' }}>{errors.displayName}</p>
        )}
      </div>

      {/* Username */}
      <div>
        <div style={inputContainerStyle}>
          <AtSign size={18} style={iconStyle} />
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
              if (errors.username) setErrors((p) => ({ ...p, username: undefined }));
            }}
            style={makeInputStyle('username')}
            {...focusProps('username')}
          />
        </div>
        {errors.username && (
          <p style={{ color: '#FF6B6B', fontSize: '12px', margin: '4px 0 0 4px' }}>{errors.username}</p>
        )}
      </div>

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
            style={makeInputStyle('email')}
            {...focusProps('email')}
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
            style={{ ...makeInputStyle('password'), paddingRight: '44px' }}
            {...focusProps('password')}
            autoComplete="new-password"
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
            }}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {/* Password strength indicator */}
        {password && (
          <div style={{ marginTop: '8px' }}>
            <div
              style={{
                height: '4px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: passwordStrength.width,
                  backgroundColor: passwordStrength.color,
                  borderRadius: '4px',
                  transition: 'width 0.3s, background-color 0.3s',
                }}
              />
            </div>
            <p style={{ color: passwordStrength.color, fontSize: '11px', margin: '4px 0 0 4px', fontWeight: 500 }}>
              {passwordStrength.label}
            </p>
          </div>
        )}
        {errors.password && (
          <p style={{ color: '#FF6B6B', fontSize: '12px', margin: '4px 0 0 4px' }}>{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <div style={inputContainerStyle}>
          <Lock size={18} style={iconStyle} />
          <input
            type={showConfirm ? 'text' : 'password'}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined }));
            }}
            style={{ ...makeInputStyle('confirmPassword'), paddingRight: '44px' }}
            {...focusProps('confirmPassword')}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
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
            }}
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p style={{ color: '#FF6B6B', fontSize: '12px', margin: '4px 0 0 4px' }}>{errors.confirmPassword}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Interests */}
      <div>
        <label style={{ color: '#E8EAFF', fontSize: '14px', fontWeight: 600, marginBottom: '10px', display: 'block' }}>
          What are you interested in?
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {INTERESTS.map(({ id, label, icon: Icon }) => {
            const isSelected = interests.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleInterest(id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: `1.5px solid ${isSelected ? '#0088FF' : 'rgba(255,255,255,0.08)'}`,
                  backgroundColor: isSelected ? 'rgba(0,136,255,0.15)' : '#0D1230',
                  color: isSelected ? '#0088FF' : '#8A8FB5',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </div>
        {errors.interests && (
          <p style={{ color: '#FF6B6B', fontSize: '12px', margin: '8px 0 0 4px' }}>{errors.interests}</p>
        )}
      </div>

      {/* City */}
      <div>
        <label style={{ color: '#E8EAFF', fontSize: '14px', fontWeight: 600, marginBottom: '10px', display: 'block' }}>
          Your City
        </label>
        <div style={inputContainerStyle}>
          <MapPin size={18} style={iconStyle} />
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              if (errors.city) setErrors((p) => ({ ...p, city: undefined }));
            }}
            style={{
              ...makeInputStyle('city'),
              appearance: 'none',
              cursor: 'pointer',
              color: city ? '#E8EAFF' : '#5A5F7D',
            }}
          >
            <option value="" disabled>
              Select your city
            </option>
            {CITIES.map((c) => (
              <option key={c} value={c} style={{ backgroundColor: '#0D1230', color: '#E8EAFF' }}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {errors.city && (
          <p style={{ color: '#FF6B6B', fontSize: '12px', margin: '4px 0 0 4px' }}>{errors.city}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label style={{ color: '#E8EAFF', fontSize: '14px', fontWeight: 600, marginBottom: '10px', display: 'block' }}>
          Bio{' '}
          <span style={{ color: '#5A5F7D', fontWeight: 400, fontSize: '12px' }}>(optional)</span>
        </label>
        <textarea
          placeholder="Tell us about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '14px 16px',
            backgroundColor: '#0D1230',
            border: '1.5px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            color: '#E8EAFF',
            fontSize: '15px',
            fontFamily: 'Inter, sans-serif',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#0088FF';
            e.target.style.boxShadow = '0 0 0 3px rgba(0,136,255,0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <label style={{ color: '#E8EAFF', fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
        Choose your account type
      </label>

      {/* User card */}
      <div
        onClick={() => setAccountType('user')}
        style={{
          padding: '20px',
          borderRadius: '16px',
          border: `2px solid ${accountType === 'user' ? '#0088FF' : 'rgba(255,255,255,0.08)'}`,
          backgroundColor: accountType === 'user' ? 'rgba(0,136,255,0.08)' : '#0D1230',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: accountType === 'user'
              ? 'linear-gradient(135deg, #0088FF, #00D4AA)'
              : 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Users size={24} color={accountType === 'user' ? '#fff' : '#5A5F7D'} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#E8EAFF', fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>
            I'm looking for events
          </h3>
          <p style={{ color: '#8A8FB5', fontSize: '13px', margin: 0 }}>
            Discover events, meet people, and explore your city
          </p>
        </div>
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            border: `2px solid ${accountType === 'user' ? '#0088FF' : 'rgba(255,255,255,0.15)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {accountType === 'user' && (
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#0088FF',
              }}
            />
          )}
        </div>
      </div>

      {/* Business card */}
      <div
        onClick={() => setAccountType('business')}
        style={{
          padding: '20px',
          borderRadius: '16px',
          border: `2px solid ${accountType === 'business' ? '#0088FF' : 'rgba(255,255,255,0.08)'}`,
          backgroundColor: accountType === 'business' ? 'rgba(0,136,255,0.08)' : '#0D1230',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: accountType === 'business'
              ? 'linear-gradient(135deg, #0088FF, #7B61FF)'
              : 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Store size={24} color={accountType === 'business' ? '#fff' : '#5A5F7D'} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#E8EAFF', fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>
            I'm a business
          </h3>
          <p style={{ color: '#8A8FB5', fontSize: '13px', margin: 0 }}>
            Create events, grow your audience, and engage your community
          </p>
        </div>
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            border: `2px solid ${accountType === 'business' ? '#0088FF' : 'rgba(255,255,255,0.15)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {accountType === 'business' && (
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#0088FF',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );

  const stepTitles = ['Account', 'About You', 'Account Type'];

  // ---- render -------------------------------------------------------------
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0E27',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(0,136,255,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <FluttrrLogo size={48} />
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              margin: '12px 0 6px',
              background: 'linear-gradient(135deg, #E8EAFF 0%, #0088FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Join Fluttrr
          </h1>
          <p style={{ color: '#8A8FB5', fontSize: '14px', margin: 0 }}>
            Discover events and meet people near you
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '28px' }}>
          {/* Step labels */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            {stepTitles.map((title, i) => (
              <span
                key={title}
                style={{
                  fontSize: '12px',
                  fontWeight: step === i + 1 ? 600 : 400,
                  color: step >= i + 1 ? '#0088FF' : '#5A5F7D',
                  transition: 'color 0.3s',
                }}
              >
                {title}
              </span>
            ))}
          </div>
          {/* Bar */}
          <div
            style={{
              height: '4px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(step / 3) * 100}%`,
                background: 'linear-gradient(90deg, #0088FF, #00D4AA)',
                borderRadius: '4px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

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
              marginBottom: '16px',
            }}
          >
            {errors.form}
          </div>
        )}

        {/* Step content */}
        <div style={{ marginBottom: '24px' }}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: '#0D1230',
                border: '1.5px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                color: '#E8EAFF',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#111640'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0D1230'; }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              style={{
                flex: step === 1 ? 1 : 2,
                padding: '14px',
                background: 'linear-gradient(135deg, #0088FF, #0066CC)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                flex: 2,
                padding: '14px',
                background: isLoading
                  ? 'linear-gradient(135deg, #005BB5, #003D7A)'
                  : 'linear-gradient(135deg, #0088FF, #00D4AA)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isLoading ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.opacity = '1'; }}
            >
              {isLoading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
              {isLoading ? 'Creating Account...' : 'Create Account'}
              {!isLoading && <Check size={16} />}
            </button>
          )}
        </div>

        {/* Sign in link */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '24px',
            color: '#8A8FB5',
            fontSize: '14px',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/auth/login"
            style={{
              color: '#0088FF',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Sign In
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

export default RegisterPage;
