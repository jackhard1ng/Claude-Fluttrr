import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  MapPin,
  Phone,
  Globe,
  Star,
  Users,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Navigation,
  CheckCircle,
  Wifi,
  Sun,
  Car,
  Dog,
  Accessibility,
  Music,
  Wine,
  UtensilsCrossed,
  Instagram,
  Facebook,
  Twitter,
  ExternalLink,
  Image,
  X,
} from 'lucide-react';
import EventCard from '../components/common/EventCard';
import Avatar from '../components/common/Avatar';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------
const mockBusinessDetail = {
  id: 'b1',
  name: 'BrewHaus ATX',
  slug: 'brewhaus-atx',
  description:
    "Austin's premier craft brewery and taproom. We brew our own beers on-site and feature 24 rotating taps from local breweries. Our kitchen serves up elevated pub fare, and our event space hosts everything from trivia nights to live music. Come for the beer, stay for the community.\n\nWe've been proudly serving Austin since 2018 and have become a staple of the East 6th Street scene. Our commitment to quality craft beer and community events has earned us recognition as one of Austin's best breweries.",
  short_description: "Austin's favorite craft brewery and taproom with 24 taps",
  category: 'bar',
  logo_url: '/api/placeholder/200/200',
  cover_photo_url: '/api/placeholder/800/400',
  photos: [
    '/api/placeholder/400/400',
    '/api/placeholder/400/400',
    '/api/placeholder/400/400',
    '/api/placeholder/400/400',
  ],
  address: '1200 East 6th Street',
  city: 'Austin',
  state: 'Texas',
  zip_code: '78702',
  latitude: 30.2672,
  longitude: -97.7431,
  phone: '(512) 555-0101',
  email: 'hello@brewhaus.com',
  website: 'https://brewhaus.example.com',
  social_links: {
    instagram: '@brewhausatx',
    facebook: 'brewhausatx',
    twitter: '@brewhausatx',
  },
  operating_hours: {
    monday: { open: '11:00', close: '23:00', closed: false },
    tuesday: { open: '11:00', close: '23:00', closed: false },
    wednesday: { open: '11:00', close: '23:00', closed: false },
    thursday: { open: '11:00', close: '00:00', closed: false },
    friday: { open: '11:00', close: '01:00', closed: false },
    saturday: { open: '10:00', close: '01:00', closed: false },
    sunday: { open: '10:00', close: '22:00', closed: false },
  },
  amenities: [
    'wifi',
    'outdoor_seating',
    'parking',
    'pet_friendly',
    'wheelchair_accessible',
    'live_music',
    'full_bar',
    'food',
  ],
  price_range: '$$',
  rating: 4.7,
  review_count: 234,
  follower_count: 1250,
  total_events: 48,
  is_verified: true,
  is_featured: true,
};

const mockBusinessById = {
  b1: mockBusinessDetail,
  b2: {
    ...mockBusinessDetail,
    id: 'b2',
    name: "O'Malley's Pub",
    slug: 'omalleys-pub',
    description:
      "A classic Irish pub in the heart of downtown Austin. Traditional pub food, imported beers, and a warm atmosphere make O'Malley's the perfect spot for a pint after work or a weekend gathering with friends.",
    short_description: 'Classic Irish pub with imports and live sports',
    category: 'bar',
    rating: 4.3,
    review_count: 178,
    follower_count: 820,
    total_events: 22,
    is_verified: false,
    address: '500 West 6th Street',
    phone: '(512) 555-0202',
  },
};

const mockReviews = [
  {
    id: 'r1',
    user: { display_name: 'Sarah Chen', avatar_url: '/api/placeholder/40/40' },
    rating: 5,
    text: 'Absolutely love BrewHaus! The trivia nights are a blast and the craft beers are top-notch. The staff is always friendly and the atmosphere is perfect for a night out.',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    helpful_count: 12,
  },
  {
    id: 'r2',
    user: { display_name: 'James Park', avatar_url: '/api/placeholder/40/40' },
    rating: 4,
    text: 'Great selection of beers and the food is really good. Can get a bit crowded on weekends but that just speaks to how popular this place is. Definitely recommend the IPA flight!',
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    helpful_count: 8,
  },
  {
    id: 'r3',
    user: { display_name: 'Luna Martinez', avatar_url: '/api/placeholder/40/40' },
    rating: 5,
    text: "The best brewery in Austin, hands down. I've been coming here since they opened and the quality has only gotten better. The new outdoor patio is amazing!",
    date: new Date(Date.now() - 86400000 * 14).toISOString(),
    helpful_count: 15,
  },
  {
    id: 'r4',
    user: { display_name: 'Mike Rodriguez', avatar_url: '/api/placeholder/40/40' },
    rating: 4,
    text: 'Solid spot for watching games and enjoying craft beer. The nachos are incredible. Wish they had a few more parking spots but other than that, no complaints.',
    date: new Date(Date.now() - 86400000 * 21).toISOString(),
    helpful_count: 5,
  },
];

const ratingDistribution = { 5: 142, 4: 58, 3: 22, 2: 8, 1: 4 };

const mockBusinessEvents = [
  {
    id: '1',
    title: 'Tuesday Trivia Night: Pop Culture Edition',
    category: 'trivia',
    image_url: '/api/placeholder/400/300',
    start_time: new Date(Date.now() + 86400000).toISOString(),
    venue_name: 'BrewHaus ATX',
    city: 'Austin',
    attendee_count: 67,
    max_attendees: 120,
    is_free: true,
    price: 0,
    vibe_tags: ['social', 'competitive'],
    Business: {
      id: 'b1',
      name: 'BrewHaus ATX',
      logo_url: '/api/placeholder/40/40',
      is_verified: true,
    },
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
    Business: {
      id: 'b1',
      name: 'BrewHaus ATX',
      logo_url: '/api/placeholder/40/40',
      is_verified: true,
    },
  },
  {
    id: '7',
    title: 'Craft Beer Tasting: Holiday Edition',
    category: 'food_drink',
    image_url: '/api/placeholder/400/300',
    start_time: new Date(Date.now() + 604800000).toISOString(),
    venue_name: 'BrewHaus ATX',
    city: 'Austin',
    attendee_count: 22,
    max_attendees: 40,
    is_free: false,
    price: 15,
    vibe_tags: ['chill', 'social'],
    Business: {
      id: 'b1',
      name: 'BrewHaus ATX',
      logo_url: '/api/placeholder/40/40',
      is_verified: true,
    },
  },
];

// ---------------------------------------------------------------------------
// Amenity icon mapping
// ---------------------------------------------------------------------------
const amenityIcons = {
  wifi: { icon: Wifi, label: 'Free WiFi' },
  outdoor_seating: { icon: Sun, label: 'Outdoor Seating' },
  parking: { icon: Car, label: 'Parking' },
  pet_friendly: { icon: Dog, label: 'Pet Friendly' },
  wheelchair_accessible: { icon: Accessibility, label: 'Wheelchair Accessible' },
  live_music: { icon: Music, label: 'Live Music' },
  full_bar: { icon: Wine, label: 'Full Bar' },
  food: { icon: UtensilsCrossed, label: 'Food Menu' },
};

const categoryIcons = {
  restaurant: UtensilsCrossed,
  bar: Wine,
  cafe: UtensilsCrossed,
  gym: Users,
  music_venue: Music,
  other: MapPin,
};

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------
const getDayOfWeek = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

const formatHour = (timeStr) => {
  if (!timeStr) return '';
  const [hour, minute] = timeStr.split(':');
  const h = parseInt(hour, 10);
  if (h === 0 || h === 24) return '12:00 AM';
  if (h === 12) return `12:${minute} PM`;
  if (h > 12) return `${h - 12}:${minute} PM`;
  return `${h}:${minute} AM`;
};

const formatReviewDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const BusinessDetailPage = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();

  const business = mockBusinessById[businessId] || mockBusinessDetail;

  const [isFollowing, setIsFollowing] = useState(false);
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const today = getDayOfWeek();
  const todayHours = business.operating_hours?.[today];
  const descriptionLong = business.description && business.description.length > 200;
  const totalRatings = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);

  const handleOpenMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`;
    window.open(url, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: business.name, url: window.location.href });
    }
  };

  const handleCallPhone = () => {
    window.open(`tel:${business.phone}`, '_self');
  };

  const handleOpenWebsite = () => {
    window.open(business.website, '_blank');
  };

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------
  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#0A0E27',
      color: '#FFFFFF',
      paddingBottom: 40,
    },

    /* Hero */
    hero: {
      position: 'relative',
      width: '100%',
      height: 260,
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
      height: '70%',
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

    /* Business profile header (overlaps hero) */
    profileHeader: {
      position: 'relative',
      marginTop: -50,
      padding: '0 16px',
      zIndex: 10,
    },
    profileLogoWrap: {
      width: 88,
      height: 88,
      borderRadius: 20,
      border: '3px solid #0A0E27',
      overflow: 'hidden',
      backgroundColor: '#141832',
      marginBottom: 12,
    },
    profileLogo: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    profileName: {
      fontSize: 24,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    profileCategory: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.55)',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    profileRating: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 14,
      marginBottom: 4,
    },
    profilePrice: {
      fontSize: 14,
      color: '#00D4AA',
      fontWeight: 600,
    },

    /* Action buttons */
    actionRow: {
      display: 'flex',
      gap: 10,
      padding: '16px',
      overflowX: 'auto',
    },
    actionBtn: {
      flex: '0 0 auto',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px 18px',
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      border: 'none',
      whiteSpace: 'nowrap',
    },
    actionPrimary: {
      background: 'linear-gradient(135deg, #0088FF, #00C6FF)',
      color: '#fff',
    },
    actionFollowing: {
      background: 'transparent',
      border: '2px solid #0088FF',
      color: '#0088FF',
    },
    actionOutline: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: '#fff',
    },

    /* Content wrapper */
    content: {
      padding: '0 16px',
    },

    /* Quick Info */
    statsRow: {
      display: 'flex',
      justifyContent: 'space-around',
      padding: '16px 0',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      marginBottom: 16,
    },
    statBlock: {
      textAlign: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: 700,
    },
    statLabel: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.45)',
      marginTop: 2,
    },
    infoList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      marginBottom: 16,
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
    },
    infoIcon: {
      color: '#0088FF',
      flexShrink: 0,
    },
    infoLink: {
      color: '#0088FF',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    },

    /* Hours */
    hoursToggle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      padding: '8px 0',
    },
    hoursToday: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
    },
    hoursOpen: {
      color: '#00D4AA',
      fontWeight: 600,
      fontSize: 12,
      marginLeft: 8,
    },
    hoursClosed: {
      color: '#FF6B6B',
      fontWeight: 600,
      fontSize: 12,
      marginLeft: 8,
    },
    hoursList: {
      paddingLeft: 34,
      marginTop: 8,
    },
    hoursDay: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13,
      color: 'rgba(255,255,255,0.65)',
      padding: '4px 0',
    },
    hoursDayCurrent: {
      color: '#0088FF',
      fontWeight: 600,
    },

    /* Section divider & title */
    divider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.08)',
      margin: '20px 0',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 12,
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },

    /* About */
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
    amenityGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 16,
    },
    amenityTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 500,
      backgroundColor: 'rgba(0,136,255,0.1)',
      color: 'rgba(255,255,255,0.75)',
      border: '1px solid rgba(0,136,255,0.2)',
    },
    socialRow: {
      display: 'flex',
      gap: 12,
      marginTop: 16,
    },
    socialBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    },

    /* Events */
    eventsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },
    seeAllBtn: {
      width: '100%',
      padding: '12px 0',
      borderRadius: 12,
      border: '1px solid rgba(0,136,255,0.3)',
      background: 'rgba(0,136,255,0.06)',
      color: '#0088FF',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: 8,
    },

    /* Reviews */
    reviewSummary: {
      display: 'flex',
      gap: 24,
      marginBottom: 20,
    },
    reviewAvgBlock: {
      textAlign: 'center',
      minWidth: 80,
    },
    reviewAvgNumber: {
      fontSize: 40,
      fontWeight: 700,
      lineHeight: 1,
    },
    reviewAvgStars: {
      display: 'flex',
      justifyContent: 'center',
      gap: 2,
      margin: '6px 0',
    },
    reviewAvgCount: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.45)',
    },
    ratingBars: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      justifyContent: 'center',
    },
    ratingBarRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 12,
    },
    ratingBarLabel: {
      width: 14,
      textAlign: 'right',
      color: 'rgba(255,255,255,0.55)',
    },
    ratingBarTrack: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.08)',
      overflow: 'hidden',
    },
    ratingBarFill: {
      height: '100%',
      borderRadius: 3,
      backgroundColor: '#FFB347',
    },
    ratingBarCount: {
      width: 28,
      textAlign: 'right',
      color: 'rgba(255,255,255,0.4)',
      fontSize: 11,
    },
    reviewCard: {
      padding: 16,
      background: 'rgba(255,255,255,0.04)',
      borderRadius: 16,
      marginBottom: 12,
    },
    reviewHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
    },
    reviewUserInfo: {
      flex: 1,
    },
    reviewUserName: {
      fontSize: 14,
      fontWeight: 600,
    },
    reviewDate: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.4)',
    },
    reviewStars: {
      display: 'flex',
      gap: 2,
      marginBottom: 8,
    },
    reviewText: {
      fontSize: 14,
      lineHeight: 1.6,
      color: 'rgba(255,255,255,0.75)',
    },
    reviewHelpful: {
      marginTop: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      color: 'rgba(255,255,255,0.4)',
    },

    /* Photos */
    photoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 8,
    },
    photoItem: {
      borderRadius: 12,
      overflow: 'hidden',
      aspectRatio: '1',
      cursor: 'pointer',
    },
    photoImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },

    /* Lightbox */
    lightbox: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.92)',
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    lightboxClose: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 40,
      height: 40,
      borderRadius: '50%',
      border: 'none',
      background: 'rgba(255,255,255,0.15)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    },
    lightboxImg: {
      maxWidth: '100%',
      maxHeight: '85vh',
      borderRadius: 12,
      objectFit: 'contain',
    },
  };

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  const renderHero = () => (
    <div style={styles.hero}>
      <img src={business.cover_photo_url} alt={business.name} style={styles.heroImage} />
      <div style={styles.heroGradient} />
      <div style={styles.heroTopBar}>
        <button style={styles.heroIconBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <button style={styles.heroIconBtn} onClick={handleShare}>
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );

  const renderProfileHeader = () => {
    const CategoryIcon = categoryIcons[business.category] || MapPin;
    return (
      <div style={styles.profileHeader}>
        <div style={styles.profileLogoWrap}>
          <img src={business.logo_url} alt={business.name} style={styles.profileLogo} />
        </div>
        <div style={styles.profileName}>
          {business.name}
          {business.is_verified && (
            <CheckCircle size={18} fill="#0088FF" stroke="#0A0E27" />
          )}
        </div>
        <div style={styles.profileCategory}>
          <CategoryIcon size={14} />
          {business.category?.replace(/_/g, ' ')}
        </div>
        <div style={styles.profileRating}>
          <Star size={16} fill="#FFB347" stroke="#FFB347" />
          <span style={{ color: '#FFB347', fontWeight: 600 }}>
            {business.rating}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>
            ({business.review_count} reviews)
          </span>
          {business.price_range && (
            <span style={{ ...styles.profilePrice, marginLeft: 12 }}>
              {business.price_range}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderActionButtons = () => (
    <div style={styles.actionRow}>
      <button
        style={{
          ...styles.actionBtn,
          ...(isFollowing ? styles.actionFollowing : styles.actionPrimary),
        }}
        onClick={() => setIsFollowing(!isFollowing)}
      >
        <Heart size={16} fill={isFollowing ? '#0088FF' : 'none'} />
        {isFollowing ? 'Following' : 'Follow'}
      </button>
      <button
        style={{ ...styles.actionBtn, ...styles.actionOutline }}
        onClick={() => navigate(`/chat/business-${business.id}`)}
      >
        <MessageCircle size={16} />
        Message
      </button>
      <button
        style={{ ...styles.actionBtn, ...styles.actionOutline }}
        onClick={handleOpenMap}
      >
        <Navigation size={16} />
        Directions
      </button>
      <button
        style={{ ...styles.actionBtn, ...styles.actionOutline }}
        onClick={handleShare}
      >
        <Share2 size={16} />
        Share
      </button>
    </div>
  );

  const renderQuickInfo = () => {
    const formatFollowers = (n) => {
      if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
      return n.toString();
    };

    return (
      <div style={styles.content}>
        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statBlock}>
            <div style={styles.statValue}>{formatFollowers(business.follower_count)}</div>
            <div style={styles.statLabel}>Followers</div>
          </div>
          <div style={styles.statBlock}>
            <div style={styles.statValue}>{business.total_events}</div>
            <div style={styles.statLabel}>Events</div>
          </div>
          <div style={styles.statBlock}>
            <div style={styles.statValue}>{business.review_count}</div>
            <div style={styles.statLabel}>Reviews</div>
          </div>
        </div>

        {/* Info rows */}
        <div style={styles.infoList}>
          <div style={styles.infoRow}>
            <MapPin size={18} style={styles.infoIcon} />
            <span
              style={styles.infoLink}
              onClick={handleOpenMap}
            >
              {business.address}, {business.city}, {business.state} {business.zip_code}
              <ExternalLink size={12} />
            </span>
          </div>
          {business.phone && (
            <div style={styles.infoRow}>
              <Phone size={18} style={styles.infoIcon} />
              <span style={styles.infoLink} onClick={handleCallPhone}>
                {business.phone}
              </span>
            </div>
          )}
          {business.website && (
            <div style={styles.infoRow}>
              <Globe size={18} style={styles.infoIcon} />
              <span style={styles.infoLink} onClick={handleOpenWebsite}>
                {business.website.replace('https://', '')}
                <ExternalLink size={12} />
              </span>
            </div>
          )}
        </div>

        {/* Operating hours */}
        {business.operating_hours && (
          <div>
            <div style={styles.hoursToggle} onClick={() => setHoursExpanded(!hoursExpanded)}>
              <div style={styles.hoursToday}>
                <Clock size={18} style={styles.infoIcon} />
                <span>
                  {todayHours && !todayHours.closed
                    ? `${formatHour(todayHours.open)} - ${formatHour(todayHours.close)}`
                    : 'Closed today'}
                </span>
                {todayHours && !todayHours.closed ? (
                  <span style={styles.hoursOpen}>Open</span>
                ) : (
                  <span style={styles.hoursClosed}>Closed</span>
                )}
              </div>
              {hoursExpanded ? (
                <ChevronUp size={18} color="rgba(255,255,255,0.4)" />
              ) : (
                <ChevronDown size={18} color="rgba(255,255,255,0.4)" />
              )}
            </div>
            {hoursExpanded && (
              <div style={styles.hoursList}>
                {Object.entries(business.operating_hours).map(([day, hours]) => (
                  <div
                    key={day}
                    style={{
                      ...styles.hoursDay,
                      ...(day === today ? styles.hoursDayCurrent : {}),
                    }}
                  >
                    <span style={{ textTransform: 'capitalize', minWidth: 90 }}>
                      {day}
                    </span>
                    <span>
                      {hours.closed
                        ? 'Closed'
                        : `${formatHour(hours.open)} - ${formatHour(hours.close)}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAbout = () => {
    const text =
      !aboutExpanded && descriptionLong
        ? business.description.slice(0, 200) + '...'
        : business.description;

    return (
      <div style={styles.content}>
        <div style={styles.divider} />
        <h3 style={styles.sectionTitle}>About</h3>
        <p style={styles.descriptionText}>{text}</p>
        {descriptionLong && (
          <button
            style={styles.readMoreBtn}
            onClick={() => setAboutExpanded(!aboutExpanded)}
          >
            {aboutExpanded ? 'Show Less' : 'Read More'}
            {aboutExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}

        {/* Amenities */}
        {business.amenities && business.amenities.length > 0 && (
          <div style={styles.amenityGrid}>
            {business.amenities.map((amenity) => {
              const info = amenityIcons[amenity];
              const IconComp = info?.icon;
              return (
                <span key={amenity} style={styles.amenityTag}>
                  {IconComp && <IconComp size={14} />}
                  {info?.label || amenity.replace(/_/g, ' ')}
                </span>
              );
            })}
          </div>
        )}

        {/* Social links */}
        {business.social_links && (
          <div style={styles.socialRow}>
            {business.social_links.instagram && (
              <button
                style={styles.socialBtn}
                onClick={() =>
                  window.open(
                    `https://instagram.com/${business.social_links.instagram.replace('@', '')}`,
                    '_blank'
                  )
                }
                title={business.social_links.instagram}
              >
                <Instagram size={18} />
              </button>
            )}
            {business.social_links.facebook && (
              <button
                style={styles.socialBtn}
                onClick={() =>
                  window.open(
                    `https://facebook.com/${business.social_links.facebook}`,
                    '_blank'
                  )
                }
                title={business.social_links.facebook}
              >
                <Facebook size={18} />
              </button>
            )}
            {business.social_links.twitter && (
              <button
                style={styles.socialBtn}
                onClick={() =>
                  window.open(
                    `https://twitter.com/${business.social_links.twitter.replace('@', '')}`,
                    '_blank'
                  )
                }
                title={business.social_links.twitter}
              >
                <Twitter size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderEvents = () => (
    <div style={styles.content}>
      <div style={styles.divider} />
      <div style={styles.sectionHeader}>
        <h3 style={{ ...styles.sectionTitle, marginBottom: 0 }}>
          Events at {business.name}{' '}
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
            ({mockBusinessEvents.length})
          </span>
        </h3>
      </div>
      <div style={styles.eventsList}>
        {mockBusinessEvents.map((evt) => (
          <EventCard key={evt.id} event={evt} variant="compact" showBusiness={false} />
        ))}
      </div>
      <button style={styles.seeAllBtn}>See All Events</button>
    </div>
  );

  const renderReviews = () => {
    const displayReviews = showAllReviews ? mockReviews : mockReviews.slice(0, 3);

    return (
      <div style={styles.content}>
        <div style={styles.divider} />
        <div style={styles.sectionHeader}>
          <h3 style={{ ...styles.sectionTitle, marginBottom: 0 }}>
            Reviews{' '}
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
              ({business.review_count})
            </span>
          </h3>
        </div>

        {/* Summary */}
        <div style={styles.reviewSummary}>
          <div style={styles.reviewAvgBlock}>
            <div style={styles.reviewAvgNumber}>{business.rating}</div>
            <div style={styles.reviewAvgStars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  fill={s <= Math.round(business.rating) ? '#FFB347' : 'none'}
                  stroke="#FFB347"
                />
              ))}
            </div>
            <div style={styles.reviewAvgCount}>{business.review_count} reviews</div>
          </div>

          <div style={styles.ratingBars}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star] || 0;
              const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
              return (
                <div key={star} style={styles.ratingBarRow}>
                  <span style={styles.ratingBarLabel}>{star}</span>
                  <Star size={10} fill="#FFB347" stroke="#FFB347" />
                  <div style={styles.ratingBarTrack}>
                    <div style={{ ...styles.ratingBarFill, width: `${pct}%` }} />
                  </div>
                  <span style={styles.ratingBarCount}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review cards */}
        {displayReviews.map((review) => (
          <div key={review.id} style={styles.reviewCard}>
            <div style={styles.reviewHeader}>
              <Avatar
                src={review.user.avatar_url}
                name={review.user.display_name}
                size="sm"
              />
              <div style={styles.reviewUserInfo}>
                <div style={styles.reviewUserName}>{review.user.display_name}</div>
                <div style={styles.reviewDate}>{formatReviewDate(review.date)}</div>
              </div>
            </div>
            <div style={styles.reviewStars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  fill={s <= review.rating ? '#FFB347' : 'none'}
                  stroke="#FFB347"
                />
              ))}
            </div>
            <div style={styles.reviewText}>{review.text}</div>
            <div style={styles.reviewHelpful}>
              <Heart size={12} /> {review.helpful_count} found this helpful
            </div>
          </div>
        ))}

        {mockReviews.length > 3 && (
          <button
            style={styles.seeAllBtn}
            onClick={() => setShowAllReviews(!showAllReviews)}
          >
            {showAllReviews ? 'Show Less' : 'See All Reviews'}
          </button>
        )}
      </div>
    );
  };

  const renderPhotos = () => {
    if (!business.photos || business.photos.length === 0) return null;

    return (
      <div style={styles.content}>
        <div style={styles.divider} />
        <div style={styles.sectionHeader}>
          <h3 style={{ ...styles.sectionTitle, marginBottom: 0 }}>
            Photos{' '}
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
              ({business.photos.length})
            </span>
          </h3>
        </div>
        <div style={styles.photoGrid}>
          {business.photos.map((photo, i) => (
            <div
              key={i}
              style={styles.photoItem}
              onClick={() => setLightboxPhoto(photo)}
            >
              <img src={photo} alt={`${business.name} photo ${i + 1}`} style={styles.photoImg} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // -----------------------------------------------------------------------
  // Main render
  // -----------------------------------------------------------------------
  return (
    <div style={styles.page}>
      {/* Hero */}
      {renderHero()}

      {/* Profile header */}
      {renderProfileHeader()}

      {/* Action buttons */}
      {renderActionButtons()}

      {/* Quick info */}
      {renderQuickInfo()}

      {/* About */}
      {renderAbout()}

      {/* Events */}
      {renderEvents()}

      {/* Reviews */}
      {renderReviews()}

      {/* Photos */}
      {renderPhotos()}

      {/* Photo lightbox */}
      {lightboxPhoto && (
        <div style={styles.lightbox} onClick={() => setLightboxPhoto(null)}>
          <button
            style={styles.lightboxClose}
            onClick={() => setLightboxPhoto(null)}
          >
            <X size={20} />
          </button>
          <img
            src={lightboxPhoto}
            alt="Full size"
            style={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default BusinessDetailPage;
