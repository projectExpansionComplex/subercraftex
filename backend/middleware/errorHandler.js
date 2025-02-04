const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let message = err.message || 'Server Error';
  let statusCode = err.statusCode || 500;

  // Customize the error response if necessary
  if (err.name === 'CastError') {
    message = `Resource not found with id: ${err.value}`;
    statusCode = 404;
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
