const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const {
  Event, Business, User, EventAttendee, SavedEvent,
  ChatRoom, ChatMember, Notification,
} = require('../models');
const logger = require('../utils/logger');

/**
 * @desc    List events with pagination and filters
 * @route   GET /api/events
 */
const getEvents = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, category, start_date, end_date,
      is_free, search, city, state, sort = 'start_time',
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { status: 'published' };

    if (category) where.category = category;
    if (is_free !== undefined) where.is_free = is_free === 'true';
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (state) where.state = { [Op.iLike]: `%${state}%` };

    if (start_date) {
      where.start_time = { ...(where.start_time || {}), [Op.gte]: new Date(start_date) };
    }
    if (end_date) {
      where.end_time = { ...(where.end_time || {}), [Op.lte]: new Date(end_date) };
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.overlap]: [search.toLowerCase()] } },
      ];
    }

    const orderMap = {
      start_time: [['start_time', 'ASC']],
      newest: [['created_at', 'DESC']],
      popular: [['attendee_count', 'DESC']],
      views: [['view_count', 'DESC']],
    };

    const { count, rows: events } = await Event.findAndCountAll({
      where,
      include: [
        {
          model: Business,
          as: 'Business',
          attributes: ['id', 'name', 'slug', 'logo_url', 'category'],
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'username', 'display_name', 'avatar_url'],
        },
      ],
      order: orderMap[sort] || orderMap.start_time,
      limit: parseInt(limit),
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Events retrieved successfully.',
      data: { events: events.map((e) => e.toPublicJSON()) },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetEvents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching events.',
    });
  }
};

/**
 * @desc    Get single event by ID
 * @route   GET /api/events/:id
 */
const getEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id, {
      include: [
        {
          model: Business,
          as: 'Business',
          attributes: ['id', 'name', 'slug', 'logo_url', 'category', 'address', 'city', 'state'],
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'username', 'display_name', 'avatar_url'],
        },
        {
          model: EventAttendee,
          as: 'Attendees',
          limit: 10,
          where: { status: { [Op.in]: ['going', 'interested'] } },
          required: false,
          include: [
            {
              model: User,
              as: 'User',
              attributes: ['id', 'username', 'display_name', 'avatar_url'],
            },
          ],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        message: 'No event found with this ID.',
      });
    }

    const eventData = event.toPublicJSON();

    // Check if the current user has RSVP'd or saved this event
    if (req.user) {
      const attendance = await EventAttendee.findOne({
        where: { event_id: id, user_id: req.user.id },
      });
      eventData.user_rsvp_status = attendance ? attendance.status : null;

      const saved = await SavedEvent.findOne({
        where: { event_id: id, user_id: req.user.id },
      });
      eventData.is_saved = !!saved;
    }

    return res.status(200).json({
      success: true,
      message: 'Event retrieved successfully.',
      data: { event: eventData },
    });
  } catch (error) {
    logger.error('GetEvent error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching the event.',
    });
  }
};

/**
 * @desc    Create a new event (requires business owner)
 * @route   POST /api/events
 */
const createEvent = async (req, res) => {
  try {
    const { business_id } = req.body;

    if (!business_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing business ID',
        message: 'A business_id is required to create an event.',
      });
    }

    const business = await Business.findByPk(business_id);

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
        message: 'You are not the owner of this business.',
      });
    }

    const result = await sequelize.transaction(async (t) => {
      const event = await Event.create(
        {
          business_id,
          created_by: req.user.id,
          title: req.body.title,
          description: req.body.description,
          short_description: req.body.short_description,
          category: req.body.category,
          subcategory: req.body.subcategory,
          tags: req.body.tags,
          vibe_tags: req.body.vibe_tags,
          image_url: req.body.image_url,
          gallery: req.body.gallery,
          start_time: req.body.start_time,
          end_time: req.body.end_time,
          timezone: req.body.timezone,
          recurrence: req.body.recurrence,
          venue_name: req.body.venue_name,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zip_code: req.body.zip_code,
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          is_virtual: req.body.is_virtual,
          virtual_link: req.body.virtual_link,
          price: req.body.price,
          price_description: req.body.price_description,
          max_attendees: req.body.max_attendees,
          min_attendees: req.body.min_attendees,
          age_restriction: req.body.age_restriction,
          dress_code: req.body.dress_code,
          what_to_bring: req.body.what_to_bring,
          accessibility: req.body.accessibility,
          difficulty_level: req.body.difficulty_level,
          status: req.body.status || 'published',
          metadata: req.body.metadata,
        },
        { transaction: t }
      );

      // Auto-create a chat room for the event
      const chatRoom = await ChatRoom.create(
        {
          name: event.title,
          type: 'event',
          event_id: event.id,
          business_id: business_id,
          created_by: req.user.id,
          description: `Chat room for ${event.title}`,
          member_count: 1,
        },
        { transaction: t }
      );

      // Add creator as the first chat member (owner role)
      await ChatMember.create(
        {
          room_id: chatRoom.id,
          user_id: req.user.id,
          role: 'owner',
        },
        { transaction: t }
      );

      // Increment business total_events count
      await Business.increment('total_events', {
        by: 1,
        where: { id: business_id },
        transaction: t,
      });

      // Increment user events_hosted_count
      await User.increment('events_hosted_count', {
        by: 1,
        where: { id: req.user.id },
        transaction: t,
      });

      return event;
    });

    const createdEvent = await Event.findByPk(result.id, {
      include: [
        {
          model: Business,
          as: 'Business',
          attributes: ['id', 'name', 'slug', 'logo_url'],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: { event: createdEvent.toPublicJSON() },
    });
  } catch (error) {
    logger.error('CreateEvent error:', error);

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
      message: 'An error occurred while creating the event.',
    });
  }
};

/**
 * @desc    Update an event (owner only)
 * @route   PUT /api/events/:id
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id, {
      include: [{ model: Business, as: 'Business' }],
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        message: 'No event found with this ID.',
      });
    }

    if (event.created_by !== req.user.id && event.Business.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You do not have permission to update this event.',
      });
    }

    const allowedFields = [
      'title', 'description', 'short_description', 'category', 'subcategory',
      'tags', 'vibe_tags', 'image_url', 'gallery', 'start_time', 'end_time',
      'timezone', 'recurrence', 'venue_name', 'address', 'city', 'state',
      'zip_code', 'latitude', 'longitude', 'is_virtual', 'virtual_link',
      'price', 'price_description', 'max_attendees', 'min_attendees',
      'age_restriction', 'dress_code', 'what_to_bring', 'accessibility',
      'difficulty_level', 'status', 'cancellation_reason', 'metadata',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await event.update(updates);

    const updatedEvent = await Event.findByPk(id, {
      include: [
        {
          model: Business,
          as: 'Business',
          attributes: ['id', 'name', 'slug', 'logo_url'],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: { event: updatedEvent.toPublicJSON() },
    });
  } catch (error) {
    logger.error('UpdateEvent error:', error);

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
      message: 'An error occurred while updating the event.',
    });
  }
};

/**
 * @desc    Soft delete an event
 * @route   DELETE /api/events/:id
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id, {
      include: [{ model: Business, as: 'Business' }],
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        message: 'No event found with this ID.',
      });
    }

    if (event.created_by !== req.user.id && event.Business.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You do not have permission to delete this event.',
      });
    }

    await sequelize.transaction(async (t) => {
      await event.update({ status: 'cancelled' }, { transaction: t });
      await event.destroy({ transaction: t });

      await Business.decrement('total_events', {
        by: 1,
        where: { id: event.business_id, total_events: { [Op.gt]: 0 } },
        transaction: t,
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully.',
      data: null,
    });
  } catch (error) {
    logger.error('DeleteEvent error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while deleting the event.',
    });
  }
};

/**
 * @desc    Get nearby events using haversine formula
 * @route   GET /api/events/nearby
 */
const getNearbyEvents = async (req, res) => {
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

    const where = {
      status: 'published',
      end_time: { [Op.gte]: new Date() },
    };

    if (category) where.category = category;

    const { count, rows: events } = await Event.findAndCountAll({
      where,
      attributes: {
        include: [[sequelize.literal(haversine), 'distance']],
      },
      include: [
        {
          model: Business,
          as: 'Business',
          attributes: ['id', 'name', 'slug', 'logo_url'],
        },
      ],
      having: sequelize.literal(`${haversine} <= ${radiusKm}`),
      order: [[sequelize.literal('distance'), 'ASC']],
      limit: parseInt(limit),
      offset,
      subQuery: false,
    });

    return res.status(200).json({
      success: true,
      message: 'Nearby events retrieved successfully.',
      data: { events: events.map((e) => e.toPublicJSON()) },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetNearbyEvents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching nearby events.',
    });
  }
};

/**
 * @desc    Get trending events sorted by attendee_count and view_count
 * @route   GET /api/events/trending
 */
const getTrendingEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, city, state } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      status: 'published',
      end_time: { [Op.gte]: new Date() },
    };

    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (state) where.state = { [Op.iLike]: `%${state}%` };

    const { count, rows: events } = await Event.findAndCountAll({
      where,
      include: [
        {
          model: Business,
          as: 'Business',
          attributes: ['id', 'name', 'slug', 'logo_url'],
        },
      ],
      order: [
        ['attendee_count', 'DESC'],
        ['view_count', 'DESC'],
        ['interested_count', 'DESC'],
      ],
      limit: parseInt(limit),
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Trending events retrieved successfully.',
      data: { events: events.map((e) => e.toPublicJSON()) },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetTrendingEvents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching trending events.',
    });
  }
};

/**
 * @desc    Get upcoming events the current user is attending
 * @route   GET /api/events/upcoming
 */
const getUpcomingEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: attendances } = await EventAttendee.findAndCountAll({
      where: {
        user_id: req.user.id,
        status: { [Op.in]: ['going', 'interested', 'maybe'] },
      },
      include: [
        {
          model: Event,
          as: 'Event',
          where: {
            status: 'published',
            start_time: { [Op.gte]: new Date() },
          },
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
    }));

    return res.status(200).json({
      success: true,
      message: 'Upcoming events retrieved successfully.',
      data: { events },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetUpcomingEvents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching upcoming events.',
    });
  }
};

/**
 * @desc    RSVP to an event (going/interested/maybe)
 * @route   POST /api/events/:id/rsvp
 */
const rsvpEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'going' } = req.body;

    const validStatuses = ['going', 'interested', 'maybe'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        message: `RSVP status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        message: 'No event found with this ID.',
      });
    }

    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        error: 'Event unavailable',
        message: 'This event is not currently accepting RSVPs.',
      });
    }

    if (status === 'going' && event.max_attendees && event.attendee_count >= event.max_attendees) {
      return res.status(400).json({
        success: false,
        error: 'Event full',
        message: 'This event has reached its maximum capacity.',
      });
    }

    const result = await sequelize.transaction(async (t) => {
      const existingAttendee = await EventAttendee.findOne({
        where: { event_id: id, user_id: req.user.id },
        transaction: t,
      });

      let attendee;
      const previousStatus = existingAttendee ? existingAttendee.status : null;

      if (existingAttendee) {
        await existingAttendee.update({ status, rsvp_time: new Date() }, { transaction: t });
        attendee = existingAttendee;
      } else {
        attendee = await EventAttendee.create(
          {
            event_id: id,
            user_id: req.user.id,
            status,
            rsvp_time: new Date(),
          },
          { transaction: t }
        );
      }

      // Update attendee and interested counts based on status transitions
      if (!previousStatus) {
        // New RSVP
        if (status === 'going') {
          await Event.increment('attendee_count', { by: 1, where: { id }, transaction: t });
          await User.increment('events_attended_count', {
            by: 1,
            where: { id: req.user.id },
            transaction: t,
          });
        }
        if (status === 'interested') {
          await Event.increment('interested_count', { by: 1, where: { id }, transaction: t });
        }
      } else if (previousStatus !== status) {
        // Status change
        if (previousStatus === 'going' && status !== 'going') {
          await Event.decrement('attendee_count', {
            by: 1,
            where: { id, attendee_count: { [Op.gt]: 0 } },
            transaction: t,
          });
          await User.decrement('events_attended_count', {
            by: 1,
            where: { id: req.user.id, events_attended_count: { [Op.gt]: 0 } },
            transaction: t,
          });
        }
        if (previousStatus === 'interested' && status !== 'interested') {
          await Event.decrement('interested_count', {
            by: 1,
            where: { id, interested_count: { [Op.gt]: 0 } },
            transaction: t,
          });
        }
        if (status === 'going' && previousStatus !== 'going') {
          await Event.increment('attendee_count', { by: 1, where: { id }, transaction: t });
          await User.increment('events_attended_count', {
            by: 1,
            where: { id: req.user.id },
            transaction: t,
          });
        }
        if (status === 'interested' && previousStatus !== 'interested') {
          await Event.increment('interested_count', { by: 1, where: { id }, transaction: t });
        }
      }

      // Add user to event chat room if not already a member
      const eventChatRoom = await ChatRoom.findOne({
        where: { event_id: id, type: 'event' },
        transaction: t,
      });

      if (eventChatRoom) {
        const existingMember = await ChatMember.findOne({
          where: { room_id: eventChatRoom.id, user_id: req.user.id },
          transaction: t,
        });

        if (!existingMember) {
          await ChatMember.create(
            {
              room_id: eventChatRoom.id,
              user_id: req.user.id,
              role: 'member',
            },
            { transaction: t }
          );

          await ChatRoom.increment('member_count', {
            by: 1,
            where: { id: eventChatRoom.id },
            transaction: t,
          });
        } else if (!existingMember.is_active) {
          await existingMember.update({ is_active: true }, { transaction: t });
          await ChatRoom.increment('member_count', {
            by: 1,
            where: { id: eventChatRoom.id },
            transaction: t,
          });
        }
      }

      return attendee;
    });

    return res.status(200).json({
      success: true,
      message: `RSVP status set to "${status}" successfully.`,
      data: { rsvp: result },
    });
  } catch (error) {
    logger.error('RsvpEvent error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while processing your RSVP.',
    });
  }
};

/**
 * @desc    Cancel RSVP for an event
 * @route   DELETE /api/events/:id/rsvp
 */
const cancelRsvp = async (req, res) => {
  try {
    const { id } = req.params;

    const attendee = await EventAttendee.findOne({
      where: { event_id: id, user_id: req.user.id },
    });

    if (!attendee) {
      return res.status(404).json({
        success: false,
        error: 'RSVP not found',
        message: 'You have not RSVP\'d to this event.',
      });
    }

    await sequelize.transaction(async (t) => {
      const previousStatus = attendee.status;

      if (previousStatus === 'going') {
        await Event.decrement('attendee_count', {
          by: 1,
          where: { id, attendee_count: { [Op.gt]: 0 } },
          transaction: t,
        });
        await User.decrement('events_attended_count', {
          by: 1,
          where: { id: req.user.id, events_attended_count: { [Op.gt]: 0 } },
          transaction: t,
        });
      }
      if (previousStatus === 'interested') {
        await Event.decrement('interested_count', {
          by: 1,
          where: { id, interested_count: { [Op.gt]: 0 } },
          transaction: t,
        });
      }

      await attendee.destroy({ transaction: t });

      // Remove user from event chat room
      const eventChatRoom = await ChatRoom.findOne({
        where: { event_id: id, type: 'event' },
        transaction: t,
      });

      if (eventChatRoom) {
        const chatMember = await ChatMember.findOne({
          where: { room_id: eventChatRoom.id, user_id: req.user.id },
          transaction: t,
        });

        if (chatMember && chatMember.role !== 'owner') {
          await chatMember.update({ is_active: false }, { transaction: t });
          await ChatRoom.decrement('member_count', {
            by: 1,
            where: { id: eventChatRoom.id, member_count: { [Op.gt]: 0 } },
            transaction: t,
          });
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'RSVP cancelled successfully.',
      data: null,
    });
  } catch (error) {
    logger.error('CancelRsvp error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while cancelling your RSVP.',
    });
  }
};

/**
 * @desc    Save/bookmark an event
 * @route   POST /api/events/:id/save
 */
const saveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { collection = 'default', notes } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        message: 'No event found with this ID.',
      });
    }

    const existingSave = await SavedEvent.findOne({
      where: { event_id: id, user_id: req.user.id },
    });

    if (existingSave) {
      return res.status(400).json({
        success: false,
        error: 'Already saved',
        message: 'You have already saved this event.',
      });
    }

    await sequelize.transaction(async (t) => {
      await SavedEvent.create(
        {
          event_id: id,
          user_id: req.user.id,
          collection,
          notes,
        },
        { transaction: t }
      );

      await Event.increment('save_count', { by: 1, where: { id }, transaction: t });
    });

    return res.status(201).json({
      success: true,
      message: 'Event saved successfully.',
      data: null,
    });
  } catch (error) {
    logger.error('SaveEvent error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while saving the event.',
    });
  }
};

/**
 * @desc    Remove saved/bookmarked event
 * @route   DELETE /api/events/:id/save
 */
const unsaveEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const savedEvent = await SavedEvent.findOne({
      where: { event_id: id, user_id: req.user.id },
    });

    if (!savedEvent) {
      return res.status(404).json({
        success: false,
        error: 'Not saved',
        message: 'This event is not in your saved list.',
      });
    }

    await sequelize.transaction(async (t) => {
      await savedEvent.destroy({ transaction: t });

      await Event.decrement('save_count', {
        by: 1,
        where: { id, save_count: { [Op.gt]: 0 } },
        transaction: t,
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Event removed from saved list.',
      data: null,
    });
  } catch (error) {
    logger.error('UnsaveEvent error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while removing the saved event.',
    });
  }
};

/**
 * @desc    Get attendees for an event
 * @route   GET /api/events/:id/attendees
 */
const getEventAttendees = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        message: 'No event found with this ID.',
      });
    }

    const whereClause = { event_id: id };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: attendees } = await EventAttendee.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_verified'],
        },
      ],
      order: [['rsvp_time', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Event attendees retrieved successfully.',
      data: {
        attendees: attendees.map((a) => ({
          user: a.User,
          status: a.status,
          rsvp_time: a.rsvp_time,
          checked_in: a.checked_in,
        })),
      },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetEventAttendees error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching event attendees.',
    });
  }
};

/**
 * @desc    Full-text search events
 * @route   GET /api/events/search
 */
const searchEvents = async (req, res) => {
  try {
    const { q, page = 1, limit = 20, category, city, state, is_free } = req.query;

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
      status: 'published',
      end_time: { [Op.gte]: new Date() },
      [Op.or]: [
        { title: { [Op.iLike]: `%${searchTerm}%` } },
        { description: { [Op.iLike]: `%${searchTerm}%` } },
        { venue_name: { [Op.iLike]: `%${searchTerm}%` } },
        { tags: { [Op.overlap]: [searchTerm.toLowerCase()] } },
        { vibe_tags: { [Op.overlap]: [searchTerm.toLowerCase()] } },
      ],
    };

    if (category) where.category = category;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (state) where.state = { [Op.iLike]: `%${state}%` };
    if (is_free !== undefined) where.is_free = is_free === 'true';

    const { count, rows: events } = await Event.findAndCountAll({
      where,
      include: [
        {
          model: Business,
          as: 'Business',
          attributes: ['id', 'name', 'slug', 'logo_url'],
        },
      ],
      order: [
        ['attendee_count', 'DESC'],
        ['start_time', 'ASC'],
      ],
      limit: parseInt(limit),
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Search results retrieved successfully.',
      data: { events: events.map((e) => e.toPublicJSON()) },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('SearchEvents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while searching events.',
    });
  }
};

/**
 * @desc    Get events by category
 * @route   GET /api/events/category/:category
 */
const getEventsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: events } = await Event.findAndCountAll({
      where: {
        category,
        status: 'published',
        end_time: { [Op.gte]: new Date() },
      },
      include: [
        {
          model: Business,
          as: 'Business',
          attributes: ['id', 'name', 'slug', 'logo_url'],
        },
      ],
      order: [['start_time', 'ASC']],
      limit: parseInt(limit),
      offset,
    });

    return res.status(200).json({
      success: true,
      message: `Events in category "${category}" retrieved successfully.`,
      data: { events: events.map((e) => e.toPublicJSON()) },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetEventsByCategory error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching events by category.',
    });
  }
};

/**
 * @desc    Get featured events
 * @route   GET /api/events/featured
 */
const getFeaturedEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: events } = await Event.findAndCountAll({
      where: {
        is_featured: true,
        status: 'published',
        end_time: { [Op.gte]: new Date() },
      },
      include: [
        {
          model: Business,
          as: 'Business',
          attributes: ['id', 'name', 'slug', 'logo_url'],
        },
      ],
      order: [['start_time', 'ASC']],
      limit: parseInt(limit),
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Featured events retrieved successfully.',
      data: { events: events.map((e) => e.toPublicJSON()) },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetFeaturedEvents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching featured events.',
    });
  }
};

/**
 * @desc    Increment event view count
 * @route   POST /api/events/:id/view
 */
const incrementViewCount = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        message: 'No event found with this ID.',
      });
    }

    await Event.increment('view_count', { by: 1, where: { id } });

    return res.status(200).json({
      success: true,
      message: 'View count incremented.',
      data: { view_count: event.view_count + 1 },
    });
  } catch (error) {
    logger.error('IncrementViewCount error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while tracking the view.',
    });
  }
};

/**
 * @desc    Get all event categories with counts
 * @route   GET /api/events/categories
 */
const getEventCategories = async (req, res) => {
  try {
    const categories = await Event.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        status: 'published',
        end_time: { [Op.gte]: new Date() },
      },
      group: ['category'],
      order: [[sequelize.literal('count'), 'DESC']],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Event categories retrieved successfully.',
      data: { categories },
    });
  } catch (error) {
    logger.error('GetEventCategories error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching event categories.',
    });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getNearbyEvents,
  getTrendingEvents,
  getUpcomingEvents,
  rsvpEvent,
  cancelRsvp,
  saveEvent,
  unsaveEvent,
  getEventAttendees,
  searchEvents,
  getEventsByCategory,
  getFeaturedEvents,
  incrementViewCount,
  getEventCategories,
};
