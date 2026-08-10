const express = require('express');
const { body } = require('express-validator');
const { uploadActivity, getHistory } = require('../controllers/activityController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

const uploadValidation = [
  body('activities').isArray({ min: 1 }).withMessage('Activities must be a non-empty array'),
  body('activities.*.eventType').isIn(['screen_on', 'screen_off', 'app_usage', 'charging']).withMessage('Invalid eventType'),
  body('activities.*.timestamp').isISO8601().withMessage('Invalid timestamp format'),
  body('activities.*.appCategory')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('appCategory must be a string'),
  body('activities.*.sessionDuration')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('sessionDuration must be a non-negative integer'),
  body('activities.*.chargingStatus')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('chargingStatus must be a boolean'),
  validate,
];

router.post('/upload', uploadValidation, uploadActivity);
router.get('/history', getHistory);

module.exports = router;
