const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User'); 


// Login controller
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario en la base de datos
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Crear un token JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'Secretkey1213', // Toca cambiar 'defaultSecretKey' por la clave secreta
            { expiresIn: '1h' }
        );

        res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
