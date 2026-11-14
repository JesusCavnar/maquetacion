require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Importar cors
const connectDB = require('./db'); // Archivo de conexión a la base de datos
const admin = require('firebase-admin');
const serviceAccount = require('./Firebasekey.json'); // Ruta al archivo de configuración de Firebase


// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

process.removeAllListeners('warning');

// CORS Configuration
const app = express();
app.use(express.json()); // Middleware para parsear JSON
app.use(express.urlencoded({ extended: true })); // Middleware para parsear URL-encoded


// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:5500',
  'https://mundo-velas-api.onrender.com',
  'https://mundo-velas-api.onrender.com',
  'http://127.0.0.1:3000',
  'https://shimmering-capybara-fb7ab0.netlify.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  credentials: true,
  exposedHeaders: ['Authorization'], // Explicitly expose Authorization header
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

// Database connection
connectDB();

// Routes - IMPORTANT: Load these AFTER CORS and other middleware
const userRoutes = require('./src/routes/userRoutes');
const favoritesRoutes = require('./src/routes/favoriteRoutes'); // Fixed path
const cartRoutes = require('./src/routes/cartRoutes');

app.use('/api/users', userRoutes);  
app.use('/api/favorites', favoritesRoutes);
app.use('/api/cart', cartRoutes);

// Checkout routes
const checkoutRoutes = require('./src/routes/checkoutRoutes');
app.use('/api/checkout', checkoutRoutes);

// Order routes
const orderRoutes = require('./src/routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('CORS configured for:', corsOptions.origin);
});