const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {authenticate, isAdmin} = require('../middleware/authenticateUser');

// Public routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);

// Protected routes (need JWT token)
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

module.exports = router;
