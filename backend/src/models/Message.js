const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Message extends Model {
  toPublicJSON() {
    return {
      id: this.id,
      room_id: this.room_id,
      sender_id: this.sender_id,
      type: this.type,
      content: this.content,
      media_url: this.media_url,
      media_type: this.media_type,
      reply_to: this.reply_to,
      mentions: this.mentions,
      reactions: this.reactions,
      is_edited: this.is_edited,
      is_pinned: this.is_pinned,
      read_by: this.read_by,
      metadata: this.metadata,
      created_at: this.created_at,
      updated_at: this.updated_at,
      Sender: this.Sender,
    };
  }
}

Message.init(
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
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('text', 'image', 'video', 'audio', 'file', 'location', 'event_share', 'system'),
      defaultValue: 'text',
    },
    content: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    media_url: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    media_type: {
      type: DataTypes.STRING(50),
      defaultValue: null,
    },
    media_metadata: {
      type: DataTypes.JSONB,
      defaultValue: null,
    },
    reply_to: {
      type: DataTypes.UUID,
      defaultValue: null,
      references: {
        model: 'messages',
        key: 'id',
      },
    },
    mentions: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
    },
    reactions: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    read_by: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
    },
    is_edited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    edited_at: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    is_pinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    paranoid: false,
    indexes: [
      { fields: ['room_id'] },
      { fields: ['sender_id'] },
      { fields: ['created_at'] },
      { fields: ['room_id', 'created_at'] },
      { fields: ['reply_to'] },
      { fields: ['type'] },
    ],
  }
);

module.exports = Message;
