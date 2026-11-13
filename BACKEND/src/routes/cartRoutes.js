// BACKEND/src/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticateToken = require('../../middlewares/authMiddleware');

// Todas estas rutas requieren que el usuario esté logueado
router.get('/', authenticateToken, cartController.getCart);
router.post('/', authenticateToken, cartController.addToCart);
router.put('/:productId', authenticateToken, cartController.updateQuantity);
router.delete('/clear', authenticateToken, cartController.clearCart); // Poner antes de /:productId
router.delete('/:productId', authenticateToken, cartController.removeFromCart);

module.exports = router;