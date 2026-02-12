const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { profileUpdateValidation, validate } = require('../middleware/validate');

router.get('/search', requireAuth, userController.searchUsers);
router.get('/nearby', requireAuth, userController.getNearbyUsers);
router.get('/recommended', requireAuth, userController.getRecommendedUsers);
router.get('/saved-events', requireAuth, userController.getSavedEvents);
router.get('/:id', optionalAuth, userController.getProfile);
router.put('/profile', requireAuth, profileUpdateValidation, validate, userController.updateProfile);
router.put('/avatar', requireAuth, userController.updateAvatar);
router.get('/:id/events', optionalAuth, userController.getUserEvents);
router.get('/:id/followers', optionalAuth, userController.getUserFollowers);
router.get('/:id/following', optionalAuth, userController.getUserFollowing);
router.post('/:id/follow', requireAuth, userController.followUser);
router.delete('/:id/follow', requireAuth, userController.unfollowUser);

module.exports = router;
