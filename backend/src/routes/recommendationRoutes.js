const express = require('express');
const { getRecommendations, markAsRead } = require('../controllers/recommendationController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getRecommendations);
router.patch('/:id/read', markAsRead);

module.exports = router;

