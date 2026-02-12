import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Calendar,
  UserPlus,
  MapPin,
  MessageCircle,
  RefreshCw,
  Store,
  Award,
  Users,
  CheckCheck,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock notifications
// ---------------------------------------------------------------------------
const mockNotifications = [
  {
    id: 'n1',
    type: 'event_reminder',
    title: 'Trivia Night Tomorrow!',
    body: "Tuesday Trivia Night starts tomorrow at 7 PM. Don't forget!",
    created_at: new Date(Date.now() - 1800000),
    is_read: false,
    icon: 'calendar',
  },
  {
    id: 'n2',
    type: 'new_follower',
    title: 'New Follower',
    body: 'Sarah Chen started following you',
    created_at: new Date(Date.now() - 3600000),
    is_read: false,
    sender_avatar: '/api/placeholder/40/40',
    icon: 'user-plus',
  },
  {
    id: 'n3',
    type: 'event_nearby',
    title: 'New Event Nearby',
    body: 'Glow Bowl Friday is happening at Lucky Lanes, just 0.5 miles away!',
    created_at: new Date(Date.now() - 7200000),
    is_read: false,
    icon: 'map-pin',
  },
  {
    id: 'n4',
    type: 'chat_message',
    title: 'New Message',
    body: 'James Park sent a message in Trivia Night Chat',
    created_at: new Date(Date.now() - 14400000),
    is_read: true,
    icon: 'message-circle',
  },
  {
    id: 'n5',
    type: 'event_update',
    title: 'Event Updated',
    body: 'Salsa Night has been updated - new DJ lineup announced!',
    created_at: new Date(Date.now() - 28800000),
    is_read: true,
    icon: 'refresh-cw',
  },
  {
    id: 'n6',
    type: 'business_update',
    title: 'Grindhouse Coffee',
    body: 'Board Game Brunch is coming up next week!',
    created_at: new Date(Date.now() - 86400000),
    is_read: true,
    icon: 'store',
  },
  {
    id: 'n7',
    type: 'achievement',
    title: 'Achievement Unlocked!',
    body: "You've attended 15 events! You're a Social Butterfly!",
    created_at: new Date(Date.now() - 172800000),
    is_read: true,
    icon: 'award',
  },
  {
    id: 'n8',
    type: 'event_going',
    title: 'People are going!',
    body: "12 more people RSVP'd to Glow Bowl Friday",
    created_at: new Date(Date.now() - 259200000),
    is_read: true,
    icon: 'users',
  },
];

// ---------------------------------------------------------------------------
// Icon + color mapping
// ---------------------------------------------------------------------------
const iconMap = {
  calendar: { Icon: Calendar, color: '#0088FF', bg: 'rgba(0,136,255,0.12)' },
  'user-plus': { Icon: UserPlus, color: '#00D4AA', bg: 'rgba(0,212,170,0.12)' },
  'map-pin': { Icon: MapPin, color: '#FFB347', bg: 'rgba(255,179,71,0.12)' },
  'message-circle': { Icon: MessageCircle, color: '#7B61FF', bg: 'rgba(123,97,255,0.12)' },
  'refresh-cw': { Icon: RefreshCw, color: '#E040FB', bg: 'rgba(224,64,251,0.12)' },
  store: { Icon: Store, color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)' },
  award: { Icon: Award, color: '#FFD54F', bg: 'rgba(255,213,79,0.12)' },
  users: { Icon: Users, color: '#26C6DA', bg: 'rgba(38,198,218,0.12)' },
};

// ---------------------------------------------------------------------------
// Tab type mapping
// ---------------------------------------------------------------------------
const TAB_FILTERS = {
  All: () => true,
  Events: (n) => ['event_reminder', 'event_nearby', 'event_update', 'event_going'].includes(n.type),
  Social: (n) => ['new_follower', 'chat_message', 'achievement'].includes(n.type),
  System: (n) => ['business_update'].includes(n.type),
};

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------
const formatRelativeTime = (date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ---------------------------------------------------------------------------
// NotificationsPage
// ---------------------------------------------------------------------------
const NotificationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState(mockNotifications);

  const filteredNotifications = notifications.filter(TAB_FILTERS[activeTab]);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
    );

    // Navigate based on type
    switch (notification.type) {
      case 'event_reminder':
      case 'event_nearby':
      case 'event_update':
      case 'event_going':
        navigate('/explore');
        break;
      case 'new_follower':
        navigate('/profile');
        break;
      case 'chat_message':
        navigate('/chat');
        break;
      case 'business_update':
        navigate('/explore');
        break;
      case 'achievement':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  const tabs = Object.keys(TAB_FILTERS);

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
        <h1 style={{ color: '#E8EAFF', fontSize: '18px', fontWeight: 700, margin: 0, flex: 1 }}>
          Notifications
          {unreadCount > 0 && (
            <span
              style={{
                backgroundColor: '#0088FF22',
                color: '#0088FF',
                fontSize: '12px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '10px',
                marginLeft: '8px',
              }}
            >
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              background: 'none',
              border: 'none',
              color: '#0088FF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
            }}
          >
            <CheckCheck size={16} />
            Mark All Read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const tabCount = tab === 'All'
            ? notifications.length
            : notifications.filter(TAB_FILTERS[tab]).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: isActive ? '#0088FF' : 'rgba(255,255,255,0.04)',
                color: isActive ? '#fff' : '#8A8FB5',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {tab}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  opacity: 0.7,
                }}
              >
                {tabCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      <div style={{ padding: '8px 16px' }}>
        {filteredNotifications.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
            }}
          >
            <Bell
              size={48}
              color="#5A5F7D"
              style={{ marginBottom: '16px', opacity: 0.5 }}
            />
            <h3 style={{ color: '#E8EAFF', fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>
              No notifications
            </h3>
            <p style={{ color: '#5A5F7D', fontSize: '13px', margin: 0 }}>
              You're all caught up! Check back later.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const { Icon, color, bg } = iconMap[notification.icon] || iconMap.calendar;
            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: notification.is_read ? 'transparent' : 'rgba(0,136,255,0.04)',
                  transition: 'background-color 0.15s',
                  marginBottom: '2px',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = notification.is_read
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(0,136,255,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = notification.is_read
                    ? 'transparent'
                    : 'rgba(0,136,255,0.04)';
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color={color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '2px',
                    }}
                  >
                    <h4
                      style={{
                        color: '#E8EAFF',
                        fontSize: '14px',
                        fontWeight: notification.is_read ? 500 : 600,
                        margin: 0,
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {notification.title}
                    </h4>
                    <span
                      style={{
                        color: '#5A5F7D',
                        fontSize: '11px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {formatRelativeTime(notification.created_at)}
                    </span>
                  </div>
                  <p
                    style={{
                      color: '#8A8FB5',
                      fontSize: '13px',
                      margin: 0,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {notification.body}
                  </p>
                </div>

                {/* Unread dot */}
                {!notification.is_read && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#0088FF',
                      flexShrink: 0,
                      marginTop: '6px',
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
