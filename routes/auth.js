const express = require('express');
const { register, login, getUser } = require('../controllers/authController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/', auth, getUser);

module.exports = router;