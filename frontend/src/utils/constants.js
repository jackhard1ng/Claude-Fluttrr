/**
 * Fluttrr application constants.
 */

/**
 * API base URL (relative -- proxied by CRA in development).
 */
export const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

/**
 * Default map center (Austin, TX).
 */
export const MAP_DEFAULT_CENTER = {
  lat: 30.2672,
  lng: -97.7431,
  zoom: 13,
};

/**
 * Event categories with display metadata.
 * @type {Array<{value: string, label: string, icon: string, color: string}>}
 */
export const EVENT_CATEGORIES = [
  { value: 'live_music', label: 'Live Music', icon: 'Music', color: '#FF6B6B' },
  { value: 'dj_night', label: 'DJ Night', icon: 'Disc3', color: '#A855F7' },
  { value: 'comedy', label: 'Comedy', icon: 'Laugh', color: '#FFAA00' },
  { value: 'trivia', label: 'Trivia', icon: 'HelpCircle', color: '#00D68F' },
  { value: 'karaoke', label: 'Karaoke', icon: 'Mic', color: '#FF69B4' },
  { value: 'open_mic', label: 'Open Mic', icon: 'Mic2', color: '#FF8C42' },
  { value: 'food_drink', label: 'Food & Drink', icon: 'UtensilsCrossed', color: '#00D4FF' },
  { value: 'happy_hour', label: 'Happy Hour', icon: 'Wine', color: '#FFD700' },
  { value: 'brunch', label: 'Brunch', icon: 'Coffee', color: '#D4A574' },
  { value: 'sports', label: 'Sports', icon: 'Trophy', color: '#0088FF' },
  { value: 'watch_party', label: 'Watch Party', icon: 'Tv', color: '#4CAF50' },
  { value: 'fitness', label: 'Fitness', icon: 'Dumbbell', color: '#E91E63' },
  { value: 'yoga', label: 'Yoga', icon: 'Heart', color: '#9C27B0' },
  { value: 'art', label: 'Art & Gallery', icon: 'Palette', color: '#FF5722' },
  { value: 'dance', label: 'Dance', icon: 'Music2', color: '#E040FB' },
  { value: 'networking', label: 'Networking', icon: 'Users', color: '#0088FF' },
  { value: 'workshop', label: 'Workshop', icon: 'BookOpen', color: '#607D8B' },
  { value: 'outdoor', label: 'Outdoor', icon: 'TreePine', color: '#4CAF50' },
  { value: 'market', label: 'Market', icon: 'ShoppingBag', color: '#FF7043' },
  { value: 'festival', label: 'Festival', icon: 'PartyPopper', color: '#FF4081' },
  { value: 'community', label: 'Community', icon: 'HandHeart', color: '#26C6DA' },
  { value: 'other', label: 'Other', icon: 'Sparkles', color: '#78909C' },
];

/**
 * Business categories.
 * @type {Array<{value: string, label: string, icon: string, color: string}>}
 */
export const BUSINESS_CATEGORIES = [
  { value: 'bar', label: 'Bar', icon: 'Wine', color: '#FF6B6B' },
  { value: 'restaurant', label: 'Restaurant', icon: 'UtensilsCrossed', color: '#FFAA00' },
  { value: 'cafe', label: 'Cafe', icon: 'Coffee', color: '#D4A574' },
  { value: 'brewery', label: 'Brewery', icon: 'Beer', color: '#FFD700' },
  { value: 'club', label: 'Nightclub', icon: 'Disc3', color: '#A855F7' },
  { value: 'venue', label: 'Venue', icon: 'Building2', color: '#0088FF' },
  { value: 'lounge', label: 'Lounge', icon: 'Sofa', color: '#E91E63' },
  { value: 'rooftop', label: 'Rooftop', icon: 'Sun', color: '#FF8C42' },
  { value: 'sports_bar', label: 'Sports Bar', icon: 'Trophy', color: '#4CAF50' },
  { value: 'winery', label: 'Winery', icon: 'Grape', color: '#9C27B0' },
  { value: 'food_truck', label: 'Food Truck', icon: 'Truck', color: '#FF5722' },
  { value: 'gallery', label: 'Gallery', icon: 'Palette', color: '#607D8B' },
  { value: 'fitness_studio', label: 'Fitness Studio', icon: 'Dumbbell', color: '#E040FB' },
  { value: 'coworking', label: 'Coworking', icon: 'Laptop', color: '#26C6DA' },
  { value: 'other', label: 'Other', icon: 'MapPin', color: '#78909C' },
];

/**
 * Vibe tags that users can assign to events.
 * @type {Array<{value: string, label: string, emoji: string}>}
 */
export const VIBE_TAGS = [
  { value: 'chill', label: 'Chill', emoji: '😌' },
  { value: 'hype', label: 'Hype', emoji: '🔥' },
  { value: 'cozy', label: 'Cozy', emoji: '🛋️' },
  { value: 'wild', label: 'Wild', emoji: '🎉' },
  { value: 'classy', label: 'Classy', emoji: '🥂' },
  { value: 'casual', label: 'Casual', emoji: '👋' },
  { value: 'romantic', label: 'Romantic', emoji: '💕' },
  { value: 'artsy', label: 'Artsy', emoji: '🎨' },
  { value: 'sporty', label: 'Sporty', emoji: '⚽' },
  { value: 'nerdy', label: 'Nerdy', emoji: '🤓' },
  { value: 'loud', label: 'Loud', emoji: '🔊' },
  { value: 'intimate', label: 'Intimate', emoji: '✨' },
  { value: 'family_friendly', label: 'Family Friendly', emoji: '👨‍👩‍👧‍👦' },
  { value: 'pet_friendly', label: 'Pet Friendly', emoji: '🐕' },
  { value: 'outdoor', label: 'Outdoor', emoji: '🌳' },
  { value: 'rooftop', label: 'Rooftop', emoji: '🏙️' },
];

/**
 * Price range options.
 * @type {Array<{value: string, label: string, description: string}>}
 */
export const PRICE_RANGES = [
  { value: 'free', label: 'Free', description: 'No cost' },
  { value: '$', label: '$', description: 'Under $15' },
  { value: '$$', label: '$$', description: '$15 - $30' },
  { value: '$$$', label: '$$$', description: '$30 - $60' },
  { value: '$$$$', label: '$$$$', description: '$60+' },
];

/**
 * Age restriction options for events.
 * @type {Array<{value: string, label: string}>}
 */
export const AGE_RESTRICTIONS = [
  { value: 'all_ages', label: 'All Ages' },
  { value: '18+', label: '18+' },
  { value: '21+', label: '21+' },
];

/**
 * Sort options for event lists.
 * @type {Array<{value: string, label: string}>}
 */
export const EVENT_SORT_OPTIONS = [
  { value: 'date_asc', label: 'Date (Soonest)' },
  { value: 'date_desc', label: 'Date (Latest)' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'distance', label: 'Nearest' },
  { value: 'price_asc', label: 'Price (Low to High)' },
  { value: 'price_desc', label: 'Price (High to Low)' },
  { value: 'newest', label: 'Recently Added' },
];

/**
 * RSVP status values.
 */
export const RSVP_STATUS = {
  GOING: 'going',
  INTERESTED: 'interested',
  MAYBE: 'maybe',
  NOT_GOING: 'not_going',
};

/**
 * Chat room types.
 */
export const CHAT_ROOM_TYPES = {
  DIRECT: 'direct',
  GROUP: 'group',
  EVENT: 'event',
};

/**
 * Notification types.
 */
export const NOTIFICATION_TYPES = {
  FOLLOW: 'follow',
  LIKE: 'like',
  COMMENT: 'comment',
  RSVP: 'rsvp',
  EVENT_REMINDER: 'event_reminder',
  EVENT_UPDATE: 'event_update',
  MESSAGE: 'message',
  SYSTEM: 'system',
};

/**
 * Maximum file upload sizes (in bytes).
 */
export const MAX_UPLOAD_SIZE = {
  AVATAR: 5 * 1024 * 1024, // 5MB
  EVENT_IMAGE: 10 * 1024 * 1024, // 10MB
  CHAT_ATTACHMENT: 25 * 1024 * 1024, // 25MB
};

/**
 * Pagination defaults.
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  CHAT_MESSAGE_LIMIT: 50,
};
