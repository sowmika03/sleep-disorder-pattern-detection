class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleError = (err, req, res, next) => {
  const { statusCode = 500, message } = err;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    statusCode,
    stack: err.stack,
  });

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: message || 'An error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  AppError,
  handleError,
};

