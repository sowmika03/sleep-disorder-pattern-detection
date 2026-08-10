const express = require('express');
const { body } = require('express-validator');
const { runPrediction, getLatest } = require('../controllers/predictionController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

const runPredictionValidation = [
  body('days').optional().isInt({ min: 1, max: 30 }),
  validate,
];

router.post('/run', runPredictionValidation, runPrediction);
router.get('/latest', getLatest);

module.exports = router;

