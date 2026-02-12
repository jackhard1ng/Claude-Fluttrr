const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { User, Follow, Event, EventAttendee, SavedEvent, Business, Notification } = require('../models');
const logger = require('../utils/logger');

/**
 * @desc    Get user profile by ID
 * @route   GET /api/users/:id
 */
const getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user found with this ID.',
      });
    }

    const profileData = user.toPublicJSON();

    // If the requesting user is authenticated, check follow status
    if (req.user) {
      const isFollowing = await Follow.findOne({
        where: {
          follower_id: req.user.id,
          following_id: id,
          type: 'user',
        },
      });
      profileData.is_following = !!isFollowing;
    }

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully.',
      data: { user: profileData },
    });
  } catch (error) {
    logger.error('GetProfile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching the profile.',
    });
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/profile
 */
const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'display_name', 'bio', 'phone', 'date_of_birth', 'gender',
      'city', 'state', 'country', 'latitude', 'longitude',
      'interests', 'cover_photo_url', 'privacy_settings',
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

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User account not found.',
      });
    }

    await user.update(updates);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: user.toSafeJSON() },
    });
  } catch (error) {
    logger.error('UpdateProfile error:', error);

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
      message: 'An error occurred while updating the profile.',
    });
  }
};

/**
 * @desc    Search users by username or display_name
 * @route   GET /api/users/search
 */
const searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing query',
        message: 'Search query is required.',
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchTerm = q.trim();

    const { count, rows: users } = await User.findAndCountAll({
      where: {
        status: 'active',
        [Op.or]: [
          { username: { [Op.iLike]: `%${searchTerm}%` } },
          { display_name: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      attributes: [
        'id', 'username', 'display_name', 'avatar_url', 'bio',
        'city', 'state', 'is_verified', 'account_type',
        'follower_count', 'following_count',
      ],
      order: [['follower_count', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Search results retrieved successfully.',
      data: { users },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('SearchUsers error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while searching users.',
    });
  }
};

/**
 * @desc    Get events a user is attending
 * @route   GET /api/users/:id/events
 */
const getUserEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, status = 'going' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user found with this ID.',
      });
    }

    const whereClause = {
      user_id: id,
    };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: attendances } = await EventAttendee.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Event,
          as: 'Event',
          where: { status: 'published' },
          include: [
            {
              model: Business,
              as: 'Business',
              attributes: ['id', 'name', 'slug', 'logo_url'],
            },
          ],
        },
      ],
      order: [[{ model: Event, as: 'Event' }, 'start_time', 'ASC']],
      limit: parseInt(limit),
      offset,
    });

    const events = attendances.map((a) => ({
      ...a.Event.toPublicJSON(),
      rsvp_status: a.status,
      rsvp_time: a.rsvp_time,
    }));

    return res.status(200).json({
      success: true,
      message: 'User events retrieved successfully.',
      data: { events },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetUserEvents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching user events.',
    });
  }
};

/**
 * @desc    Get user's followers
 * @route   GET /api/users/:id/followers
 */
const getUserFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user found with this ID.',
      });
    }

    const { count, rows: follows } = await Follow.findAndCountAll({
      where: {
        following_id: id,
        type: 'user',
      },
      include: [
        {
          model: User,
          as: 'Follower',
          attributes: [
            'id', 'username', 'display_name', 'avatar_url',
            'bio', 'is_verified', 'follower_count',
          ],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    const followers = follows.map((f) => f.Follower);

    return res.status(200).json({
      success: true,
      message: 'Followers retrieved successfully.',
      data: { followers },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetUserFollowers error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching followers.',
    });
  }
};

/**
 * @desc    Get users that a user is following
 * @route   GET /api/users/:id/following
 */
const getUserFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user found with this ID.',
      });
    }

    const { count, rows: follows } = await Follow.findAndCountAll({
      where: {
        follower_id: id,
        type: 'user',
      },
      include: [
        {
          model: User,
          as: 'FollowedUser',
          attributes: [
            'id', 'username', 'display_name', 'avatar_url',
            'bio', 'is_verified', 'follower_count',
          ],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    const following = follows.map((f) => f.FollowedUser);

    return res.status(200).json({
      success: true,
      message: 'Following list retrieved successfully.',
      data: { following },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetUserFollowing error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching following list.',
    });
  }
};

/**
 * @desc    Follow a user
 * @route   POST /api/users/:id/follow
 */
const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    const followerId = req.user.id;

    if (id === followerId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action',
        message: 'You cannot follow yourself.',
      });
    }

    const targetUser = await User.findByPk(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user found with this ID.',
      });
    }

    const existingFollow = await Follow.findOne({
      where: {
        follower_id: followerId,
        following_id: id,
        type: 'user',
      },
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        error: 'Already following',
        message: 'You are already following this user.',
      });
    }

    await sequelize.transaction(async (t) => {
      await Follow.create(
        {
          follower_id: followerId,
          following_id: id,
          type: 'user',
        },
        { transaction: t }
      );

      await User.increment('following_count', {
        by: 1,
        where: { id: followerId },
        transaction: t,
      });

      await User.increment('follower_count', {
        by: 1,
        where: { id },
        transaction: t,
      });

      await Notification.create(
        {
          user_id: id,
          sender_id: followerId,
          type: 'new_follower',
          title: 'New Follower',
          body: `${req.user.username || 'Someone'} started following you.`,
          data: { follower_id: followerId },
        },
        { transaction: t }
      );
    });

    return res.status(201).json({
      success: true,
      message: 'User followed successfully.',
      data: null,
    });
  } catch (error) {
    logger.error('FollowUser error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while following the user.',
    });
  }
};

/**
 * @desc    Unfollow a user
 * @route   DELETE /api/users/:id/follow
 */
const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const followerId = req.user.id;

    if (id === followerId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action',
        message: 'You cannot unfollow yourself.',
      });
    }

    const existingFollow = await Follow.findOne({
      where: {
        follower_id: followerId,
        following_id: id,
        type: 'user',
      },
    });

    if (!existingFollow) {
      return res.status(400).json({
        success: false,
        error: 'Not following',
        message: 'You are not following this user.',
      });
    }

    await sequelize.transaction(async (t) => {
      await existingFollow.destroy({ transaction: t });

      await User.decrement('following_count', {
        by: 1,
        where: { id: followerId, following_count: { [Op.gt]: 0 } },
        transaction: t,
      });

      await User.decrement('follower_count', {
        by: 1,
        where: { id, follower_count: { [Op.gt]: 0 } },
        transaction: t,
      });
    });

    return res.status(200).json({
      success: true,
      message: 'User unfollowed successfully.',
      data: null,
    });
  } catch (error) {
    logger.error('UnfollowUser error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while unfollowing the user.',
    });
  }
};

/**
 * @desc    Get user's saved/bookmarked events
 * @route   GET /api/users/saved-events
 */
const getSavedEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, collection } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = { user_id: req.user.id };
    if (collection) {
      whereClause.collection = collection;
    }

    const { count, rows: savedEvents } = await SavedEvent.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Event,
          as: 'Event',
          include: [
            {
              model: Business,
              as: 'Business',
              attributes: ['id', 'name', 'slug', 'logo_url'],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    const events = savedEvents.map((se) => ({
      ...se.Event.toPublicJSON(),
      saved_at: se.created_at,
      collection: se.collection,
      notes: se.notes,
    }));

    return res.status(200).json({
      success: true,
      message: 'Saved events retrieved successfully.',
      data: { events },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetSavedEvents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching saved events.',
    });
  }
};

/**
 * @desc    Update user avatar URL
 * @route   PUT /api/users/avatar
 */
const updateAvatar = async (req, res) => {
  try {
    const { avatar_url } = req.body;

    if (!avatar_url) {
      return res.status(400).json({
        success: false,
        error: 'Missing avatar URL',
        message: 'Avatar URL is required.',
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User account not found.',
      });
    }

    await user.update({ avatar_url });

    return res.status(200).json({
      success: true,
      message: 'Avatar updated successfully.',
      data: { avatar_url: user.avatar_url },
    });
  } catch (error) {
    logger.error('UpdateAvatar error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while updating the avatar.',
    });
  }
};

/**
 * @desc    Find users near a given location
 * @route   GET /api/users/nearby
 */
const getNearbyUsers = async (req, res) => {
  try {
    const { lat, lng, radius = 25, page = 1, limit = 20 } = req.query;

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

    const { count, rows: users } = await User.findAndCountAll({
      where: {
        status: 'active',
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null },
        id: { [Op.ne]: req.user ? req.user.id : null },
      },
      attributes: {
        include: [[sequelize.literal(haversine), 'distance']],
        exclude: ['password_hash', 'refresh_token', 'deleted_at'],
      },
      having: sequelize.literal(`${haversine} <= ${radiusKm}`),
      order: [[sequelize.literal('distance'), 'ASC']],
      limit: parseInt(limit),
      offset,
      subQuery: false,
    });

    return res.status(200).json({
      success: true,
      message: 'Nearby users retrieved successfully.',
      data: { users },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetNearbyUsers error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching nearby users.',
    });
  }
};

/**
 * @desc    Get recommended users based on shared interests
 * @route   GET /api/users/recommended
 */
const getRecommendedUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const currentUser = await User.findByPk(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User account not found.',
      });
    }

    // Get IDs of users already being followed
    const followingRecords = await Follow.findAll({
      where: { follower_id: req.user.id, type: 'user' },
      attributes: ['following_id'],
    });
    const followingIds = followingRecords.map((f) => f.following_id);
    const excludeIds = [req.user.id, ...followingIds];

    const whereClause = {
      id: { [Op.notIn]: excludeIds },
      status: 'active',
    };

    // If the user has interests, find users with overlapping interests
    if (currentUser.interests && currentUser.interests.length > 0) {
      whereClause.interests = { [Op.overlap]: currentUser.interests };
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: [
        'id', 'username', 'display_name', 'avatar_url', 'bio',
        'city', 'state', 'is_verified', 'interests',
        'follower_count', 'following_count',
      ],
      order: [['follower_count', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    // Calculate shared interest count for ranking
    const usersWithScore = users.map((user) => {
      const userJSON = user.toJSON();
      const sharedInterests = currentUser.interests
        ? currentUser.interests.filter(
            (interest) => userJSON.interests && userJSON.interests.includes(interest)
          )
        : [];
      return {
        ...userJSON,
        shared_interests: sharedInterests,
        shared_interest_count: sharedInterests.length,
      };
    });

    usersWithScore.sort((a, b) => b.shared_interest_count - a.shared_interest_count);

    return res.status(200).json({
      success: true,
      message: 'Recommended users retrieved successfully.',
      data: { users: usersWithScore },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetRecommendedUsers error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching recommended users.',
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  searchUsers,
  getUserEvents,
  getUserFollowers,
  getUserFollowing,
  followUser,
  unfollowUser,
  getSavedEvents,
  updateAvatar,
  getNearbyUsers,
  getRecommendedUsers,
};
