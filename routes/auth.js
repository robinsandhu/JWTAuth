const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

// /auth/register
router.post('/register', authController.register);

// /auth/login
router.post('/login', authController.login);

// /auth/refresh
router.post('/refresh', authController.refresh);

module.exports = router;