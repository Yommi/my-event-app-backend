const express = require('express');
const userController = require('../Controllers/userController');
const authController = require('../Controllers/authController');
const User = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

router.route('/signup').post(
  catchAsync(async (req, res, next) => {
    req.body.role = 'admin';
    const admin = await User.create(req.body);

    authController.createSendToken(admin, 201, res);
  })
);

module.exports = router;
