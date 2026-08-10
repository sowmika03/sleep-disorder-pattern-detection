const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');
const User = require('../models/User');
const logger = require('../utils/logger');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, age, gender } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Normalize gender to lowercase
    const normalizedGender = gender ? gender.toLowerCase().trim() : null;
    if (normalizedGender && !['male', 'female', 'other'].includes(normalizedGender)) {
      throw new AppError('Gender must be male, female, or other', 400);
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName: firstName || null,
      lastName: lastName || null,
      age: age || null,
      gender: normalizedGender || null,
    });

    const token = generateToken(user.id);

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user.id);

    logger.info(`User logged in: ${user.email}`);

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};

