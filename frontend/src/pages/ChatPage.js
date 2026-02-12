import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PenSquare,
  Search,
  X,
  Users,
  MessageCircle,
  Building2,
  CalendarDays,
  BellOff,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import Avatar from '../components/common/Avatar';

const mockChatRooms = [
  {
    id: 'r1',
    name: 'Tuesday Trivia Night Chat',
    type: 'event',
    avatar_url: '/api/placeholder/100/100',
    member_count: 67,
    last_message: {
      content: "Can't wait for tomorrow! Anyone need a team?",
      sender_name: 'Sarah Chen',
      type: 'text',
      created_at: new Date(Date.now() - 120000),
    },
    unread_count: 3,
  },
  {
    id: 'r2',
    name: 'BrewHaus Community',
    type: 'business',
    avatar_url: '/api/placeholder/100/100',
    member_count: 234,
    last_message: {
      content: 'New seasonal IPA dropping next week! \u{1F37A}',
      sender_name: 'BrewHaus ATX',
      type: 'text',
      created_at: new Date(Date.now() - 900000),
    },
    unread_count: 5,
  },
  {
    id: 'r3',
    name: 'Sarah Chen',
    type: 'direct',
    avatar_url: '/api/placeholder/100/100',
    isOnline: true,
    last_message: {
      content: 'Hey! Are you going to trivia night?',
      sender_name: 'Sarah Chen',
      type: 'text',
      created_at: new Date(Date.now() - 1800000),
    },
    unread_count: 1,
  },
  {
    id: 'r4',
    name: 'Glow Bowl Friday',
    type: 'event',
    avatar_url: '/api/placeholder/100/100',
    member_count: 145,
    last_message: {
      content: 'Who wants to be on my team?! \u{1F3B3}',
      sender_name: 'Mike Rodriguez',
      type: 'text',
      created_at: new Date(Date.now() - 5400000),
    },
    unread_count: 0,
  },
  {
    id: 'r5',
    name: 'Remote Work Wednesday',
    type: 'event',
    avatar_url: '/api/placeholder/100/100',
    member_count: 28,
    last_message: {
      content: "I'll be there early to grab the corner table!",
      sender_name: 'James Park',
      type: 'text',
      created_at: new Date(Date.now() - 7200000),
    },
    unread_count: 0,
  },
  {
    id: 'r6',
    name: 'Mike Rodriguez',
    type: 'direct',
    avatar_url: '/api/placeholder/100/100',
    isOnline: false,
    last_message: {
      content: 'Sounds good, see you there!',
      sender_name: 'You',
      type: 'text',
      created_at: new Date(Date.now() - 86400000),
    },
    unread_count: 0,
  },
  {
    id: 'r7',
    name: 'Sunrise Yoga Group',
    type: 'event',
    avatar_url: '/api/placeholder/100/100',
    member_count: 32,
    last_message: {
      content: 'Remember to bring your mat!',
      sender_name: 'Flow Yoga',
      type: 'text',
      created_at: new Date(Date.now() - 43200000),
    },
    unread_count: 0,
  },
  {
    id: 'r8',
    name: 'Emma Wilson',
    type: 'direct',
    avatar_url: '/api/placeholder/100/100',
    isOnline: true,
    last_message: {
      content: 'The paint and sip looks amazing!',
      sender_name: 'Emma Wilson',
      type: 'text',
      created_at: new Date(Date.now() - 172800000),
    },
    unread_count: 0,
  },
];

const tabs = [
  { id: 'all', label: 'All', icon: MessageCircle },
  { id: 'event', label: 'Events', icon: CalendarDays },
  { id: 'direct', label: 'Direct', icon: Users },
  { id: 'business', label: 'Business', icon: Building2 },
];

const formatRelativeTime = (date) => {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'event':
      return CalendarDays;
    case 'business':
      return Building2;
    case 'direct':
      return null;
    default:
      return MessageCircle;
  }
};

const ChatPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mutedChats] = useState(['r7']);

  const filteredChats = mockChatRooms.filter((room) => {
    const matchesTab = activeTab === 'all' || room.type === activeTab;
    const matchesSearch =
      !searchQuery ||
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.last_message.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#0A0E27',
      paddingBottom: 90,
    },
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      backgroundColor: '#0A0E27',
      borderBottom: '1px solid #1E2448',
    },
    headerInner: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px 12px',
    },
    title: {
      fontSize: 28,
      fontWeight: 700,
      color: '#FFFFFF',
      fontFamily: "'Inter', sans-serif",
      margin: 0,
    },
    composeBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: '#1A1F44',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#0088FF',
      transition: 'background-color 0.2s, transform 0.15s',
    },
    searchContainer: {
      padding: '0 20px 12px',
    },
    searchInner: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      backgroundColor: '#1A1F44',
      borderRadius: 12,
      padding: '10px 14px',
      border: '1px solid #1E2448',
      transition: 'border-color 0.2s',
    },
    searchInput: {
      flex: 1,
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      color: '#FFFFFF',
      fontSize: 15,
      fontFamily: "'Inter', sans-serif",
    },
    searchIcon: {
      color: '#6B7194',
      flexShrink: 0,
    },
    clearBtn: {
      background: 'none',
      border: 'none',
      color: '#6B7194',
      cursor: 'pointer',
      padding: 2,
      display: 'flex',
      alignItems: 'center',
    },
    tabsContainer: {
      display: 'flex',
      gap: 4,
      padding: '0 20px 12px',
      overflowX: 'auto',
    },
    tab: (isActive) => ({
      padding: '8px 16px',
      borderRadius: 20,
      border: 'none',
      backgroundColor: isActive ? '#0088FF' : '#1A1F44',
      color: isActive ? '#FFFFFF' : '#A0A6C0',
      fontSize: 13,
      fontWeight: isActive ? 600 : 500,
      fontFamily: "'Inter', sans-serif",
      cursor: 'pointer',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    }),
    chatList: {
      padding: '0',
    },
    chatItem: (hasUnread) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 20px',
      cursor: 'pointer',
      backgroundColor: hasUnread ? 'rgba(0, 136, 255, 0.04)' : 'transparent',
      transition: 'background-color 0.15s',
      borderBottom: '1px solid rgba(30, 36, 72, 0.5)',
    }),
    avatarContainer: {
      position: 'relative',
      flexShrink: 0,
    },
    typeIndicator: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 20,
      height: 20,
      borderRadius: '50%',
      backgroundColor: '#0F1336',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid #0A0E27',
    },
    chatContent: {
      flex: 1,
      minWidth: 0,
    },
    chatTopRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    chatName: (hasUnread) => ({
      fontSize: 15,
      fontWeight: hasUnread ? 700 : 600,
      color: '#FFFFFF',
      fontFamily: "'Inter', sans-serif",
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '70%',
    }),
    timestamp: (hasUnread) => ({
      fontSize: 12,
      color: hasUnread ? '#0088FF' : '#6B7194',
      fontWeight: hasUnread ? 600 : 400,
      fontFamily: "'Inter', sans-serif",
      flexShrink: 0,
    }),
    chatBottomRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    lastMessage: (hasUnread) => ({
      fontSize: 13,
      color: hasUnread ? '#A0A6C0' : '#6B7194',
      fontWeight: hasUnread ? 500 : 400,
      fontFamily: "'Inter', sans-serif",
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      flex: 1,
    }),
    unreadBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#0088FF',
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: 700,
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 6px',
      flexShrink: 0,
    },
    mutedIcon: {
      color: '#6B7194',
      flexShrink: 0,
      marginLeft: 4,
    },
    memberCount: {
      fontSize: 12,
      color: '#6B7194',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      alignItems: 'center',
      gap: 3,
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: '#1A1F44',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: 600,
      color: '#FFFFFF',
      fontFamily: "'Inter', sans-serif",
      margin: '0 0 8px',
    },
    emptyText: {
      fontSize: 14,
      color: '#6B7194',
      fontFamily: "'Inter', sans-serif",
      margin: 0,
      maxWidth: 280,
      lineHeight: 1.5,
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 1,
      right: 1,
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: '#00D68F',
      border: '2.5px solid #0A0E27',
    },
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.title}>Messages</h1>
          <button
            style={styles.composeBtn}
            onClick={() => {}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#222855';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1A1F44';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <PenSquare size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <div style={styles.searchInner}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button
                style={styles.clearBtn}
                onClick={() => setSearchQuery('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabsContainer}>
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                style={styles.tab(activeTab === tab.id)}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = '#222855';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = '#1A1F44';
                  }
                }}
              >
                <TabIcon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat List */}
      <div style={styles.chatList}>
        {filteredChats.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <MessageSquare size={28} color="#6B7194" />
            </div>
            <h3 style={styles.emptyTitle}>No chats found</h3>
            <p style={styles.emptyText}>
              {searchQuery
                ? `No results for "${searchQuery}"`
                : 'No conversations in this category yet. Join an event to start chatting!'}
            </p>
          </div>
        ) : (
          filteredChats.map((room) => {
            const hasUnread = room.unread_count > 0;
            const isMuted = mutedChats.includes(room.id);
            const TypeIcon = getTypeIcon(room.type);

            return (
              <div
                key={room.id}
                style={styles.chatItem(hasUnread)}
                onClick={() => navigate(`/chat/${room.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = hasUnread
                    ? 'rgba(0, 136, 255, 0.08)'
                    : 'rgba(26, 31, 68, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = hasUnread
                    ? 'rgba(0, 136, 255, 0.04)'
                    : 'transparent';
                }}
              >
                {/* Avatar */}
                <div style={styles.avatarContainer}>
                  <Avatar
                    src={room.avatar_url}
                    name={room.name}
                    size="lg"
                    showOnlineIndicator={room.type === 'direct'}
                    isOnline={room.isOnline}
                  />
                  {TypeIcon && room.type !== 'direct' && (
                    <div style={styles.typeIndicator}>
                      <TypeIcon
                        size={11}
                        color={
                          room.type === 'event'
                            ? '#FFB347'
                            : room.type === 'business'
                            ? '#00D4AA'
                            : '#0088FF'
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={styles.chatContent}>
                  <div style={styles.chatTopRow}>
                    <h4 style={styles.chatName(hasUnread)}>{room.name}</h4>
                    <span style={styles.timestamp(hasUnread)}>
                      {formatRelativeTime(room.last_message.created_at)}
                    </span>
                  </div>
                  <div style={styles.chatBottomRow}>
                    <p style={styles.lastMessage(hasUnread)}>
                      {room.type !== 'direct' && room.last_message.sender_name !== 'You'
                        ? `${room.last_message.sender_name}: `
                        : room.last_message.sender_name === 'You'
                        ? 'You: '
                        : ''}
                      {room.last_message.content}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {isMuted && (
                        <BellOff size={14} style={styles.mutedIcon} />
                      )}
                      {hasUnread && !isMuted && (
                        <div style={styles.unreadBadge}>{room.unread_count}</div>
                      )}
                    </div>
                  </div>
                  {room.member_count && (
                    <div style={styles.memberCount}>
                      <Users size={11} />
                      {room.member_count} members
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatPage;
