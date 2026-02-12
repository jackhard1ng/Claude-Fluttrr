const { Op } = require('sequelize');
const { User, Notification } = require('../models');
const logger = require('../utils/logger');

/**
 * @desc    Get user's notifications with pagination
 * @route   GET /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, is_read } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { user_id: req.user.id };

    if (type) where.type = type;
    if (is_read !== undefined) where.is_read = is_read === 'true';

    // Exclude expired notifications
    where[Op.or] = [
      { expires_at: null },
      { expires_at: { [Op.gte]: new Date() } },
    ];

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'username', 'display_name', 'avatar_url'],
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully.',
      data: { notifications },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetNotifications error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching notifications.',
    });
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PUT /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
        message: 'No notification found with this ID.',
      });
    }

    if (notification.is_read) {
      return res.status(200).json({
        success: true,
        message: 'Notification was already marked as read.',
        data: { notification },
      });
    }

    await notification.update({
      is_read: true,
      read_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: { notification },
    });
  } catch (error) {
    logger.error('MarkAsRead error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while marking the notification as read.',
    });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
  try {
    const [updatedCount] = await Notification.update(
      { is_read: true, read_at: new Date() },
      {
        where: {
          user_id: req.user.id,
          is_read: false,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: `${updatedCount} notification(s) marked as read.`,
      data: { updated_count: updatedCount },
    });
  } catch (error) {
    logger.error('MarkAllAsRead error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while marking all notifications as read.',
    });
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
        message: 'No notification found with this ID.',
      });
    }

    await notification.destroy();

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully.',
      data: null,
    });
  } catch (error) {
    logger.error('DeleteNotification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while deleting the notification.',
    });
  }
};

/**
 * @desc    Get count of unread notifications
 * @route   GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: {
        user_id: req.user.id,
        is_read: false,
        [Op.or]: [
          { expires_at: null },
          { expires_at: { [Op.gte]: new Date() } },
        ],
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Unread count retrieved successfully.',
      data: { unread_count: count },
    });
  } catch (error) {
    logger.error('GetUnreadCount error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching unread count.',
    });
  }
};

/**
 * @desc    Update notification preferences
 * @route   PUT /api/notifications/preferences
 */
const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid preferences',
        message: 'Notification preferences must be provided as an object.',
      });
    }

    const allowedKeys = [
      'push', 'email', 'event_reminders', 'chat_messages',
      'new_followers', 'event_updates', 'marketing',
    ];

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User account not found.',
      });
    }

    const currentPrefs = { ...user.notification_preferences };

    for (const key of allowedKeys) {
      if (preferences[key] !== undefined) {
        if (typeof preferences[key] !== 'boolean') {
          return res.status(400).json({
            success: false,
            error: 'Invalid preference value',
            message: `Preference "${key}" must be a boolean value.`,
          });
        }
        currentPrefs[key] = preferences[key];
      }
    }

    await user.update({ notification_preferences: currentPrefs });

    return res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully.',
      data: { notification_preferences: user.notification_preferences },
    });
  } catch (error) {
    logger.error('UpdatePreferences error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while updating notification preferences.',
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  updatePreferences,
};
