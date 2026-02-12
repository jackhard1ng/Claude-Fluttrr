const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { ChatRoom, ChatMember, Message, User } = require('../models');
const logger = require('../utils/logger');

/**
 * @desc    Get user's chat rooms with last message and unread count
 * @route   GET /api/chat/rooms
 */
const getRooms = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const memberWhere = {
      user_id: req.user.id,
      is_active: true,
    };

    const roomWhere = { is_active: true };
    if (type) roomWhere.type = type;

    const { count, rows: memberships } = await ChatMember.findAndCountAll({
      where: memberWhere,
      include: [
        {
          model: ChatRoom,
          as: 'Room',
          where: roomWhere,
          include: [
            {
              model: ChatMember,
              as: 'Members',
              where: { is_active: true },
              required: false,
              include: [
                {
                  model: User,
                  as: 'User',
                  attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_online'],
                },
              ],
            },
          ],
        },
      ],
      order: [[{ model: ChatRoom, as: 'Room' }, 'last_message_at', 'DESC NULLS LAST']],
      limit: parseInt(limit),
      offset,
    });

    const rooms = memberships.map((m) => {
      const room = m.Room.toPublicJSON();
      room.unread_count = m.unread_count;
      room.is_muted = m.is_muted;
      room.role = m.role;
      room.joined_at = m.joined_at;
      return room;
    });

    return res.status(200).json({
      success: true,
      message: 'Chat rooms retrieved successfully.',
      data: { rooms },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('GetRooms error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching chat rooms.',
    });
  }
};

/**
 * @desc    Get single chat room with members
 * @route   GET /api/chat/rooms/:id
 */
const getRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user is a member
    const membership = await ChatMember.findOne({
      where: { room_id: id, user_id: req.user.id, is_active: true },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You are not a member of this chat room.',
      });
    }

    const room = await ChatRoom.findByPk(id, {
      include: [
        {
          model: ChatMember,
          as: 'Members',
          where: { is_active: true },
          required: false,
          include: [
            {
              model: User,
              as: 'User',
              attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_online', 'last_seen'],
            },
          ],
        },
      ],
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found',
        message: 'No chat room found with this ID.',
      });
    }

    const roomData = room.toPublicJSON();
    roomData.unread_count = membership.unread_count;
    roomData.is_muted = membership.is_muted;
    roomData.role = membership.role;

    return res.status(200).json({
      success: true,
      message: 'Chat room retrieved successfully.',
      data: { room: roomData },
    });
  } catch (error) {
    logger.error('GetRoom error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching the chat room.',
    });
  }
};

/**
 * @desc    Create a direct or group chat room
 * @route   POST /api/chat/rooms
 */
const createRoom = async (req, res) => {
  try {
    const { type, name, description, member_ids } = req.body;

    if (!type || !['direct', 'group'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type',
        message: 'Chat room type must be "direct" or "group".',
      });
    }

    if (!member_ids || !Array.isArray(member_ids) || member_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing members',
        message: 'At least one member ID is required.',
      });
    }

    // For direct messages, check if a DM room already exists between the two users
    if (type === 'direct') {
      if (member_ids.length !== 1) {
        return res.status(400).json({
          success: false,
          error: 'Invalid members',
          message: 'Direct messages require exactly one other member.',
        });
      }

      const otherUserId = member_ids[0];

      if (otherUserId === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'Invalid member',
          message: 'You cannot create a direct message with yourself.',
        });
      }

      // Check if the other user exists
      const otherUser = await User.findByPk(otherUserId);
      if (!otherUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'The specified user was not found.',
        });
      }

      // Check if a DM room already exists between these two users
      const existingRoom = await ChatRoom.findOne({
        where: { type: 'direct', is_active: true },
        include: [
          {
            model: ChatMember,
            as: 'Members',
            where: {
              user_id: { [Op.in]: [req.user.id, otherUserId] },
              is_active: true,
            },
            required: true,
          },
        ],
        group: ['ChatRoom.id'],
        having: sequelize.literal(`COUNT("Members"."id") = 2`),
      });

      if (existingRoom) {
        const room = await ChatRoom.findByPk(existingRoom.id, {
          include: [
            {
              model: ChatMember,
              as: 'Members',
              where: { is_active: true },
              include: [
                {
                  model: User,
                  as: 'User',
                  attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_online'],
                },
              ],
            },
          ],
        });

        return res.status(200).json({
          success: true,
          message: 'Existing direct message room found.',
          data: { room: room.toPublicJSON() },
        });
      }
    }

    if (type === 'group' && !name) {
      return res.status(400).json({
        success: false,
        error: 'Missing name',
        message: 'Group chat rooms require a name.',
      });
    }

    // Verify all member_ids are valid users
    const members = await User.findAll({
      where: { id: { [Op.in]: member_ids }, status: 'active' },
    });

    if (members.length !== member_ids.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid members',
        message: 'One or more member IDs are invalid.',
      });
    }

    const result = await sequelize.transaction(async (t) => {
      const room = await ChatRoom.create(
        {
          name: name || null,
          type,
          created_by: req.user.id,
          description: description || null,
          member_count: member_ids.length + 1, // includes the creator
        },
        { transaction: t }
      );

      // Add the creator as owner
      await ChatMember.create(
        {
          room_id: room.id,
          user_id: req.user.id,
          role: type === 'group' ? 'owner' : 'member',
        },
        { transaction: t }
      );

      // Add other members
      const memberRecords = member_ids.map((userId) => ({
        room_id: room.id,
        user_id: userId,
        role: 'member',
      }));

      await ChatMember.bulkCreate(memberRecords, { transaction: t });

      return room;
    });

    const createdRoom = await ChatRoom.findByPk(result.id, {
      include: [
        {
          model: ChatMember,
          as: 'Members',
          where: { is_active: true },
          include: [
            {
              model: User,
              as: 'User',
              attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_online'],
            },
          ],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Chat room created successfully.',
      data: { room: createdRoom.toPublicJSON() },
    });
  } catch (error) {
    logger.error('CreateRoom error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while creating the chat room.',
    });
  }
};

/**
 * @desc    Get messages for a room (cursor-based pagination)
 * @route   GET /api/chat/rooms/:id/messages
 */
const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { cursor, limit = 50 } = req.query;

    // Verify membership
    const membership = await ChatMember.findOne({
      where: { room_id: id, user_id: req.user.id, is_active: true },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You are not a member of this chat room.',
      });
    }

    const where = { room_id: id, is_deleted: false };

    // Cursor-based pagination: fetch messages older than the cursor
    if (cursor) {
      where.id = { [Op.lt]: cursor };
    }

    const messages = await Message.findAll({
      where,
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'username', 'display_name', 'avatar_url'],
        },
        {
          model: Message,
          as: 'ReplyMessage',
          required: false,
          attributes: ['id', 'content', 'sender_id', 'type'],
          include: [
            {
              model: User,
              as: 'Sender',
              attributes: ['id', 'username', 'display_name'],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit) + 1, // Fetch one extra to determine if there are more
    });

    const hasMore = messages.length > parseInt(limit);
    const resultMessages = hasMore ? messages.slice(0, parseInt(limit)) : messages;
    const nextCursor = hasMore ? resultMessages[resultMessages.length - 1].id : null;

    return res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully.',
      data: { messages: resultMessages.map((m) => m.toPublicJSON()) },
      pagination: {
        has_more: hasMore,
        next_cursor: nextCursor,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('GetMessages error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching messages.',
    });
  }
};

/**
 * @desc    Send a message in a chat room
 * @route   POST /api/chat/rooms/:id/messages
 */
const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type = 'text', media_url, media_type, media_metadata, reply_to, mentions } = req.body;

    // Verify membership
    const membership = await ChatMember.findOne({
      where: { room_id: id, user_id: req.user.id, is_active: true },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You are not a member of this chat room.',
      });
    }

    if (!content && !media_url) {
      return res.status(400).json({
        success: false,
        error: 'Missing content',
        message: 'Message content or media is required.',
      });
    }

    // Check room settings for admin-only posting
    const room = await ChatRoom.findByPk(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found',
        message: 'No chat room found with this ID.',
      });
    }

    if (room.settings && room.settings.only_admins_post) {
      if (!['admin', 'moderator', 'owner'].includes(membership.role)) {
        return res.status(403).json({
          success: false,
          error: 'Restricted',
          message: 'Only admins can post in this chat room.',
        });
      }
    }

    const message = await sequelize.transaction(async (t) => {
      const newMessage = await Message.create(
        {
          room_id: id,
          sender_id: req.user.id,
          type,
          content: content || '',
          media_url: media_url || null,
          media_type: media_type || null,
          media_metadata: media_metadata || null,
          reply_to: reply_to || null,
          mentions: mentions || [],
        },
        { transaction: t }
      );

      // Update room's last_message and last_message_at
      const senderUser = await User.findByPk(req.user.id, {
        attributes: ['id', 'username', 'display_name', 'avatar_url'],
        transaction: t,
      });

      await room.update(
        {
          last_message: {
            id: newMessage.id,
            content: content ? content.substring(0, 100) : `[${type}]`,
            sender: senderUser ? senderUser.toJSON() : null,
            type,
            created_at: newMessage.created_at,
          },
          last_message_at: new Date(),
        },
        { transaction: t }
      );

      // Increment unread count for all other active members
      await ChatMember.increment('unread_count', {
        by: 1,
        where: {
          room_id: id,
          user_id: { [Op.ne]: req.user.id },
          is_active: true,
        },
        transaction: t,
      });

      return newMessage;
    });

    const fullMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'username', 'display_name', 'avatar_url'],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: { message: fullMessage.toPublicJSON() },
    });
  } catch (error) {
    logger.error('SendMessage error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while sending the message.',
    });
  }
};

/**
 * @desc    Edit a message (sender only)
 * @route   PUT /api/chat/messages/:id
 */
const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Missing content',
        message: 'Message content is required.',
      });
    }

    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
        message: 'No message found with this ID.',
      });
    }

    if (message.sender_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You can only edit your own messages.',
      });
    }

    if (message.is_deleted) {
      return res.status(400).json({
        success: false,
        error: 'Message deleted',
        message: 'Cannot edit a deleted message.',
      });
    }

    await message.update({
      content,
      is_edited: true,
      edited_at: new Date(),
    });

    const updatedMessage = await Message.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'username', 'display_name', 'avatar_url'],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: 'Message edited successfully.',
      data: { message: updatedMessage.toPublicJSON() },
    });
  } catch (error) {
    logger.error('EditMessage error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while editing the message.',
    });
  }
};

/**
 * @desc    Soft delete a message
 * @route   DELETE /api/chat/messages/:id
 */
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
        message: 'No message found with this ID.',
      });
    }

    if (message.sender_id !== req.user.id) {
      // Check if user is admin/owner of the room
      const membership = await ChatMember.findOne({
        where: {
          room_id: message.room_id,
          user_id: req.user.id,
          role: { [Op.in]: ['admin', 'owner', 'moderator'] },
          is_active: true,
        },
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized',
          message: 'You do not have permission to delete this message.',
        });
      }
    }

    await message.update({
      is_deleted: true,
      content: '',
      media_url: null,
    });

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully.',
      data: null,
    });
  } catch (error) {
    logger.error('DeleteMessage error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while deleting the message.',
    });
  }
};

/**
 * @desc    Add emoji reaction to a message
 * @route   POST /api/chat/messages/:id/reactions
 */
const addReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        error: 'Missing emoji',
        message: 'An emoji is required for a reaction.',
      });
    }

    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
        message: 'No message found with this ID.',
      });
    }

    // Verify user is in the room
    const membership = await ChatMember.findOne({
      where: { room_id: message.room_id, user_id: req.user.id, is_active: true },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You are not a member of this chat room.',
      });
    }

    const reactions = { ...message.reactions };
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    if (!reactions[emoji].includes(req.user.id)) {
      reactions[emoji].push(req.user.id);
    }

    await message.update({ reactions });

    return res.status(200).json({
      success: true,
      message: 'Reaction added successfully.',
      data: { reactions },
    });
  } catch (error) {
    logger.error('AddReaction error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while adding the reaction.',
    });
  }
};

/**
 * @desc    Remove emoji reaction from a message
 * @route   DELETE /api/chat/messages/:id/reactions
 */
const removeReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        error: 'Missing emoji',
        message: 'An emoji is required to remove a reaction.',
      });
    }

    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
        message: 'No message found with this ID.',
      });
    }

    const reactions = { ...message.reactions };
    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter((uid) => uid !== req.user.id);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    }

    await message.update({ reactions });

    return res.status(200).json({
      success: true,
      message: 'Reaction removed successfully.',
      data: { reactions },
    });
  } catch (error) {
    logger.error('RemoveReaction error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while removing the reaction.',
    });
  }
};

/**
 * @desc    Mark messages as read and reset unread count
 * @route   POST /api/chat/rooms/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const membership = await ChatMember.findOne({
      where: { room_id: id, user_id: req.user.id, is_active: true },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You are not a member of this chat room.',
      });
    }

    await sequelize.transaction(async (t) => {
      await membership.update(
        { last_read_at: new Date(), unread_count: 0 },
        { transaction: t }
      );

      // Add user to read_by for all unread messages
      await Message.update(
        {
          read_by: sequelize.fn(
            'array_append',
            sequelize.col('read_by'),
            req.user.id
          ),
        },
        {
          where: {
            room_id: id,
            sender_id: { [Op.ne]: req.user.id },
            is_deleted: false,
            read_by: { [Op.not]: { [Op.contains]: [req.user.id] } },
          },
          transaction: t,
        }
      );
    });

    return res.status(200).json({
      success: true,
      message: 'Messages marked as read.',
      data: null,
    });
  } catch (error) {
    logger.error('MarkAsRead error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while marking messages as read.',
    });
  }
};

/**
 * @desc    Add members to a group chat
 * @route   POST /api/chat/rooms/:id/members
 */
const addMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { member_ids } = req.body;

    if (!member_ids || !Array.isArray(member_ids) || member_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing members',
        message: 'At least one member ID is required.',
      });
    }

    const room = await ChatRoom.findByPk(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found',
        message: 'No chat room found with this ID.',
      });
    }

    if (room.type === 'direct') {
      return res.status(400).json({
        success: false,
        error: 'Invalid action',
        message: 'Cannot add members to a direct message.',
      });
    }

    // Verify requester is admin/owner
    const requesterMembership = await ChatMember.findOne({
      where: {
        room_id: id,
        user_id: req.user.id,
        is_active: true,
        role: { [Op.in]: ['admin', 'owner'] },
      },
    });

    if (!requesterMembership) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'Only admins and owners can add members.',
      });
    }

    // Check max members
    if (room.max_members && room.member_count + member_ids.length > room.max_members) {
      return res.status(400).json({
        success: false,
        error: 'Room full',
        message: 'Adding these members would exceed the room capacity.',
      });
    }

    // Verify all users exist
    const users = await User.findAll({
      where: { id: { [Op.in]: member_ids }, status: 'active' },
    });

    if (users.length !== member_ids.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid members',
        message: 'One or more member IDs are invalid.',
      });
    }

    let addedCount = 0;

    await sequelize.transaction(async (t) => {
      for (const userId of member_ids) {
        const existing = await ChatMember.findOne({
          where: { room_id: id, user_id: userId },
          transaction: t,
        });

        if (existing && existing.is_active) {
          continue; // Already a member
        }

        if (existing && !existing.is_active) {
          await existing.update({ is_active: true, role: 'member' }, { transaction: t });
        } else {
          await ChatMember.create(
            { room_id: id, user_id: userId, role: 'member' },
            { transaction: t }
          );
        }
        addedCount++;
      }

      if (addedCount > 0) {
        await ChatRoom.increment('member_count', {
          by: addedCount,
          where: { id },
          transaction: t,
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: `${addedCount} member(s) added successfully.`,
      data: { added_count: addedCount },
    });
  } catch (error) {
    logger.error('AddMembers error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while adding members.',
    });
  }
};

/**
 * @desc    Remove a member from a chat room (admin only)
 * @route   DELETE /api/chat/rooms/:id/members/:userId
 */
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const room = await ChatRoom.findByPk(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found',
        message: 'No chat room found with this ID.',
      });
    }

    // Verify requester is admin/owner
    const requesterMembership = await ChatMember.findOne({
      where: {
        room_id: id,
        user_id: req.user.id,
        is_active: true,
        role: { [Op.in]: ['admin', 'owner'] },
      },
    });

    if (!requesterMembership) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'Only admins and owners can remove members.',
      });
    }

    const targetMembership = await ChatMember.findOne({
      where: { room_id: id, user_id: userId, is_active: true },
    });

    if (!targetMembership) {
      return res.status(404).json({
        success: false,
        error: 'Member not found',
        message: 'This user is not an active member of the room.',
      });
    }

    // Cannot remove the owner
    if (targetMembership.role === 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Cannot remove owner',
        message: 'The room owner cannot be removed.',
      });
    }

    await sequelize.transaction(async (t) => {
      await targetMembership.update({ is_active: false }, { transaction: t });

      await ChatRoom.decrement('member_count', {
        by: 1,
        where: { id, member_count: { [Op.gt]: 0 } },
        transaction: t,
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Member removed successfully.',
      data: null,
    });
  } catch (error) {
    logger.error('RemoveMember error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while removing the member.',
    });
  }
};

/**
 * @desc    Leave a chat room
 * @route   POST /api/chat/rooms/:id/leave
 */
const leaveRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const membership = await ChatMember.findOne({
      where: { room_id: id, user_id: req.user.id, is_active: true },
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        error: 'Not a member',
        message: 'You are not a member of this chat room.',
      });
    }

    // If the user is the owner of a group, they must transfer ownership first
    const room = await ChatRoom.findByPk(id);
    if (room.type === 'group' && membership.role === 'owner') {
      const otherAdmins = await ChatMember.findOne({
        where: {
          room_id: id,
          user_id: { [Op.ne]: req.user.id },
          is_active: true,
          role: { [Op.in]: ['admin', 'owner'] },
        },
      });

      if (!otherAdmins) {
        // Transfer ownership to the next member
        const nextMember = await ChatMember.findOne({
          where: {
            room_id: id,
            user_id: { [Op.ne]: req.user.id },
            is_active: true,
          },
          order: [['joined_at', 'ASC']],
        });

        if (nextMember) {
          await nextMember.update({ role: 'owner' });
        }
      }
    }

    await sequelize.transaction(async (t) => {
      await membership.update({ is_active: false }, { transaction: t });

      await ChatRoom.decrement('member_count', {
        by: 1,
        where: { id, member_count: { [Op.gt]: 0 } },
        transaction: t,
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Left the chat room successfully.',
      data: null,
    });
  } catch (error) {
    logger.error('LeaveRoom error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while leaving the chat room.',
    });
  }
};

/**
 * @desc    Toggle mute on a chat room
 * @route   PUT /api/chat/rooms/:id/mute
 */
const muteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_muted, muted_until } = req.body;

    const membership = await ChatMember.findOne({
      where: { room_id: id, user_id: req.user.id, is_active: true },
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        error: 'Not a member',
        message: 'You are not a member of this chat room.',
      });
    }

    const updateData = {
      is_muted: is_muted !== undefined ? is_muted : !membership.is_muted,
    };

    if (muted_until) {
      updateData.muted_until = new Date(muted_until);
    } else if (updateData.is_muted === false) {
      updateData.muted_until = null;
    }

    await membership.update(updateData);

    return res.status(200).json({
      success: true,
      message: updateData.is_muted ? 'Chat room muted.' : 'Chat room unmuted.',
      data: {
        is_muted: membership.is_muted,
        muted_until: membership.muted_until,
      },
    });
  } catch (error) {
    logger.error('MuteRoom error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while updating mute settings.',
    });
  }
};

/**
 * @desc    Get all members of a chat room
 * @route   GET /api/chat/rooms/:id/members
 */
const getRoomMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Verify user is a member
    const membership = await ChatMember.findOne({
      where: { room_id: id, user_id: req.user.id, is_active: true },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You are not a member of this chat room.',
      });
    }

    const { count, rows: members } = await ChatMember.findAndCountAll({
      where: { room_id: id, is_active: true },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_online', 'last_seen', 'is_verified'],
        },
      ],
      order: [
        [sequelize.literal(`CASE WHEN role = 'owner' THEN 1 WHEN role = 'admin' THEN 2 WHEN role = 'moderator' THEN 3 ELSE 4 END`), 'ASC'],
        ['joined_at', 'ASC'],
      ],
      limit: parseInt(limit),
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Room members retrieved successfully.',
      data: {
        members: members.map((m) => ({
          user: m.User,
          role: m.role,
          joined_at: m.joined_at,
          nickname: m.nickname,
          is_muted: m.is_muted,
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
    logger.error('GetRoomMembers error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching room members.',
    });
  }
};

module.exports = {
  getRooms,
  getRoom,
  createRoom,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  markAsRead,
  addMembers,
  removeMember,
  leaveRoom,
  muteRoom,
  getRoomMembers,
};
