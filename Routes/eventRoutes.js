const express = require('express');
const authController = require('../Controllers/authController');
const eventController = require('../Controllers/eventController');

const router = express.Router();

// PROTECTED ROUTES BELOW
router.use(authController.protect);

router
  .route('/my')
  .get(eventController.setHostId, eventController.getUserEvents)
  .post(eventController.setHostId, eventController.createEvent)
  .patch(eventController.setHostId, eventController.updateEvent)
  .delete(eventController.setHostId, eventController.deleteEvent);

// RESTRICT ALL ROUTES BELOW TO ADMIN
router.use(authController.restrictTo('admin'));

router.route('/').get(eventController.getAllEvents);

router
  .route('/:id')
  .get(eventController.getEvent)
  .post(eventController.createEvent)
  .patch(eventController.updateEvent)
  .delete(eventController.deleteEvent);

// router.route('/:userId').get(eventController.getUserEvents);

module.exports = router;
