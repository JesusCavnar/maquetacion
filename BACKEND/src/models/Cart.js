// BACKEND/src/models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false }); // No crear _id por cada item

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Un carrito por usuario
    },
    items: [cartItemSchema],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware para actualizar updatedAt
cartSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Métodos del carrito
cartSchema.methods.addItem = function(item) {
    const existingItem = this.items.find(i => i.productId === item.productId);
    
    if (existingItem) {
        // Si ya existe, aumentar cantidad
        existingItem.quantity += item.quantity || 1;
    } else {
        // Si no existe, agregar nuevo
        this.items.push({
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity || 1
        });
    }
    
    return this.save();
};

cartSchema.methods.updateQuantity = function(productId, quantity) {
    const item = this.items.find(i => i.productId === productId);
    
    if (!item) {
        throw new Error('Product not found in cart');
    }
    
    if (quantity <= 0) {
        // Si quantity es 0 o menos, eliminar el item
        this.items = this.items.filter(i => i.productId !== productId);
    } else {
        item.quantity = quantity;
    }
    
    return this.save();
};

cartSchema.methods.removeItem = function(productId) {
    this.items = this.items.filter(i => i.productId !== productId);
    return this.save();
};

cartSchema.methods.clearCart = function() {
    this.items = [];
    return this.save();
};

// Método virtual para calcular el total
cartSchema.virtual('totalItems').get(function() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

cartSchema.virtual('subtotal').get(function() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

// Configurar virtuals para que aparezcan en JSON
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;