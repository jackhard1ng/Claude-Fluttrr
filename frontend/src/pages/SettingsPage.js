import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Bell,
  BellRing,
  MessageCircle,
  UserPlus,
  MapPin,
  Eye,
  EyeOff,
  Globe,
  Moon,
  Info,
  FileText,
  HelpCircle,
  Star,
  LogOut,
  UserX,
  Briefcase,
} from 'lucide-react';
import Avatar from '../components/common/Avatar';
import { useAuth } from '../contexts/AuthContext';

// ---------------------------------------------------------------------------
// Toggle switch component
// ---------------------------------------------------------------------------
const ToggleSwitch = ({ enabled, onToggle, disabled = false }) => (
  <button
    type="button"
    onClick={() => !disabled && onToggle(!enabled)}
    style={{
      width: '48px',
      height: '28px',
      borderRadius: '14px',
      border: 'none',
      backgroundColor: disabled ? '#1A1E3D' : enabled ? '#0088FF' : '#1A1E3D',
      position: 'relative',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.2s',
      flexShrink: 0,
      opacity: disabled ? 0.5 : 1,
      padding: 0,
    }}
  >
    <div
      style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        backgroundColor: disabled ? '#5A5F7D' : '#fff',
        position: 'absolute',
        top: '3px',
        left: enabled ? '23px' : '3px',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}
    />
  </button>
);

// ---------------------------------------------------------------------------
// Settings row component
// ---------------------------------------------------------------------------
const SettingsRow = ({ icon: Icon, iconColor = '#5A5F7D', label, value, onClick, rightElement, danger = false }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '14px 0',
      cursor: onClick ? 'pointer' : 'default',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      transition: 'background-color 0.15s',
    }}
  >
    {Icon && (
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          backgroundColor: danger ? 'rgba(255,107,107,0.1)' : 'rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={danger ? '#FF6B6B' : iconColor} />
      </div>
    )}
    <div style={{ flex: 1, minWidth: 0 }}>
      <span
        style={{
          color: danger ? '#FF6B6B' : '#E8EAFF',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
    {value && (
      <span
        style={{
          color: '#5A5F7D',
          fontSize: '13px',
          maxWidth: '140px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
    )}
    {rightElement || (
      onClick && <ChevronRight size={18} color="#5A5F7D" />
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Section header component
// ---------------------------------------------------------------------------
const SectionHeader = ({ title }) => (
  <h3
    style={{
      color: '#0088FF',
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      margin: '24px 0 8px',
    }}
  >
    {title}
  </h3>
);

// ---------------------------------------------------------------------------
// SettingsPage
// ---------------------------------------------------------------------------
const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Notification toggles
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [chatMessages, setChatMessages] = useState(true);
  const [newFollowers, setNewFollowers] = useState(true);
  const [nearbyEvents, setNearbyEvents] = useState(false);

  // Privacy toggles
  const [publicProfile, setPublicProfile] = useState(true);
  const [showEventsAttended, setShowEventsAttended] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [allowDMs, setAllowDMs] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0E27',
        fontFamily: 'Inter, sans-serif',
        paddingBottom: '100px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky',
          top: 0,
          backgroundColor: '#0A0E27',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: '#E8EAFF',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ color: '#E8EAFF', fontSize: '18px', fontWeight: 700, margin: 0 }}>
          Settings
        </h1>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* ---- ACCOUNT ---- */}
        <SectionHeader title="Account" />

        {/* Profile row */}
        <div
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 0',
            cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <Avatar
            src={user?.avatar_url}
            name={user?.display_name || 'User'}
            size="lg"
          />
          <div style={{ flex: 1 }}>
            <h4 style={{ color: '#E8EAFF', fontSize: '16px', fontWeight: 600, margin: '0 0 2px' }}>
              {user?.display_name || 'Demo User'}
            </h4>
            <p style={{ color: '#8A8FB5', fontSize: '13px', margin: 0 }}>
              @{user?.username || 'demo_user'}
            </p>
          </div>
          <span style={{ color: '#0088FF', fontSize: '13px', fontWeight: 500 }}>Edit Profile</span>
          <ChevronRight size={16} color="#5A5F7D" />
        </div>

        <SettingsRow
          icon={Mail}
          iconColor="#0088FF"
          label="Email"
          value={user?.email || 'demo@fluttrr.com'}
          onClick={() => {}}
        />
        <SettingsRow
          icon={Phone}
          iconColor="#00D4AA"
          label="Phone"
          value="Not set"
          onClick={() => {}}
        />
        <SettingsRow
          icon={Lock}
          iconColor="#FFB347"
          label="Password"
          value="Change Password"
          onClick={() => {}}
        />
        <SettingsRow
          icon={Briefcase}
          iconColor="#7B61FF"
          label="Account Type"
          value={user?.account_type === 'business' ? 'Business' : 'Personal'}
          onClick={() => {}}
        />

        {/* ---- NOTIFICATIONS ---- */}
        <SectionHeader title="Notifications" />

        <SettingsRow
          icon={Bell}
          iconColor="#0088FF"
          label="Push Notifications"
          rightElement={<ToggleSwitch enabled={pushNotifications} onToggle={setPushNotifications} />}
        />
        <SettingsRow
          icon={Mail}
          iconColor="#00D4AA"
          label="Email Notifications"
          rightElement={<ToggleSwitch enabled={emailNotifications} onToggle={setEmailNotifications} />}
        />
        <SettingsRow
          icon={BellRing}
          iconColor="#FFB347"
          label="Event Reminders"
          rightElement={<ToggleSwitch enabled={eventReminders} onToggle={setEventReminders} />}
        />
        <SettingsRow
          icon={MessageCircle}
          iconColor="#7B61FF"
          label="Chat Messages"
          rightElement={<ToggleSwitch enabled={chatMessages} onToggle={setChatMessages} />}
        />
        <SettingsRow
          icon={UserPlus}
          iconColor="#E040FB"
          label="New Followers"
          rightElement={<ToggleSwitch enabled={newFollowers} onToggle={setNewFollowers} />}
        />
        <SettingsRow
          icon={MapPin}
          iconColor="#FF6B6B"
          label="Nearby Events"
          rightElement={<ToggleSwitch enabled={nearbyEvents} onToggle={setNearbyEvents} />}
        />

        {/* ---- PRIVACY ---- */}
        <SectionHeader title="Privacy" />

        <SettingsRow
          icon={Globe}
          iconColor="#0088FF"
          label="Public Profile"
          rightElement={<ToggleSwitch enabled={publicProfile} onToggle={setPublicProfile} />}
        />
        <SettingsRow
          icon={Eye}
          iconColor="#00D4AA"
          label="Show Events Attended"
          rightElement={<ToggleSwitch enabled={showEventsAttended} onToggle={setShowEventsAttended} />}
        />
        <SettingsRow
          icon={MapPin}
          iconColor="#FFB347"
          label="Show Location"
          rightElement={<ToggleSwitch enabled={showLocation} onToggle={setShowLocation} />}
        />
        <SettingsRow
          icon={MessageCircle}
          iconColor="#7B61FF"
          label="Allow DMs"
          rightElement={<ToggleSwitch enabled={allowDMs} onToggle={setAllowDMs} />}
        />

        {/* ---- APPEARANCE ---- */}
        <SectionHeader title="Appearance" />

        <SettingsRow
          icon={Moon}
          iconColor="#5A5F7D"
          label="Dark Mode"
          rightElement={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#5A5F7D', fontSize: '11px' }}>More themes coming soon</span>
              <ToggleSwitch enabled={true} onToggle={() => {}} disabled={true} />
            </div>
          }
        />

        {/* ---- ABOUT ---- */}
        <SectionHeader title="About" />

        <SettingsRow
          icon={Info}
          iconColor="#5A5F7D"
          label="Version"
          value="1.0.0"
        />
        <SettingsRow
          icon={FileText}
          iconColor="#0088FF"
          label="Terms of Service"
          onClick={() => {}}
        />
        <SettingsRow
          icon={Shield}
          iconColor="#00D4AA"
          label="Privacy Policy"
          onClick={() => {}}
        />
        <SettingsRow
          icon={HelpCircle}
          iconColor="#FFB347"
          label="Help & Support"
          onClick={() => {}}
        />
        <SettingsRow
          icon={Star}
          iconColor="#FFD54F"
          label="Rate Fluttrr"
          onClick={() => {}}
        />

        {/* ---- DANGER ZONE ---- */}
        <SectionHeader title="Danger Zone" />

        <SettingsRow
          icon={UserX}
          label="Deactivate Account"
          onClick={() => {}}
          danger={true}
        />

        {/* Log Out button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: 'transparent',
            border: '1.5px solid #FF6B6B',
            borderRadius: '12px',
            color: '#FF6B6B',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '16px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
