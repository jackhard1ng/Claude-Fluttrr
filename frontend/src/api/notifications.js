import apiClient from './client';

/**
 * Get notifications for the authenticated user.
 * @param {Object} params - Pagination params { page, limit, type }
 * @returns {Promise<Object>} Paginated notifications
 */
export const getNotifications = (params = {}) => {
  return apiClient.get('/notifications', { params }).then((res) => res.data);
};

/**
 * Mark a specific notification as read.
 * @param {string} id - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = (id) => {
  return apiClient.put(`/notifications/${id}/read`).then((res) => res.data);
};

/**
 * Mark all notifications as read.
 * @returns {Promise<Object>} Result
 */
export const markAllAsRead = () => {
  return apiClient.put('/notifications/read-all').then((res) => res.data);
};

/**
 * Get the number of unread notifications.
 * @returns {Promise<Object>} Unread count
 */
export const getUnreadCount = () => {
  return apiClient.get('/notifications/unread-count').then((res) => res.data);
};

/**
 * Delete a notification.
 * @param {string} id - Notification ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteNotification = (id) => {
  return apiClient.delete(`/notifications/${id}`).then((res) => res.data);
};
