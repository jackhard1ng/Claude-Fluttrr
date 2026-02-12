import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  ArrowLeft,
  Search,
  X,
  MapPin,
  Users,
  Calendar,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock map events
// ---------------------------------------------------------------------------
const mockMapEvents = [
  {
    id: '1',
    title: 'Tuesday Trivia Night',
    category: 'trivia',
    lat: 30.2672,
    lng: -97.7431,
    venue: 'BrewHaus ATX',
    attendee_count: 67,
    is_free: true,
    start_time: new Date(Date.now() + 86400000),
    image_url: '/api/placeholder/400/200',
  },
  {
    id: '2',
    title: 'Remote Work Wednesday',
    category: 'networking',
    lat: 30.2500,
    lng: -97.7500,
    venue: 'Grindhouse Coffee',
    attendee_count: 28,
    is_free: true,
    start_time: new Date(Date.now() + 2 * 86400000),
    image_url: '/api/placeholder/400/200',
  },
  {
    id: '3',
    title: 'Glow Bowl Friday',
    category: 'themed_night',
    lat: 30.2630,
    lng: -97.7520,
    venue: 'Lucky Lanes',
    attendee_count: 145,
    is_free: false,
    start_time: new Date(Date.now() + 3 * 86400000),
    image_url: '/api/placeholder/400/200',
  },
  {
    id: '4',
    title: 'Sunrise Yoga',
    category: 'fitness',
    lat: 30.2669,
    lng: -97.7710,
    venue: 'Zilker Park',
    attendee_count: 32,
    is_free: true,
    start_time: new Date(Date.now() + 86400000),
    image_url: '/api/placeholder/400/200',
  },
  {
    id: '5',
    title: 'Paint & Sip',
    category: 'art',
    lat: 30.2650,
    lng: -97.7490,
    venue: 'Palette Gallery',
    attendee_count: 24,
    is_free: false,
    start_time: new Date(Date.now() + 4 * 86400000),
    image_url: '/api/placeholder/400/200',
  },
  {
    id: '6',
    title: 'Live Music Saturday',
    category: 'music',
    lat: 30.2685,
    lng: -97.7425,
    venue: 'BrewHaus ATX',
    attendee_count: 89,
    is_free: true,
    start_time: new Date(Date.now() + 5 * 86400000),
    image_url: '/api/placeholder/400/200',
  },
  {
    id: '7',
    title: 'Board Game Brunch',
    category: 'board_games',
    lat: 30.2510,
    lng: -97.7490,
    venue: 'Grindhouse Coffee',
    attendee_count: 18,
    is_free: true,
    start_time: new Date(Date.now() + 7 * 86400000),
    image_url: '/api/placeholder/400/200',
  },
  {
    id: '8',
    title: 'Salsa Night',
    category: 'dance',
    lat: 30.2680,
    lng: -97.7440,
    venue: 'BrewHaus ATX',
    attendee_count: 52,
    is_free: false,
    start_time: new Date(Date.now() + 3 * 86400000),
    image_url: '/api/placeholder/400/200',
  },
];

// ---------------------------------------------------------------------------
// Category emoji map
// ---------------------------------------------------------------------------
const categoryEmoji = {
  trivia: '🧠',
  networking: '🤝',
  themed_night: '🌙',
  fitness: '💪',
  art: '🎨',
  music: '🎵',
  board_games: '🎲',
  dance: '💃',
  food_drink: '🍕',
  comedy: '😂',
  karaoke: '🎤',
  sports: '⚽',
  outdoor: '🌳',
  wellness: '🧘',
  happy_hour: '🍻',
};

const categoryLabels = {
  trivia: 'Trivia',
  networking: 'Networking',
  themed_night: 'Themed Night',
  fitness: 'Fitness',
  art: 'Art',
  music: 'Music',
  board_games: 'Board Games',
  dance: 'Dance',
  food_drink: 'Food & Drink',
  comedy: 'Comedy',
  karaoke: 'Karaoke',
  sports: 'Sports',
  outdoor: 'Outdoor',
  wellness: 'Wellness',
  happy_hour: 'Happy Hour',
};

// ---------------------------------------------------------------------------
// Custom Leaflet marker icon factory
// ---------------------------------------------------------------------------
const createMarkerIcon = (category) => {
  const emoji = categoryEmoji[category] || '📍';
  return L.divIcon({
    html: `<div style="
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0066CC, #0088FF);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(0,136,255,0.5);
      border: 2px solid #E8EAFF;
    ">${emoji}</div>`,
    className: 'custom-map-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
  });
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const calcDistance = (lat1, lng1, lat2, lng2) => {
  // Simple Haversine approximation for miles
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

const isToday = (date) => new Date(date).toDateString() === new Date().toDateString();

const isThisWeekend = (date) => {
  const d = new Date(date);
  const now = new Date();
  const day = now.getDay();
  const daysUntilSat = (6 - day + 7) % 7;
  const saturday = new Date(now);
  saturday.setDate(now.getDate() + daysUntilSat);
  saturday.setHours(0, 0, 0, 0);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  sunday.setHours(23, 59, 59, 999);
  return d >= saturday && d <= sunday;
};

// Austin center coordinates
const AUSTIN_CENTER = [30.2672, -97.7431];

// ---------------------------------------------------------------------------
// FlyToLocation component -- recenter map
// ---------------------------------------------------------------------------
const FlyToLocation = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 0.8 });
    }
  }, [center, map]);
  return null;
};

// ---------------------------------------------------------------------------
// Filter chips
// ---------------------------------------------------------------------------
const QUICK_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'free', label: 'Free' },
  { id: 'today', label: 'Today' },
  { id: 'weekend', label: 'This Weekend' },
];

const CATEGORY_FILTERS = [
  'trivia',
  'music',
  'fitness',
  'art',
  'dance',
  'networking',
  'board_games',
  'themed_night',
];

// ---------------------------------------------------------------------------
// MapViewPage Component
// ---------------------------------------------------------------------------
const MapViewPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const bottomSheetRef = useRef(null);

  // Filter events
  const filteredEvents = useMemo(() => {
    let events = [...mockMapEvents];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }

    // Quick filter
    if (activeQuickFilter === 'free') {
      events = events.filter((e) => e.is_free);
    } else if (activeQuickFilter === 'today') {
      events = events.filter((e) => isToday(e.start_time));
    } else if (activeQuickFilter === 'weekend') {
      events = events.filter((e) => isThisWeekend(e.start_time));
    }

    // Category filter
    if (activeCategoryFilter) {
      events = events.filter((e) => e.category === activeCategoryFilter);
    }

    return events;
  }, [searchQuery, activeQuickFilter, activeCategoryFilter]);

  // Sort by distance for bottom sheet
  const sortedByDistance = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const dA = parseFloat(calcDistance(AUSTIN_CENTER[0], AUSTIN_CENTER[1], a.lat, a.lng));
      const dB = parseFloat(calcDistance(AUSTIN_CENTER[0], AUSTIN_CENTER[1], b.lat, b.lng));
      return dA - dB;
    });
  }, [filteredEvents]);

  const styles = {
    page: {
      position: 'relative',
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      backgroundColor: '#0A0E27',
      fontFamily: "'Inter', sans-serif",
    },
    headerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      padding: '12px 16px',
      background: 'linear-gradient(180deg, rgba(10,14,39,0.95) 0%, rgba(10,14,39,0.6) 80%, transparent 100%)',
      pointerEvents: 'none',
    },
    headerInner: {
      pointerEvents: 'auto',
    },
    searchRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: '#1A1F44',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#E8EAFF',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    },
    searchBar: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      backgroundColor: '#1A1F44',
      borderRadius: 12,
      padding: '10px 14px',
      border: '1px solid #1E2448',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    },
    searchInput: {
      flex: 1,
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      color: '#FFFFFF',
      fontSize: 14,
      fontFamily: "'Inter', sans-serif",
    },
    filterRow: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      WebkitOverflowScrolling: 'touch',
      paddingBottom: 2,
    },
    filterChip: (isActive) => ({
      padding: '7px 14px',
      borderRadius: 20,
      backgroundColor: isActive ? '#0088FF' : 'rgba(26,31,68,0.9)',
      border: isActive ? 'none' : '1px solid #1E2448',
      color: isActive ? '#FFFFFF' : '#A0A6C0',
      fontSize: 12,
      fontWeight: isActive ? 600 : 500,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      fontFamily: "'Inter', sans-serif",
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      transition: 'all 0.2s',
    }),
    mapContainer: {
      width: '100%',
      height: '100%',
    },
    bottomSheet: (expanded) => ({
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: '#0F1336',
      borderRadius: '20px 20px 0 0',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
      transition: 'max-height 0.35s ease, height 0.35s ease',
      maxHeight: expanded ? '60vh' : '220px',
      display: 'flex',
      flexDirection: 'column',
    }),
    sheetHandle: {
      display: 'flex',
      justifyContent: 'center',
      padding: '10px 0 6px',
      cursor: 'pointer',
    },
    handleBar: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#2A2F55',
    },
    sheetHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 20px 12px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    sheetTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: '#E8EAFF',
      margin: 0,
    },
    sheetCount: {
      fontSize: 12,
      color: '#8A8FB5',
    },
    sheetList: {
      flex: 1,
      overflowY: 'auto',
      padding: '8px 0',
      scrollbarWidth: 'thin',
      scrollbarColor: '#1E2448 transparent',
    },
    sheetEventCard: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 20px',
      cursor: 'pointer',
      transition: 'background-color 0.15s',
    },
    sheetEventImage: {
      width: 56,
      height: 56,
      borderRadius: 10,
      backgroundColor: '#1A1F44',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      flexShrink: 0,
    },
    sheetEventInfo: {
      flex: 1,
      minWidth: 0,
    },
    sheetEventTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: '#E8EAFF',
      margin: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    sheetEventMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    sheetMetaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      color: '#8A8FB5',
      fontSize: 12,
    },
    sheetDistance: {
      fontSize: 12,
      color: '#0088FF',
      fontWeight: 600,
      flexShrink: 0,
    },
    popupCard: {
      width: 240,
      backgroundColor: '#0F1336',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      fontFamily: "'Inter', sans-serif",
    },
    popupImage: {
      width: '100%',
      height: 100,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: '#1A1F44',
    },
    popupBody: {
      padding: 12,
    },
    popupTitle: {
      fontSize: 14,
      fontWeight: 700,
      color: '#E8EAFF',
      margin: '0 0 6px',
    },
    popupMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 12,
      color: '#8A8FB5',
      marginBottom: 4,
    },
    popupBtn: {
      width: '100%',
      padding: '8px',
      borderRadius: 8,
      background: 'linear-gradient(135deg, #0066CC, #0088FF)',
      border: 'none',
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: 8,
      fontFamily: "'Inter', sans-serif",
    },
    popupBadge: (isFree) => ({
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 8,
      backgroundColor: isFree ? 'rgba(0,212,170,0.2)' : 'rgba(255,179,71,0.2)',
      color: isFree ? '#00D4AA' : '#FFB347',
      fontSize: 11,
      fontWeight: 600,
      marginTop: 4,
    }),
  };

  return (
    <div style={styles.page}>
      {/* Header Overlay */}
      <div style={styles.headerOverlay}>
        <div style={styles.headerInner}>
          {/* Search Row */}
          <div style={styles.searchRow}>
            <button
              style={styles.backBtn}
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} />
            </button>
            <div style={styles.searchBar}>
              <Search size={18} color="#6B7194" />
              <input
                style={styles.searchInput}
                type="text"
                placeholder="Search events on map..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  style={{ background: 'none', border: 'none', color: '#6B7194', cursor: 'pointer', padding: 2, display: 'flex' }}
                  onClick={() => setSearchQuery('')}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Chips */}
          <div style={styles.filterRow}>
            {QUICK_FILTERS.map((f) => (
              <button
                key={f.id}
                style={styles.filterChip(activeQuickFilter === f.id)}
                onClick={() => setActiveQuickFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
            <div style={{ width: 1, height: 28, backgroundColor: '#1E2448', flexShrink: 0, margin: '0 4px' }} />
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                style={styles.filterChip(activeCategoryFilter === cat)}
                onClick={() =>
                  setActiveCategoryFilter(activeCategoryFilter === cat ? null : cat)
                }
              >
                {categoryEmoji[cat]} {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={AUSTIN_CENTER}
        zoom={13}
        style={styles.mapContainer}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {flyTarget && <FlyToLocation center={flyTarget} />}

        {filteredEvents.map((event) => (
          <Marker
            key={event.id}
            position={[event.lat, event.lng]}
            icon={createMarkerIcon(event.category)}
          >
            <Popup className="custom-popup" closeButton={false}>
              <div style={styles.popupCard}>
                <div
                  style={{
                    ...styles.popupImage,
                    backgroundImage: `url(${event.image_url})`,
                  }}
                />
                <div style={styles.popupBody}>
                  <h4 style={styles.popupTitle}>{event.title}</h4>
                  <div style={styles.popupMeta}>
                    <Calendar size={12} />
                    {formatDate(event.start_time)}
                  </div>
                  <div style={styles.popupMeta}>
                    <MapPin size={12} />
                    {event.venue}
                  </div>
                  <div style={styles.popupMeta}>
                    <Users size={12} />
                    {event.attendee_count} going
                  </div>
                  <span style={styles.popupBadge(event.is_free)}>
                    {event.is_free ? 'Free' : 'Paid'}
                  </span>
                  <button
                    style={styles.popupBtn}
                    onClick={() => navigate(`/event/${event.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Bottom Sheet */}
      <div
        ref={bottomSheetRef}
        style={styles.bottomSheet(bottomSheetExpanded)}
      >
        <div
          style={styles.sheetHandle}
          onClick={() => setBottomSheetExpanded(!bottomSheetExpanded)}
        >
          <div style={styles.handleBar} />
        </div>
        <div style={styles.sheetHeader}>
          <h3 style={styles.sheetTitle}>
            Nearby Events
            {bottomSheetExpanded ? (
              <ChevronDown
                size={16}
                style={{ verticalAlign: 'middle', marginLeft: 6, cursor: 'pointer' }}
                onClick={() => setBottomSheetExpanded(false)}
              />
            ) : (
              <ChevronUp
                size={16}
                style={{ verticalAlign: 'middle', marginLeft: 6, cursor: 'pointer' }}
                onClick={() => setBottomSheetExpanded(true)}
              />
            )}
          </h3>
          <span style={styles.sheetCount}>{sortedByDistance.length} events</span>
        </div>
        <div style={styles.sheetList}>
          {sortedByDistance.map((event) => {
            const distance = calcDistance(
              AUSTIN_CENTER[0],
              AUSTIN_CENTER[1],
              event.lat,
              event.lng
            );
            return (
              <div
                key={event.id}
                style={styles.sheetEventCard}
                onClick={() => {
                  setFlyTarget([event.lat, event.lng]);
                  // Reset fly target after animation
                  setTimeout(() => setFlyTarget(null), 1000);
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                <div
                  style={{
                    ...styles.sheetEventImage,
                    backgroundImage: `url(${event.image_url})`,
                  }}
                />
                <div style={styles.sheetEventInfo}>
                  <h4 style={styles.sheetEventTitle}>
                    {categoryEmoji[event.category]} {event.title}
                  </h4>
                  <div style={styles.sheetEventMeta}>
                    <span style={styles.sheetMetaItem}>
                      <Calendar size={11} />
                      {formatDate(event.start_time)}
                    </span>
                    <span style={styles.sheetMetaItem}>
                      <MapPin size={11} />
                      {event.venue}
                    </span>
                    <span style={styles.sheetMetaItem}>
                      <Users size={11} />
                      {event.attendee_count}
                    </span>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    {event.is_free ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#00D4AA',
                          backgroundColor: 'rgba(0,212,170,0.15)',
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        Free
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#FFB347',
                          backgroundColor: 'rgba(255,179,71,0.15)',
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        Paid
                      </span>
                    )}
                  </div>
                </div>
                <span style={styles.sheetDistance}>{distance} mi</span>
              </div>
            );
          })}

          {sortedByDistance.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '30px 20px',
                color: '#5A5F7D',
              }}
            >
              <MapPin size={28} style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 14, margin: 0 }}>No events match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapViewPage;
