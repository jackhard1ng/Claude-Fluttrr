const jwt = require('jsonwebtoken');
const { User, ChatRoom, ChatMember, Message } = require('../models');
const logger = require('../utils/logger');

const onlineUsers = new Map();

const initializeSocket = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fluttrr-dev-jwt-secret-2024');
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      socket.userId = user.id;
      next();
    } catch (error) {
      logger.error('Socket auth error:', error.message);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    logger.info(`User connected: ${userId}`);

    // Track online status
    onlineUsers.set(userId, socket.id);
    await User.update({ is_online: true, last_seen: new Date() }, { where: { id: userId } });

    // Join user's chat rooms
    try {
      const memberships = await ChatMember.findAll({
        where: { user_id: userId, is_active: true },
        attributes: ['room_id'],
      });
      memberships.forEach((m) => {
        socket.join(`room:${m.room_id}`);
      });
    } catch (error) {
      logger.error('Error joining rooms:', error.message);
    }

    // Broadcast online status
    socket.broadcast.emit('user:online', { userId, isOnline: true });

    // ===== Chat Events =====

    socket.on('chat:join', async (data) => {
      const { roomId } = data;
      try {
        const member = await ChatMember.findOne({
          where: { room_id: roomId, user_id: userId, is_active: true },
        });
        if (member) {
          socket.join(`room:${roomId}`);
          socket.to(`room:${roomId}`).emit('chat:user_joined', {
            roomId,
            userId,
            username: socket.user.username,
          });
        }
      } catch (error) {
        logger.error('Error joining chat:', error.message);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    socket.on('chat:leave', (data) => {
      const { roomId } = data;
      socket.leave(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('chat:user_left', {
        roomId,
        userId,
        username: socket.user.username,
      });
    });

    socket.on('chat:message', async (data) => {
      const { roomId, content, type = 'text', replyTo, mediaUrl, mediaType } = data;
      try {
        const member = await ChatMember.findOne({
          where: { room_id: roomId, user_id: userId, is_active: true },
        });
        if (!member) {
          return socket.emit('error', { message: 'Not a member of this chat' });
        }

        const message = await Message.create({
          room_id: roomId,
          sender_id: userId,
          type,
          content,
          reply_to: replyTo || null,
          media_url: mediaUrl || null,
          media_type: mediaType || null,
          read_by: [userId],
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

        // Update room's last message
        await ChatRoom.update(
          {
            last_message: {
              id: message.id,
              content: type === 'text' ? content : `[${type}]`,
              sender_id: userId,
              sender_name: socket.user.display_name,
              type,
              created_at: message.created_at,
            },
            last_message_at: new Date(),
          },
          { where: { id: roomId } }
        );

        // Increment unread count for other members
        await ChatMember.increment('unread_count', {
          by: 1,
          where: {
            room_id: roomId,
            user_id: { [require('sequelize').Op.ne]: userId },
            is_active: true,
          },
        });

        // Emit to room
        io.to(`room:${roomId}`).emit('chat:message', fullMessage.toPublicJSON());

        // Emit notification to offline members
        const members = await ChatMember.findAll({
          where: {
            room_id: roomId,
            user_id: { [require('sequelize').Op.ne]: userId },
            is_active: true,
            is_muted: false,
          },
        });

        members.forEach((m) => {
          const memberSocketId = onlineUsers.get(m.user_id);
          if (memberSocketId) {
            io.to(memberSocketId).emit('notification:chat', {
              roomId,
              message: fullMessage.toPublicJSON(),
              unreadCount: m.unread_count + 1,
            });
          }
        });
      } catch (error) {
        logger.error('Error sending message:', error.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('chat:typing', (data) => {
      const { roomId } = data;
      socket.to(`room:${roomId}`).emit('chat:typing', {
        roomId,
        userId,
        username: socket.user.display_name,
      });
    });

    socket.on('chat:stop_typing', (data) => {
      const { roomId } = data;
      socket.to(`room:${roomId}`).emit('chat:stop_typing', {
        roomId,
        userId,
      });
    });

    socket.on('chat:read', async (data) => {
      const { roomId } = data;
      try {
        await ChatMember.update(
          { last_read_at: new Date(), unread_count: 0 },
          { where: { room_id: roomId, user_id: userId } }
        );

        // Update read_by on recent messages
        const recentMessages = await Message.findAll({
          where: { room_id: roomId },
          order: [['created_at', 'DESC']],
          limit: 50,
        });

        for (const msg of recentMessages) {
          if (!msg.read_by.includes(userId)) {
            await msg.update({
              read_by: [...msg.read_by, userId],
            });
          }
        }

        socket.to(`room:${roomId}`).emit('chat:read', {
          roomId,
          userId,
          readAt: new Date(),
        });
      } catch (error) {
        logger.error('Error marking as read:', error.message);
      }
    });

    socket.on('chat:reaction', async (data) => {
      const { messageId, emoji, action } = data;
      try {
        const message = await Message.findByPk(messageId);
        if (!message) return;

        const reactions = { ...message.reactions };
        if (action === 'add') {
          if (!reactions[emoji]) reactions[emoji] = [];
          if (!reactions[emoji].includes(userId)) {
            reactions[emoji].push(userId);
          }
        } else if (action === 'remove') {
          if (reactions[emoji]) {
            reactions[emoji] = reactions[emoji].filter((id) => id !== userId);
            if (reactions[emoji].length === 0) delete reactions[emoji];
          }
        }

        await message.update({ reactions });

        io.to(`room:${message.room_id}`).emit('chat:reaction', {
          messageId,
          reactions,
          userId,
          emoji,
          action,
        });
      } catch (error) {
        logger.error('Error updating reaction:', error.message);
      }
    });

    // ===== Presence Events =====

    socket.on('location:update', async (data) => {
      const { latitude, longitude } = data;
      try {
        await User.update(
          { latitude, longitude, last_seen: new Date() },
          { where: { id: userId } }
        );
      } catch (error) {
        logger.error('Error updating location:', error.message);
      }
    });

    // ===== Event Events =====

    socket.on('event:join', (data) => {
      const { eventId } = data;
      socket.join(`event:${eventId}`);
    });

    socket.on('event:leave', (data) => {
      const { eventId } = data;
      socket.leave(`event:${eventId}`);
    });

    // ===== Disconnect =====

    socket.on('disconnect', async () => {
      logger.info(`User disconnected: ${userId}`);
      onlineUsers.delete(userId);

      try {
        await User.update(
          { is_online: false, last_seen: new Date() },
          { where: { id: userId } }
        );
      } catch (error) {
        logger.error('Error updating offline status:', error.message);
      }

      socket.broadcast.emit('user:offline', { userId, isOnline: false, lastSeen: new Date() });
    });
  });

  return io;
};

const getOnlineUsers = () => onlineUsers;

const emitToUser = (io, userId, event, data) => {
  const socketId = onlineUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
};

const emitToRoom = (io, roomId, event, data) => {
  io.to(`room:${roomId}`).emit(event, data);
};

module.exports = {
  initializeSocket,
  getOnlineUsers,
  emitToUser,
  emitToRoom,
};
