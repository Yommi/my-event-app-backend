const express = require('express');
const authController = require('../Controllers/authController');
const eventController = require('../Controllers/eventController');

const router = express.Router();

router.use(authController.protect);
// ALL ROUTES AFTER THIS LINE ARE PROTECTED

router.route('/').get(eventController.getAllEvents);
router.route('/eventsByLocation').get(eventController.getEventsByLocation);
router.route('/checkRegistered').get(eventController.checkIfRegistered);
router.route('/registeredFor').get(eventController.eventsRegisteredFor);
router.route('/register').patch(eventController.register);
router.route('/unregister').patch(eventController.unregister);

router
  .route('/user/me')
  .get(eventController.setHostId, eventController.getUserEvents)
  .post(eventController.setHostId, eventController.createEvent)
  .patch(eventController.updateMyEvent)
  .delete(eventController.deleteMyEvent);

  router
  .route('/:id')
  .get(eventController.getEvent)

router.use(authController.restrictTo('admin'));
// ALL ROUTES AFTER THIS LINE ARE RESTRICTED TO ADMINS

router
  .route('/:id')
  .get(eventController.getEvent)
  .post(eventController.createEvent)
  .patch(eventController.updateEvent)
  .delete(eventController.deleteEvent);

router.route('/users/:userId').get(eventController.getUserEvents);

module.exports = router;
