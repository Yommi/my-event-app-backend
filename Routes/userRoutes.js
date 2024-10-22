const express = require('express');
const userController = require('../Controllers/userController');
const authController = require('../Controllers/authController');
const router = express.Router();

// Authenticaion
router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').post(authController.resetPassword);

// PROTECTED
router.use(authController.protect);

router.route('/getMe').get(userController.setId, userController.getUser);
router
  .route('/updateMe')
  .get(userController.setId, userController.updateUser);
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
