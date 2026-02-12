import apiClient from './client';

/**
 * Get a user's public profile.
 * @param {string} id - User ID
 * @returns {Promise<Object>} User profile
 */
export const getProfile = (id) => {
  return apiClient.get(`/users/${id}`).then((res) => res.data);
};

/**
 * Update the current authenticated user's profile.
 * @param {Object} data - Profile fields to update
 * @returns {Promise<Object>} Updated profile
 */
export const updateProfile = (data) => {
  return apiClient.put('/users/profile', data).then((res) => res.data);
};

/**
 * Search for users by query string.
 * @param {string} query - Search query
 * @returns {Promise<Object>} User search results
 */
export const searchUsers = (query) => {
  return apiClient
    .get('/users/search', { params: { q: query } })
    .then((res) => res.data);
};

/**
 * Follow a user.
 * @param {string} id - User ID to follow
 * @returns {Promise<Object>} Follow result
 */
export const followUser = (id) => {
  return apiClient.post(`/users/${id}/follow`).then((res) => res.data);
};

/**
 * Unfollow a user.
 * @param {string} id - User ID to unfollow
 * @returns {Promise<Object>} Unfollow result
 */
export const unfollowUser = (id) => {
  return apiClient.delete(`/users/${id}/follow`).then((res) => res.data);
};

/**
 * Get events that a user is attending or has attended.
 * @param {string} id - User ID
 * @returns {Promise<Object>} User events
 */
export const getUserEvents = (id) => {
  return apiClient.get(`/users/${id}/events`).then((res) => res.data);
};

/**
 * Get a user's followers.
 * @param {string} id - User ID
 * @returns {Promise<Object>} Followers list
 */
export const getUserFollowers = (id) => {
  return apiClient.get(`/users/${id}/followers`).then((res) => res.data);
};

/**
 * Get users that a user is following.
 * @param {string} id - User ID
 * @returns {Promise<Object>} Following list
 */
export const getUserFollowing = (id) => {
  return apiClient.get(`/users/${id}/following`).then((res) => res.data);
};

/**
 * Get the authenticated user's saved events.
 * @returns {Promise<Object>} Saved events list
 */
export const getSavedEvents = () => {
  return apiClient.get('/users/saved-events').then((res) => res.data);
};

/**
 * Upload a new avatar image for the authenticated user.
 * @param {FormData} formData - Form data containing the avatar file
 * @returns {Promise<Object>} Updated user with new avatar URL
 */
export const updateAvatar = (formData) => {
  return apiClient
    .put('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
};
