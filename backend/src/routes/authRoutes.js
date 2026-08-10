const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').optional({ nullable: true, checkFalsy: true }).trim().notEmpty().withMessage('First name cannot be empty if provided'),
  body('lastName').optional({ nullable: true, checkFalsy: true }).trim().notEmpty().withMessage('Last name cannot be empty if provided'),
  body('age').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),
  body('gender').optional({ nullable: true, checkFalsy: true }).custom((value) => {
    if (!value) return true; // Allow empty/undefined
    const normalized = value.toLowerCase().trim();
    if (['male', 'female', 'other'].includes(normalized)) {
      return true;
    }
    throw new Error('Gender must be male, female, or other');
  }),
  validate,
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

module.exports = router;

