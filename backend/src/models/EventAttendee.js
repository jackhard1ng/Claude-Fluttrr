const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class EventAttendee extends Model {}

EventAttendee.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'events',
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
    status: {
      type: DataTypes.ENUM('going', 'interested', 'maybe', 'not_going', 'waitlisted'),
      defaultValue: 'going',
    },
    rsvp_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    check_in_time: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    checked_in: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      validate: {
        min: 1,
        max: 5,
      },
    },
    review: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    invited_by: {
      type: DataTypes.UUID,
      defaultValue: null,
    },
    source: {
      type: DataTypes.ENUM('direct', 'share', 'invite', 'discover', 'notification'),
      defaultValue: 'direct',
    },
    notes: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: 'EventAttendee',
    tableName: 'event_attendees',
    indexes: [
      { fields: ['event_id', 'user_id'], unique: true },
      { fields: ['event_id'] },
      { fields: ['user_id'] },
      { fields: ['status'] },
    ],
  }
);

module.exports = EventAttendee;
