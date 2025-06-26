const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');

// Search Buses
router.get('/search', busController.searchBuses);

// Get Available Seats
router.get('/seats/:scheduleId', busController.getAvailableSeats);

module.exports = router;
