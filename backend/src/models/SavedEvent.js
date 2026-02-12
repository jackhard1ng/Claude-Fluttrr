const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class SavedEvent extends Model {}

SavedEvent.init(
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
    event_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id',
      },
    },
    collection: {
      type: DataTypes.STRING(100),
      defaultValue: 'default',
    },
    notes: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: 'SavedEvent',
    tableName: 'saved_events',
    indexes: [
      { fields: ['user_id', 'event_id'], unique: true },
      { fields: ['user_id'] },
      { fields: ['event_id'] },
      { fields: ['collection'] },
    ],
  }
);

module.exports = SavedEvent;
