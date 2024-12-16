const express = require('express');
const authController = require('../Controllers/authController');
const eventController = require('../Controllers/eventController');

const router = express.Router();

// For development all these are availble to all
router.route('/').get(eventController.getAllEvents);
router.route('/eventsByLocation').get(eventController.getEventsByLocation);
router.route('/:id').get(eventController.getEvent);
// router.route('/eventsByRegion').get(eventController.getEventsByRegion);

// PROTECTED ROUTES BELOW
router.use(authController.protect);

router
  .route('/user/me')
  .get(eventController.setHostId, eventController.getUserEvents)
  .post(eventController.setHostId, eventController.createEvent)
  .patch(eventController.setHostId, eventController.updateMyEvent)
  .delete(eventController.setHostId, eventController.deleteMyEvent);

// RESTRICT ALL ROUTES BELOW TO ADMIN

router.use(authController.restrictTo('admin'));

router
  .route('/:id')
  .post(eventController.createEvent)
  .patch(eventController.updateEvent)
  .delete(eventController.deleteEvent);

router.route('/users/:userId').get(eventController.getUserEvents);

module.exports = router;
