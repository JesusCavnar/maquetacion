const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoriteController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/', authMiddleware, favoritesController.getUserFavorites);
router.post('/', authMiddleware, favoritesController.addFavorite);
router.delete('/:id', authMiddleware, favoritesController.removeFavorite);

module.exports = router;