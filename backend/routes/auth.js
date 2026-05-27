const express = require('express');
const { authenticate } = require('../middleware/auth');
const { 
  register, 
  login, 
  logout, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', authenticate, logout);

module.exports = router;
