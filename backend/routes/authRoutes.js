const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { body } = require('express-validator');
const validationMiddleware = require('../middleware/validationMiddleware');

// Register route
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validationMiddleware,
  registerUser
);

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validationMiddleware,
  loginUser
);

module.exports = router;
