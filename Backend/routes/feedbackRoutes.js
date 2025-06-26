const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticate, isAdmin } = require('../middleware/authenticateUser');

// Protect feedback creation also
router.post('/feedback', authenticate, feedbackController.createFeedback);

// Route to get feedback for a specific booking (admin only)
router.get('/feedback/:booking_id', authenticate, isAdmin, feedbackController.getFeedback);

module.exports = router;
