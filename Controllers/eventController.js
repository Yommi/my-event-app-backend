const factory = require('../Controllers/factoryController');
const Event = require('../Models/eventModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.setHostId = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;

  next();
});

exports.createEvent = factory.createOne(Event);
exports.deleteEvent = factory.deleteOne(Event);
