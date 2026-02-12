const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class ChatMember extends Model {}

ChatMember.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'chat_rooms',
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('member', 'admin', 'moderator', 'owner'),
      defaultValue: 'member',
    },
    nickname: {
      type: DataTypes.STRING(100),
      defaultValue: null,
    },
    last_read_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    unread_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_muted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    muted_until: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'ChatMember',
    tableName: 'chat_members',
    indexes: [
      { fields: ['room_id', 'user_id'], unique: true },
      { fields: ['room_id'] },
      { fields: ['user_id'] },
      { fields: ['is_active'] },
    ],
  }
);

module.exports = ChatMember;
