import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Star,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Accessibility,
  Car,
  Train,
  Zap,
  Eye,
  Heart,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import EventCard from '../components/common/EventCard';
import Avatar from '../components/common/Avatar';

// ---------------------------------------------------------------------------
// Category colors (mirrors EventCard)
// ---------------------------------------------------------------------------
const categoryColors = {
  trivia: '#FFB347',
  board_games: '#00D4AA',
  music: '#FF6B6B',
  dance: '#E040FB',
  fitness: '#00D4AA',
  food_drink: '#FF8A65',
  art: '#7B61FF',
  comedy: '#FFD54F',
  networking: '#0088FF',
  workshop: '#26C6DA',
  sports: '#66BB6A',
  outdoor: '#4CAF50',
  wellness: '#80DEEA',
  karaoke: '#F06292',
  open_mic: '#FFB74D',
  happy_hour: '#FFA726',
  themed_night: '#BA68C8',
  community: '#42A5F5',
  education: '#5C6BC0',
  charity: '#EF5350',
  holiday: '#EC407A',
  special: '#AB47BC',
  other: '#78909C',
};

const vibeColors = {
  social: '#0088FF',
  competitive: '#FF6B6B',
  casual: '#00D4AA',
  fun: '#FFB347',
  chill: '#80DEEA',
  hype: '#E040FB',
  cozy: '#FFA726',
  romantic: '#F06292',
  wild: '#FF6B6B',
  classy: '#7B61FF',
};

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------
const mockEventDetail = {
  id: '1',
  title: 'Tuesday Trivia Night: Pop Culture Edition',
  description:
    "Think you know your pop culture? Prove it! Our weekly trivia night is back with a Pop Culture theme. Form teams of up to 6, enjoy $5 pints all night, and compete for prizes including a $100 bar tab for the winning team. DJ spinning throwback hits between rounds. No cover, just good vibes and great beer.\n\nRounds include: Movies & TV, Music, Celebrity Gossip, Viral Moments, and a Mystery Round!\n\nArriving early is recommended as tables fill up fast. The event is free to attend - just come and play!",
  short_description: 'Weekly trivia with $5 pints, prizes, and DJ sets between rounds',
  category: 'trivia',
  tags: ['trivia', 'pop_culture', 'beer', 'prizes', 'teams'],
  vibe_tags: ['social', 'competitive', 'casual', 'fun'],
  image_url: '/api/placeholder/800/500',
  gallery: ['/api/placeholder/600/400', '/api/placeholder/600/400', '/api/placeholder/600/400'],
  start_time: new Date(Date.now() + 86400000).toISOString(),
  end_time: new Date(Date.now() + 86400000 + 10800000).toISOString(),
  venue_name: 'BrewHaus ATX',
  address: '1200 East 6th Street, Austin, TX 78702',
  city: 'Austin',
  state: 'Texas',
  latitude: 30.2672,
  longitude: -97.7431,
  price: 0,
  is_free: true,
  max_attendees: 120,
  attendee_count: 67,
  interested_count: 34,
  view_count: 450,
  share_count: 23,
  age_restriction: '21+',
  difficulty_level: 'all_levels',
  dress_code: null,
  what_to_bring: [],
  accessibility: { wheelchair: true, parking: true, public_transit: true },
  status: 'published',
  is_featured: true,
  Business: {
    id: 'b1',
    name: 'BrewHaus ATX',
    slug: 'brewhaus-atx',
    logo_url: '/api/placeholder/100/100',
    category: 'bar',
    rating: 4.7,
    review_count: 234,
    follower_count: 1250,
    is_verified: true,
    short_description: "Austin's favorite craft brewery and taproom",
  },
  attendees: [
    { id: 'u1', display_name: 'Sarah Chen', avatar_url: '/api/placeholder/40/40' },
    { id: 'u2', display_name: 'James Park', avatar_url: '/api/placeholder/40/40' },
    { id: 'u3', display_name: 'Luna Martinez', avatar_url: '/api/placeholder/40/40' },
    { id: 'u4', display_name: 'Mike Rodriguez', avatar_url: '/api/placeholder/40/40' },
    { id: 'u5', display_name: 'Emma Wilson', avatar_url: '/api/placeholder/40/40' },
  ],
  chatPreview: [
    { sender: 'Sarah Chen', content: "Can't wait for tomorrow! Anyone need a team?" },
    { sender: 'James Park', content: "I'm in! We could form a team together." },
  ],
};

const mockEventById = {
  '1': mockEventDetail,
  '2': {
    ...mockEventDetail,
    id: '2',
    title: 'Live Jazz & Wine Night',
    description:
      'An elegant evening of live jazz and curated wine pairings. Enjoy smooth tunes from the Marcus Ellis Trio while sampling wines from Texas Hill Country vineyards. Each wine is paired with artisanal charcuterie. Reservations recommended but walk-ins welcome while space lasts.',
    short_description: 'Live jazz trio with curated Texas wine pairings',
    category: 'music',
    vibe_tags: ['classy', 'chill', 'romantic'],
    price: 25,
    is_free: false,
    max_attendees: 60,
    attendee_count: 48,
    age_restriction: '21+',
    venue_name: 'The Velvet Lounge',
    address: '800 Congress Avenue, Austin, TX 78701',
    start_time: new Date(Date.now() + 172800000).toISOString(),
    end_time: new Date(Date.now() + 172800000 + 10800000).toISOString(),
  },
  '3': {
    ...mockEventDetail,
    id: '3',
    title: 'Sunrise Yoga in the Park',
    description:
      'Start your morning right with a sunrise yoga session at Zilker Park. All levels welcome. Bring your own mat and water bottle. Our instructor Mia will guide you through a rejuvenating Vinyasa flow as the sun rises over the Austin skyline.',
    short_description: 'Morning Vinyasa flow at Zilker Park for all levels',
    category: 'fitness',
    vibe_tags: ['chill', 'casual'],
    price: 10,
    is_free: false,
    max_attendees: 40,
    attendee_count: 28,
    age_restriction: 'all_ages',
    difficulty_level: 'beginner',
    what_to_bring: ['Yoga mat', 'Water bottle', 'Sunscreen'],
    venue_name: 'Zilker Park',
    address: '2100 Barton Springs Rd, Austin, TX 78704',
    start_time: new Date(Date.now() + 259200000).toISOString(),
    end_time: new Date(Date.now() + 259200000 + 5400000).toISOString(),
  },
};

const similarEvents = [
  {
    id: '4',
    title: 'Pub Quiz Wednesdays',
    category: 'trivia',
    image_url: '/api/placeholder/400/300',
    start_time: new Date(Date.now() + 172800000).toISOString(),
    venue_name: "Tap Room O'Malley's",
    city: 'Austin',
    attendee_count: 42,
    max_attendees: 80,
    is_free: true,
    price: 0,
    vibe_tags: ['social', 'fun'],
    Business: { id: 'b2', name: "O'Malley's Pub", logo_url: '/api/placeholder/40/40', is_verified: false },
  },
  {
    id: '5',
    title: 'Board Game Social',
    category: 'board_games',
    image_url: '/api/placeholder/400/300',
    start_time: new Date(Date.now() + 259200000).toISOString(),
    venue_name: 'Game Night Cafe',
    city: 'Austin',
    attendee_count: 18,
    max_attendees: 30,
    is_free: false,
    price: 5,
    vibe_tags: ['casual', 'social'],
    Business: { id: 'b3', name: 'Game Night Cafe', logo_url: '/api/placeholder/40/40', is_verified: true },
  },
  {
    id: '6',
    title: 'BrewHaus Open Mic Night',
    category: 'open_mic',
    image_url: '/api/placeholder/400/300',
    start_time: new Date(Date.now() + 345600000).toISOString(),
    venue_name: 'BrewHaus ATX',
    city: 'Austin',
    attendee_count: 35,
    max_attendees: 100,
    is_free: true,
    price: 0,
    vibe_tags: ['casual', 'fun'],
    Business: { id: 'b1', name: 'BrewHaus ATX', logo_url: '/api/placeholder/40/40', is_verified: true },
  },
];

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------
const formatEventDate = (startTime) => {
  const date = new Date(startTime);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === now.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}`;
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const isHappeningNow = (start, end) => {
  const now = new Date();
  return new Date(start) <= now && now <= new Date(end);
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const EventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const event = mockEventById[eventId] || mockEventDetail;

  const [isSaved, setIsSaved] = useState(false);
  const [isGoing, setIsGoing] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [showAllAttendees, setShowAllAttendees] = useState(false);

  const categoryColor = categoryColors[event.category] || '#0088FF';
  const spotsLeft = event.max_attendees ? event.max_attendees - event.attendee_count : null;
  const capacityPercent = event.max_attendees
    ? Math.round((event.attendee_count / event.max_attendees) * 100)
    : 0;
  const happening = isHappeningNow(event.start_time, event.end_time);
  const descriptionLong = event.description && event.description.length > 200;

  const handleRSVP = () => {
    if (isGoing) {
      setShowCancelPrompt(true);
    } else {
      setIsGoing(true);
    }
  };

  const handleCancelRSVP = () => {
    setIsGoing(false);
    setShowCancelPrompt(false);
  };

  const handleOpenMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`;
    window.open(url, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event.title, url: window.location.href });
    }
  };

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------
  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#0A0E27',
      color: '#FFFFFF',
      paddingBottom: 100,
    },

    /* Hero */
    hero: {
      position: 'relative',
      width: '100%',
      height: 340,
      overflow: 'hidden',
    },
    heroImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    heroGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60%',
      background: 'linear-gradient(to top, #0A0E27 0%, transparent 100%)',
      pointerEvents: 'none',
    },
    heroTopBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      zIndex: 10,
    },
    heroIconBtn: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: 'rgba(10,14,39,0.55)',
      backdropFilter: 'blur(8px)',
      border: 'none',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    },
    heroTopRight: {
      display: 'flex',
      gap: 8,
    },
    heroBadges: {
      position: 'absolute',
      bottom: 56,
      left: 16,
      display: 'flex',
      gap: 8,
      zIndex: 10,
    },
    badge: {
      padding: '4px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
    },
    categoryBadge: {
      backgroundColor: categoryColor + '30',
      color: categoryColor,
      border: `1px solid ${categoryColor}55`,
    },
    priceBadge: {
      backgroundColor: 'rgba(0,212,170,0.2)',
      color: '#00D4AA',
      border: '1px solid rgba(0,212,170,0.35)',
    },
    heroBottomText: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    happeningNow: {
      background: 'linear-gradient(135deg, #FF6B6B, #FF3D71)',
      padding: '4px 12px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      animation: 'pulse 2s ease-in-out infinite',
    },
    dateLabel: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 13,
      fontWeight: 500,
    },

    /* Content wrapper */
    content: {
      padding: '0 16px',
    },

    /* Info Section */
    title: {
      fontSize: 24,
      fontWeight: 700,
      lineHeight: 1.25,
      marginBottom: 12,
      marginTop: 16,
    },
    vibeTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    vibeTag: {
      padding: '4px 12px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
    },
    metaList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      marginBottom: 20,
    },
    metaRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
    },
    metaIcon: {
      color: '#0088FF',
      flexShrink: 0,
    },
    metaLink: {
      color: '#0088FF',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    },

    /* Divider */
    divider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.08)',
      margin: '20px 0',
    },

    /* Business */
    businessSection: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 4,
    },
    businessInfo: {
      flex: 1,
      minWidth: 0,
    },
    businessName: {
      fontSize: 16,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    businessMeta: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.55)',
      marginTop: 2,
    },
    businessRating: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 13,
      color: '#FFB347',
      marginTop: 4,
    },
    viewBusinessBtn: {
      padding: '8px 16px',
      borderRadius: 20,
      border: '1px solid rgba(0,136,255,0.4)',
      background: 'transparent',
      color: '#0088FF',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },

    /* Description */
    sectionTitle: {
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 12,
    },
    descriptionText: {
      fontSize: 14,
      lineHeight: 1.7,
      color: 'rgba(255,255,255,0.78)',
      whiteSpace: 'pre-wrap',
    },
    readMoreBtn: {
      background: 'none',
      border: 'none',
      color: '#0088FF',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      padding: '8px 0 0',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    },
    infoTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      marginRight: 8,
      marginTop: 12,
    },
    whatToBring: {
      marginTop: 16,
    },
    bringItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 0',
      fontSize: 14,
      color: 'rgba(255,255,255,0.78)',
    },
    accessibilityRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    accessTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 500,
      backgroundColor: 'rgba(0,212,170,0.12)',
      color: '#00D4AA',
      border: '1px solid rgba(0,212,170,0.25)',
    },

    /* Attendees */
    attendeeHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    attendeeCount: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.55)',
      fontWeight: 400,
    },
    seeAllBtn: {
      background: 'none',
      border: 'none',
      color: '#0088FF',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
    },
    avatarStack: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 12,
    },
    stackedAvatar: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      border: '2px solid #0A0E27',
      objectFit: 'cover',
      backgroundColor: '#1A1E3C',
    },
    moreAvatars: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      border: '2px solid #0A0E27',
      backgroundColor: 'rgba(0,136,255,0.18)',
      color: '#0088FF',
      fontSize: 12,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    capacityBar: {
      marginTop: 8,
    },
    capacityTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.08)',
      overflow: 'hidden',
    },
    capacityFill: {
      height: '100%',
      borderRadius: 3,
      transition: 'width 0.4s ease',
    },
    capacityLabel: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.5)',
      marginTop: 6,
    },

    /* Chat preview */
    chatPreview: {
      background: 'rgba(255,255,255,0.04)',
      borderRadius: 16,
      padding: 16,
      marginTop: 4,
    },
    chatMessage: {
      display: 'flex',
      gap: 10,
      marginBottom: 12,
    },
    chatBubble: {
      flex: 1,
    },
    chatSender: {
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 2,
    },
    chatText: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.7)',
      lineHeight: 1.4,
    },
    joinChatBtn: {
      width: '100%',
      padding: '10px 0',
      borderRadius: 12,
      border: '1px solid rgba(0,136,255,0.4)',
      background: 'rgba(0,136,255,0.08)',
      color: '#0088FF',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 8,
    },

    /* Similar events */
    similarScroll: {
      display: 'flex',
      gap: 12,
      overflowX: 'auto',
      paddingBottom: 8,
      scrollSnapType: 'x mandatory',
      WebkitOverflowScrolling: 'touch',
    },
    similarCard: {
      minWidth: 260,
      scrollSnapAlign: 'start',
    },

    /* Sticky Bottom */
    stickyBottom: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '12px 16px',
      paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      background: 'linear-gradient(to top, #0A0E27 60%, transparent)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    rsvpBtn: {
      flex: 1,
      padding: '14px 0',
      borderRadius: 14,
      border: 'none',
      fontSize: 16,
      fontWeight: 700,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: 'all 0.2s ease',
    },
    rsvpGoing: {
      background: 'linear-gradient(135deg, #0088FF, #00C6FF)',
      color: '#fff',
    },
    rsvpAlready: {
      background: 'transparent',
      border: '2px solid #00D4AA',
      color: '#00D4AA',
    },
    cancelBtn: {
      padding: '14px 20px',
      borderRadius: 14,
      border: '1px solid rgba(255,107,107,0.4)',
      background: 'rgba(255,107,107,0.08)',
      color: '#FF6B6B',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
    spotsLeft: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.45)',
      textAlign: 'center',
      marginTop: 2,
    },

    /* Cancel prompt overlay */
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(10,14,39,0.8)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    overlayCard: {
      background: '#141832',
      borderRadius: 20,
      padding: 24,
      maxWidth: 340,
      width: '100%',
      textAlign: 'center',
    },
    overlayTitle: {
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 8,
    },
    overlayText: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.6)',
      marginBottom: 20,
    },
    overlayBtns: {
      display: 'flex',
      gap: 12,
    },
    overlayBtnCancel: {
      flex: 1,
      padding: '12px 0',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'transparent',
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
    },
    overlayBtnConfirm: {
      flex: 1,
      padding: '12px 0',
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #FF6B6B, #FF3D71)',
      color: '#fff',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
    },

    /* Stats mini */
    statsRow: {
      display: 'flex',
      gap: 16,
      marginBottom: 16,
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 13,
      color: 'rgba(255,255,255,0.45)',
    },
  };

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------
  const renderVibeTags = () => (
    <div style={styles.vibeTags}>
      {event.vibe_tags.map((tag) => {
        const color = vibeColors[tag] || '#0088FF';
        return (
          <span
            key={tag}
            style={{
              ...styles.vibeTag,
              backgroundColor: color + '18',
              color: color,
              border: `1px solid ${color}33`,
            }}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );

  const renderMeta = () => (
    <div style={styles.metaList}>
      <div style={styles.metaRow}>
        <Calendar size={18} style={styles.metaIcon} />
        <span>{formatEventDate(event.start_time)}</span>
      </div>
      <div style={styles.metaRow}>
        <Clock size={18} style={styles.metaIcon} />
        <span>
          {formatTime(event.start_time)} &ndash; {formatTime(event.end_time)}
        </span>
      </div>
      <div style={styles.metaRow}>
        <MapPin size={18} style={styles.metaIcon} />
        <span
          style={styles.metaLink}
          onClick={handleOpenMap}
        >
          {event.venue_name} &middot; {event.address}
          <ExternalLink size={12} />
        </span>
      </div>
      <div style={styles.metaRow}>
        <DollarSign size={18} style={styles.metaIcon} />
        <span>{event.is_free ? 'Free admission' : `$${event.price}`}</span>
      </div>
    </div>
  );

  const renderBusiness = () => {
    const biz = event.Business;
    return (
      <>
        <div style={styles.divider} />
        <div style={styles.businessSection}>
          <Avatar src={biz.logo_url} name={biz.name} size="lg" />
          <div style={styles.businessInfo}>
            <div style={styles.businessName}>
              {biz.name}
              {biz.is_verified && (
                <CheckCircle size={14} fill="#0088FF" stroke="#0A0E27" />
              )}
            </div>
            <div style={styles.businessMeta}>
              {biz.category?.replace(/_/g, ' ')} &middot; {biz.short_description}
            </div>
            <div style={styles.businessRating}>
              <Star size={14} fill="#FFB347" stroke="#FFB347" />
              {biz.rating} ({biz.review_count} reviews)
            </div>
          </div>
          <button
            style={styles.viewBusinessBtn}
            onClick={() => navigate(`/business/${biz.id}`)}
          >
            View
          </button>
        </div>
      </>
    );
  };

  const renderDescription = () => {
    const text =
      !descriptionExpanded && descriptionLong
        ? event.description.slice(0, 200) + '...'
        : event.description;

    return (
      <>
        <div style={styles.divider} />
        <h3 style={styles.sectionTitle}>About this Event</h3>
        <p style={styles.descriptionText}>{text}</p>
        {descriptionLong && (
          <button
            style={styles.readMoreBtn}
            onClick={() => setDescriptionExpanded(!descriptionExpanded)}
          >
            {descriptionExpanded ? 'Show Less' : 'Read More'}
            {descriptionExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}

        {/* What to bring */}
        {event.what_to_bring && event.what_to_bring.length > 0 && (
          <div style={styles.whatToBring}>
            <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>What to Bring</h4>
            {event.what_to_bring.map((item, i) => (
              <div key={i} style={styles.bringItem}>
                <CheckCircle size={14} color="#00D4AA" />
                {item}
              </div>
            ))}
          </div>
        )}

        {/* Tags row: difficulty, age, etc. */}
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap' }}>
          {event.difficulty_level && (
            <span
              style={{
                ...styles.infoTag,
                backgroundColor: 'rgba(0,136,255,0.12)',
                color: '#0088FF',
                border: '1px solid rgba(0,136,255,0.25)',
              }}
            >
              <Zap size={12} />
              {event.difficulty_level === 'all_levels' ? 'All Levels' : event.difficulty_level}
            </span>
          )}
          {event.age_restriction && event.age_restriction !== 'all_ages' && (
            <span
              style={{
                ...styles.infoTag,
                backgroundColor: 'rgba(255,107,107,0.12)',
                color: '#FF6B6B',
                border: '1px solid rgba(255,107,107,0.25)',
              }}
            >
              <Shield size={12} />
              {event.age_restriction}
            </span>
          )}
        </div>

        {/* Accessibility */}
        {event.accessibility && (
          <div style={styles.accessibilityRow}>
            {event.accessibility.wheelchair && (
              <span style={styles.accessTag}>
                <Accessibility size={12} /> Wheelchair Accessible
              </span>
            )}
            {event.accessibility.parking && (
              <span style={styles.accessTag}>
                <Car size={12} /> Parking Available
              </span>
            )}
            {event.accessibility.public_transit && (
              <span style={styles.accessTag}>
                <Train size={12} /> Public Transit
              </span>
            )}
          </div>
        )}
      </>
    );
  };

  const renderAttendees = () => {
    const displayAttendees = showAllAttendees ? event.attendees : event.attendees.slice(0, 5);
    const remaining = event.attendee_count - event.attendees.length;

    return (
      <>
        <div style={styles.divider} />
        <div style={styles.attendeeHeader}>
          <h3 style={{ ...styles.sectionTitle, marginBottom: 0 }}>
            Who's Going{' '}
            <span style={styles.attendeeCount}>{event.attendee_count}</span>
          </h3>
          <button style={styles.seeAllBtn} onClick={() => setShowAllAttendees(!showAllAttendees)}>
            {showAllAttendees ? 'Collapse' : 'See All'}
          </button>
        </div>

        <div style={styles.avatarStack}>
          {displayAttendees.map((att, i) => (
            <div key={att.id} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i }}>
              <Avatar src={att.avatar_url} name={att.display_name} size="sm" />
            </div>
          ))}
          {remaining > 0 && (
            <div style={{ ...styles.moreAvatars, marginLeft: -10 }}>
              +{remaining}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <Heart size={14} /> {event.interested_count} interested
          </div>
          <div style={styles.statItem}>
            <Eye size={14} /> {event.view_count} views
          </div>
          <div style={styles.statItem}>
            <Share2 size={14} /> {event.share_count} shares
          </div>
        </div>

        {/* Capacity bar */}
        {event.max_attendees && (
          <div style={styles.capacityBar}>
            <div style={styles.capacityTrack}>
              <div
                style={{
                  ...styles.capacityFill,
                  width: `${capacityPercent}%`,
                  background:
                    capacityPercent > 85
                      ? 'linear-gradient(90deg, #FF6B6B, #FF3D71)'
                      : capacityPercent > 60
                        ? 'linear-gradient(90deg, #FFB347, #FFA726)'
                        : 'linear-gradient(90deg, #0088FF, #00C6FF)',
                }}
              />
            </div>
            <div style={styles.capacityLabel}>
              {event.attendee_count}/{event.max_attendees} spots filled
            </div>
          </div>
        )}
      </>
    );
  };

  const renderChatPreview = () => {
    if (!event.chatPreview || event.chatPreview.length === 0) return null;
    return (
      <>
        <div style={styles.divider} />
        <h3 style={styles.sectionTitle}>Event Chat</h3>
        <div style={styles.chatPreview}>
          {event.chatPreview.map((msg, i) => (
            <div key={i} style={styles.chatMessage}>
              <Avatar name={msg.sender} size="xs" />
              <div style={styles.chatBubble}>
                <div style={styles.chatSender}>{msg.sender}</div>
                <div style={styles.chatText}>{msg.content}</div>
              </div>
            </div>
          ))}
          <button
            style={styles.joinChatBtn}
            onClick={() => navigate(`/chat/event-${event.id}`)}
          >
            <MessageCircle size={16} />
            Join Chat
          </button>
        </div>
      </>
    );
  };

  const renderSimilarEvents = () => (
    <>
      <div style={styles.divider} />
      <h3 style={styles.sectionTitle}>Similar Events</h3>
      <div style={styles.similarScroll}>
        {similarEvents.map((evt) => (
          <div key={evt.id} style={styles.similarCard}>
            <EventCard event={evt} variant="compact" showBusiness />
          </div>
        ))}
      </div>
    </>
  );

  // -----------------------------------------------------------------------
  // Main render
  // -----------------------------------------------------------------------
  return (
    <div style={styles.page}>
      {/* ---- Hero ---- */}
      <div style={styles.hero}>
        <img
          src={event.image_url}
          alt={event.title}
          style={styles.heroImage}
        />
        <div style={styles.heroGradient} />

        {/* Top bar */}
        <div style={styles.heroTopBar}>
          <button style={styles.heroIconBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div style={styles.heroTopRight}>
            <button style={styles.heroIconBtn} onClick={handleShare}>
              <Share2 size={18} />
            </button>
            <button
              style={{
                ...styles.heroIconBtn,
                backgroundColor: isSaved ? 'rgba(0,136,255,0.25)' : 'rgba(10,14,39,0.55)',
              }}
              onClick={() => setIsSaved(!isSaved)}
            >
              <Bookmark
                size={18}
                fill={isSaved ? '#0088FF' : 'none'}
                stroke={isSaved ? '#0088FF' : '#fff'}
              />
            </button>
          </div>
        </div>

        {/* Category & Price badges on image */}
        <div style={styles.heroBadges}>
          <span style={{ ...styles.badge, ...styles.categoryBadge }}>
            {event.category?.replace(/_/g, ' ')}
          </span>
          <span style={{ ...styles.badge, ...styles.priceBadge }}>
            {event.is_free ? 'Free' : `$${event.price}`}
          </span>
        </div>

        {/* Happening now or date at bottom */}
        <div style={styles.heroBottomText}>
          {happening ? (
            <span style={styles.happeningNow}>
              <Zap size={12} /> Happening Now
            </span>
          ) : (
            <span style={styles.dateLabel}>
              <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {formatEventDate(event.start_time)} at {formatTime(event.start_time)}
            </span>
          )}
        </div>
      </div>

      {/* ---- Content ---- */}
      <div style={styles.content}>
        {/* Title */}
        <h1 style={styles.title}>{event.title}</h1>

        {/* Vibe tags */}
        {event.vibe_tags && event.vibe_tags.length > 0 && renderVibeTags()}

        {/* Meta */}
        {renderMeta()}

        {/* Business */}
        {event.Business && renderBusiness()}

        {/* Description */}
        {renderDescription()}

        {/* Attendees */}
        {renderAttendees()}

        {/* Chat preview */}
        {renderChatPreview()}

        {/* Similar events */}
        {renderSimilarEvents()}
      </div>

      {/* ---- Sticky Bottom Bar ---- */}
      <div style={styles.stickyBottom}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <button
            style={{
              ...styles.rsvpBtn,
              ...(isGoing ? styles.rsvpAlready : styles.rsvpGoing),
            }}
            onClick={handleRSVP}
          >
            {isGoing ? (
              <>
                <CheckCircle size={18} /> Going
              </>
            ) : (
              "I'm Going!"
            )}
          </button>
          {spotsLeft !== null && !isGoing && (
            <div style={styles.spotsLeft}>
              {spotsLeft} spots remaining
            </div>
          )}
        </div>
        {isGoing && (
          <button style={styles.cancelBtn} onClick={() => setShowCancelPrompt(true)}>
            Cancel RSVP
          </button>
        )}
      </div>

      {/* ---- Cancel RSVP Prompt ---- */}
      {showCancelPrompt && (
        <div style={styles.overlay} onClick={() => setShowCancelPrompt(false)}>
          <div style={styles.overlayCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.overlayTitle}>Cancel RSVP?</div>
            <p style={styles.overlayText}>
              Are you sure you want to cancel your RSVP for this event?
            </p>
            <div style={styles.overlayBtns}>
              <button
                style={styles.overlayBtnCancel}
                onClick={() => setShowCancelPrompt(false)}
              >
                Keep RSVP
              </button>
              <button style={styles.overlayBtnConfirm} onClick={handleCancelRSVP}>
                Cancel RSVP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
