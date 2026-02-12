import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Users,
  Heart,
  Star,
  Plus,
  Edit3,
  BarChart3,
  XCircle,
  TrendingUp,
  UserPlus,
  MessageCircle,
  ChevronDown,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import Avatar from '../components/common/Avatar';

// ---------------------------------------------------------------------------
// Mock dashboard data
// ---------------------------------------------------------------------------
const mockDashboard = {
  business: {
    id: 'b1',
    name: 'BrewHaus ATX',
    logo_url: '/api/placeholder/100/100',
    is_verified: true,
  },
  stats: {
    total_events: 48,
    total_attendees: 2847,
    followers: 1250,
    avg_rating: 4.7,
    review_count: 234,
  },
  upcoming_events: [
    {
      id: '1',
      title: 'Tuesday Trivia Night',
      start_time: new Date(Date.now() + 86400000),
      attendee_count: 67,
      max_attendees: 120,
      status: 'published',
    },
    {
      id: '8',
      title: 'Salsa Night: Beginner Lesson',
      start_time: new Date(Date.now() + 3 * 86400000),
      attendee_count: 52,
      max_attendees: 80,
      status: 'published',
    },
    {
      id: '6',
      title: 'Live Music: The Wayward Souls',
      start_time: new Date(Date.now() + 5 * 86400000),
      attendee_count: 89,
      max_attendees: 150,
      status: 'published',
    },
    {
      id: '9',
      title: 'Comedy Open Mic Night',
      start_time: new Date(Date.now() + 7 * 86400000),
      attendee_count: 0,
      max_attendees: 60,
      status: 'draft',
    },
  ],
  weekly_attendance: [42, 67, 28, 55, 145, 89, 35],
  activity: [
    { text: "12 people RSVP'd to Trivia Night", time: '2h ago', icon: 'users' },
    { text: 'New 5-star review from Demo User', time: '5h ago', icon: 'star' },
    { text: 'Sarah Chen started following BrewHaus', time: '8h ago', icon: 'user-plus' },
    { text: 'Salsa Night reached 50% capacity', time: '1d ago', icon: 'trending-up' },
    { text: 'New message in BrewHaus Community chat', time: '1d ago', icon: 'message-circle' },
  ],
};

const mockBusinesses = [
  { id: 'b1', name: 'BrewHaus ATX', logo_url: '/api/placeholder/100/100' },
  { id: 'b6', name: 'The Rooftop Bar', logo_url: '/api/placeholder/100/100' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getActivityIcon = (iconName) => {
  switch (iconName) {
    case 'users':
      return <Users size={16} color="#0088FF" />;
    case 'star':
      return <Star size={16} color="#FFB347" fill="#FFB347" />;
    case 'user-plus':
      return <UserPlus size={16} color="#00D4AA" />;
    case 'trending-up':
      return <TrendingUp size={16} color="#E040FB" />;
    case 'message-circle':
      return <MessageCircle size={16} color="#7B61FF" />;
    default:
      return <Clock size={16} color="#8A8FB5" />;
  }
};

const getStatusBadge = (status) => {
  const styles = {
    published: {
      bg: 'rgba(0, 212, 170, 0.15)',
      color: '#00D4AA',
      icon: <CheckCircle2 size={12} />,
      label: 'Published',
    },
    draft: {
      bg: 'rgba(138, 143, 181, 0.15)',
      color: '#8A8FB5',
      icon: <Edit3 size={12} />,
      label: 'Draft',
    },
    cancelled: {
      bg: 'rgba(255, 107, 107, 0.15)',
      color: '#FF6B6B',
      icon: <XCircle size={12} />,
      label: 'Cancelled',
    },
  };
  const s = styles[status] || styles.draft;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        borderRadius: '8px',
        backgroundColor: s.bg,
        color: s.color,
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {s.icon}
      {s.label}
    </span>
  );
};

// ---------------------------------------------------------------------------
// BusinessDashboardPage Component
// ---------------------------------------------------------------------------
const BusinessDashboardPage = () => {
  const navigate = useNavigate();
  const [selectedBusiness, setSelectedBusiness] = useState(mockBusinesses[0]);
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);

  const data = mockDashboard;
  const maxAttendance = Math.max(...data.weekly_attendance);
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const statCards = [
    {
      label: 'Total Events',
      value: data.stats.total_events,
      change: '+3 this month',
      icon: <Calendar size={22} color="#fff" />,
      gradient: 'linear-gradient(135deg, #0066CC, #0088FF)',
    },
    {
      label: 'Total Attendees',
      value: data.stats.total_attendees.toLocaleString(),
      change: '+156 this week',
      icon: <Users size={22} color="#fff" />,
      gradient: 'linear-gradient(135deg, #00A882, #00D4AA)',
    },
    {
      label: 'Followers',
      value: data.stats.followers.toLocaleString(),
      change: '+23 this week',
      icon: <Heart size={22} color="#fff" />,
      gradient: 'linear-gradient(135deg, #CC3366, #FF6B6B)',
    },
    {
      label: 'Avg Rating',
      value: data.stats.avg_rating,
      change: `from ${data.stats.review_count} reviews`,
      icon: <Star size={22} color="#fff" fill="#fff" />,
      gradient: 'linear-gradient(135deg, #CC8800, #FFB347)',
    },
  ];

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#0A0E27',
      paddingBottom: 100,
      fontFamily: "'Inter', sans-serif",
    },
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      backgroundColor: '#0A0E27',
      borderBottom: '1px solid #1E2448',
      padding: '16px 20px 12px',
    },
    headerTop: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: '#1A1F44',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#E8EAFF',
      transition: 'background-color 0.2s',
    },
    title: {
      fontSize: 22,
      fontWeight: 700,
      color: '#FFFFFF',
      margin: 0,
    },
    businessSelector: {
      position: 'relative',
    },
    selectorBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 14px',
      borderRadius: 12,
      backgroundColor: '#1A1F44',
      border: '1px solid #1E2448',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    selectorName: {
      fontSize: 14,
      fontWeight: 600,
      color: '#E8EAFF',
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: 4,
      backgroundColor: '#1A1F44',
      borderRadius: 12,
      border: '1px solid #1E2448',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      zIndex: 30,
      overflow: 'hidden',
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 14px',
      cursor: 'pointer',
      transition: 'background-color 0.15s',
      border: 'none',
      backgroundColor: 'transparent',
      width: '100%',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 12,
      padding: '20px 16px 0',
    },
    statCard: (gradient) => ({
      background: gradient,
      borderRadius: 16,
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
    }),
    statIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    statValue: {
      fontSize: 26,
      fontWeight: 700,
      color: '#FFFFFF',
      margin: 0,
      lineHeight: 1.1,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: 500,
      color: 'rgba(255,255,255,0.8)',
      margin: '4px 0 0',
    },
    statChange: {
      fontSize: 11,
      fontWeight: 500,
      color: 'rgba(255,255,255,0.65)',
      margin: '6px 0 0',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    },
    section: {
      padding: '24px 16px 0',
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 700,
      color: '#E8EAFF',
      margin: 0,
    },
    createBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 16px',
      borderRadius: 10,
      background: 'linear-gradient(135deg, #0066CC, #0088FF)',
      border: 'none',
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'opacity 0.2s, transform 0.15s',
      fontFamily: "'Inter', sans-serif",
    },
    eventRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px',
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 12,
      marginBottom: 8,
      border: '1px solid rgba(255,255,255,0.06)',
      transition: 'background-color 0.2s',
    },
    eventInfo: {
      flex: 1,
      minWidth: 0,
    },
    eventTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: '#E8EAFF',
      margin: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    eventMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginTop: 4,
    },
    eventMetaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      color: '#8A8FB5',
      fontSize: 12,
    },
    eventActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexShrink: 0,
    },
    actionBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: '#1A1F44',
      border: '1px solid #1E2448',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#8A8FB5',
      transition: 'all 0.2s',
    },
    activityItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '12px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    activityIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    activityText: {
      fontSize: 13,
      color: '#E8EAFF',
      margin: 0,
      lineHeight: 1.4,
    },
    activityTime: {
      fontSize: 11,
      color: '#5A5F7D',
      margin: '2px 0 0',
    },
    chartContainer: {
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 16,
      padding: '20px',
      border: '1px solid rgba(255,255,255,0.06)',
    },
    chartTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: '#E8EAFF',
      margin: '0 0 16px',
    },
    chartBars: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 8,
      height: 140,
    },
    barColumn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },
    barLabel: {
      fontSize: 11,
      color: '#5A5F7D',
      fontWeight: 500,
    },
    barValue: {
      fontSize: 10,
      color: '#8A8FB5',
      fontWeight: 600,
    },
    capacityBar: {
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.06)',
      width: 60,
      flexShrink: 0,
    },
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.headerLeft}>
            <button
              style={styles.backBtn}
              onClick={() => navigate('/profile')}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#222855')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1A1F44')}
            >
              <ArrowLeft size={18} />
            </button>
            <h1 style={styles.title}>Business Dashboard</h1>
          </div>
        </div>

        {/* Business Selector */}
        <div style={styles.businessSelector}>
          <div
            style={styles.selectorBtn}
            onClick={() => setShowBusinessDropdown(!showBusinessDropdown)}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#222855')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1A1F44')}
          >
            <Avatar
              src={selectedBusiness.logo_url}
              name={selectedBusiness.name}
              size="sm"
            />
            <span style={styles.selectorName}>{selectedBusiness.name}</span>
            {data.business.is_verified && (
              <Star size={14} fill="#0088FF" stroke="#0088FF" />
            )}
            <ChevronDown
              size={16}
              color="#8A8FB5"
              style={{
                marginLeft: 'auto',
                transform: showBusinessDropdown ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s',
              }}
            />
          </div>

          {showBusinessDropdown && (
            <div style={styles.dropdown}>
              {mockBusinesses.map((biz) => (
                <div
                  key={biz.id}
                  style={{
                    ...styles.dropdownItem,
                    backgroundColor:
                      selectedBusiness.id === biz.id
                        ? 'rgba(0,136,255,0.1)'
                        : 'transparent',
                  }}
                  onClick={() => {
                    setSelectedBusiness(biz);
                    setShowBusinessDropdown(false);
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBusiness.id !== biz.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedBusiness.id !== biz.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Avatar src={biz.logo_url} name={biz.name} size="sm" />
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: selectedBusiness.id === biz.id ? '#0088FF' : '#E8EAFF',
                    }}
                  >
                    {biz.name}
                  </span>
                  {selectedBusiness.id === biz.id && (
                    <CheckCircle2 size={16} color="#0088FF" style={{ marginLeft: 'auto' }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <div key={index} style={styles.statCard(stat.gradient)}>
            <div style={styles.statIconWrap}>{stat.icon}</div>
            <p style={styles.statValue}>{stat.value}</p>
            <p style={styles.statLabel}>{stat.label}</p>
            <p style={styles.statChange}>
              <TrendingUp size={10} />
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Upcoming Events Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Upcoming Events</h2>
          <button
            style={styles.createBtn}
            onClick={() => navigate('/create-event')}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus size={16} />
            Create New Event
          </button>
        </div>

        {data.upcoming_events.map((event) => {
          const capacityPercent = event.max_attendees
            ? Math.round((event.attendee_count / event.max_attendees) * 100)
            : 0;

          return (
            <div
              key={event.id}
              style={styles.eventRow}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)')
              }
            >
              <div style={styles.eventInfo}>
                <h4 style={styles.eventTitle}>{event.title}</h4>
                <div style={styles.eventMeta}>
                  <span style={styles.eventMetaItem}>
                    <Calendar size={12} />
                    {formatDate(event.start_time)}
                  </span>
                  <span style={styles.eventMetaItem}>
                    <Clock size={12} />
                    {formatTime(event.start_time)}
                  </span>
                  <span style={styles.eventMetaItem}>
                    <Users size={12} />
                    {event.attendee_count}/{event.max_attendees}
                  </span>
                </div>
                {/* Capacity bar */}
                <div style={{ ...styles.capacityBar, marginTop: 6 }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 3,
                      background:
                        capacityPercent > 80
                          ? 'linear-gradient(90deg, #FF6B6B, #FF8A8A)'
                          : capacityPercent > 50
                          ? 'linear-gradient(90deg, #FFB347, #FFD54F)'
                          : 'linear-gradient(90deg, #0088FF, #00AAFF)',
                      width: `${capacityPercent}%`,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </div>

              {getStatusBadge(event.status)}

              <div style={styles.eventActions}>
                <button
                  style={styles.actionBtn}
                  title="Edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/create-event?edit=${event.id}`);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#222855';
                    e.currentTarget.style.color = '#0088FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1A1F44';
                    e.currentTarget.style.color = '#8A8FB5';
                  }}
                >
                  <Edit3 size={14} />
                </button>
                <button
                  style={styles.actionBtn}
                  title="View Analytics"
                  onClick={(e) => e.stopPropagation()}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#222855';
                    e.currentTarget.style.color = '#00D4AA';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1A1F44';
                    e.currentTarget.style.color = '#8A8FB5';
                  }}
                >
                  <BarChart3 size={14} />
                </button>
                <button
                  style={styles.actionBtn}
                  title="Cancel Event"
                  onClick={(e) => e.stopPropagation()}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#222855';
                    e.currentTarget.style.color = '#FF6B6B';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1A1F44';
                    e.currentTarget.style.color = '#8A8FB5';
                  }}
                >
                  <XCircle size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Chart */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Weekly Attendance</h2>
        </div>
        <div style={styles.chartContainer}>
          <h4 style={styles.chartTitle}>
            <BarChart3 size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Event Attendance This Week
          </h4>
          <div style={styles.chartBars}>
            {data.weekly_attendance.map((value, index) => {
              const heightPercent = maxAttendance > 0 ? (value / maxAttendance) * 100 : 0;
              return (
                <div key={index} style={styles.barColumn}>
                  <span style={styles.barValue}>{value}</span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 36,
                      height: `${heightPercent}%`,
                      minHeight: 4,
                      borderRadius: '6px 6px 4px 4px',
                      background:
                        index === 4
                          ? 'linear-gradient(180deg, #0088FF, #0066CC)'
                          : 'linear-gradient(180deg, rgba(0,136,255,0.6), rgba(0,136,255,0.25))',
                      transition: 'height 0.4s ease',
                    }}
                  />
                  <span style={styles.barLabel}>{dayLabels[index]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Activity</h2>
        </div>
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 16,
            padding: '4px 16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {data.activity.map((item, index) => (
            <div
              key={index}
              style={{
                ...styles.activityItem,
                borderBottom:
                  index < data.activity.length - 1
                    ? '1px solid rgba(255,255,255,0.04)'
                    : 'none',
              }}
            >
              <div style={styles.activityIconWrap}>
                {getActivityIcon(item.icon)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={styles.activityText}>{item.text}</p>
                <p style={styles.activityTime}>{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div style={{ height: 40 }} />
    </div>
  );
};

export default BusinessDashboardPage;
