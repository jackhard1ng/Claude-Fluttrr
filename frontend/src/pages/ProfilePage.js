import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  Edit3,
  MapPin,
  Calendar,
  Users,
  UserPlus,
  UserCheck,
  MessageCircle,
  Star,
  Bookmark,
  Heart,
  Share2,
  Camera,
  CheckCircle2,
  Clock,
  MoreHorizontal,
} from 'lucide-react';
import Avatar from '../components/common/Avatar';
import EventCard from '../components/common/EventCard';

const mockProfile = {
  id: 'demo-user',
  username: 'demo_user',
  display_name: 'Demo User',
  bio: 'Just exploring Fluttrr! Love meeting new people and discovering cool events around town. Coffee enthusiast \u2615 and trivia champion \u{1F3C6}',
  city: 'Austin',
  state: 'Texas',
  avatar_url: '/api/placeholder/120/120',
  cover_photo_url: null,
  interests: ['coffee', 'trivia', 'live_music', 'food', 'fitness', 'art', 'board_games'],
  account_type: 'user',
  is_verified: true,
  follower_count: 42,
  following_count: 67,
  events_attended_count: 15,
};

const interestColors = {
  coffee: '#FF8A65',
  trivia: '#FFB347',
  live_music: '#FF6B6B',
  food: '#FF8A65',
  fitness: '#00D68F',
  art: '#7B61FF',
  board_games: '#00D4AA',
  networking: '#0088FF',
  dance: '#E040FB',
  comedy: '#FFD54F',
  wellness: '#80DEEA',
  sports: '#66BB6A',
  outdoor: '#4CAF50',
  karaoke: '#F06292',
};

const mockUpcomingEvents = [
  {
    id: 'e1',
    title: 'Tuesday Trivia Night',
    category: 'trivia',
    start_time: new Date(Date.now() + 86400000).toISOString(),
    venue_name: "Pinthouse Pizza",
    city: 'Austin',
    image_url: '/api/placeholder/600/400',
    attendee_count: 67,
    max_attendees: 100,
    is_free: true,
    price: '0',
    Business: { name: 'Pinthouse Pizza', logo_url: '/api/placeholder/40/40', is_verified: true },
  },
  {
    id: 'e2',
    title: 'Glow Bowl Friday',
    category: 'sports',
    start_time: new Date(Date.now() + 345600000).toISOString(),
    venue_name: 'Highland Lanes',
    city: 'Austin',
    image_url: '/api/placeholder/600/400',
    attendee_count: 145,
    max_attendees: 200,
    is_free: false,
    price: '15',
    Business: { name: 'Highland Lanes', logo_url: '/api/placeholder/40/40', is_verified: false },
  },
  {
    id: 'e3',
    title: 'Sunrise Yoga in the Park',
    category: 'fitness',
    start_time: new Date(Date.now() + 172800000).toISOString(),
    venue_name: 'Zilker Park',
    city: 'Austin',
    image_url: '/api/placeholder/600/400',
    attendee_count: 32,
    max_attendees: 50,
    is_free: true,
    price: '0',
    Business: { name: 'Flow Yoga ATX', logo_url: '/api/placeholder/40/40', is_verified: true },
  },
];

const mockSavedEvents = [
  {
    id: 'e4',
    title: 'Paint & Sip Night',
    category: 'art',
    start_time: new Date(Date.now() + 518400000).toISOString(),
    venue_name: 'The Art Garage',
    city: 'Austin',
    image_url: '/api/placeholder/600/400',
    attendee_count: 28,
    max_attendees: 40,
    is_free: false,
    price: '35',
    Business: { name: 'The Art Garage', logo_url: '/api/placeholder/40/40', is_verified: false },
  },
  {
    id: 'e5',
    title: 'Jazz on the Lawn',
    category: 'music',
    start_time: new Date(Date.now() + 604800000).toISOString(),
    venue_name: 'Stubb\'s BBQ',
    city: 'Austin',
    image_url: '/api/placeholder/600/400',
    attendee_count: 89,
    max_attendees: 150,
    is_free: false,
    price: '20',
    Business: { name: "Stubb's BBQ", logo_url: '/api/placeholder/40/40', is_verified: true },
  },
];

const mockReviews = [
  {
    id: 'rev1',
    event_name: 'Board Game Night',
    venue_name: 'Vigilante Bar',
    rating: 5,
    content: 'Amazing atmosphere! Met so many fun people and played some awesome games. Will definitely be back next week.',
    created_at: new Date(Date.now() - 604800000),
  },
  {
    id: 'rev2',
    event_name: 'Morning Coffee Meetup',
    venue_name: 'Houndstooth Coffee',
    rating: 4,
    content: 'Great coffee and good conversations. A bit crowded but the organizers handled it well.',
    created_at: new Date(Date.now() - 1209600000),
  },
  {
    id: 'rev3',
    event_name: 'Karaoke Night',
    venue_name: 'Ego\'s Lounge',
    rating: 5,
    content: 'Best karaoke spot in Austin! The crowd was incredibly supportive and the drink specials were solid.',
    created_at: new Date(Date.now() - 2419200000),
  },
];

const tabs = [
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'reviews', label: 'Reviews', icon: Star },
];

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [profile] = useState(mockProfile);
  const [activeTab, setActiveTab] = useState('events');
  const [isFollowing, setIsFollowing] = useState(false);
  const isOwnProfile = !userId || userId === 'demo-user';

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#0A0E27',
      paddingBottom: 90,
      fontFamily: "'Inter', sans-serif",
    },
    coverPhoto: {
      width: '100%',
      height: 180,
      background: profile.cover_photo_url
        ? `url(${profile.cover_photo_url}) center/cover`
        : 'linear-gradient(135deg, #0088FF 0%, #7B61FF 50%, #00D4AA 100%)',
      position: 'relative',
    },
    coverOverlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to bottom, rgba(10, 14, 39, 0) 40%, rgba(10, 14, 39, 0.8) 100%)',
    },
    coverActions: {
      position: 'absolute',
      top: 12,
      left: 12,
      right: 12,
      display: 'flex',
      justifyContent: 'space-between',
      zIndex: 10,
    },
    coverBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: 'rgba(10, 14, 39, 0.5)',
      backdropFilter: 'blur(8px)',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#FFFFFF',
      transition: 'background-color 0.2s',
    },
    profileSection: {
      padding: '0 20px',
      marginTop: -50,
      position: 'relative',
      zIndex: 5,
    },
    avatarContainer: {
      position: 'relative',
      width: 100,
      height: 100,
      marginBottom: 12,
    },
    avatarWrapper: {
      width: 100,
      height: 100,
      borderRadius: '50%',
      border: '4px solid #0A0E27',
      overflow: 'hidden',
      position: 'relative',
    },
    editAvatarBtn: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 30,
      height: 30,
      borderRadius: '50%',
      backgroundColor: '#0088FF',
      border: '3px solid #0A0E27',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#FFFFFF',
      zIndex: 2,
    },
    nameRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    displayName: {
      fontSize: 24,
      fontWeight: 700,
      color: '#FFFFFF',
      margin: 0,
    },
    verifiedBadge: {
      color: '#0088FF',
      flexShrink: 0,
    },
    username: {
      fontSize: 14,
      color: '#6B7194',
      margin: '0 0 10px',
    },
    bio: {
      fontSize: 15,
      color: '#A0A6C0',
      lineHeight: 1.55,
      margin: '0 0 12px',
    },
    location: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 13,
      color: '#6B7194',
      marginBottom: 16,
    },
    interestsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 20,
    },
    interestTag: (interest) => {
      const color = interestColors[interest] || '#0088FF';
      return {
        padding: '5px 12px',
        borderRadius: 16,
        backgroundColor: color + '18',
        color: color,
        fontSize: 12,
        fontWeight: 600,
        border: `1px solid ${color}30`,
        textTransform: 'capitalize',
      };
    },
    statsRow: {
      display: 'flex',
      gap: 0,
      backgroundColor: '#1A1F44',
      borderRadius: 16,
      padding: '16px 0',
      marginBottom: 20,
      border: '1px solid #1E2448',
    },
    statItem: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      borderRight: '1px solid #1E2448',
      cursor: 'pointer',
    },
    statItemLast: {
      borderRight: 'none',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 700,
      color: '#FFFFFF',
    },
    statLabel: {
      fontSize: 12,
      color: '#6B7194',
      fontWeight: 500,
    },
    actionButtons: {
      display: 'flex',
      gap: 10,
      marginBottom: 24,
    },
    primaryBtn: (isActive) => ({
      flex: 1,
      padding: '12px 20px',
      borderRadius: 12,
      backgroundColor: isActive ? '#1A1F44' : '#0088FF',
      border: isActive ? '1px solid #0088FF' : 'none',
      color: isActive ? '#0088FF' : '#FFFFFF',
      fontSize: 14,
      fontWeight: 600,
      fontFamily: "'Inter', sans-serif",
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: 'all 0.2s',
    }),
    secondaryBtn: {
      flex: 1,
      padding: '12px 20px',
      borderRadius: 12,
      backgroundColor: '#1A1F44',
      border: '1px solid #1E2448',
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 600,
      fontFamily: "'Inter', sans-serif",
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: 'all 0.2s',
    },
    tabsContainer: {
      display: 'flex',
      borderBottom: '1px solid #1E2448',
      padding: '0 20px',
      marginBottom: 16,
    },
    tab: (isActive) => ({
      flex: 1,
      padding: '14px 0',
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: isActive ? '2px solid #0088FF' : '2px solid transparent',
      color: isActive ? '#FFFFFF' : '#6B7194',
      fontSize: 14,
      fontWeight: isActive ? 600 : 500,
      fontFamily: "'Inter', sans-serif",
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      transition: 'all 0.2s',
    }),
    tabContent: {
      padding: '0 20px',
    },
    eventGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    },
    reviewCard: {
      backgroundColor: '#1A1F44',
      borderRadius: 16,
      padding: '16px',
      border: '1px solid #1E2448',
      marginBottom: 12,
    },
    reviewHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    reviewEventName: {
      fontSize: 15,
      fontWeight: 600,
      color: '#FFFFFF',
      margin: '0 0 2px',
    },
    reviewVenueName: {
      fontSize: 12,
      color: '#6B7194',
      margin: 0,
    },
    reviewStars: {
      display: 'flex',
      gap: 2,
    },
    reviewContent: {
      fontSize: 14,
      color: '#A0A6C0',
      lineHeight: 1.5,
      margin: '0 0 8px',
    },
    reviewDate: {
      fontSize: 12,
      color: '#6B7194',
    },
    emptyTabState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      textAlign: 'center',
    },
    emptyTabIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: '#1A1F44',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    emptyTabTitle: {
      fontSize: 16,
      fontWeight: 600,
      color: '#FFFFFF',
      margin: '0 0 6px',
    },
    emptyTabText: {
      fontSize: 13,
      color: '#6B7194',
      margin: 0,
      maxWidth: 260,
      lineHeight: 1.5,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 600,
      color: '#FFFFFF',
      margin: '0 0 12px',
    },
  };

  const renderEventsTab = () => (
    <div style={styles.tabContent}>
      <h3 style={styles.sectionTitle}>Upcoming Events</h3>
      <div style={styles.eventGrid}>
        {mockUpcomingEvents.map((event) => (
          <EventCard key={event.id} event={event} variant="compact" />
        ))}
      </div>
    </div>
  );

  const renderSavedTab = () => (
    <div style={styles.tabContent}>
      {mockSavedEvents.length > 0 ? (
        <div style={styles.eventGrid}>
          {mockSavedEvents.map((event) => (
            <EventCard key={event.id} event={event} variant="compact" />
          ))}
        </div>
      ) : (
        <div style={styles.emptyTabState}>
          <div style={styles.emptyTabIcon}>
            <Bookmark size={24} color="#6B7194" />
          </div>
          <h4 style={styles.emptyTabTitle}>No saved events</h4>
          <p style={styles.emptyTabText}>
            Bookmark events you're interested in and they'll show up here.
          </p>
        </div>
      )}
    </div>
  );

  const renderReviewsTab = () => (
    <div style={styles.tabContent}>
      {mockReviews.length > 0 ? (
        mockReviews.map((review) => (
          <div key={review.id} style={styles.reviewCard}>
            <div style={styles.reviewHeader}>
              <div>
                <h4 style={styles.reviewEventName}>{review.event_name}</h4>
                <p style={styles.reviewVenueName}>{review.venue_name}</p>
              </div>
              <div style={styles.reviewStars}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < review.rating ? '#FFB347' : 'none'}
                    stroke={i < review.rating ? '#FFB347' : '#6B7194'}
                  />
                ))}
              </div>
            </div>
            <p style={styles.reviewContent}>{review.content}</p>
            <span style={styles.reviewDate}>{formatDate(review.created_at)}</span>
          </div>
        ))
      ) : (
        <div style={styles.emptyTabState}>
          <div style={styles.emptyTabIcon}>
            <Star size={24} color="#6B7194" />
          </div>
          <h4 style={styles.emptyTabTitle}>No reviews yet</h4>
          <p style={styles.emptyTabText}>
            After attending events, leave reviews to help others discover great experiences.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Cover Photo */}
      <div style={styles.coverPhoto}>
        <div style={styles.coverOverlay} />
        <div style={styles.coverActions}>
          {!isOwnProfile ? (
            <button
              style={styles.coverBtn}
              onClick={() => navigate(-1)}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(10, 14, 39, 0.7)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(10, 14, 39, 0.5)')}
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div />
          )}
          <button
            style={styles.coverBtn}
            onClick={() => {}}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(10, 14, 39, 0.7)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(10, 14, 39, 0.5)')}
          >
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div style={styles.profileSection}>
        {/* Avatar */}
        <div style={styles.avatarContainer}>
          <div style={styles.avatarWrapper}>
            <Avatar
              src={profile.avatar_url}
              name={profile.display_name}
              size={92}
            />
          </div>
          {isOwnProfile && (
            <div
              style={styles.editAvatarBtn}
              onClick={() => {}}
            >
              <Camera size={14} />
            </div>
          )}
        </div>

        {/* Name */}
        <div style={styles.nameRow}>
          <h1 style={styles.displayName}>{profile.display_name}</h1>
          {profile.is_verified && (
            <CheckCircle2
              size={20}
              fill="#0088FF"
              stroke="#0A0E27"
              style={styles.verifiedBadge}
            />
          )}
        </div>
        <p style={styles.username}>@{profile.username}</p>

        {/* Bio */}
        <p style={styles.bio}>{profile.bio}</p>

        {/* Location */}
        <div style={styles.location}>
          <MapPin size={14} />
          <span>{profile.city}, {profile.state}</span>
        </div>

        {/* Interests */}
        <div style={styles.interestsContainer}>
          {profile.interests.map((interest) => (
            <span key={interest} style={styles.interestTag(interest)}>
              {interest.replace(/_/g, ' ')}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{profile.events_attended_count}</span>
            <span style={styles.statLabel}>Events</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{profile.follower_count}</span>
            <span style={styles.statLabel}>Followers</span>
          </div>
          <div style={{ ...styles.statItem, ...styles.statItemLast }}>
            <span style={styles.statNumber}>{profile.following_count}</span>
            <span style={styles.statLabel}>Following</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          {isOwnProfile ? (
            <>
              <button
                style={styles.primaryBtn(false)}
                onClick={() => {}}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0077E6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0088FF')}
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
              <button
                style={styles.secondaryBtn}
                onClick={() => navigate('/settings')}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#222855')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1A1F44')}
              >
                <Settings size={16} />
                Settings
              </button>
            </>
          ) : (
            <>
              <button
                style={styles.primaryBtn(isFollowing)}
                onClick={() => setIsFollowing(!isFollowing)}
                onMouseEnter={(e) => {
                  if (!isFollowing) e.currentTarget.style.backgroundColor = '#0077E6';
                  else e.currentTarget.style.backgroundColor = '#222855';
                }}
                onMouseLeave={(e) => {
                  if (!isFollowing) e.currentTarget.style.backgroundColor = '#0088FF';
                  else e.currentTarget.style.backgroundColor = '#1A1F44';
                }}
              >
                {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button
                style={styles.secondaryBtn}
                onClick={() => navigate('/chat')}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#222855')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1A1F44')}
              >
                <MessageCircle size={16} />
                Message
              </button>
            </>
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
            >
              <TabIcon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'events' && renderEventsTab()}
      {activeTab === 'saved' && renderSavedTab()}
      {activeTab === 'reviews' && renderReviewsTab()}
    </div>
  );
};

export default ProfilePage;
