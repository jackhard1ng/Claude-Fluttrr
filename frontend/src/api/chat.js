import apiClient from './client';

/**
 * Get all chat rooms for the authenticated user.
 * @returns {Promise<Object>} Chat rooms list
 */
export const getRooms = () => {
  return apiClient.get('/chat/rooms').then((res) => res.data);
};

/**
 * Get details for a specific chat room.
 * @param {string} id - Room ID
 * @returns {Promise<Object>} Room data
 */
export const getRoom = (id) => {
  return apiClient.get(`/chat/rooms/${id}`).then((res) => res.data);
};

/**
 * Create a new chat room.
 * @param {Object} data - Room data { type, participants, name, eventId }
 * @returns {Promise<Object>} Created room
 */
export const createRoom = (data) => {
  return apiClient.post('/chat/rooms', data).then((res) => res.data);
};

/**
 * Get messages for a chat room with pagination.
 * @param {string} roomId - Room ID
 * @param {Object} params - Pagination params { page, limit, before }
 * @returns {Promise<Object>} Paginated messages
 */
export const getMessages = (roomId, params = {}) => {
  return apiClient
    .get(`/chat/rooms/${roomId}/messages`, { params })
    .then((res) => res.data);
};

/**
 * Send a message to a chat room via the REST API.
 * (Prefer the socket for real-time delivery.)
 * @param {string} roomId - Room ID
 * @param {Object} data - Message data { content, type, metadata }
 * @returns {Promise<Object>} Sent message
 */
export const sendMessage = (roomId, data) => {
  return apiClient.post(`/chat/rooms/${roomId}/messages`, data).then((res) => res.data);
};

/**
 * Mark all messages in a room as read.
 * @param {string} roomId - Room ID
 * @returns {Promise<Object>} Result
 */
export const markAsRead = (roomId) => {
  return apiClient.post(`/chat/rooms/${roomId}/read`).then((res) => res.data);
};

/**
 * Leave a chat room.
 * @param {string} roomId - Room ID
 * @returns {Promise<Object>} Result
 */
export const leaveRoom = (roomId) => {
  return apiClient.post(`/chat/rooms/${roomId}/leave`).then((res) => res.data);
};

/**
 * Mute or unmute a chat room.
 * @param {string} roomId - Room ID
 * @returns {Promise<Object>} Updated mute status
 */
export const muteRoom = (roomId) => {
  return apiClient.post(`/chat/rooms/${roomId}/mute`).then((res) => res.data);
};
