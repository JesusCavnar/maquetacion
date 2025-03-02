const express = require('express');
const { signupUser } = require('../controllers/userController');
const { loginUser } = require('../controllers/authController');
const authenticateToken = require('../../middlewares/authMiddleware'); // Correct import
const User = require('../models/User');
const Product = require('../models/Product');

const router = express.Router();

// Ruta POST para el registro de usuarios
router.post('/signup', signupUser);

// Ruta POST para el login
router.post('/login', loginUser);

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user information:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/update', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, email, phone } = req.body;

        // Find the user by ID and update their information
        const user = await User.findByIdAndUpdate(
            req.user.userId, // User ID from the token
            { firstName, lastName, email, phone },
            { new: true } // Return the updated user
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating user information:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.delete('/delete', authenticateToken, async (req, res) => {
    try {
        // Find the user by ID and delete their profile
        const user = await User.findByIdAndDelete(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Ruta GET para obtener los favoritos del usuario
router.get('/favorites', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('favorites');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Ruta DELETE para eliminar un producto de los favoritos
router.delete('/favorites/:productId', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove the product ID from the favorites array
        user.favorites = user.favorites.filter(
            productId => productId.toString() !== req.params.productId
        );

        await user.save();
        res.status(200).json({ message: 'Product removed from favorites' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;