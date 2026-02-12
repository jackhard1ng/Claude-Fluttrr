import { format, formatDistanceToNow, isToday, isTomorrow, isThisWeek, parseISO } from 'date-fns';
import { EVENT_CATEGORIES } from './constants';

// ---------------------------------------------------------------------------
// Date & Time Formatting
// ---------------------------------------------------------------------------

/**
 * Format a date string or Date object to a readable format.
 * @param {string|Date} date
 * @param {string} formatStr - date-fns format string (default 'MMM d, yyyy')
 * @returns {string}
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '';
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return format(parsed, formatStr);
  } catch {
    return '';
  }
};

/**
 * Format a date to time-only string.
 * @param {string|Date} date
 * @param {string} formatStr - default 'h:mm a'
 * @returns {string}
 */
export const formatTime = (date, formatStr = 'h:mm a') => {
  if (!date) return '';
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return format(parsed, formatStr);
  } catch {
    return '';
  }
};

/**
 * Format a date as a relative time string (e.g. "3 hours ago").
 * @param {string|Date} date
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(parsed, { addSuffix: true });
  } catch {
    return '';
  }
};

/**
 * Format a date specifically for event display.
 * Shows "Today", "Tomorrow", day of week, or full date.
 * @param {string|Date} date
 * @returns {string}
 */
export const formatEventDate = (date) => {
  if (!date) return '';
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date;

    if (isToday(parsed)) {
      return `Today at ${format(parsed, 'h:mm a')}`;
    }
    if (isTomorrow(parsed)) {
      return `Tomorrow at ${format(parsed, 'h:mm a')}`;
    }
    if (isThisWeek(parsed)) {
      return format(parsed, 'EEEE \'at\' h:mm a');
    }
    return format(parsed, 'EEE, MMM d \'at\' h:mm a');
  } catch {
    return '';
  }
};

// ---------------------------------------------------------------------------
// Number & Currency Formatting
// ---------------------------------------------------------------------------

/**
 * Format a price value for display.
 * @param {number} price - Price in dollars
 * @param {string} currency - Currency code (default 'USD')
 * @returns {string}
 */
export const formatPrice = (price, currency = 'USD') => {
  if (price === 0 || price === null || price === undefined) return 'Free';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `$${price}`;
  }
};

/**
 * Format a distance in miles for display.
 * @param {number} miles
 * @returns {string}
 */
export const formatDistance = (miles) => {
  if (miles === null || miles === undefined) return '';
  if (miles < 0.1) return 'Nearby';
  if (miles < 1) return `${(miles * 5280).toFixed(0)} ft`;
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
};

/**
 * Format a large number with abbreviation (1.2k, 3.4M, etc.).
 * @param {number} num
 * @returns {string}
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num < 1000) return num.toString();
  if (num < 1000000) {
    const val = num / 1000;
    return val % 1 === 0 ? `${val}k` : `${val.toFixed(1)}k`;
  }
  const val = num / 1000000;
  return val % 1 === 0 ? `${val}M` : `${val.toFixed(1)}M`;
};

// ---------------------------------------------------------------------------
// String Utilities
// ---------------------------------------------------------------------------

/**
 * Get initials from a display name (up to 2 characters).
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Truncate text to a maximum length with ellipsis.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
};

// ---------------------------------------------------------------------------
// Category Helpers
// ---------------------------------------------------------------------------

/**
 * Get the color associated with an event category.
 * @param {string} categoryValue
 * @returns {string}
 */
export const getCategoryColor = (categoryValue) => {
  const category = EVENT_CATEGORIES.find((c) => c.value === categoryValue);
  return category?.color || '#78909C';
};

/**
 * Get the icon name (Lucide icon) associated with an event category.
 * @param {string} categoryValue
 * @returns {string}
 */
export const getCategoryIcon = (categoryValue) => {
  const category = EVENT_CATEGORIES.find((c) => c.value === categoryValue);
  return category?.icon || 'Sparkles';
};

// ---------------------------------------------------------------------------
// Visual Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a CSS linear gradient string from one or two colors.
 * If only one color is provided, a lighter variant is generated automatically.
 * @param {string} color1
 * @param {string} color2
 * @param {number} angle - Gradient angle in degrees (default 135)
 * @returns {string}
 */
export const generateGradient = (color1, color2, angle = 135) => {
  if (!color1) return 'linear-gradient(135deg, #0088FF, #00D4FF)';
  const end = color2 || adjustColorBrightness(color1, 40);
  return `linear-gradient(${angle}deg, ${color1}, ${end})`;
};

/**
 * Adjust the brightness of a hex color.
 * Positive amount lightens, negative darkens.
 * @param {string} hex
 * @param {number} amount
 * @returns {string}
 */
const adjustColorBrightness = (hex, amount) => {
  let color = hex.replace('#', '');
  if (color.length === 3) {
    color = color
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(color, 16);
  let r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  let g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  let b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};
