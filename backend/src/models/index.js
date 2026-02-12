const User = require('./User');
const Business = require('./Business');
const Event = require('./Event');
const EventAttendee = require('./EventAttendee');
const ChatRoom = require('./ChatRoom');
const ChatMember = require('./ChatMember');
const Message = require('./Message');
const Follow = require('./Follow');
const Notification = require('./Notification');
const SavedEvent = require('./SavedEvent');
const Review = require('./Review');

// ===== User <-> Business =====
User.hasMany(Business, { foreignKey: 'owner_id', as: 'OwnedBusinesses' });
Business.belongsTo(User, { foreignKey: 'owner_id', as: 'Owner' });

// ===== Business <-> Event =====
Business.hasMany(Event, { foreignKey: 'business_id', as: 'Events' });
Event.belongsTo(Business, { foreignKey: 'business_id', as: 'Business' });

// ===== User <-> Event (creator) =====
User.hasMany(Event, { foreignKey: 'created_by', as: 'CreatedEvents' });
Event.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });

// ===== Event <-> EventAttendee <-> User =====
Event.hasMany(EventAttendee, { foreignKey: 'event_id', as: 'Attendees' });
EventAttendee.belongsTo(Event, { foreignKey: 'event_id', as: 'Event' });
User.hasMany(EventAttendee, { foreignKey: 'user_id', as: 'EventAttendances' });
EventAttendee.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

Event.belongsToMany(User, {
  through: EventAttendee,
  foreignKey: 'event_id',
  otherKey: 'user_id',
  as: 'AttendingUsers',
});
User.belongsToMany(Event, {
  through: EventAttendee,
  foreignKey: 'user_id',
  otherKey: 'event_id',
  as: 'AttendingEvents',
});

// ===== ChatRoom relationships =====
ChatRoom.belongsTo(Event, { foreignKey: 'event_id', as: 'Event' });
Event.hasOne(ChatRoom, { foreignKey: 'event_id', as: 'ChatRoom' });

ChatRoom.belongsTo(Business, { foreignKey: 'business_id', as: 'Business' });
Business.hasMany(ChatRoom, { foreignKey: 'business_id', as: 'ChatRooms' });

ChatRoom.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });
User.hasMany(ChatRoom, { foreignKey: 'created_by', as: 'CreatedChatRooms' });

// ===== ChatRoom <-> ChatMember <-> User =====
ChatRoom.hasMany(ChatMember, { foreignKey: 'room_id', as: 'Members' });
ChatMember.belongsTo(ChatRoom, { foreignKey: 'room_id', as: 'Room' });
User.hasMany(ChatMember, { foreignKey: 'user_id', as: 'ChatMemberships' });
ChatMember.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

ChatRoom.belongsToMany(User, {
  through: ChatMember,
  foreignKey: 'room_id',
  otherKey: 'user_id',
  as: 'ChatUsers',
});
User.belongsToMany(ChatRoom, {
  through: ChatMember,
  foreignKey: 'user_id',
  otherKey: 'room_id',
  as: 'JoinedRooms',
});

// ===== Messages =====
ChatRoom.hasMany(Message, { foreignKey: 'room_id', as: 'Messages' });
Message.belongsTo(ChatRoom, { foreignKey: 'room_id', as: 'Room' });
User.hasMany(Message, { foreignKey: 'sender_id', as: 'SentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });
Message.belongsTo(Message, { foreignKey: 'reply_to', as: 'ReplyMessage' });
Message.hasMany(Message, { foreignKey: 'reply_to', as: 'Replies' });

// ===== Follows =====
User.hasMany(Follow, { foreignKey: 'follower_id', as: 'Following' });
Follow.belongsTo(User, { foreignKey: 'follower_id', as: 'Follower' });
User.hasMany(Follow, { foreignKey: 'following_id', as: 'Followers' });
Follow.belongsTo(User, { foreignKey: 'following_id', as: 'FollowedUser' });
Business.hasMany(Follow, { foreignKey: 'business_id', as: 'Followers' });
Follow.belongsTo(Business, { foreignKey: 'business_id', as: 'FollowedBusiness' });

// ===== Notifications =====
User.hasMany(Notification, { foreignKey: 'user_id', as: 'Notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'Recipient' });
User.hasMany(Notification, { foreignKey: 'sender_id', as: 'SentNotifications' });
Notification.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });

// ===== Saved Events =====
User.hasMany(SavedEvent, { foreignKey: 'user_id', as: 'SavedEvents' });
SavedEvent.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
Event.hasMany(SavedEvent, { foreignKey: 'event_id', as: 'Saves' });
SavedEvent.belongsTo(Event, { foreignKey: 'event_id', as: 'Event' });

User.belongsToMany(Event, {
  through: SavedEvent,
  foreignKey: 'user_id',
  otherKey: 'event_id',
  as: 'BookmarkedEvents',
});
Event.belongsToMany(User, {
  through: SavedEvent,
  foreignKey: 'event_id',
  otherKey: 'user_id',
  as: 'SavedByUsers',
});

// ===== Reviews =====
User.hasMany(Review, { foreignKey: 'user_id', as: 'Reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'Reviewer' });
Business.hasMany(Review, { foreignKey: 'business_id', as: 'Reviews' });
Review.belongsTo(Business, { foreignKey: 'business_id', as: 'Business' });
Event.hasMany(Review, { foreignKey: 'event_id', as: 'Reviews' });
Review.belongsTo(Event, { foreignKey: 'event_id', as: 'Event' });

module.exports = {
  User,
  Business,
  Event,
  EventAttendee,
  ChatRoom,
  ChatMember,
  Message,
  Follow,
  Notification,
  SavedEvent,
  Review,
};
