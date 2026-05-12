const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    phone: { type: String },
    
    favorites: [{
        type: String,
        default: []
    }],
    
    firebaseUid: { type: String, unique: true, sparse: true }, // For Google users
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date }
});

// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// UPDATED methods for string favorites
userSchema.methods.addFavorite = async function(productId) {
    if (!this.favorites.includes(productId)) {
        this.favorites.push(productId);
        await this.save();
    }
};

// UPDATED method to remove favorite
userSchema.methods.removeFavorite = async function(productId) {
    this.favorites = this.favorites.filter(fav => fav !== productId);
    await this.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;