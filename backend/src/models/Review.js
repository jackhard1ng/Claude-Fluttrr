const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Review extends Model {}

Review.init(
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
    business_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'businesses',
        key: 'id',
      },
    },
    event_id: {
      type: DataTypes.UUID,
      defaultValue: null,
      references: {
        model: 'events',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    title: {
      type: DataTypes.STRING(200),
      defaultValue: null,
    },
    content: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    helpful_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    response: {
      type: DataTypes.JSONB,
      defaultValue: null,
    },
    is_verified_attendance: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'flagged', 'removed'),
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['business_id'] },
      { fields: ['event_id'] },
      { fields: ['rating'] },
      { fields: ['business_id', 'user_id'], unique: true },
      { fields: ['status'] },
    ],
  }
);

module.exports = Review;
