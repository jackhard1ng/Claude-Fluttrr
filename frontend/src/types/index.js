/**
 * @fileoverview JSDoc type definitions for the Fluttrr application.
 *
 * These types are used throughout the codebase for IDE autocompletion,
 * documentation, and static analysis. They are not enforced at runtime.
 */

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} username - Unique username
 * @property {string} display_name - Display name shown in the UI
 * @property {string} email - Email address
 * @property {string} [bio] - User biography / about text
 * @property {string} [city] - User's city
 * @property {string} [state] - User's state / region
 * @property {string} [avatar_url] - URL of the user's avatar image
 * @property {string} account_type - 'user' | 'business' | 'admin'
 * @property {string[]} [interests] - List of interest tags
 * @property {number} follower_count - Number of followers
 * @property {number} following_count - Number of users being followed
 * @property {number} events_attended_count - Number of events attended
 * @property {boolean} is_verified - Whether the user is verified
 * @property {boolean} [is_following] - Whether the current user follows this user
 * @property {string} [created_at] - ISO 8601 creation timestamp
 * @property {string} [updated_at] - ISO 8601 last-update timestamp
 */

// ---------------------------------------------------------------------------
// Business
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Business
 * @property {string} id - Unique business identifier
 * @property {string} name - Business name
 * @property {string} [description] - Business description
 * @property {string} category - Business category slug (e.g. 'bar', 'restaurant')
 * @property {string} [address] - Street address
 * @property {string} [city] - City
 * @property {string} [state] - State / region
 * @property {string} [zip_code] - ZIP / postal code
 * @property {number} [latitude] - Latitude coordinate
 * @property {number} [longitude] - Longitude coordinate
 * @property {string} [phone] - Contact phone number
 * @property {string} [website] - Website URL
 * @property {string} [image_url] - Primary image URL
 * @property {string[]} [gallery] - Array of additional image URLs
 * @property {Object} [hours] - Operating hours keyed by day of week
 * @property {string} [price_range] - Price range indicator ('$' to '$$$$')
 * @property {number} [rating] - Average rating (0-5)
 * @property {number} [review_count] - Number of reviews
 * @property {number} [follower_count] - Number of followers
 * @property {string} [owner_id] - User ID of the business owner
 * @property {boolean} [is_verified] - Whether the business is verified
 * @property {boolean} [is_following] - Whether the current user follows this business
 * @property {string[]} [vibe_tags] - Vibe tags associated with the business
 * @property {string} [created_at] - ISO 8601 creation timestamp
 * @property {string} [updated_at] - ISO 8601 last-update timestamp
 */

// ---------------------------------------------------------------------------
// Event
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Event
 * @property {string} id - Unique event identifier
 * @property {string} title - Event title
 * @property {string} [description] - Full event description
 * @property {string} category - Event category slug (e.g. 'live_music')
 * @property {string} start_date - ISO 8601 start date/time
 * @property {string} [end_date] - ISO 8601 end date/time
 * @property {string} [address] - Event address
 * @property {string} [city] - City
 * @property {string} [state] - State / region
 * @property {number} [latitude] - Latitude coordinate
 * @property {number} [longitude] - Longitude coordinate
 * @property {string} [venue_name] - Name of the venue
 * @property {string} [image_url] - Primary event image URL
 * @property {string[]} [gallery] - Additional image URLs
 * @property {number} [price] - Ticket price (0 for free)
 * @property {string} [price_range] - Price range indicator
 * @property {string} [age_restriction] - 'all_ages' | '18+' | '21+'
 * @property {number} [capacity] - Maximum number of attendees
 * @property {number} [attendee_count] - Current number of attendees
 * @property {number} [interested_count] - Number of users interested
 * @property {number} [view_count] - Number of views
 * @property {string[]} [vibe_tags] - Vibe tags for the event
 * @property {string} [rsvp_status] - Current user's RSVP status
 * @property {boolean} [is_saved] - Whether the current user saved this event
 * @property {boolean} [is_featured] - Whether the event is featured
 * @property {boolean} [is_trending] - Whether the event is trending
 * @property {string} [business_id] - ID of the hosting business (if any)
 * @property {Business} [business] - Populated business object
 * @property {string} [organizer_id] - ID of the event organizer
 * @property {User} [organizer] - Populated organizer object
 * @property {string} [created_at] - ISO 8601 creation timestamp
 * @property {string} [updated_at] - ISO 8601 last-update timestamp
 */

// ---------------------------------------------------------------------------
// ChatRoom
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} ChatRoom
 * @property {string} id - Unique room identifier
 * @property {string} type - Room type: 'direct' | 'group' | 'event'
 * @property {string} [name] - Room name (for group/event rooms)
 * @property {string} [image_url] - Room image/avatar URL
 * @property {User[]} participants - Array of participant users
 * @property {Message} [last_message] - Most recent message in the room
 * @property {number} unread_count - Number of unread messages for current user
 * @property {boolean} is_muted - Whether notifications are muted
 * @property {string} [event_id] - Associated event ID (for event rooms)
 * @property {string} [created_at] - ISO 8601 creation timestamp
 * @property {string} [updated_at] - ISO 8601 last-update timestamp
 */

// ---------------------------------------------------------------------------
// Message
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Message
 * @property {string} id - Unique message identifier
 * @property {string} room_id - ID of the chat room
 * @property {string} sender_id - ID of the message sender
 * @property {User} [sender] - Populated sender object
 * @property {string} content - Message text content
 * @property {string} type - Message type: 'text' | 'image' | 'event_share' | 'system'
 * @property {Object} [metadata] - Additional metadata (image URL, shared event, etc.)
 * @property {Object[]} [reactions] - Array of reactions { emoji, user_id }
 * @property {boolean} is_read - Whether the message has been read by the recipient
 * @property {string} [created_at] - ISO 8601 creation timestamp
 * @property {string} [updated_at] - ISO 8601 last-update timestamp
 */

// ---------------------------------------------------------------------------
// Notification
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Notification
 * @property {string} id - Unique notification identifier
 * @property {string} type - Notification type (see NOTIFICATION_TYPES constant)
 * @property {string} title - Short notification title
 * @property {string} body - Notification body text
 * @property {string} [image_url] - Associated image (e.g. user avatar)
 * @property {Object} [data] - Arbitrary payload (event ID, user ID, etc.)
 * @property {string} [action_url] - URL to navigate to when tapped
 * @property {boolean} is_read - Whether the notification has been read
 * @property {string} [sender_id] - ID of the user who triggered the notification
 * @property {User} [sender] - Populated sender object
 * @property {string} [created_at] - ISO 8601 creation timestamp
 */

// ---------------------------------------------------------------------------
// API Response Wrappers
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} data - Array of result items
 * @property {Object} pagination - Pagination metadata
 * @property {number} pagination.page - Current page number
 * @property {number} pagination.limit - Items per page
 * @property {number} pagination.total - Total number of items
 * @property {number} pagination.totalPages - Total number of pages
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {*} [data] - Response payload
 * @property {string} [message] - Human-readable message
 * @property {string} [error] - Error message (on failure)
 */

// Export nothing -- this file is purely for type documentation.
export {};
