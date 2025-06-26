const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/authenticateUser');

// Admin login
router.post('/login', adminController.loginAdmin);

// Admin protected routes
router.post('/bus-operator', authenticate, isAdmin, adminController.createBusOperator);
router.post('/bus', authenticate, isAdmin, adminController.createBus);
router.put('/bus/:bus_id', authenticate, isAdmin, adminController.updateBus);
router.delete('/bus/:bus_id', authenticate, isAdmin, adminController.deleteBus);

module.exports = router;
