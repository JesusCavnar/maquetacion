const express = require('express');
const { signupUser } = require('../controllers/userController');
const { loginUser } = require('../controllers/authController');
const authenticateToken = require('../../middlewares/authMiddleware'); // Correct import
const User = require('../models/User');
const Product = require('../models/Product');
const admin = require('firebase-admin'); 
const router = express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Helper function for error handling
const handleError = (res, error, context) => {
    console.error(`Error in ${context}:`, error);
    const status = error.status || 500;
    const message = error.message || 'Server error';
    res.status(status).json({ success: false, message });
};

// Input validation middleware
const validateUserInput = (req, res, next) => {
    if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    next();
};


// Ruta POST para el registro de usuarios
router.post('/signup', signupUser);

// Ruta POST para el login
router.post('/login', loginUser);
router.post('/signup', signupUser);
module.exports = router;

// Ruta POST para Google Sign-In
router.post('/google-signin', async (req, res) => {
    try {
        // First ensure the request has a body
        if (!req.body || !req.body.idToken) {
            return res.status(400).json({ message: 'ID token is required' });
        }

        const { idToken } = req.body;
        console.log('Received ID token:', idToken); // Debug log

        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken, true);
        const { uid, email, name } = decodedToken;

        // Check if the user already exists in your database
        let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });

        if (!user) {
            // Create a new user if they don't exist
            user = new User({
                firebaseUid: uid,
                email: email,
                firstName: name || '', // Use the name from Google as firstName
                lastName: '', // google does not have last name
            });
            await user.save();
        } else if (!user.firebaseUid) {
            // Update existing user with firebaseUid if they signed up manually first
            user.firebaseUid = uid;
            await user.save();
        }

        // Create a JWT token for your API
        const token = jwt.sign(
            { 
                userId: user._id.toString(),
                email: user.email,
                isGoogle: true
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Respond with the token and user data
        res.status(200).json({ 
            message: 'Google sign-in successful', 
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isGoogle: true
            }
        });
    } catch (error) {
        console.error('Error during Google sign-in:', error);
        res.status(500).json({ message: 'Google sign-in failed', error: error.message });
    }
});

router.put('/update', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, email, phone } = req.body;
        let user;

        if (req.user.userId) {
            // Manual sign-in user
            user = await User.findByIdAndUpdate(
                req.user.userId,
                { firstName, lastName, email, phone },
                { new: true }
            );
        } else if (req.user.firebaseUid) {
            // Google sign-in user
            user = await User.findOneAndUpdate(
                { firebaseUid: req.user.firebaseUid },
                { firstName, lastName, email, phone },
                { new: true }
            );
        }

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Return the format that your frontend expects
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone
            }
        });

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating user information:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Ruta GET para obtener el perfil del usuario
router.get('/me', authenticateToken, async (req, res) => {
    try {
        let user;
        
        if (req.user.userId) {
            // Manual login user
            user = await User.findById(req.user.userId)
                .select('-password -__v'); // Exclude sensitive fields
        } else if (req.user.firebaseUid) {
            // Google login user
            user = await User.findOne({ firebaseUid: req.user.firebaseUid })
                .select('-__v');
        }

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.status(200).json({ 
            success: true,
            user 
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
});
     
// Ruta DELETE para eliminar un usuario
router.delete('/delete', authenticateToken, async (req, res) => {
    try {
        let user;
        if (req.user.userId) {
            // Manual sign-in user
            user = await User.findByIdAndDelete(req.user.userId);
        } else if (req.user.firebaseUid) {
            // Google sign-in user
            user = await User.findOneAndDelete({ firebaseUid: req.user.firebaseUid });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



// Ruta POST para agregar a favoritos - UPDATED
router.post('/favorites', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.body;
        
        if (!productId) {
            return res.status(400).json({ 
                success: false,
                message: 'Product ID is required' 
            });
        }

        let user;
        if (req.user.userId) {
            user = await User.findById(req.user.userId);
        } else if (req.user.firebaseUid) {
            user = await User.findOne({ firebaseUid: req.user.firebaseUid });
        }

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Check if already in favorites
        if (user.favorites.includes(productId)) {
            return res.status(400).json({ 
                success: false,
                message: 'Product already in favorites' 
            });
        }

        // Add to favorites
        user.favorites.push(productId);
        await user.save();

        res.status(200).json({ 
            success: true,
            message: 'Added to favorites',
            favorites: user.favorites
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
});

// Ruta GET para obtener los favoritos del usuario - UPDATED
router.get('/favorites', authenticateToken, async (req, res) => {
    try {
        let user;
        if (req.user.userId) {
            user = await User.findById(req.user.userId);
        } else if (req.user.firebaseUid) {
            user = await User.findOne({ firebaseUid: req.user.firebaseUid });
        }

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Get product details for each favorite
        const favoritesWithDetails = user.favorites.map(productId => ({
            _id: productId,
            name: getProductNameFromId(productId),
            description: getProductDescriptionFromId(productId),
            image: getProductImageFromId(productId),
            price: getProductPriceFromId(productId)
        }));

        res.status(200).json({ 
            success: true,
            favorites: favoritesWithDetails
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
});

// Ruta DELETE para eliminar un producto de los favoritos - UPDATED
router.delete('/favorites/:productId', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.params;
        let user;

        if (req.user.userId) {
            user = await User.findById(req.user.userId);
        } else if (req.user.firebaseUid) {
            user = await User.findOne({ firebaseUid: req.user.firebaseUid });
        }

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Remove the product ID from favorites array
        user.favorites = user.favorites.filter(fav => fav !== productId);
        await user.save();

        res.status(200).json({ 
            success: true,
            message: 'Product removed from favorites',
            favorites: user.favorites
        });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
});

// Add this helper function for product prices
function getProductPriceFromId(productId) {
    const productPrices = {
        'colonia-product-id': 120.00,
        'ficodiamalfi-product-id': 85.00,
        'mirtodipanamera-product-id': 85.00,
        'grazie-product-id': 95.00,
        'lavender-product-id': 72.00,
        'limebasil-product-id': 95.00,
        'peony-product-id': 68.00,
        'goldenamber-product-id': 115.00,
        'essence-boungiorno-id': 95.00,
        'essence-lacasasullago-id': 94.00,
        'essence-boungiorno-refill-id': 118.00,
        'essence-yuzu-id': 105.00,
        'essence-limebasil-id': 112.00,
        'essence-lavender-moonflower-id': 112.00,
        'essence-woodsage-id': 112.00,
        'essence-freshfig-refill-id': 95.00,
        'gift-british-seaside-id': 420.00,
        'gift-lavender-moonflower-trio-id': 200.00,
        'gift-travel-candles-trio-id': 100.00,
        'gift-wildberry-bramble-duo-id': 295.00,
        'gift-festive-collection-trio-id': 140.00,
        'gift-terrace-trio-id': 145.00,
        'gift-ecodiluce-id': 310.00,
        'gift-chapeau-candle-id': 695.00
    };
    return productPrices[productId] || 0;
}
// Helper functions to provide product details based on ID
function getProductNameFromId(productId) {
    const productNames = {
        'colonia-product-id': 'Colonia',
        'ficodiamalfi-product-id': 'Fico di Amalfi',
        'mirtodipanamera-product-id': 'Mirto di Panamera',
        'grazie-product-id': 'Grazie',
        'lavender-product-id': 'Lavender',
        'limebasil-product-id': 'Lime & Basil',
        'peony-product-id': 'Peony',
        'goldenamber-product-id': 'Golden Amber',
        'essence-boungiorno-id': 'Buongiorno',
        'essence-lacasasullago-id': 'La Casa Sul Lago', 
        'essence-boungiorno-refill-id': 'Buongiorno Refill',
        'essence-yuzu-id': 'Yuzu',
        'essence-limebasil-id': 'Lime Basil & Mandarin',
        'essence-lavender-moonflower-id': 'Lavender & Moonflower',
        'essence-woodsage-id': 'Wood Sage & Sea Salt',
        'essence-freshfig-refill-id': 'Fresh Fig & Cassis Refill',
        'gift-british-seaside-id': 'British Seaside Luxury Gift Tin',
        'gift-lavender-moonflower-trio-id': 'Lavender & Moonflower Trio',
        'gift-travel-candles-trio-id': 'Travel Candles Trio',
        'gift-wildberry-bramble-duo-id': 'Wild Berry & Bramble Duo',
        'gift-festive-collection-trio-id': 'Festive Collection Trio',
        'gift-terrace-trio-id': 'The Terrace Trio',
        'gift-ecodiluce-id': 'Eco di Luce',
        'gift-chapeau-candle-id': 'Chapeau! Candle',
    };
    return productNames[productId] || 'Product';
}

function getProductDescriptionFromId(productId) {
    const productDescriptions = {
        'colonia-product-id': 'Acqua di Parma - Citrus, lavender, verbena, sandalwood',
        'ficodiamalfi-product-id': 'Fresh fig scent with citrus notes',
        'mirtodipanamera-product-id': 'Myrtle berry with woody undertones',
        'grazie-product-id': 'Elegant floral and musk combination',
        'lavender-product-id': 'Calming lavender essential oil',
        'limebasil-product-id': 'Zesty lime with fresh basil',
        'peony-product-id': 'Delicate peony blossom fragrance',
        'goldenamber-product-id': 'Warm amber with vanilla notes',
        'essence-boungiorno-id': 'Acqua di Parma - Diffuser 180ml',
        'essence-lacasasullago-id': 'Acqua di Parma - Diffuser 180ml',
        'essence-boungiorno-refill-id': 'Acqua di Parma - 500ml Refill',
        'essence-yuzu-id': 'Acqua di Parma - Diffuser 180ml',
        'essence-limebasil-id': 'Jo Malone - Diffuser 165ml',
        'essence-lavender-moonflower-id': 'Jo Malone - Diffuser 165ml',
        'essence-woodsage-id': 'Jo Malone - Diffuser 165ml',
        'essence-freshfig-refill-id': 'Jo Malone - 350ml Refill',
        'gift-british-seaside-id': 'Jo Malone - Premium seaside-inspired tin with favorite fragrances',
        'gift-lavender-moonflower-trio-id': 'Jo Malone - Three ways to welcome the night with serene scent',
        'gift-travel-candles-trio-id': 'Jo Malone - Most loved travel candles in three signature scents',
        'gift-wildberry-bramble-duo-id': 'Jo Malone - Fresh juiciness of red berries carried on the air',
        'gift-festive-collection-trio-id': 'Acqua di Parma - Luxury Christmas candles in elegant gold box',
        'gift-terrace-trio-id': 'Acqua di Parma - Summer candles celebrating Italian landscapes',
        'gift-ecodiluce-id': 'Acqua di Parma - Decorative glass object with candlelight experience',
        'gift-chapeau-candle-id': 'Acqua di Parma - Two-in-one candle design with art deco jar',
    };
    return productDescriptions[productId] || `Description for ${getProductNameFromId(productId)}`;
}

function getProductImageFromId(productId) {
    const productImages = {
        'colonia-product-id': 'jumbo1.jpg',
        'ficodiamalfi-product-id': 'ficodiamalfi1.jpg',
        'mirtodipanamera-product-id': 'Mirtodipanamera1.jpg',
        'grazie-product-id': 'grazie1.jpg',
        'lavender-product-id': 'lavendermooncandle1.jpg',
        'limebasil-product-id': 'limebasilcandle1.jpg',
        'peony-product-id': 'peonyblush1.jpg',
        'goldenamber-product-id': 'goldenamber.jpg',
        'essence-boungiorno-id': 'boungiornoessence.jpg',
        'essence-lacasasullago-id': 'lacasasullago.jpg',
        'essence-boungiorno-refill-id': 'boungiornorefill.jpg',
        'essence-yuzu-id': 'Yuzuessence.jpg',
        'essence-limebasil-id': 'limebasilessence.jpg',
        'essence-lavender-moonflower-id': 'lavendermoonflower.jpg',
        'essence-woodsage-id': 'woodsageessence.jpg',
        'essence-freshfig-refill-id': 'freshfigrefill.jpg',
        'gift-british-seaside-id': 'Britishsea.jpg',
        'gift-lavender-moonflower-trio-id': 'lavendergift.jpg',
        'gift-travel-candles-trio-id': 'candletrio.jpg',
        'gift-wildberry-bramble-duo-id': 'wildberry.jpg',
        'gift-festive-collection-trio-id': 'triofestivo.jpg',
        'gift-terrace-trio-id': 'laterraza.jpg',
        'gift-ecodiluce-id': 'ecodiluce.jpg',
        'gift-chapeau-candle-id': 'velachapeau.jpg',
    };

    return productImages[productId] || 'default.jpg';
}

module.exports = router;
