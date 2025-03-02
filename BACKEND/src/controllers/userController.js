const User = require('../models/User'); 

const signupUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Validación de datos 
    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Crear un nuevo usuario
    const newUser = new User({ firstName, lastName, email, password, phone });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error registering user' });
  }
};

module.exports = { signupUser };
