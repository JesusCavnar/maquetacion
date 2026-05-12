const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Login controller
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Debug log
        console.log('Login attempt for:', email);

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Check if this is a Google user trying to log in manually
        if (user.firebaseUid) {
            return res.status(401).json({
                success: false,
                message: 'Please use Google Sign-In for this account'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid password for:', email);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        const token = jwt.sign(
            { 
                userId: user._id.toString(),
                email: user.email,
                isGoogle: false
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set CORS headers
        res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:5500');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Expose-Headers', 'Authorization');
        res.header('Authorization', `Bearer ${token}`);

        console.log('Successful login for:', email);
        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};