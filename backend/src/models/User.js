const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

class User extends Model {
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password_hash);
  }

  toSafeJSON() {
    const values = { ...this.get() };
    delete values.password_hash;
    delete values.deleted_at;
    return values;
  }

  toPublicJSON() {
    return {
      id: this.id,
      username: this.username,
      display_name: this.display_name,
      avatar_url: this.avatar_url,
      bio: this.bio,
      city: this.city,
      state: this.state,
      is_verified: this.is_verified,
      account_type: this.account_type,
      created_at: this.created_at,
      interests: this.interests,
      follower_count: this.follower_count,
      following_count: this.following_count,
      events_attended_count: this.events_attended_count,
    };
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        is: /^[a-zA-Z0-9._]+$/,
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    display_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    avatar_url: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    cover_photo_url: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    bio: {
      type: DataTypes.TEXT,
      defaultValue: '',
      validate: {
        len: [0, 500],
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      defaultValue: null,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      defaultValue: null,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'non-binary', 'other', 'prefer_not_to_say'),
      defaultValue: 'prefer_not_to_say',
    },
    city: {
      type: DataTypes.STRING(100),
      defaultValue: null,
    },
    state: {
      type: DataTypes.STRING(100),
      defaultValue: null,
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: 'US',
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      defaultValue: null,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      defaultValue: null,
    },
    interests: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    account_type: {
      type: DataTypes.ENUM('user', 'business', 'admin'),
      defaultValue: 'user',
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_online: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    last_seen: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    notification_preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        push: true,
        email: true,
        event_reminders: true,
        chat_messages: true,
        new_followers: true,
        event_updates: true,
        marketing: false,
      },
    },
    privacy_settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        profile_public: true,
        show_events_attended: true,
        show_location: true,
        allow_dms: true,
      },
    },
    follower_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    following_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    events_attended_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    events_hosted_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended', 'deactivated'),
      defaultValue: 'active',
    },
    refresh_token: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    last_login: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    login_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          const salt = await bcrypt.genSalt(12);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          const salt = await bcrypt.genSalt(12);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
    },
    indexes: [
      { fields: ['email'], unique: true },
      { fields: ['username'], unique: true },
      { fields: ['account_type'] },
      { fields: ['city', 'state'] },
      { fields: ['latitude', 'longitude'] },
      { fields: ['status'] },
      { fields: ['is_verified'] },
    ],
  }
);

module.exports = User;
