const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const authController = require('../Controllers/authController');

exports.getAll = (model) => {
  return catchAsync(async (req, res, next) => {
    const docs = await model.find();

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: docs,
    });
  });
};

exports.getOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await model.findById(req.params.id);

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
    const doc = await model.create(req.body);

    if (Object.keys(req.body).includes('password')) {
      doc.password = undefined;
    }

    authController.createSendToken(doc, 201, res);
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
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('There is no document with that id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
};
