const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Business extends Model {
  toPublicJSON() {
    return {
      id: this.id,
      owner_id: this.owner_id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      category: this.category,
      subcategory: this.subcategory,
      logo_url: this.logo_url,
      cover_photo_url: this.cover_photo_url,
      photos: this.photos,
      address: this.address,
      city: this.city,
      state: this.state,
      zip_code: this.zip_code,
      country: this.country,
      latitude: this.latitude,
      longitude: this.longitude,
      phone: this.phone,
      email: this.email,
      website: this.website,
      social_links: this.social_links,
      operating_hours: this.operating_hours,
      amenities: this.amenities,
      price_range: this.price_range,
      rating: this.rating,
      review_count: this.review_count,
      follower_count: this.follower_count,
      total_events: this.total_events,
      is_verified: this.is_verified,
      is_featured: this.is_featured,
      created_at: this.created_at,
    };
  }
}

Business.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [2, 200],
      },
    },
    slug: {
      type: DataTypes.STRING(250),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    short_description: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    category: {
      type: DataTypes.ENUM(
        'restaurant',
        'bar',
        'cafe',
        'gym',
        'bowling',
        'arcade',
        'bookstore',
        'gallery',
        'theater',
        'music_venue',
        'sports',
        'wellness',
        'retail',
        'coworking',
        'park',
        'library',
        'community_center',
        'other'
      ),
      allowNull: false,
    },
    subcategory: {
      type: DataTypes.STRING(100),
      defaultValue: null,
    },
    logo_url: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    cover_photo_url: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    zip_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: 'US',
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      defaultValue: null,
    },
    email: {
      type: DataTypes.STRING(255),
      defaultValue: null,
    },
    website: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    social_links: {
      type: DataTypes.JSONB,
      defaultValue: {
        instagram: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        yelp: null,
      },
    },
    operating_hours: {
      type: DataTypes.JSONB,
      defaultValue: {
        monday: { open: '09:00', close: '21:00', closed: false },
        tuesday: { open: '09:00', close: '21:00', closed: false },
        wednesday: { open: '09:00', close: '21:00', closed: false },
        thursday: { open: '09:00', close: '21:00', closed: false },
        friday: { open: '09:00', close: '22:00', closed: false },
        saturday: { open: '10:00', close: '22:00', closed: false },
        sunday: { open: '10:00', close: '20:00', closed: false },
      },
    },
    amenities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    price_range: {
      type: DataTypes.ENUM('free', '$', '$$', '$$$', '$$$$'),
      defaultValue: '$$',
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    review_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    follower_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_events: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_attendees: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        auto_accept_rsvps: true,
        allow_reviews: true,
        show_attendance_count: true,
        notification_email: null,
      },
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'Business',
    tableName: 'businesses',
    indexes: [
      { fields: ['owner_id'] },
      { fields: ['slug'], unique: true },
      { fields: ['category'] },
      { fields: ['city', 'state'] },
      { fields: ['latitude', 'longitude'] },
      { fields: ['rating'] },
      { fields: ['is_verified'] },
      { fields: ['is_featured'] },
      { fields: ['is_active'] },
    ],
    hooks: {
      beforeValidate: (business) => {
        if (business.name && !business.slug) {
          business.slug = business.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 200);
        }
      },
    },
  }
);

module.exports = Business;
