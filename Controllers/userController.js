const User = require('../Models/userModel');
const factory = require('../Controllers/factoryController');
const authController = require('../Controllers/authController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.createUser = factory.createOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.updateUser = factory.updateOne(User);

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { oldPassword, newPassword, passwordConfirm } = req.body;

  console.log(oldPassword, user.password);

  if (!(await user.correctPassword(oldPassword, user.password))) {
    return next(new AppError('old password is incorrect!', 400));
  }

  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;

  await user.save({ validateBeforeSave: true });

  authController.createSendToken(user, 200, res);
});

exports.setId = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;

  next();
});
