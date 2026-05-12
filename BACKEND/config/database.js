const mongoose = require('mongoose');
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // Path to your Firebase service account key

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

const connectDB = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');

        // Initialize Firestore
        const firestore = admin.firestore();
        firestore.settings({ ignoreUndefinedProperties: true });
        console.log('Firebase connected');

        // Create collections if they don't exist
        const collections = await firestore.listCollections();
        const requiredCollections = ['favorites', 'manualUsers'];
        
        for (const col of requiredCollections) {
            if (!collections.some(c => c.id === col)) {
                await firestore.collection(col).doc('init').set({ createdAt: new Date() });
                console.log(`Created ${col} collection`);
            }
        }

    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

// Export both MongoDB and Firebase instances
module.exports = {
    connectDB,
    mongoose,
    firestore: admin.firestore(),
    firebaseAuth: admin.auth()
};