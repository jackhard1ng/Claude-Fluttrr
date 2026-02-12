const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { eventValidation, validate } = require('../middleware/validate');

router.get('/', optionalAuth, eventController.getEvents);
router.get('/search', optionalAuth, eventController.searchEvents);
router.get('/nearby', optionalAuth, eventController.getNearbyEvents);
router.get('/trending', optionalAuth, eventController.getTrendingEvents);
router.get('/featured', optionalAuth, eventController.getFeaturedEvents);
router.get('/upcoming', requireAuth, eventController.getUpcomingEvents);
router.get('/categories', eventController.getEventCategories);
router.get('/category/:category', optionalAuth, eventController.getEventsByCategory);
router.get('/:id', optionalAuth, eventController.getEvent);
router.post('/', requireAuth, eventValidation, validate, eventController.createEvent);
router.put('/:id', requireAuth, eventController.updateEvent);
router.delete('/:id', requireAuth, eventController.deleteEvent);
router.post('/:id/rsvp', requireAuth, eventController.rsvpEvent);
router.delete('/:id/rsvp', requireAuth, eventController.cancelRsvp);
router.post('/:id/save', requireAuth, eventController.saveEvent);
router.delete('/:id/save', requireAuth, eventController.unsaveEvent);
router.get('/:id/attendees', optionalAuth, eventController.getEventAttendees);
router.post('/:id/view', optionalAuth, eventController.incrementViewCount);

module.exports = router;
