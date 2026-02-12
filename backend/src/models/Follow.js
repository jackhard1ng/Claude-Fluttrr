const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Follow extends Model {}

Follow.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    follower_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    following_id: {
      type: DataTypes.UUID,
      defaultValue: null,
      references: {
        model: 'users',
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
    type: {
      type: DataTypes.ENUM('user', 'business'),
      allowNull: false,
    },
    notifications_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Follow',
    tableName: 'follows',
    indexes: [
      { fields: ['follower_id', 'following_id'], unique: true, where: { type: 'user' } },
      { fields: ['follower_id', 'business_id'], unique: true, where: { type: 'business' } },
      { fields: ['follower_id'] },
      { fields: ['following_id'] },
      { fields: ['business_id'] },
      { fields: ['type'] },
    ],
  }
);

module.exports = Follow;
