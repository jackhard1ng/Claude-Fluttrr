import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Flame,
  Sparkles,
} from 'lucide-react';
import Header from '../components/layout/Header';
import EventCard from '../components/common/EventCard';
import BusinessCard from '../components/common/BusinessCard';
import CategoryScroll from '../components/common/CategoryScroll';
import Avatar from '../components/common/Avatar';
import { useAuth } from '../contexts/AuthContext';

// ---------------------------------------------------------------------------
// Date helpers -- produce Date objects relative to "now" for demo data
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

const getToday = (hour = 12, minute = 0) => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

// ---------------------------------------------------------------------------
// Mock events
// ---------------------------------------------------------------------------
const mockEvents = [
  {
    id: '1',
    title: 'Tuesday Trivia Night: Pop Culture Edition',
    category: 'trivia',
    start_time: getTomorrow(19),
    end_time: getTomorrow(22),
    venue_name: 'BrewHaus ATX',
    address: '1200 E 6th St',
    city: 'Austin',
    state: 'Texas',
    price: 0,
    is_free: true,
    max_attendees: 120,
    attendee_count: 67,
    interested_count: 34,
    view_count: 450,
    image_url: '/api/placeholder/800/500',
    is_featured: true,
    age_restriction: '21+',
    tags: ['trivia', 'beer', 'teams'],
    vibe_tags: ['social', 'competitive', 'fun'],
    Business: {
      id: 'b1',
      name: 'BrewHaus ATX',
      logo_url: '/api/placeholder/100/100',
      is_verified: true,
    },
  },
  {
    id: '2',
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
    is_featured: true,
    tags: ['coworking', 'networking'],
    vibe_tags: ['productive', 'chill'],
    Business: {
      id: 'b2',
      name: 'Grindhouse Coffee',
      logo_url: '/api/placeholder/100/100',
      is_verified: true,
    },
  },
  {
    id: '3',
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
    Business: {
      id: 'b3',
      name: 'Lucky Lanes Bowling',
      logo_url: '/api/placeholder/100/100',
      is_verified: true,
    },
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
    Business: {
      id: 'b4',
      name: 'Flow Yoga Studio',
      logo_url: '/api/placeholder/100/100',
      is_verified: true,
    },
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
    Business: {
      id: 'b5',
      name: 'Palette Art Gallery',
      logo_url: '/api/placeholder/100/100',
      is_verified: true,
    },
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
    Business: {
      id: 'b1',
      name: 'BrewHaus ATX',
      logo_url: '/api/placeholder/100/100',
      is_verified: true,
    },
  },
  {
    id: '7',
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
    Business: {
      id: 'b2',
      name: 'Grindhouse Coffee',
      logo_url: '/api/placeholder/100/100',
      is_verified: true,
    },
  },
  {
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
    Business: {
      id: 'b1',
      name: 'BrewHaus ATX',
      logo_url: '/api/placeholder/100/100',
      is_verified: true,
    },
  },
];

// Events happening "today" -- separate set with today's dates
const todayEvents = [
  {
    id: 't1',
    title: 'Lunchtime Jazz Session',
    category: 'music',
    start_time: getToday(12),
    end_time: getToday(14),
    venue_name: 'BrewHaus ATX',
    address: '1200 E 6th St',
    city: 'Austin',
    price: 0,
    is_free: true,
    max_attendees: 80,
    attendee_count: 41,
    image_url: '/api/placeholder/800/500',
    tags: ['jazz', 'live_music'],
    vibe_tags: ['chill', 'artsy'],
    Business: {
      id: 'b1',
      name: 'BrewHaus ATX',
      logo_url: '/api/placeholder/100/100',
      is_verified: true,
    },
  },
  {
    id: 't2',
    title: 'Afternoon Espresso Tasting',
    category: 'food_drink',
    start_time: getToday(15),
    end_time: getToday(17),
    venue_name: 'Grindhouse Coffee',
    address: '456 S Congress Ave',
    city: 'Austin',
    price: 10,
    is_free: false,
    max_attendees: 20,
    attendee_count: 16,
    image_url: '/api/placeholder/800/500',
    tags: ['coffee', 'tasting'],
    vibe_tags: ['cozy', 'social'],
    Business: {
      id: 'b2',
      name: 'Grindhouse Coffee',
      logo_url: '/api/placeholder/100/100',
      is_verified: true,
    },
  },
  {
    id: 't3',
    title: 'Happy Hour Hangout',
    category: 'happy_hour',
    start_time: getToday(17),
    end_time: getToday(19),
    venue_name: 'BrewHaus ATX',
    address: '1200 E 6th St',
    city: 'Austin',
    price: 0,
    is_free: true,
    max_attendees: 100,
    attendee_count: 55,
    image_url: '/api/placeholder/800/500',
    tags: ['happy_hour', 'drinks'],
    vibe_tags: ['social', 'fun'],
    Business: {
      id: 'b1',
      name: 'BrewHaus ATX',
      logo_url: '/api/placeholder/100/100',
      is_verified: true,
    },
  },
];

// ---------------------------------------------------------------------------
// Mock businesses
// ---------------------------------------------------------------------------
const mockBusinesses = [
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

// Events user is "attending" (RSVP'd)
const myUpcomingEvents = [mockEvents[0], mockEvents[2], mockEvents[4]];

// ---------------------------------------------------------------------------
// Greeting helper
// ---------------------------------------------------------------------------
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// ---------------------------------------------------------------------------
// Trending events -- sorted by attendee count descending
// ---------------------------------------------------------------------------
const trendingEvents = [...mockEvents]
  .sort((a, b) => b.attendee_count - a.attendee_count)
  .slice(0, 6);

// Featured events -- ones with is_featured flag
const featuredEvents = mockEvents.filter((e) => e.is_featured);

// ---------------------------------------------------------------------------
// Compact "today" card (inline component for the Happening Today section)
// ---------------------------------------------------------------------------
const TodayEventCard = ({ event }) => {
  const navigate = useNavigate();

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

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
    happy_hour: '#FFA726',
    themed_night: '#BA68C8',
  };

  const color = categoryColors[event.category] || '#0088FF';

  return (
    <div
      className="today-event-card"
      onClick={() => navigate(`/event/${event.id}`)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: '12px',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'background-color 0.2s, transform 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          width: '4px',
          height: '48px',
          borderRadius: '4px',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4
          style={{
            color: '#E8EAFF',
            fontSize: '14px',
            fontWeight: 600,
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {event.title}
        </h4>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '4px',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#8A8FB5',
              fontSize: '12px',
            }}
          >
            <Clock size={12} />
            {formatTime(event.start_time)}
          </span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#8A8FB5',
              fontSize: '12px',
            }}
          >
            <MapPin size={12} />
            {event.venue_name}
          </span>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#8A8FB5',
          fontSize: '12px',
          flexShrink: 0,
        }}
      >
        <Users size={12} />
        {event.attendee_count}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Section wrapper with title, optional action, and divider
// ---------------------------------------------------------------------------
const Section = ({ title, emoji, action, actionLabel, onAction, count, children, style = {} }) => (
  <section style={{ padding: '0 16px', marginBottom: '28px', ...style }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#E8EAFF',
            margin: 0,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {emoji && <span style={{ marginRight: '6px' }}>{emoji}</span>}
          {title}
        </h2>
        {count !== undefined && (
          <span
            style={{
              backgroundColor: '#0088FF22',
              color: '#0088FF',
              fontSize: '12px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '10px',
            }}
          >
            {count}
          </span>
        )}
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#0088FF',
            fontSize: '13px',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {actionLabel}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
    {children}
  </section>
);

// ---------------------------------------------------------------------------
// HomePage Component
// ---------------------------------------------------------------------------
const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const featuredScrollRef = useRef(null);
  const businessScrollRef = useRef(null);

  const userName = user?.display_name?.split(' ')[0] || 'Explorer';

  return (
    <div
      className="home-page"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0E27',
        paddingBottom: '100px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Header */}
      <Header
        showLogo={true}
        showSearch={true}
        showNotifications={true}
        showLocation={true}
      />

      {/* Greeting Section */}
      <section style={{ padding: '20px 16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <Avatar
            src={user?.avatar_url}
            name={user?.display_name || 'Explorer'}
            size="lg"
            showOnlineIndicator
            isOnline={true}
          />
          <div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 700,
                margin: 0,
                background: 'linear-gradient(135deg, #E8EAFF, #0088FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {getGreeting()}, {userName}
            </h1>
            <p
              style={{
                color: '#8A8FB5',
                fontSize: '14px',
                margin: '2px 0 0',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Discover what's happening near you
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          margin: '12px 16px 20px',
        }}
      />

      {/* Featured Events Carousel */}
      <Section
        title="Featured Events"
        emoji=""
        actionLabel="See All"
        onAction={() => navigate('/explore')}
      >
        <div
          ref={featuredScrollRef}
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            paddingBottom: '4px',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {featuredEvents.map((event) => (
            <div
              key={event.id}
              style={{
                minWidth: '300px',
                maxWidth: '340px',
                flexShrink: 0,
                scrollSnapAlign: 'start',
              }}
            >
              <EventCard event={event} variant="featured" />
            </div>
          ))}
        </div>
      </Section>

      {/* Categories Section */}
      <Section title="Browse by Category">
        <CategoryScroll
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </Section>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          margin: '4px 16px 20px',
        }}
      />

      {/* Happening Today */}
      <Section
        title="Happening Today"
        count={todayEvents.length}
        actionLabel="See All"
        onAction={() => navigate('/explore')}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {todayEvents.map((event) => (
            <TodayEventCard key={event.id} event={event} />
          ))}
        </div>
      </Section>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          margin: '4px 16px 20px',
        }}
      />

      {/* Trending Events */}
      <Section
        title="Trending Near You"
        emoji={<Flame size={18} style={{ color: '#FF6B6B' }} />}
        actionLabel="See All"
        onAction={() => navigate('/explore')}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {trendingEvents.map((event) => (
            <EventCard key={event.id} event={event} variant="default" />
          ))}
        </div>
      </Section>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          margin: '4px 16px 20px',
        }}
      />

      {/* Popular Places (Businesses) */}
      <Section
        title="Popular Places"
        actionLabel="View All"
        onAction={() => navigate('/explore')}
      >
        <div
          ref={businessScrollRef}
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            paddingBottom: '4px',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {mockBusinesses.map((biz) => (
            <div
              key={biz.id}
              style={{ minWidth: '260px', maxWidth: '300px', flexShrink: 0 }}
            >
              <BusinessCard business={biz} variant="compact" />
            </div>
          ))}
        </div>
      </Section>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          margin: '4px 16px 20px',
        }}
      />

      {/* Your Upcoming Events (Schedule) */}
      <Section
        title="Your Schedule"
        emoji={<Calendar size={18} style={{ color: '#0088FF' }} />}
        actionLabel="View All"
        onAction={() => navigate('/profile')}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {myUpcomingEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => navigate(`/event/${event.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: 'rgba(0,136,255,0.06)',
                borderRadius: '12px',
                cursor: 'pointer',
                border: '1px solid rgba(0,136,255,0.12)',
                transition: 'background-color 0.2s, transform 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0,136,255,0.12)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0,136,255,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '10px',
                  backgroundImage: `url(${event.image_url || '/api/placeholder/100/100'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4
                  style={{
                    color: '#E8EAFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {event.title}
                </h4>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '4px',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#8A8FB5',
                      fontSize: '12px',
                    }}
                  >
                    <Calendar size={12} />
                    {new Date(event.start_time).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#8A8FB5',
                      fontSize: '12px',
                    }}
                  >
                    <MapPin size={12} />
                    {event.venue_name}
                  </span>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: '#0088FF22',
                  color: '#0088FF',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  flexShrink: 0,
                }}
              >
                Going
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Quick Stats Footer */}
      <div
        style={{
          padding: '16px',
          textAlign: 'center',
          marginTop: '8px',
        }}
      >
        <p
          style={{
            color: '#5A5F7D',
            fontSize: '13px',
            margin: 0,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <Sparkles
            size={14}
            style={{ verticalAlign: 'middle', marginRight: '4px', color: '#0088FF' }}
          />
          {mockEvents.length + todayEvents.length} events near Austin, TX
        </p>
      </div>
    </div>
  );
};

export default HomePage;
