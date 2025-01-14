const express = require('express');
const authController = require('../Controllers/authController');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').post(authController.resetPassword);

router
  .route('/checkToken')
  .get(authController.protect, (req, res, next) => {
    res.status(200).json({
      status: 'success',
    });
  });

module.exports = router;
