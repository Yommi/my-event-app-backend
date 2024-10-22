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

exports.follow = catchAsync(async (req, res, next) => {
  const followerId = req.user._id;
  const followedId = req.params.id;

  if (followerId.toString() === followedId) {
    return next(new AppError('You cannot follow yourself', 400));
  }

  const followedUser = await User.findByIdAndUpdate(
    followedId,
    { $addToSet: { followers: followerId } },
    { new: true }
  );

  if (!followedUser) {
    return next(new AppError('User not found', 404));
  }

  const followingUser = await User.findByIdAndUpdate(
    followerId,
    { $addToSet: { following: followedId } },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Followed successfully!',
  });
});

exports.unfollow = catchAsync(async (req, res, next) => {
  const followerId = req.user._id;
  const unfollowedId = req.params.id;

  const unfollowedUser = await User.findByIdAndUpdate(
    unfollowedId,
    { $pull: { followers: followerId } }, // Remove followerId from followers array
    { new: true }
  );

  if (!unfollowedUser) {
    return next(new AppError('User not found', 404));
  }

  const unfollowingUser = await User.findByIdAndUpdate(
    followerId,
    { $pull: { following: unfollowedId } },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Unfollowed successfully!',
  });
});
