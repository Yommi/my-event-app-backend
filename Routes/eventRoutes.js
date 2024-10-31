const express = require('express');
const authController = require('../Controllers/authController');
const eventController = require('../Controllers/eventController');

const router = express.Router();

router.route('/').get(eventController.getAllEvents);
router.route('/nearby').get(eventController.getNearMe);

// PROTECTED ROUTES BELOW
router.use(authController.protect);

router
  .route('/my')
  .get(eventController.setHostId, eventController.getUserEvents)
  .post(eventController.setHostId, eventController.createEvent)
  .patch(eventController.setHostId, eventController.updateEvent)
  .delete(eventController.setHostId, eventController.deleteEvent);

// router.route('/nearBy').get(eventController.GetNearMe);
// RESTRICT ALL ROUTES BELOW TO ADMIN

router.use(authController.restrictTo('admin'));

// router.route('/').get(eventController.getAllEvents);

router
  .route('/:id')
  .get(eventController.getEvent)
  .post(eventController.createEvent)
  .patch(eventController.updateEvent)
  .delete(eventController.deleteEvent);

router.route('/users/:userId').get(eventController.getUserEvents);

module.exports = router;
