const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Notification extends Model {}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    sender_id: {
      type: DataTypes.UUID,
      defaultValue: null,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM(
        'event_reminder',
        'event_update',
        'event_cancelled',
        'new_follower',
        'event_invite',
        'chat_message',
        'event_nearby',
        'business_update',
        'review_response',
        'system',
        'achievement',
        'event_going',
        'event_full'
      ),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    action_url: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    image_url: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    is_pushed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal',
    },
    expires_at: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['user_id', 'is_read'] },
      { fields: ['type'] },
      { fields: ['created_at'] },
      { fields: ['sender_id'] },
    ],
  }
);

module.exports = Notification;
