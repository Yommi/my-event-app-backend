const express = require('express');
const authController = require('../Controllers/authController');
const eventController = require('../Controllers/eventController');

const router = express.Router();
router.use(authController.protect);

router
  .route('/:id')
  .post(eventController.createEvent)
  .delete(eventController.deleteEvent);

module.exports = router;
