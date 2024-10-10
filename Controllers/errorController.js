module.exports = (err, req, res, next) => {
  const error = err;

  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    error,
    stack: error.stack,
  });
};
