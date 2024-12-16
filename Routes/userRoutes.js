const express = require('express');
const userController = require('../Controllers/userController');
const authController = require('../Controllers/authController');
const router = express.Router();

// PROTECTED
router.use(authController.protect);

router.route('/getMe').get(userController.setId, userController.getUser);
router
  .route('/updateMe')
  .patch(userController.setId, userController.updateUser);
router
  .route('/deleteMe')
  .get(userController.setId, userController.deleteUser);

router.route('/updatePassword').post(userController.updatePassword);

// FOLLOW AND UNFOLLOW
router.patch('/:id/follow', userController.follow);
router.patch('/:id/unfollow', userController.unfollow);

// ADMIN ROUTES
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
