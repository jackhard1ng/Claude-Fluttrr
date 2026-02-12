const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class ChatRoom extends Model {
  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      event_id: this.event_id,
      business_id: this.business_id,
      avatar_url: this.avatar_url,
      description: this.description,
      member_count: this.member_count,
      last_message: this.last_message,
      last_message_at: this.last_message_at,
      is_active: this.is_active,
      created_at: this.created_at,
      Members: this.Members,
      Event: this.Event,
      Business: this.Business,
    };
  }
}

ChatRoom.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      defaultValue: null,
    },
    type: {
      type: DataTypes.ENUM('direct', 'event', 'group', 'business'),
      allowNull: false,
    },
    event_id: {
      type: DataTypes.UUID,
      defaultValue: null,
      references: {
        model: 'events',
        key: 'id',
      },
    },
    business_id: {
      type: DataTypes.UUID,
      defaultValue: null,
      references: {
        model: 'businesses',
        key: 'id',
      },
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    avatar_url: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    member_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    max_members: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    last_message: {
      type: DataTypes.JSONB,
      defaultValue: null,
    },
    last_message_at: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        mute_notifications: false,
        allow_media: true,
        only_admins_post: false,
        auto_delete_days: null,
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    pinned_message_id: {
      type: DataTypes.UUID,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: 'ChatRoom',
    tableName: 'chat_rooms',
    indexes: [
      { fields: ['type'] },
      { fields: ['event_id'] },
      { fields: ['business_id'] },
      { fields: ['created_by'] },
      { fields: ['last_message_at'] },
      { fields: ['is_active'] },
    ],
  }
);

module.exports = ChatRoom;
