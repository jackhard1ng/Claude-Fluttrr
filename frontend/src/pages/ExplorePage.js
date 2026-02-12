import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map,
  List,
  SlidersHorizontal,
  Sparkles,
  Loader,
  ChevronDown,
} from 'lucide-react';
import Header from '../components/layout/Header';
import EventCard from '../components/common/EventCard';
import SearchBar from '../components/common/SearchBar';
import CategoryScroll from '../components/common/CategoryScroll';

// ---------------------------------------------------------------------------
// Date helpers -- produce ISO strings relative to "now" for demo data
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
// Mock events data
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
  // Extra events so the grid feels full and "Load More" is meaningful
  {
    id: '9',
    title: 'Open Mic Comedy Night',
    category: 'comedy',
    start_time: getDayAfter(20),
    end_time: getDayAfter(22, 30),
    venue_name: 'BrewHaus ATX',
    address: '1200 E 6th St',
    city: 'Austin',
    price: 0,
    is_free: true,
    max_attendees: 100,
    attendee_count: 73,
    image_url: '/api/placeholder/800/500',
    tags: ['comedy', 'open_mic'],
    vibe_tags: ['fun', 'social'],
    Business: {
      id: 'b1',
      name: 'BrewHaus ATX',
      logo_url: '/api/placeholder/100/100',
      is_verified: true,
    },
  },
  {
    id: '10',
    title: 'Weekend Farmers Market',
    category: 'community',
    start_time: getIn4Days(8),
    end_time: getIn4Days(13),
    venue_name: 'Zilker Park',
    address: 'Barton Springs Rd',
    city: 'Austin',
    price: 0,
    is_free: true,
    max_attendees: 500,
    attendee_count: 312,
    image_url: '/api/placeholder/800/500',
    tags: ['market', 'local', 'food'],
    vibe_tags: ['community', 'relaxing'],
    Business: {
      id: 'b4',
      name: 'Flow Yoga Studio',
      logo_url: '/api/placeholder/100/100',
      is_verified: true,
    },
  },
  {
    id: '11',
    title: 'Karaoke Thursdays',
    category: 'karaoke',
    start_time: getDayAfter(21),
    end_time: getDayAfter(23, 59),
    venue_name: 'Lucky Lanes',
    address: '789 Lamar Blvd',
    city: 'Austin',
    price: 0,
    is_free: true,
    max_attendees: 60,
    attendee_count: 38,
    image_url: '/api/placeholder/800/500',
    tags: ['karaoke', 'singing'],
    vibe_tags: ['energetic', 'fun'],
    Business: {
      id: 'b3',
      name: 'Lucky Lanes Bowling',
      logo_url: '/api/placeholder/100/100',
      is_verified: true,
    },
  },
  {
    id: '12',
    title: 'Pottery Workshop for Beginners',
    category: 'workshop',
    start_time: getIn5Days(10),
    end_time: getIn5Days(13),
    venue_name: 'Palette Art Gallery',
    address: '567 E Cesar Chavez',
    city: 'Austin',
    price: 45,
    is_free: false,
    max_attendees: 15,
    attendee_count: 11,
    image_url: '/api/placeholder/800/500',
    tags: ['pottery', 'craft', 'beginner'],
    vibe_tags: ['creative', 'relaxing'],
    Business: {
      id: 'b5',
      name: 'Palette Art Gallery',
      logo_url: '/api/placeholder/100/100',
      is_verified: true,
    },
  },
];

// ---------------------------------------------------------------------------
// Filter definitions
// ---------------------------------------------------------------------------
const QUICK_FILTERS = [
  { id: 'today', label: 'Today' },
  { id: 'this_week', label: 'This Week' },
  { id: 'free', label: 'Free' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'popular', label: 'Popular' },
];

const INITIAL_VISIBLE = 6;
const LOAD_MORE_COUNT = 4;

// ---------------------------------------------------------------------------
// Skeleton loader for loading states
// ---------------------------------------------------------------------------
const SkeletonCard = () => (
  <div
    style={{
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: '16px',
      overflow: 'hidden',
      animation: 'skeletonPulse 1.5s ease-in-out infinite',
    }}
  >
    <div
      style={{
        width: '100%',
        height: '180px',
        backgroundColor: 'rgba(255,255,255,0.06)',
      }}
    />
    <div style={{ padding: '14px' }}>
      <div
        style={{
          width: '40%',
          height: '12px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: '6px',
          marginBottom: '10px',
        }}
      />
      <div
        style={{
          width: '80%',
          height: '16px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: '6px',
          marginBottom: '10px',
        }}
      />
      <div
        style={{
          width: '60%',
          height: '12px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: '6px',
          marginBottom: '10px',
        }}
      />
      <div
        style={{
          width: '50%',
          height: '12px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: '6px',
        }}
      />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Empty state component
// ---------------------------------------------------------------------------
const EmptyState = ({ message }) => (
  <div
    style={{
      textAlign: 'center',
      padding: '48px 24px',
      color: '#5A5F7D',
    }}
  >
    <Sparkles size={40} style={{ color: '#0088FF44', marginBottom: '12px' }} />
    <p
      style={{
        fontSize: '16px',
        fontWeight: 600,
        color: '#8A8FB5',
        marginBottom: '4px',
      }}
    >
      No events found
    </p>
    <p style={{ fontSize: '13px' }}>{message}</p>
  </div>
);

// ---------------------------------------------------------------------------
// ExplorePage Component
// ---------------------------------------------------------------------------
const ExplorePage = () => {
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFilters, setActiveFilters] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [isLoading, setIsLoading] = useState(false);

  // Toggle a quick filter chip
  const toggleFilter = useCallback((filterId) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
    // Reset visible count when filters change
    setVisibleCount(INITIAL_VISIBLE);
  }, []);

  // Filtered events computed from all state
  const filteredEvents = useMemo(() => {
    let events = [...mockEvents];

    // Category filter
    if (selectedCategory !== 'all') {
      events = events.filter((e) => e.category === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.venue_name.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.tags && e.tags.some((t) => t.toLowerCase().includes(q))) ||
          (e.Business && e.Business.name.toLowerCase().includes(q))
      );
    }

    // Quick filters
    if (activeFilters.includes('today')) {
      const todayStr = new Date().toDateString();
      events = events.filter(
        (e) => new Date(e.start_time).toDateString() === todayStr
      );
    }
    if (activeFilters.includes('this_week')) {
      const now = new Date();
      const weekEnd = new Date();
      weekEnd.setDate(now.getDate() + 7);
      events = events.filter((e) => {
        const d = new Date(e.start_time);
        return d >= now && d <= weekEnd;
      });
    }
    if (activeFilters.includes('free')) {
      events = events.filter((e) => e.is_free);
    }
    if (activeFilters.includes('popular')) {
      events = events.filter((e) => e.attendee_count >= 50);
    }
    // 'nearby' is a placeholder -- all demo events are in Austin
    // so it doesn't further filter, but we keep the chip active-state

    return events;
  }, [selectedCategory, searchQuery, activeFilters]);

  // Events to display (paginated)
  const displayedEvents = filteredEvents.slice(0, visibleCount);
  const hasMore = visibleCount < filteredEvents.length;

  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
      setIsLoading(false);
    }, 600);
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setVisibleCount(INITIAL_VISIBLE);
  };

  return (
    <div
      className="explore-page"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0E27',
        paddingBottom: '100px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Skeleton pulse animation */}
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Header */}
      <Header
        title="Explore"
        showSearch={true}
        showNotifications={true}
      />

      {/* Search Bar */}
      <div style={{ padding: '12px 16px 8px' }}>
        <SearchBar
          placeholder="Search events, places, categories..."
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={(val) => setSearchQuery(val)}
          showFilters={true}
          onFilterClick={() => {
            /* Would open a full filter modal */
          }}
          size="lg"
        />
      </div>

      {/* Category Chips */}
      <div style={{ padding: '8px 0' }}>
        <CategoryScroll
          selected={selectedCategory}
          onSelect={handleCategorySelect}
        />
      </div>

      {/* View Toggle + Filter Bar */}
      <div
        style={{
          padding: '8px 16px 4px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {/* View toggle */}
        <div
          style={{
            display: 'flex',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setViewMode('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '32px',
              backgroundColor:
                viewMode === 'grid'
                  ? 'rgba(0,136,255,0.2)'
                  : 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: viewMode === 'grid' ? '#0088FF' : '#5A5F7D',
              transition: 'all 0.2s',
            }}
            aria-label="Grid view"
          >
            <List size={16} style={{ transform: 'rotate(90deg)' }} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '32px',
              backgroundColor:
                viewMode === 'list'
                  ? 'rgba(0,136,255,0.2)'
                  : 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: viewMode === 'list' ? '#0088FF' : '#5A5F7D',
              transition: 'all 0.2s',
            }}
            aria-label="List view"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => navigate('/explore/map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '32px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#5A5F7D',
              transition: 'all 0.2s',
            }}
            aria-label="Map view"
          >
            <Map size={16} />
          </button>
        </div>

        {/* Quick filter chips -- horizontal scroll */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            flex: 1,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {QUICK_FILTERS.map((filter) => {
            const isActive = activeFilters.includes(filter.id);
            return (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  border: isActive
                    ? '1px solid #0088FF'
                    : '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: isActive
                    ? '#0088FF'
                    : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#fff' : '#8A8FB5',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div
        style={{
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
            size={13}
            style={{ verticalAlign: 'middle', marginRight: '4px', color: '#0088FF' }}
          />
          <span style={{ color: '#8A8FB5', fontWeight: 600 }}>
            {filteredEvents.length}
          </span>{' '}
          events near you
        </p>
        {(selectedCategory !== 'all' ||
          activeFilters.length > 0 ||
          searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('all');
              setActiveFilters([]);
              setSearchQuery('');
              setVisibleCount(INITIAL_VISIBLE);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#0088FF',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          margin: '0 16px 16px',
        }}
      />

      {/* Events Grid / List */}
      <div style={{ padding: '0 16px' }}>
        {displayedEvents.length === 0 && !isLoading ? (
          <EmptyState
            message={
              searchQuery
                ? `Try adjusting your search or filters.`
                : `No events match your current filters. Try another category.`
            }
          />
        ) : viewMode === 'grid' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {displayedEvents.map((event) => (
              <EventCard key={event.id} event={event} variant="default" />
            ))}
            {isLoading &&
              [...Array(2)].map((_, i) => <SkeletonCard key={`skel-${i}`} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayedEvents.map((event) => (
              <EventCard key={event.id} event={event} variant="compact" />
            ))}
            {isLoading &&
              [...Array(2)].map((_, i) => (
                <div
                  key={`skel-${i}`}
                  style={{
                    height: '80px',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: '12px',
                    animation: 'skeletonPulse 1.5s ease-in-out infinite',
                  }}
                />
              ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !isLoading && (
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={handleLoadMore}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 28px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                color: '#0088FF',
                backgroundColor: 'rgba(0,136,255,0.1)',
                border: '1px solid rgba(0,136,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0,136,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0,136,255,0.1)';
              }}
            >
              Load More
              <ChevronDown size={16} />
            </button>
          </div>
        )}

        {/* Loading indicator for Load More */}
        {isLoading && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Loader
              size={24}
              style={{
                color: '#0088FF',
                animation: 'spin 1s linear infinite',
              }}
            />
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
      </div>

      {/* Bottom spacer for smooth scroll above nav */}
      <div style={{ height: '24px' }} />
    </div>
  );
};

export default ExplorePage;
