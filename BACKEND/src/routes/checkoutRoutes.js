const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

// No requiere authenticateToken
router.post('/create', checkoutController.createCheckout);

module.exports = router;