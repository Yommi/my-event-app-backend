const factory = require('../Controllers/factoryController');
const Event = require('../Models/eventModel');
const User = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.setHostId = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;

  next();
});

exports.setUserId = catchAsync(async (req, res, next) => {
  req.params.userId = req.user.id;

  next();
});

exports.createEvent = factory.createOne(Event);
exports.deleteEvent = factory.deleteOne(Event);
exports.updateEvent = factory.updateOne(Event);
exports.getEvent = factory.getOne(Event);
exports.getAllEvents = factory.getAll(Event);

exports.getUserEvents = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if (!user) return next(new AppError('User does not exist!', 404));

  const events = await Event.find({ host: user.id });

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: events,
  });
});
