const { DataTypes, Model, Op } = require('sequelize');
const { sequelize } = require('../config/database');

class Event extends Model {
  get isUpcoming() {
    return new Date(this.start_time) > new Date();
  }

  get isHappeningNow() {
    const now = new Date();
    return new Date(this.start_time) <= now && new Date(this.end_time) >= now;
  }

  get isFull() {
    return this.max_attendees && this.attendee_count >= this.max_attendees;
  }

  get spotsLeft() {
    if (!this.max_attendees) return null;
    return Math.max(0, this.max_attendees - this.attendee_count);
  }

  toPublicJSON() {
    return {
      id: this.id,
      business_id: this.business_id,
      created_by: this.created_by,
      title: this.title,
      slug: this.slug,
      description: this.description,
      short_description: this.short_description,
      category: this.category,
      subcategory: this.subcategory,
      tags: this.tags,
      image_url: this.image_url,
      gallery: this.gallery,
      start_time: this.start_time,
      end_time: this.end_time,
      timezone: this.timezone,
      recurrence: this.recurrence,
      venue_name: this.venue_name,
      address: this.address,
      city: this.city,
      state: this.state,
      zip_code: this.zip_code,
      latitude: this.latitude,
      longitude: this.longitude,
      is_virtual: this.is_virtual,
      virtual_link: this.is_virtual ? this.virtual_link : null,
      price: this.price,
      price_description: this.price_description,
      max_attendees: this.max_attendees,
      attendee_count: this.attendee_count,
      interested_count: this.interested_count,
      view_count: this.view_count,
      share_count: this.share_count,
      age_restriction: this.age_restriction,
      dress_code: this.dress_code,
      what_to_bring: this.what_to_bring,
      accessibility: this.accessibility,
      status: this.status,
      is_featured: this.is_featured,
      is_free: this.is_free,
      vibe_tags: this.vibe_tags,
      difficulty_level: this.difficulty_level,
      created_at: this.created_at,
      updated_at: this.updated_at,
      is_upcoming: this.isUpcoming,
      is_happening_now: this.isHappeningNow,
      is_full: this.isFull,
      spots_left: this.spotsLeft,
      Business: this.Business,
      Creator: this.Creator,
    };
  }

  static async findNearby(lat, lng, radiusMiles = 25, options = {}) {
    const radiusKm = radiusMiles * 1.60934;
    const {
      limit = 50,
      offset = 0,
      category,
      startDate,
      endDate,
      isFree,
      search,
    } = options;

    const where = {
      status: 'published',
      end_time: { [Op.gte]: new Date() },
    };

    if (category) where.category = category;
    if (isFree) where.is_free = true;
    if (startDate) where.start_time = { [Op.gte]: new Date(startDate) };
    if (endDate) {
      where.end_time = where.end_time || {};
      where.end_time[Op.lte] = new Date(endDate);
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.overlap]: [search.toLowerCase()] } },
      ];
    }

    const haversine = `(
      6371 * acos(
        cos(radians(${parseFloat(lat)})) *
        cos(radians(latitude)) *
        cos(radians(longitude) - radians(${parseFloat(lng)})) +
        sin(radians(${parseFloat(lat)})) *
        sin(radians(latitude))
      )
    )`;

    return Event.findAndCountAll({
      where,
      attributes: {
        include: [[sequelize.literal(haversine), 'distance']],
      },
      having: sequelize.literal(`${haversine} <= ${radiusKm}`),
      order: [[sequelize.literal('distance'), 'ASC']],
      limit,
      offset,
      subQuery: false,
    });
  }
}

Event.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: false,
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
    title: {
      type: DataTypes.STRING(300),
      allowNull: false,
      validate: {
        len: [3, 300],
      },
    },
    slug: {
      type: DataTypes.STRING(350),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 10000],
      },
    },
    short_description: {
      type: DataTypes.STRING(500),
      defaultValue: '',
    },
    category: {
      type: DataTypes.ENUM(
        'trivia',
        'board_games',
        'music',
        'dance',
        'fitness',
        'food_drink',
        'art',
        'comedy',
        'networking',
        'workshop',
        'sports',
        'outdoor',
        'wellness',
        'karaoke',
        'open_mic',
        'happy_hour',
        'themed_night',
        'community',
        'education',
        'charity',
        'holiday',
        'special',
        'other'
      ),
      allowNull: false,
    },
    subcategory: {
      type: DataTypes.STRING(100),
      defaultValue: null,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    vibe_tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    image_url: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    gallery: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: 'America/New_York',
    },
    recurrence: {
      type: DataTypes.JSONB,
      defaultValue: null,
    },
    venue_name: {
      type: DataTypes.STRING(300),
      defaultValue: null,
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
      defaultValue: null,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    is_virtual: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    virtual_link: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    price_description: {
      type: DataTypes.STRING(200),
      defaultValue: null,
    },
    is_free: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    max_attendees: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    min_attendees: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    attendee_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    interested_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    share_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    save_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    age_restriction: {
      type: DataTypes.ENUM('all_ages', '18+', '21+'),
      defaultValue: 'all_ages',
    },
    dress_code: {
      type: DataTypes.STRING(200),
      defaultValue: null,
    },
    what_to_bring: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    accessibility: {
      type: DataTypes.JSONB,
      defaultValue: {
        wheelchair: false,
        parking: false,
        public_transit: false,
      },
    },
    difficulty_level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'all_levels'),
      defaultValue: 'all_levels',
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'cancelled', 'completed', 'postponed'),
      defaultValue: 'published',
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'Event',
    tableName: 'events',
    hooks: {
      beforeValidate: (event) => {
        if (event.title && !event.slug) {
          const timestamp = Date.now().toString(36);
          event.slug = event.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 200) + '-' + timestamp;
        }
        if (event.price !== undefined) {
          event.is_free = parseFloat(event.price) === 0;
        }
      },
    },
    indexes: [
      { fields: ['business_id'] },
      { fields: ['created_by'] },
      { fields: ['slug'], unique: true },
      { fields: ['category'] },
      { fields: ['start_time'] },
      { fields: ['end_time'] },
      { fields: ['city', 'state'] },
      { fields: ['latitude', 'longitude'] },
      { fields: ['status'] },
      { fields: ['is_free'] },
      { fields: ['is_featured'] },
      { fields: ['attendee_count'] },
      { fields: ['tags'], using: 'gin' },
      { fields: ['vibe_tags'], using: 'gin' },
    ],
  }
);

module.exports = Event;
