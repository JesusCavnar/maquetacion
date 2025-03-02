require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Importar cors
const connectDB = require('./db'); // Archivo de conexión a la base de datos

const app = express();

// Habilitar CORS para todas las solicitudes
app.use(cors());

// Importar las rutas de usuarios
const userRoutes = require('./src/routes/userRoutes');

// Middleware para procesar JSON
app.use(express.json());

// Rutas principales
app.use('/api/users', userRoutes);

// Conectar a la base de datos
connectDB();

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API is running');
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

