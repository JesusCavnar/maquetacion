const Favorite = require('../models/Favorite');
const firebaseService = require('../services/firebaseService');

exports.getUserFavorites = async (req, res) => {
  try {
    let favorites;
    
    if (req.user.isGoogle) {
      // Get from Firestore
      favorites = await firebaseService.getFirestoreFavorites(req.user.id);
    } else {
      // Get from MongoDB
      favorites = await Favorite.find({ userId: req.user.id }).populate('productId');
    }
    
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    if (req.user.isGoogle) {
      const result = await firebaseService.addFirestoreFavorite(
        req.user.id, 
        req.body.productId
      );
      return res.status(201).json(result);
    }
    
    const favorite = new Favorite({
      userId: req.user.id,
      productId: req.body.productId
    });
    
    await favorite.save();
    res.status(201).json(favorite);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    // Implementation for both Google and manual users
    if (req.user.isGoogle) {
      await firebaseService.removeFirestoreFavorite(id);
    } else {
      await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { favorites: { productId: id } } },
        { new: true }
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};