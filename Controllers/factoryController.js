const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const authController = require('../Controllers/authController');
const Event = require('../Models/eventModel');
const User = require('../Models/userModel');

exports.getAll = (model) => {
  return catchAsync(async (req, res, next) => {
    let docs;
    if (model === Event) {
      docs = await model.find().populate('host', 'username');
    } else {
      docs = await model.find();
    }

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: docs,
    });
  });
};

exports.getOne = (model) => {
  return catchAsync(async (req, res, next) => {
    let doc;

    if (model === Event) {
      doc = await model
        .findById(req.params.id)
        .populate('host', 'username');
    } else {
      doc = await model.findById(req.params.id);
    }

    if (!doc) {
      return next(new AppError('There is no document with that id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
};

exports.createOne = (model) => {
  return catchAsync(async (req, res, next) => {
    if (model === Event) {
      const filteredEvent = authController.filterObj(
        req.body,
        'registeredUsers'
      );
      filteredEvent.host = req.params.id;

      const event = await model.create(filteredEvent);
      const user = await User.findById(req.params.id);

      user.events.push(user);

      await user.save({ validateBeforeSave: false });

      res.status(200).json({
        status: 'success',
        data: event,
      });
    } else if (model === User) {
      const filteredBody = authController.filterObj(
        req.body,
        'role',
        'events',
        'followers',
        'following'
      );
      req.body = filteredBody;
      const user = await model.create(req.body);

      // remove password from json output
      if (Object.keys(req.body).includes('password')) {
        user.password = undefined;
      }

      authController.createSendToken(user, 201, res);
    }
  });
};

exports.deleteOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('There is no document with that id', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};

exports.updateOne = (model) => {
  return catchAsync(async (req, res, next) => {
    // FILTER FOR USER req.body
    if (model === User) {
      const filteredBody = authController.filterObj(
        req.body,
        'role',
        'events',
        'followers',
        'following',
        'password',
        'passwordConfirm'
      );
      req.body = filteredBody;
    }

    // FILTER FOR EVENT req.body
    if (model === Event) {
      const filteredBody = authController.filterObj(
        req.body,
        'host',
        'registeredUsers'
      );
      req.body = filteredBody;
    }

    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('There is no document with that id', 404));
    }

    if (model === User) {
      authController.createSendToken(doc, 200, res);
    } else {
      res.status(200).json({
        status: 'success',
        data: doc,
      });
    }
  });
};
