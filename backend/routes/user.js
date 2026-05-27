const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/userController');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);

module.exports = router;
