import apiClient from './client';

/**
 * Get a paginated list of businesses.
 * @param {Object} params - Query parameters (page, limit, category, sort, etc.)
 * @returns {Promise<Object>} Paginated businesses response
 */
export const getBusinesses = (params = {}) => {
  return apiClient.get('/businesses', { params }).then((res) => res.data);
};

/**
 * Get a single business by ID.
 * @param {string} id - Business ID
 * @returns {Promise<Object>} Business data
 */
export const getBusiness = (id) => {
  return apiClient.get(`/businesses/${id}`).then((res) => res.data);
};

/**
 * Search businesses by query string.
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search results
 */
export const searchBusinesses = (query) => {
  return apiClient
    .get('/businesses/search', { params: { q: query } })
    .then((res) => res.data);
};

/**
 * Create a new business listing.
 * @param {Object} data - Business data
 * @returns {Promise<Object>} Created business
 */
export const createBusiness = (data) => {
  return apiClient.post('/businesses', data).then((res) => res.data);
};

/**
 * Update an existing business listing.
 * @param {string} id - Business ID
 * @param {Object} data - Updated fields
 * @returns {Promise<Object>} Updated business
 */
export const updateBusiness = (id, data) => {
  return apiClient.put(`/businesses/${id}`, data).then((res) => res.data);
};

/**
 * Follow a business.
 * @param {string} id - Business ID
 * @returns {Promise<Object>} Follow result
 */
export const followBusiness = (id) => {
  return apiClient.post(`/businesses/${id}/follow`).then((res) => res.data);
};

/**
 * Unfollow a business.
 * @param {string} id - Business ID
 * @returns {Promise<Object>} Unfollow result
 */
export const unfollowBusiness = (id) => {
  return apiClient.delete(`/businesses/${id}/follow`).then((res) => res.data);
};

/**
 * Get events hosted by a business.
 * @param {string} id - Business ID
 * @returns {Promise<Object>} Business events
 */
export const getBusinessEvents = (id) => {
  return apiClient.get(`/businesses/${id}/events`).then((res) => res.data);
};

/**
 * Get reviews for a business.
 * @param {string} id - Business ID
 * @returns {Promise<Object>} Business reviews
 */
export const getBusinessReviews = (id) => {
  return apiClient.get(`/businesses/${id}/reviews`).then((res) => res.data);
};

/**
 * Add a review to a business.
 * @param {string} id - Business ID
 * @param {Object} data - Review data { rating, comment }
 * @returns {Promise<Object>} Created review
 */
export const addReview = (id, data) => {
  return apiClient.post(`/businesses/${id}/reviews`, data).then((res) => res.data);
};

/**
 * Get analytics / statistics for a business.
 * @param {string} id - Business ID
 * @returns {Promise<Object>} Business statistics
 */
export const getBusinessStats = (id) => {
  return apiClient.get(`/businesses/${id}/stats`).then((res) => res.data);
};
