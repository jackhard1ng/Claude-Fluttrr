const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { businessValidation, validate } = require('../middleware/validate');

router.get('/', optionalAuth, businessController.getBusinesses);
router.get('/search', optionalAuth, businessController.searchBusinesses);
router.get('/nearby', optionalAuth, businessController.getNearbyBusinesses);
router.get('/categories', businessController.getBusinessCategories);
router.get('/:id', optionalAuth, businessController.getBusiness);
router.post('/', requireAuth, businessValidation, validate, businessController.createBusiness);
router.put('/:id', requireAuth, businessController.updateBusiness);
router.delete('/:id', requireAuth, businessController.deleteBusiness);
router.get('/:id/events', optionalAuth, businessController.getBusinessEvents);
router.post('/:id/follow', requireAuth, businessController.followBusiness);
router.delete('/:id/follow', requireAuth, businessController.unfollowBusiness);
router.get('/:id/reviews', optionalAuth, businessController.getBusinessReviews);
router.post('/:id/reviews', requireAuth, businessController.addReview);
router.get('/:id/stats', requireAuth, businessController.getBusinessStats);

module.exports = router;
