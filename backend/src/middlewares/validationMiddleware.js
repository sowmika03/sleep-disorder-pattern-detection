const { validationResult } = require('express-validator');
const { AppError } = require('../utils/errors');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => {
      // Get the actual error message or field name
      const field = err.param || err.path || 'field';
      const msg = err.msg || 'Invalid value';
      const location = err.location || '';
      const value = err.value !== undefined ? ` (value: ${JSON.stringify(err.value)})` : '';
      return `${location ? location + '.' : ''}${field}: ${msg}${value}`;
    }).join(', ');
    return next(new AppError(`Validation failed: ${errorMessages}`, 400));
  }
  next();
};

module.exports = {
  validate,
};

