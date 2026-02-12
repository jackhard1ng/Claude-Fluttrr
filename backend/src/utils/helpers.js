const crypto = require('crypto');

/**
 * Calculate distance between two points using Haversine formula
 * @returns Distance in miles
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Generate a unique slug from text
 */
const generateSlug = (text, suffix = '') => {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
  return suffix ? `${slug}-${suffix}` : slug;
};

/**
 * Generate a random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Paginate query results
 */
const paginate = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Build pagination response
 */
const paginationResponse = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_prev: page > 1,
  };
};

/**
 * Format event time
 */
const formatEventTime = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  const isToday = start.toDateString() === now.toDateString();
  const isTomorrow = new Date(now.getTime() + 86400000).toDateString() === start.toDateString();
  const isThisWeek = start.getTime() - now.getTime() < 7 * 86400000 && start > now;

  let label = '';
  if (isToday) label = 'Today';
  else if (isTomorrow) label = 'Tomorrow';
  else if (isThisWeek) {
    label = start.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    label = start.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  const startStr = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const endStr = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return {
    label,
    time: `${startStr} - ${endStr}`,
    full: `${label}, ${startStr} - ${endStr}`,
    isToday,
    isTomorrow,
    isThisWeek,
    isPast: end < now,
    isHappeningNow: start <= now && end >= now,
  };
};

/**
 * Sanitize user input
 */
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>]/g, '').trim();
};

/**
 * Get bounding box for a center point and radius
 */
const getBoundingBox = (lat, lon, radiusMiles) => {
  const latRadian = lat * (Math.PI / 180);
  const degLatKm = 110.574;
  const degLonKm = 111.32 * Math.cos(latRadian);
  const radiusKm = radiusMiles * 1.60934;

  const deltaLat = radiusKm / degLatKm;
  const deltaLon = radiusKm / degLonKm;

  return {
    minLat: lat - deltaLat,
    maxLat: lat + deltaLat,
    minLon: lon - deltaLon,
    maxLon: lon + deltaLon,
  };
};

/**
 * Generate initials from a name
 */
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Format relative time
 */
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'w', seconds: 604800 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
    { label: 's', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) return `${count}${interval.label} ago`;
  }
  return 'just now';
};

module.exports = {
  calculateDistance,
  generateSlug,
  generateToken,
  paginate,
  paginationResponse,
  formatEventTime,
  sanitizeInput,
  getBoundingBox,
  getInitials,
  timeAgo,
};
