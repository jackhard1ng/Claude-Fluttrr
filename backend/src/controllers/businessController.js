const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const {
  Business, User, Event, EventAttendee, Follow,
  Review, Notification,
} = require('../models');
const logger = require('../utils/logger');

/**
 * @desc    List businesses with pagination and filters
 * @route   GET /api/businesses
 */
const getBusinesses = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, category, city, state,
      price_range, sort = 'rating', is_verified, search,
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { is_active: true };

    if (category) where.category = category;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (state) where.state = { [Op.iLike]: `%${state}%` };
    if (price_range) where.price_range = price_range;
    if (is_verified !== undefined) where.is_verified = is_verified === 'true';

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.overlap]: [search.toLowerCase()] } },
      ];
    }

    const orderMap = {
      rating: [['rating', 'DESC']],
      newest: [['created_at', 'DESC']],
      popular: [['follower_count', 'DESC']],
      events: [['total_events', 'DESC']],
      name: [['name', 'ASC']],
    };

    const { count, rows: businesses } = await Business.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'Owner',
          attributes: ['id', 'username', 'display_name', 'avatar_url'],
        },
      ],
      order: orderMap[sort] || orderMap.rating,
      limit: parseInt(limit),
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Businesses retrieved successfully.',
      data: { businesses: businesses.map((b) => b.toPublicJSON()) },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetBusinesses error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching businesses.',
    });
  }
};

/**
 * @desc    Get single business by ID or slug
 * @route   GET /api/businesses/:idOrSlug
 */
const getBusiness = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Try to find by UUID first, then by slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const where = isUUID ? { id: idOrSlug } : { slug: idOrSlug };
    where.is_active = true;

    const business = await Business.findOne({
      where,
      include: [
        {
          model: User,
          as: 'Owner',
          attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_verified'],
        },
      ],
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found',
        message: 'No business found with this ID or slug.',
      });
    }

    const businessData = business.toPublicJSON();

    // Check if current user follows this business
    if (req.user) {
      const isFollowing = await Follow.findOne({
        where: {
          follower_id: req.user.id,
          business_id: business.id,
          type: 'business',
        },
      });
      businessData.is_following = !!isFollowing;
      businessData.is_owner = business.owner_id === req.user.id;
    }

    return res.status(200).json({
      success: true,
      message: 'Business retrieved successfully.',
      data: { business: businessData },
    });
  } catch (error) {
    logger.error('GetBusiness error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching the business.',
    });
  }
};

/**
 * @desc    Create a new business
 * @route   POST /api/businesses
 */
const createBusiness = async (req, res) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const business = await Business.create(
        {
          owner_id: req.user.id,
          name: req.body.name,
          description: req.body.description,
          short_description: req.body.short_description,
          category: req.body.category,
          subcategory: req.body.subcategory,
          logo_url: req.body.logo_url,
          cover_photo_url: req.body.cover_photo_url,
          photos: req.body.photos,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zip_code: req.body.zip_code,
          country: req.body.country,
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          phone: req.body.phone,
          email: req.body.email,
          website: req.body.website,
          social_links: req.body.social_links,
          operating_hours: req.body.operating_hours,
          amenities: req.body.amenities,
          tags: req.body.tags,
          price_range: req.body.price_range,
          settings: req.body.settings,
        },
        { transaction: t }
      );

      // Update user account_type to 'business' if not already
      await User.update(
        { account_type: 'business' },
        { where: { id: req.user.id }, transaction: t }
      );

      return business;
    });

    const createdBusiness = await Business.findByPk(result.id, {
      include: [
        {
          model: User,
          as: 'Owner',
          attributes: ['id', 'username', 'display_name', 'avatar_url'],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Business created successfully.',
      data: { business: createdBusiness.toPublicJSON() },
    });
  } catch (error) {
    logger.error('CreateBusiness error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.errors.map((e) => e.message).join(', '),
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: 'Duplicate entry',
        message: 'A business with this name/slug already exists.',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while creating the business.',
    });
  }
};

/**
 * @desc    Update a business (owner only)
 * @route   PUT /api/businesses/:id
 */
const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id);

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found',
        message: 'No business found with this ID.',
      });
    }

    if (business.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You do not have permission to update this business.',
      });
    }

    const allowedFields = [
      'name', 'description', 'short_description', 'category', 'subcategory',
      'logo_url', 'cover_photo_url', 'photos', 'address', 'city', 'state',
      'zip_code', 'country', 'latitude', 'longitude', 'phone', 'email',
      'website', 'social_links', 'operating_hours', 'amenities', 'tags',
      'price_range', 'settings', 'metadata',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No updates provided',
        message: 'Please provide at least one field to update.',
      });
    }

    await business.update(updates);

    return res.status(200).json({
      success: true,
      message: 'Business updated successfully.',
      data: { business: business.toPublicJSON() },
    });
  } catch (error) {
    logger.error('UpdateBusiness error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.errors.map((e) => e.message).join(', '),
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while updating the business.',
    });
  }
};

/**
 * @desc    Soft delete a business
 * @route   DELETE /api/businesses/:id
 */
const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id);

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found',
        message: 'No business found with this ID.',
      });
    }

    if (business.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You do not have permission to delete this business.',
      });
    }

    await sequelize.transaction(async (t) => {
      await business.update({ is_active: false }, { transaction: t });
      await business.destroy({ transaction: t });
    });

    return res.status(200).json({
      success: true,
      message: 'Business deleted successfully.',
      data: null,
    });
  } catch (error) {
    logger.error('DeleteBusiness error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while deleting the business.',
    });
  }
};

/**
 * @desc    Get events for a specific business
 * @route   GET /api/businesses/:id/events
 */
const getBusinessEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, status = 'published', upcoming } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const business = await Business.findByPk(id);
    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found',
        message: 'No business found with this ID.',
      });
    }

    const where = { business_id: id };
    if (status) where.status = status;
    if (upcoming === 'true') {
      where.start_time = { [Op.gte]: new Date() };
    }

    const { count, rows: events } = await Event.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'username', 'display_name', 'avatar_url'],
        },
      ],
      order: [['start_time', 'ASC']],
      limit: parseInt(limit),
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Business events retrieved successfully.',
      data: { events: events.map((e) => e.toPublicJSON()) },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetBusinessEvents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching business events.',
    });
  }
};

/**
 * @desc    Get nearby businesses using haversine formula
 * @route   GET /api/businesses/nearby
 */
const getNearbyBusinesses = async (req, res) => {
  try {
    const { lat, lng, radius = 25, page = 1, limit = 20, category } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Missing coordinates',
        message: 'Latitude and longitude are required.',
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const radiusKm = parseFloat(radius) * 1.60934;

    const haversine = `(
      6371 * acos(
        cos(radians(${parseFloat(lat)})) *
        cos(radians(latitude)) *
        cos(radians(longitude) - radians(${parseFloat(lng)})) +
        sin(radians(${parseFloat(lat)})) *
        sin(radians(latitude))
      )
    )`;

    const where = { is_active: true };
    if (category) where.category = category;

    const { count, rows: businesses } = await Business.findAndCountAll({
      where,
      attributes: {
        include: [[sequelize.literal(haversine), 'distance']],
      },
      having: sequelize.literal(`${haversine} <= ${radiusKm}`),
      order: [[sequelize.literal('distance'), 'ASC']],
      limit: parseInt(limit),
      offset,
      subQuery: false,
    });

    return res.status(200).json({
      success: true,
      message: 'Nearby businesses retrieved successfully.',
      data: { businesses: businesses.map((b) => b.toPublicJSON()) },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetNearbyBusinesses error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching nearby businesses.',
    });
  }
};

/**
 * @desc    Follow a business
 * @route   POST /api/businesses/:id/follow
 */
const followBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id);
    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found',
        message: 'No business found with this ID.',
      });
    }

    const existingFollow = await Follow.findOne({
      where: {
        follower_id: req.user.id,
        business_id: id,
        type: 'business',
      },
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        error: 'Already following',
        message: 'You are already following this business.',
      });
    }

    await sequelize.transaction(async (t) => {
      await Follow.create(
        {
          follower_id: req.user.id,
          business_id: id,
          type: 'business',
        },
        { transaction: t }
      );

      await Business.increment('follower_count', {
        by: 1,
        where: { id },
        transaction: t,
      });

      await User.increment('following_count', {
        by: 1,
        where: { id: req.user.id },
        transaction: t,
      });

      // Notify the business owner
      await Notification.create(
        {
          user_id: business.owner_id,
          sender_id: req.user.id,
          type: 'new_follower',
          title: 'New Business Follower',
          body: `${req.user.username || 'Someone'} started following ${business.name}.`,
          data: { follower_id: req.user.id, business_id: id },
        },
        { transaction: t }
      );
    });

    return res.status(201).json({
      success: true,
      message: 'Business followed successfully.',
      data: null,
    });
  } catch (error) {
    logger.error('FollowBusiness error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while following the business.',
    });
  }
};

/**
 * @desc    Unfollow a business
 * @route   DELETE /api/businesses/:id/follow
 */
const unfollowBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const existingFollow = await Follow.findOne({
      where: {
        follower_id: req.user.id,
        business_id: id,
        type: 'business',
      },
    });

    if (!existingFollow) {
      return res.status(400).json({
        success: false,
        error: 'Not following',
        message: 'You are not following this business.',
      });
    }

    await sequelize.transaction(async (t) => {
      await existingFollow.destroy({ transaction: t });

      await Business.decrement('follower_count', {
        by: 1,
        where: { id, follower_count: { [Op.gt]: 0 } },
        transaction: t,
      });

      await User.decrement('following_count', {
        by: 1,
        where: { id: req.user.id, following_count: { [Op.gt]: 0 } },
        transaction: t,
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Business unfollowed successfully.',
      data: null,
    });
  } catch (error) {
    logger.error('UnfollowBusiness error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while unfollowing the business.',
    });
  }
};

/**
 * @desc    Get reviews for a business
 * @route   GET /api/businesses/:id/reviews
 */
const getBusinessReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, sort = 'newest' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const business = await Business.findByPk(id);
    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found',
        message: 'No business found with this ID.',
      });
    }

    const orderMap = {
      newest: [['created_at', 'DESC']],
      oldest: [['created_at', 'ASC']],
      highest: [['rating', 'DESC']],
      lowest: [['rating', 'ASC']],
      helpful: [['helpful_count', 'DESC']],
    };

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { business_id: id, status: 'active' },
      include: [
        {
          model: User,
          as: 'Reviewer',
          attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_verified'],
        },
        {
          model: Event,
          as: 'Event',
          attributes: ['id', 'title', 'slug'],
          required: false,
        },
      ],
      order: orderMap[sort] || orderMap.newest,
      limit: parseInt(limit),
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Business reviews retrieved successfully.',
      data: { reviews },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetBusinessReviews error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching reviews.',
    });
  }
};

/**
 * @desc    Add a review for a business (must have attended an event)
 * @route   POST /api/businesses/:id/reviews
 */
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, content, photos, event_id } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rating',
        message: 'Rating must be between 1 and 5.',
      });
    }

    const business = await Business.findByPk(id);
    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found',
        message: 'No business found with this ID.',
      });
    }

    // Check if user already reviewed this business
    const existingReview = await Review.findOne({
      where: { business_id: id, user_id: req.user.id },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'Already reviewed',
        message: 'You have already reviewed this business.',
      });
    }

    // Verify that user has attended at least one event by this business
    const attendance = await EventAttendee.findOne({
      where: { user_id: req.user.id, status: 'going' },
      include: [
        {
          model: Event,
          as: 'Event',
          where: { business_id: id },
          required: true,
        },
      ],
    });

    const isVerifiedAttendance = !!attendance;

    const review = await sequelize.transaction(async (t) => {
      const newReview = await Review.create(
        {
          user_id: req.user.id,
          business_id: id,
          event_id: event_id || null,
          rating,
          title: title || null,
          content: content || '',
          photos: photos || [],
          is_verified_attendance: isVerifiedAttendance,
        },
        { transaction: t }
      );

      // Update business rating and review count
      const allReviews = await Review.findAll({
        where: { business_id: id, status: 'active' },
        attributes: ['rating'],
        transaction: t,
      });

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0) + rating;
      const newCount = allReviews.length + 1;
      const avgRating = (totalRating / newCount).toFixed(2);

      await business.update(
        { rating: avgRating, review_count: newCount },
        { transaction: t }
      );

      return newReview;
    });

    return res.status(201).json({
      success: true,
      message: 'Review added successfully.',
      data: { review },
    });
  } catch (error) {
    logger.error('AddReview error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.errors.map((e) => e.message).join(', '),
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while adding the review.',
    });
  }
};

/**
 * @desc    Get analytics/stats for business owner
 * @route   GET /api/businesses/:id/stats
 */
const getBusinessStats = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id);

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found',
        message: 'No business found with this ID.',
      });
    }

    if (business.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'Only the business owner can view stats.',
      });
    }

    // Total events
    const totalEvents = await Event.count({
      where: { business_id: id, status: { [Op.ne]: 'cancelled' } },
    });

    // Upcoming events
    const upcomingEvents = await Event.count({
      where: {
        business_id: id,
        status: 'published',
        start_time: { [Op.gte]: new Date() },
      },
    });

    // Total attendees across all events
    const totalAttendees = await EventAttendee.count({
      where: { status: 'going' },
      include: [
        {
          model: Event,
          as: 'Event',
          where: { business_id: id },
          required: true,
          attributes: [],
        },
      ],
    });

    // Total views across all events
    const viewStats = await Event.findOne({
      where: { business_id: id },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('view_count')), 'total_views'],
        [sequelize.fn('SUM', sequelize.col('share_count')), 'total_shares'],
        [sequelize.fn('SUM', sequelize.col('save_count')), 'total_saves'],
      ],
      raw: true,
    });

    // Rating distribution
    const ratingDistribution = await Review.findAll({
      where: { business_id: id, status: 'active' },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['rating'],
      order: [['rating', 'DESC']],
      raw: true,
    });

    // Follower count over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newFollowers = await Follow.count({
      where: {
        business_id: id,
        type: 'business',
        created_at: { [Op.gte]: thirtyDaysAgo },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Business stats retrieved successfully.',
      data: {
        stats: {
          total_events: totalEvents,
          upcoming_events: upcomingEvents,
          total_attendees: totalAttendees,
          total_views: parseInt(viewStats.total_views) || 0,
          total_shares: parseInt(viewStats.total_shares) || 0,
          total_saves: parseInt(viewStats.total_saves) || 0,
          rating: parseFloat(business.rating) || 0,
          review_count: business.review_count,
          follower_count: business.follower_count,
          new_followers_30d: newFollowers,
          rating_distribution: ratingDistribution,
        },
      },
    });
  } catch (error) {
    logger.error('GetBusinessStats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching business stats.',
    });
  }
};

/**
 * @desc    Search businesses
 * @route   GET /api/businesses/search
 */
const searchBusinesses = async (req, res) => {
  try {
    const { q, page = 1, limit = 20, category, city } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing query',
        message: 'Search query is required.',
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchTerm = q.trim();

    const where = {
      is_active: true,
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchTerm}%` } },
        { description: { [Op.iLike]: `%${searchTerm}%` } },
        { tags: { [Op.overlap]: [searchTerm.toLowerCase()] } },
        { amenities: { [Op.overlap]: [searchTerm.toLowerCase()] } },
      ],
    };

    if (category) where.category = category;
    if (city) where.city = { [Op.iLike]: `%${city}%` };

    const { count, rows: businesses } = await Business.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'Owner',
          attributes: ['id', 'username', 'display_name', 'avatar_url'],
        },
      ],
      order: [
        ['rating', 'DESC'],
        ['follower_count', 'DESC'],
      ],
      limit: parseInt(limit),
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Search results retrieved successfully.',
      data: { businesses: businesses.map((b) => b.toPublicJSON()) },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('SearchBusinesses error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while searching businesses.',
    });
  }
};

/**
 * @desc    Get all business categories with counts
 * @route   GET /api/businesses/categories
 */
const getBusinessCategories = async (req, res) => {
  try {
    const categories = await Business.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: { is_active: true },
      group: ['category'],
      order: [[sequelize.literal('count'), 'DESC']],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Business categories retrieved successfully.',
      data: { categories },
    });
  } catch (error) {
    logger.error('GetBusinessCategories error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching business categories.',
    });
  }
};

module.exports = {
  getBusinesses,
  getBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinessEvents,
  getNearbyBusinesses,
  followBusiness,
  unfollowBusiness,
  getBusinessReviews,
  addReview,
  getBusinessStats,
  searchBusinesses,
  getBusinessCategories,
};
