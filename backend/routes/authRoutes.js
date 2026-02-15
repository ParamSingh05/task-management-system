const express = require('express');
const router = express.Router();
const { register, login, logout, getCurrentUser } = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', isAuthenticated, logout);
router.get('/me', isAuthenticated, getCurrentUser);

module.exports = router;