const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const {authenticate, isAdmin} = require('../middleware/authenticateUser');

// Book a seat
router.post('/book',authenticate, bookingController.bookSeat);

// View my bookings
router.get('/mybookings', authenticate,bookingController.getMyBookings);
router.delete('/booking/:bookingId',authenticate,bookingController.cancelBooking);

module.exports = router;
