const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const User = require('../src/models/User');
const mongoose = require('mongoose');

const authenticateToken = async (req, res, next) => {
    // Extract token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('Auth middleware triggered with token:', token ? `${token.substring(0, 10)}...` : 'none');

    if (!token) {
        console.error('No token provided');
        return res.status(401).json({ 
            success: false,
            message: 'Access denied. No token provided.' 
        });
    }

    try {
        // First try to verify as JWT (manual login)
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('JWT decoded:', {
                userId: decoded.userId,
                email: decoded.email,
                isGoogle: decoded.isGoogle
            });

            // Validate MongoDB ID format
            if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
                console.error('Invalid user ID format:', decoded.userId);
                throw new Error('Invalid user ID format');
            }

            const user = await User.findById(decoded.userId);
            
            if (!user) {
                console.error('User not found in database for ID:', decoded.userId);
                return res.status(404).json({ 
                    success: false,
                    message: 'User not found' 
                });
            }

            req.user = {
                userId: user._id.toString(),
                id: user._id.toString(), // For backward compatibility
                isGoogle: false,
                email: user.email,
                rawToken: decoded
            };
            
            console.log('Manual authentication successful for user:', user.email);
            return next();
        } catch (jwtError) {
            console.log('Not a JWT token, trying Firebase... Error:', jwtError.message);
            // Continue to Firebase verification
        }

        // Try Firebase verification (Google login)
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            console.log('Firebase decoded:', {
                uid: decodedToken.uid,
                email: decodedToken.email
            });

            // Find or create user in your database
            let user = await User.findOne({ firebaseUid: decodedToken.uid });
            
            if (!user) {
                console.log('Creating new user for Firebase UID:', decodedToken.uid);
                user = new User({
                    firebaseUid: decodedToken.uid,
                    email: decodedToken.email,
                    firstName: decodedToken.name?.split(' ')[0] || 'Google',
                    lastName: decodedToken.name?.split(' ').slice(1).join(' ') || 'User',
                    isGoogle: true
                });
                await user.save();
            }

            req.user = {
                userId: user._id.toString(),
                firebaseUid: decodedToken.uid,
                id: user._id.toString(), // For backward compatibility
                isGoogle: true,
                email: decodedToken.email,
                rawToken: decodedToken
            };
            
            console.log('Google authentication successful for user:', decodedToken.email);
            return next();
        } catch (firebaseError) {
            console.error('Firebase verification failed:', firebaseError.message);
            throw new Error('Firebase token invalid');
        }

    } catch (error) {
        console.error('Authentication failed:', {
            error: error.message,
            token: token ? `${token.substring(0, 10)}...` : 'none',
            time: new Date().toISOString()
        });
        
        return res.status(403).json({ 
            success: false,
            message: 'Invalid or expired token',
            debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = authenticateToken;