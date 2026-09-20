const express = require('express');
const router = express.Router();
const { register, login, getMe, getUsers } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);

module.exports = router;
