import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Heart,
  TrendingUp,
  Star,
  ChevronRight,
  MapPin,
  Users,
  Calendar,
  Clock,
  Compass,
  Award,
  Zap,
  Coffee,
  Music,
  Palette,
  Dumbbell,
} from 'lucide-react';
import EventCard from '../components/common/EventCard';
import BusinessCard from '../components/common/BusinessCard';
import Avatar from '../components/common/Avatar';
import SearchBar from '../components/common/SearchBar';
import CategoryScroll from '../components/common/CategoryScroll';
import Header from '../components/layout/Header';

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------
const getTomorrow = (hour = 12, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const getDayAfter = (hour = 12, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const getIn3Days = (hour = 12, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const getIn4Days = (hour = 12, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + 4);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const getIn5Days = (hour = 12, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const getNextWeek = (hour = 12, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

// ---------------------------------------------------------------------------
// Mock events for various sections
// ---------------------------------------------------------------------------
const forYouEvents = [
  {
    id: '1',
    title: 'Tuesday Trivia Night: Pop Culture Edition',
    category: 'trivia',
    start_time: getTomorrow(19),
    end_time: getTomorrow(22),
    venue_name: 'BrewHaus ATX',
    address: '1200 E 6th St',
    city: 'Austin',
    price: 0,
    is_free: true,
    max_attendees: 120,
    attendee_count: 67,
    image_url: '/api/placeholder/800/500',
    is_featured: true,
    tags: ['trivia', 'beer', 'teams'],
    vibe_tags: ['social', 'competitive', 'fun'],
    reason: 'Because you like trivia',
    Business: { id: 'b1', name: 'BrewHaus ATX', logo_url: '/api/placeholder/100/100', is_verified: true },
  },
  {
    id: '5',
    title: 'Paint & Sip: Austin Skyline',
    category: 'art',
    start_time: getIn4Days(18, 30),
    end_time: getIn4Days(21),
    venue_name: 'Palette Art Gallery',
    address: '567 E Cesar Chavez',
    city: 'Austin',
    price: 35,
    is_free: false,
    max_attendees: 30,
    attendee_count: 24,
    image_url: '/api/placeholder/800/500',
    is_featured: true,
    tags: ['painting', 'wine'],
    vibe_tags: ['creative', 'relaxing'],
    reason: 'Because you like art',
    Business: { id: 'b5', name: 'Palette Art Gallery', logo_url: '/api/placeholder/100/100', is_verified: true },
  },
  {
    id: '6',
    title: 'Live Music: The Wayward Souls',
    category: 'music',
    start_time: getIn5Days(19),
    end_time: getIn5Days(22, 30),
    venue_name: 'BrewHaus ATX',
    address: '1200 E 6th St',
    city: 'Austin',
    price: 0,
    is_free: true,
    max_attendees: 150,
    attendee_count: 89,
    image_url: '/api/placeholder/800/500',
    tags: ['live_music', 'acoustic'],
    vibe_tags: ['chill', 'artsy'],
    reason: 'Because you like live music',
    Business: { id: 'b1', name: 'BrewHaus ATX', logo_url: '/api/placeholder/100/100', is_verified: true },
  },
  {
    id: '4',
    title: 'Sunrise Yoga in the Park',
    category: 'fitness',
    start_time: getTomorrow(6, 30),
    end_time: getTomorrow(7, 45),
    venue_name: 'Zilker Park',
    address: 'Barton Springs Rd',
    city: 'Austin',
    price: 0,
    is_free: true,
    max_attendees: 50,
    attendee_count: 32,
    image_url: '/api/placeholder/800/500',
    tags: ['yoga', 'outdoor'],
    vibe_tags: ['peaceful', 'energizing'],
    reason: 'Because you like fitness',
    Business: { id: 'b4', name: 'Flow Yoga Studio', logo_url: '/api/placeholder/100/100', is_verified: true },
  },
];

const newInTownEvents = [
  {
    id: 'n1',
    title: 'Austin Newcomers Mixer',
    category: 'networking',
    start_time: getDayAfter(18),
    end_time: getDayAfter(20),
    venue_name: 'BrewHaus ATX',
    address: '1200 E 6th St',
    city: 'Austin',
    price: 0,
    is_free: true,
    max_attendees: 60,
    attendee_count: 38,
    image_url: '/api/placeholder/800/500',
    tags: ['newcomers', 'social'],
    vibe_tags: ['social', 'welcoming'],
    Business: { id: 'b1', name: 'BrewHaus ATX', logo_url: '/api/placeholder/100/100', is_verified: true },
  },
  {
    id: 'n2',
    title: 'Explore Austin Walking Tour',
    category: 'outdoor',
    start_time: getIn3Days(10),
    end_time: getIn3Days(12),
    venue_name: 'Texas State Capitol',
    address: '1100 Congress Ave',
    city: 'Austin',
    price: 0,
    is_free: true,
    max_attendees: 25,
    attendee_count: 19,
    image_url: '/api/placeholder/800/500',
    tags: ['walking', 'sightseeing'],
    vibe_tags: ['adventurous', 'educational'],
    Business: { id: 'b6', name: 'ATX Adventures', logo_url: '/api/placeholder/100/100', is_verified: false },
  },
  {
    id: 'n3',
    title: 'First Friday Art Walk',
    category: 'art',
    start_time: getIn5Days(17),
    end_time: getIn5Days(21),
    venue_name: 'South Congress',
    address: 'S Congress Ave',
    city: 'Austin',
    price: 0,
    is_free: true,
    max_attendees: 200,
    attendee_count: 134,
    image_url: '/api/placeholder/800/500',
    tags: ['art', 'gallery', 'free'],
    vibe_tags: ['artsy', 'casual'],
    Business: { id: 'b5', name: 'Palette Art Gallery', logo_url: '/api/placeholder/100/100', is_verified: true },
  },
];

const popularThisWeek = [
  {
    id: 'p1',
    title: 'Glow Bowl Friday',
    category: 'themed_night',
    start_time: getIn3Days(20),
    end_time: getIn3Days(23),
    venue_name: 'Lucky Lanes',
    address: '789 Lamar Blvd',
    city: 'Austin',
    price: 15,
    is_free: false,
    max_attendees: 200,
    attendee_count: 145,
    image_url: '/api/placeholder/800/500',
    is_featured: true,
    tags: ['bowling', 'glow', 'dj'],
    vibe_tags: ['party', 'energetic'],
    Business: { id: 'b3', name: 'Lucky Lanes Bowling', logo_url: '/api/placeholder/100/100', is_verified: true },
  },
  {
    id: 'p2',
    title: 'Salsa Night: Beginner Lesson',
    category: 'dance',
    start_time: getIn3Days(20),
    end_time: getIn3Days(23, 59),
    venue_name: 'BrewHaus ATX',
    address: '1200 E 6th St',
    city: 'Austin',
    price: 5,
    is_free: false,
    max_attendees: 80,
    attendee_count: 52,
    image_url: '/api/placeholder/800/500',
    is_featured: true,
    tags: ['salsa', 'dance', 'beginner'],
    vibe_tags: ['energetic', 'social'],
    Business: { id: 'b1', name: 'BrewHaus ATX', logo_url: '/api/placeholder/100/100', is_verified: true },
  },
  {
    id: 'p3',
    title: 'Board Game Brunch',
    category: 'board_games',
    start_time: getNextWeek(10),
    end_time: getNextWeek(14),
    venue_name: 'Grindhouse Coffee',
    address: '456 S Congress Ave',
    city: 'Austin',
    price: 0,
    is_free: true,
    max_attendees: 35,
    attendee_count: 18,
    image_url: '/api/placeholder/800/500',
    tags: ['board_games', 'brunch'],
    vibe_tags: ['casual', 'social'],
    Business: { id: 'b2', name: 'Grindhouse Coffee', logo_url: '/api/placeholder/100/100', is_verified: true },
  },
  {
    id: 'p4',
    title: 'Remote Work Wednesday',
    category: 'networking',
    start_time: getDayAfter(8),
    end_time: getDayAfter(17),
    venue_name: 'Grindhouse Coffee',
    address: '456 S Congress Ave',
    city: 'Austin',
    price: 0,
    is_free: true,
    max_attendees: 40,
    attendee_count: 28,
    image_url: '/api/placeholder/800/500',
    tags: ['coworking', 'networking'],
    vibe_tags: ['productive', 'chill'],
    Business: { id: 'b2', name: 'Grindhouse Coffee', logo_url: '/api/placeholder/100/100', is_verified: true },
  },
];

const staffPicks = [
  {
    id: 's1',
    event: forYouEvents[0],
    note: "Our team's favorite trivia night -- the pop culture rounds are legendary!",
    picker: 'Fluttrr Team',
  },
  {
    id: 's2',
    event: forYouEvents[1],
    note: 'A perfect creative date night. The wine selection is excellent.',
    picker: 'Sarah, Community Lead',
  },
  {
    id: 's3',
    event: {
      id: '8',
      title: 'Salsa Night: Beginner Lesson',
      category: 'dance',
      start_time: getIn3Days(20),
      end_time: getIn3Days(23, 59),
      venue_name: 'BrewHaus ATX',
      address: '1200 E 6th St',
      city: 'Austin',
      price: 5,
      is_free: false,
      max_attendees: 80,
      attendee_count: 52,
      image_url: '/api/placeholder/800/500',
      is_featured: true,
      tags: ['salsa', 'dance', 'beginner'],
      vibe_tags: ['energetic', 'social'],
      Business: { id: 'b1', name: 'BrewHaus ATX', logo_url: '/api/placeholder/100/100', is_verified: true },
    },
    note: "Even if you've never danced before, the instructors make it so approachable!",
    picker: 'Mike, Events Team',
  },
];

const suggestedBusinesses = [
  {
    id: 'b1',
    name: 'BrewHaus ATX',
    category: 'bar',
    logo_url: '/api/placeholder/100/100',
    cover_photo_url: '/api/placeholder/600/300',
    address: '1200 E 6th St',
    city: 'Austin',
    short_description: 'Craft beer, live music, and weekly trivia on the famous 6th Street.',
    rating: 4.6,
    review_count: 234,
    follower_count: 1820,
    total_events: 48,
    is_verified: true,
    is_featured: true,
    price_range: '$$',
    amenities: ['wifi', 'outdoor_seating', 'live_music', 'food_menu'],
  },
  {
    id: 'b2',
    name: 'Grindhouse Coffee',
    category: 'cafe',
    logo_url: '/api/placeholder/100/100',
    cover_photo_url: '/api/placeholder/600/300',
    address: '456 S Congress Ave',
    city: 'Austin',
    short_description: 'Specialty coffee, pastries, and a welcoming cowork space on South Congress.',
    rating: 4.8,
    review_count: 312,
    follower_count: 2150,
    total_events: 22,
    is_verified: true,
    price_range: '$',
    amenities: ['wifi', 'power_outlets', 'quiet_area', 'pastries'],
  },
  {
    id: 'b3',
    name: 'Lucky Lanes Bowling',
    category: 'bowling',
    logo_url: '/api/placeholder/100/100',
    cover_photo_url: '/api/placeholder/600/300',
    address: '789 Lamar Blvd',
    city: 'Austin',
    short_description: 'Retro bowling alley with glow nights, arcade games, and craft cocktails.',
    rating: 4.3,
    review_count: 178,
    follower_count: 980,
    total_events: 15,
    is_verified: true,
    price_range: '$$',
    amenities: ['arcade', 'bar', 'glow_bowling', 'party_rooms'],
  },
  {
    id: 'b4',
    name: 'Flow Yoga Studio',
    category: 'gym',
    logo_url: '/api/placeholder/100/100',
    cover_photo_url: '/api/placeholder/600/300',
    address: 'Barton Springs Rd',
    city: 'Austin',
    short_description: 'Outdoor yoga, breathwork, and mindfulness in the heart of Austin.',
    rating: 4.9,
    review_count: 156,
    follower_count: 1340,
    total_events: 32,
    is_verified: true,
    price_range: '$',
    amenities: ['outdoor_classes', 'mats_provided', 'meditation'],
  },
  {
    id: 'b5',
    name: 'Palette Art Gallery',
    category: 'gallery',
    logo_url: '/api/placeholder/100/100',
    cover_photo_url: '/api/placeholder/600/300',
    address: '567 E Cesar Chavez',
    city: 'Austin',
    short_description: 'Local art gallery with paint-and-sip nights and rotating exhibits.',
    rating: 4.7,
    review_count: 89,
    follower_count: 760,
    total_events: 18,
    is_verified: true,
    price_range: '$$',
    amenities: ['wine_bar', 'art_supplies', 'exhibitions'],
  },
];

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
const Section = ({ title, emoji, icon, actionLabel, onAction, subtitle, children, style = {} }) => (
  <section style={{ padding: '0 16px', marginBottom: 28, ...style }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: subtitle ? 4 : 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#E8EAFF',
            margin: 0,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {emoji && <span style={{ marginRight: 6 }}>{emoji}</span>}
          {title}
        </h2>
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: '#0088FF',
            fontSize: 13,
            fontWeight: 600,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {actionLabel}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
    {subtitle && (
      <p
        style={{
          fontSize: 13,
          color: '#8A8FB5',
          margin: '0 0 14px',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {subtitle}
      </p>
    )}
    {children}
  </section>
);

// ---------------------------------------------------------------------------
// DiscoverPage Component
// ---------------------------------------------------------------------------
const DiscoverPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const popularScrollRef = useRef(null);
  const businessScrollRef = useRef(null);

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#0A0E27',
      paddingBottom: 100,
      fontFamily: "'Inter', sans-serif",
    },
    heroSection: {
      padding: '20px 16px 16px',
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: 700,
      margin: '0 0 4px',
      background: 'linear-gradient(135deg, #E8EAFF, #0088FF)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    heroSubtitle: {
      fontSize: 14,
      color: '#8A8FB5',
      margin: '0 0 16px',
    },
    divider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.06)',
      margin: '4px 16px 20px',
    },
    reasonBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      borderRadius: 12,
      backgroundColor: 'rgba(0,136,255,0.12)',
      color: '#0088FF',
      fontSize: 11,
      fontWeight: 600,
      marginBottom: 8,
    },
    forYouCard: {
      marginBottom: 16,
    },
    newInTownBanner: {
      background: 'linear-gradient(135deg, rgba(0,136,255,0.15), rgba(123,97,255,0.15))',
      borderRadius: 16,
      padding: '20px',
      border: '1px solid rgba(0,136,255,0.2)',
      marginBottom: 16,
    },
    bannerTitle: {
      fontSize: 20,
      fontWeight: 700,
      color: '#E8EAFF',
      margin: '0 0 6px',
    },
    bannerText: {
      fontSize: 13,
      color: '#8A8FB5',
      margin: '0 0 16px',
      lineHeight: 1.5,
    },
    staffPickCard: {
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
      marginBottom: 14,
    },
    staffPickNote: {
      padding: '12px 16px',
      backgroundColor: 'rgba(0,136,255,0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    staffPickQuote: {
      fontSize: 13,
      color: '#A0A6C0',
      margin: 0,
      fontStyle: 'italic',
      lineHeight: 1.5,
    },
    staffPickPicker: {
      fontSize: 11,
      color: '#0088FF',
      fontWeight: 600,
      marginTop: 6,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    },
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <Header
        showLogo={false}
        title=""
        showSearch={true}
        showNotifications={true}
      />

      {/* Hero Section */}
      <div style={styles.heroSection}>
        <h1 style={styles.heroTitle}>
          <Sparkles size={24} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Discover
        </h1>
        <p style={styles.heroSubtitle}>
          Curated events and experiences just for you
        </p>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search events, places, people..."
          showFilters={true}
          onFilterClick={() => navigate('/explore')}
        />
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* For You Section */}
      <Section
        title="For You"
        icon={<Heart size={18} style={{ color: '#FF6B6B' }} />}
        actionLabel="See All"
        onAction={() => navigate('/explore')}
        subtitle="Personalized recommendations based on your interests"
      >
        {forYouEvents.map((event) => (
          <div key={event.id} style={styles.forYouCard}>
            <div style={styles.reasonBadge}>
              <Sparkles size={12} />
              {event.reason}
            </div>
            <EventCard event={event} variant="default" />
          </div>
        ))}
      </Section>

      {/* Divider */}
      <div style={styles.divider} />

      {/* New in Town Section */}
      <Section
        title="New in Town?"
        icon={<Compass size={18} style={{ color: '#7B61FF' }} />}
        subtitle="Welcome to Austin! Here are some great ways to get started"
      >
        <div style={styles.newInTownBanner}>
          <h3 style={styles.bannerTitle}>
            <Compass size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Austin Starter Pack
          </h3>
          <p style={styles.bannerText}>
            Just moved to Austin? We picked the best events for newcomers
            looking to meet people and explore the city. Everyone is welcome!
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {newInTownEvents.map((event) => (
            <EventCard key={event.id} event={event} variant="compact" />
          ))}
        </div>
      </Section>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Popular This Week Section */}
      <Section
        title="Popular This Week"
        icon={<TrendingUp size={18} style={{ color: '#FFB347' }} />}
        actionLabel="View All"
        onAction={() => navigate('/explore')}
        subtitle="Events with the most RSVPs this week"
      >
        <div
          ref={popularScrollRef}
          style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            paddingBottom: 4,
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {popularThisWeek.map((event) => (
            <div
              key={event.id}
              style={{
                minWidth: 300,
                maxWidth: 340,
                flexShrink: 0,
                scrollSnapAlign: 'start',
              }}
            >
              <EventCard event={event} variant="featured" />
            </div>
          ))}
        </div>
      </Section>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Staff Picks Section */}
      <Section
        title="Staff Picks"
        icon={<Award size={18} style={{ color: '#E040FB' }} />}
        subtitle="Hand-picked by the Fluttrr team"
      >
        {staffPicks.map((pick) => (
          <div key={pick.id} style={styles.staffPickCard}>
            <div style={styles.staffPickNote}>
              <p style={styles.staffPickQuote}>"{pick.note}"</p>
              <div style={styles.staffPickPicker}>
                <Star size={12} fill="#0088FF" stroke="#0088FF" />
                {pick.picker}
              </div>
            </div>
            <div style={{ padding: 0 }}>
              <EventCard event={pick.event} variant="compact" />
            </div>
          </div>
        ))}
      </Section>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Businesses to Follow */}
      <Section
        title="Businesses to Follow"
        icon={<Zap size={18} style={{ color: '#00D4AA' }} />}
        actionLabel="Explore All"
        onAction={() => navigate('/explore')}
        subtitle="Recommended based on your interests"
      >
        <div
          ref={businessScrollRef}
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            paddingBottom: 4,
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {suggestedBusinesses.map((biz) => (
            <div
              key={biz.id}
              style={{ minWidth: 260, maxWidth: 300, flexShrink: 0 }}
            >
              <BusinessCard business={biz} variant="compact" />
            </div>
          ))}
        </div>
      </Section>

      {/* Footer CTA */}
      <div
        style={{
          padding: '16px',
          textAlign: 'center',
          marginTop: 8,
        }}
      >
        <p
          style={{
            color: '#5A5F7D',
            fontSize: 13,
            margin: 0,
          }}
        >
          <Sparkles
            size={14}
            style={{ verticalAlign: 'middle', marginRight: 4, color: '#0088FF' }}
          />
          Discovering new experiences in Austin, TX
        </p>
      </div>
    </div>
  );
};

export default DiscoverPage;
