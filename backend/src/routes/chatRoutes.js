const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');
const { messageValidation, validate } = require('../middleware/validate');

router.get('/rooms', requireAuth, chatController.getRooms);
router.get('/rooms/:id', requireAuth, chatController.getRoom);
router.post('/rooms', requireAuth, chatController.createRoom);
router.get('/rooms/:id/messages', requireAuth, chatController.getMessages);
router.post('/rooms/:id/messages', requireAuth, messageValidation, validate, chatController.sendMessage);
router.put('/messages/:id', requireAuth, chatController.editMessage);
router.delete('/messages/:id', requireAuth, chatController.deleteMessage);
router.post('/messages/:id/reactions', requireAuth, chatController.addReaction);
router.delete('/messages/:id/reactions', requireAuth, chatController.removeReaction);
router.put('/rooms/:id/read', requireAuth, chatController.markAsRead);
router.post('/rooms/:id/members', requireAuth, chatController.addMembers);
router.delete('/rooms/:id/members/:userId', requireAuth, chatController.removeMember);
router.post('/rooms/:id/leave', requireAuth, chatController.leaveRoom);
router.put('/rooms/:id/mute', requireAuth, chatController.muteRoom);
router.get('/rooms/:id/members', requireAuth, chatController.getRoomMembers);

module.exports = router;
