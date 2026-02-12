import apiClient from './client';

/**
 * Get a paginated list of events.
 * @param {Object} params - Query parameters (page, limit, category, sort, etc.)
 * @returns {Promise<Object>} Paginated events response
 */
export const getEvents = (params = {}) => {
  return apiClient.get('/events', { params }).then((res) => res.data);
};

/**
 * Get a single event by ID.
 * @param {string} id - Event ID
 * @returns {Promise<Object>} Event data
 */
export const getEvent = (id) => {
  return apiClient.get(`/events/${id}`).then((res) => res.data);
};

/**
 * Get events near a geographic location.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Radius in miles
 * @param {Object} params - Additional query parameters
 * @returns {Promise<Object>} Nearby events
 */
export const getNearbyEvents = (lat, lng, radius = 10, params = {}) => {
  return apiClient
    .get('/events/nearby', {
      params: { lat, lng, radius, ...params },
    })
    .then((res) => res.data);
};

/**
 * Get currently trending events.
 * @returns {Promise<Object>} Trending events
 */
export const getTrendingEvents = () => {
  return apiClient.get('/events/trending').then((res) => res.data);
};

/**
 * Get featured / promoted events.
 * @returns {Promise<Object>} Featured events
 */
export const getFeaturedEvents = () => {
  return apiClient.get('/events/featured').then((res) => res.data);
};

/**
 * Get upcoming events sorted by date.
 * @returns {Promise<Object>} Upcoming events
 */
export const getUpcomingEvents = () => {
  return apiClient.get('/events/upcoming').then((res) => res.data);
};

/**
 * Search events by text query.
 * @param {string} query - Search string
 * @param {Object} params - Additional query params
 * @returns {Promise<Object>} Search results
 */
export const searchEvents = (query, params = {}) => {
  return apiClient
    .get('/events/search', {
      params: { q: query, ...params },
    })
    .then((res) => res.data);
};

/**
 * Get events filtered by category.
 * @param {string} category - Category slug
 * @param {Object} params - Additional query params
 * @returns {Promise<Object>} Events in category
 */
export const getEventsByCategory = (category, params = {}) => {
  return apiClient
    .get('/events', {
      params: { category, ...params },
    })
    .then((res) => res.data);
};

/**
 * Create a new event.
 * @param {Object} data - Event data
 * @returns {Promise<Object>} Created event
 */
export const createEvent = (data) => {
  return apiClient.post('/events', data).then((res) => res.data);
};

/**
 * Update an existing event.
 * @param {string} id - Event ID
 * @param {Object} data - Updated fields
 * @returns {Promise<Object>} Updated event
 */
export const updateEvent = (id, data) => {
  return apiClient.put(`/events/${id}`, data).then((res) => res.data);
};

/**
 * Delete an event.
 * @param {string} id - Event ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteEvent = (id) => {
  return apiClient.delete(`/events/${id}`).then((res) => res.data);
};

/**
 * RSVP to an event.
 * @param {string} id - Event ID
 * @param {string} status - RSVP status ('going', 'interested', 'maybe')
 * @returns {Promise<Object>} RSVP result
 */
export const rsvpEvent = (id, status = 'going') => {
  return apiClient.post(`/events/${id}/rsvp`, { status }).then((res) => res.data);
};

/**
 * Cancel an existing RSVP.
 * @param {string} id - Event ID
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelRsvp = (id) => {
  return apiClient.delete(`/events/${id}/rsvp`).then((res) => res.data);
};

/**
 * Save an event to the user's saved list.
 * @param {string} id - Event ID
 * @returns {Promise<Object>} Save result
 */
export const saveEvent = (id) => {
  return apiClient.post(`/events/${id}/save`).then((res) => res.data);
};

/**
 * Remove an event from the user's saved list.
 * @param {string} id - Event ID
 * @returns {Promise<Object>} Unsave result
 */
export const unsaveEvent = (id) => {
  return apiClient.delete(`/events/${id}/save`).then((res) => res.data);
};

/**
 * Get the list of attendees for an event.
 * @param {string} id - Event ID
 * @returns {Promise<Object>} Attendee list
 */
export const getEventAttendees = (id) => {
  return apiClient.get(`/events/${id}/attendees`).then((res) => res.data);
};

/**
 * Increment the view count for an event (e.g. on detail page open).
 * @param {string} id - Event ID
 * @returns {Promise<Object>} Updated view count
 */
export const incrementViewCount = (id) => {
  return apiClient.post(`/events/${id}/views`).then((res) => res.data);
};

/**
 * Get the list of available event categories.
 * @returns {Promise<Object>} Categories
 */
export const getEventCategories = () => {
  return apiClient.get('/events/categories').then((res) => res.data);
};
