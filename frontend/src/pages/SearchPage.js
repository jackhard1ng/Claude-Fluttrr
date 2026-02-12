import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ArrowLeft,
  TrendingUp,
  Clock,
  MapPin,
  Calendar,
  Users,
  Star,
  Store,
  User,
  ChevronRight,
} from 'lucide-react';
import Avatar from '../components/common/Avatar';

// ---------------------------------------------------------------------------
// Mock searchable data
// ---------------------------------------------------------------------------
const mockEvents = [
  {
    id: '1',
    type: 'event',
    title: 'Tuesday Trivia Night: Pop Culture Edition',
    category: 'trivia',
    venue: 'BrewHaus ATX',
    date: 'Tomorrow, 7 PM',
    attendees: 67,
  },
  {
    id: '2',
    type: 'event',
    title: 'Remote Work Wednesday',
    category: 'networking',
    venue: 'Grindhouse Coffee',
    date: 'Wed, 8 AM',
    attendees: 28,
  },
  {
    id: '3',
    type: 'event',
    title: 'Glow Bowl Friday',
    category: 'themed_night',
    venue: 'Lucky Lanes',
    date: 'Fri, 8 PM',
    attendees: 145,
  },
  {
    id: '4',
    type: 'event',
    title: 'Sunrise Yoga in the Park',
    category: 'fitness',
    venue: 'Zilker Park',
    date: 'Tomorrow, 6:30 AM',
    attendees: 32,
  },
  {
    id: '5',
    type: 'event',
    title: 'Paint & Sip: Austin Skyline',
    category: 'art',
    venue: 'Palette Art Gallery',
    date: 'Sat, 6:30 PM',
    attendees: 24,
  },
  {
    id: '6',
    type: 'event',
    title: 'Salsa Night: Beginner Lesson',
    category: 'dance',
    venue: 'BrewHaus ATX',
    date: 'Fri, 8 PM',
    attendees: 52,
  },
  {
    id: '7',
    type: 'event',
    title: 'Board Game Brunch',
    category: 'board_games',
    venue: 'Grindhouse Coffee',
    date: 'Next Sun, 10 AM',
    attendees: 18,
  },
  {
    id: '8',
    type: 'event',
    title: 'Happy Hour Hangout',
    category: 'happy_hour',
    venue: 'BrewHaus ATX',
    date: 'Today, 5 PM',
    attendees: 55,
  },
  {
    id: '9',
    type: 'event',
    title: 'Live Music: The Wayward Souls',
    category: 'music',
    venue: 'BrewHaus ATX',
    date: 'Sat, 7 PM',
    attendees: 89,
  },
];

const mockBusinesses = [
  {
    id: 'b1',
    type: 'business',
    name: 'BrewHaus ATX',
    category: 'Bar & Grill',
    address: '1200 E 6th St, Austin',
    rating: 4.6,
    events: 48,
  },
  {
    id: 'b2',
    type: 'business',
    name: 'Grindhouse Coffee',
    category: 'Cafe',
    address: '456 S Congress Ave, Austin',
    rating: 4.8,
    events: 22,
  },
  {
    id: 'b3',
    type: 'business',
    name: 'Lucky Lanes Bowling',
    category: 'Entertainment',
    address: '789 Lamar Blvd, Austin',
    rating: 4.3,
    events: 15,
  },
  {
    id: 'b4',
    type: 'business',
    name: 'Flow Yoga Studio',
    category: 'Fitness',
    address: 'Barton Springs Rd, Austin',
    rating: 4.9,
    events: 32,
  },
  {
    id: 'b5',
    type: 'business',
    name: 'Palette Art Gallery',
    category: 'Gallery',
    address: '567 E Cesar Chavez, Austin',
    rating: 4.7,
    events: 18,
  },
];

const mockPeople = [
  { id: 'u1', type: 'person', name: 'Sarah Chen', username: 'sarahc', interests: ['trivia', 'yoga'], avatar: null },
  { id: 'u2', type: 'person', name: 'James Park', username: 'jpark', interests: ['music', 'food'], avatar: null },
  { id: 'u3', type: 'person', name: 'Maya Rodriguez', username: 'mayar', interests: ['art', 'dance'], avatar: null },
  { id: 'u4', type: 'person', name: 'Alex Kim', username: 'alexk', interests: ['fitness', 'outdoor'], avatar: null },
];

const recentSearches = ['trivia', 'yoga austin', 'happy hour', 'board games'];

const trendingSearches = [
  'Trivia Night',
  'Glow Bowl Friday',
  'Salsa Dancing',
  'Live Music Austin',
  'Yoga in the Park',
  'Board Game Brunch',
];

// ---------------------------------------------------------------------------
// Category colors
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
  happy_hour: '#FFA726',
  themed_night: '#BA68C8',
};

// ---------------------------------------------------------------------------
// SearchPage
// ---------------------------------------------------------------------------
const SearchPage = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [recentVisible, setRecentVisible] = useState(recentSearches);

  // Auto-focus on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // ---- Search logic -------------------------------------------------------
  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const filteredEvents = isSearching
    ? mockEvents.filter(
        (e) =>
          e.title.toLowerCase().includes(normalizedQuery) ||
          e.category.toLowerCase().includes(normalizedQuery) ||
          e.venue.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const filteredBusinesses = isSearching
    ? mockBusinesses.filter(
        (b) =>
          b.name.toLowerCase().includes(normalizedQuery) ||
          b.category.toLowerCase().includes(normalizedQuery) ||
          b.address.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const filteredPeople = isSearching
    ? mockPeople.filter(
        (p) =>
          p.name.toLowerCase().includes(normalizedQuery) ||
          p.username.toLowerCase().includes(normalizedQuery) ||
          p.interests.some((i) => i.includes(normalizedQuery))
      )
    : [];

  const hasResults = filteredEvents.length > 0 || filteredBusinesses.length > 0 || filteredPeople.length > 0;

  const handleRecentClick = (term) => {
    setQuery(term);
  };

  const removeRecent = (term) => {
    setRecentVisible((prev) => prev.filter((t) => t !== term));
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  // ---- render -------------------------------------------------------------
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0E27',
        fontFamily: 'Inter, sans-serif',
        paddingBottom: '100px',
      }}
    >
      {/* Search header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
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
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={22} />
        </button>

        <div
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              color: '#5A5F7D',
              pointerEvents: 'none',
            }}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search events, places, people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 40px 12px 40px',
              backgroundColor: '#0D1230',
              border: '1.5px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              color: '#E8EAFF',
              fontSize: '15px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0088FF';
              e.target.style.boxShadow = '0 0 0 3px rgba(0,136,255,0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.08)';
              e.target.style.boxShadow = 'none';
            }}
          />
          {query && (
            <button
              onClick={handleClear}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                color: '#5A5F7D',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {!isSearching ? (
          <>
            {/* Recent searches */}
            {recentVisible.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <h3
                    style={{
                      color: '#E8EAFF',
                      fontSize: '15px',
                      fontWeight: 600,
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Clock size={16} color="#8A8FB5" />
                    Recent Searches
                  </h3>
                  <button
                    onClick={() => setRecentVisible([])}
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
                    Clear All
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {recentVisible.map((term) => (
                    <div
                      key={term}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                      onClick={() => handleRecentClick(term)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Clock size={16} color="#5A5F7D" />
                      <span style={{ color: '#E8EAFF', fontSize: '14px', flex: 1 }}>{term}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecent(term);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#5A5F7D',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending searches */}
            <div>
              <h3
                style={{
                  color: '#E8EAFF',
                  fontSize: '15px',
                  fontWeight: 600,
                  margin: '0 0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <TrendingUp size={16} color="#0088FF" />
                Trending
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {trendingSearches.map((term, i) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: '#0D1230',
                      color: '#E8EAFF',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0088FF';
                      e.currentTarget.style.backgroundColor = 'rgba(0,136,255,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.backgroundColor = '#0D1230';
                    }}
                  >
                    <span style={{ color: '#0088FF', fontSize: '12px', fontWeight: 700 }}>
                      {i + 1}
                    </span>
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : !hasResults ? (
          /* No results */
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
            }}
          >
            <Search
              size={48}
              color="#5A5F7D"
              style={{ marginBottom: '16px', opacity: 0.5 }}
            />
            <h3 style={{ color: '#E8EAFF', fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>
              No results found
            </h3>
            <p style={{ color: '#5A5F7D', fontSize: '13px', margin: 0 }}>
              Try searching for something else, like "trivia" or "yoga"
            </p>
          </div>
        ) : (
          /* Search results */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Events results */}
            {filteredEvents.length > 0 && (
              <div>
                <h3
                  style={{
                    color: '#8A8FB5',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    margin: '0 0 10px',
                  }}
                >
                  Events ({filteredEvents.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {filteredEvents.map((event) => {
                    const color = categoryColors[event.category] || '#0088FF';
                    return (
                      <div
                        key={event.id}
                        onClick={() => navigate(`/event/${event.id}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            backgroundColor: `${color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Calendar size={20} color={color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4
                            style={{
                              color: '#E8EAFF',
                              fontSize: '14px',
                              fontWeight: 600,
                              margin: '0 0 3px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {event.title}
                          </h4>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                            }}
                          >
                            <span
                              style={{
                                color: '#8A8FB5',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <MapPin size={11} />
                              {event.venue}
                            </span>
                            <span
                              style={{
                                color: '#8A8FB5',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Users size={11} />
                              {event.attendees}
                            </span>
                          </div>
                        </div>
                        <span style={{ color: '#5A5F7D', fontSize: '12px', flexShrink: 0 }}>
                          {event.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Businesses results */}
            {filteredBusinesses.length > 0 && (
              <div>
                <h3
                  style={{
                    color: '#8A8FB5',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    margin: '0 0 10px',
                  }}
                >
                  Businesses ({filteredBusinesses.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {filteredBusinesses.map((biz) => (
                    <div
                      key={biz.id}
                      onClick={() => navigate(`/business/${biz.id}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(0,136,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Store size={20} color="#0088FF" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4
                          style={{
                            color: '#E8EAFF',
                            fontSize: '14px',
                            fontWeight: 600,
                            margin: '0 0 3px',
                          }}
                        >
                          {biz.name}
                        </h4>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <span style={{ color: '#8A8FB5', fontSize: '12px' }}>{biz.category}</span>
                          <span
                            style={{
                              color: '#FFD54F',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <Star size={11} fill="#FFD54F" />
                            {biz.rating}
                          </span>
                          <span style={{ color: '#8A8FB5', fontSize: '12px' }}>
                            {biz.events} events
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} color="#5A5F7D" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* People results */}
            {filteredPeople.length > 0 && (
              <div>
                <h3
                  style={{
                    color: '#8A8FB5',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    margin: '0 0 10px',
                  }}
                >
                  People ({filteredPeople.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {filteredPeople.map((person) => (
                    <div
                      key={person.id}
                      onClick={() => navigate(`/profile/${person.id}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Avatar
                        src={person.avatar}
                        name={person.name}
                        size="md"
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#E8EAFF', fontSize: '14px', fontWeight: 600, margin: '0 0 2px' }}>
                          {person.name}
                        </h4>
                        <p style={{ color: '#8A8FB5', fontSize: '12px', margin: 0 }}>
                          @{person.username}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {person.interests.slice(0, 2).map((interest) => (
                          <span
                            key={interest}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(0,136,255,0.08)',
                              color: '#0088FF',
                              fontSize: '11px',
                              fontWeight: 500,
                            }}
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
