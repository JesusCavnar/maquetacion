// BACKEND/src/controllers/cartController.js
const Cart = require('../models/cart.js');

// 1. Obtener el carrito del usuario
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.userId });
        
        // Si el usuario no tiene carrito, devolvemos uno vacío
        if (!cart) {
            cart = new Cart({ userId: req.user.userId, items: [] });
            await cart.save();
        }

        // Convertimos a objeto para agregar la categoría
        let cartObj = cart.toObject();

        // MAPA DE CATEGORÍAS (De dónde sale cada imagen)
        const categoryMap = {
            // VELAS
            'colonia-product-id': 'BSCATALOG',
            'ficodiamalfi-product-id': 'BSCATALOG',
            'mirtodipanamera-product-id': 'BSCATALOG',
            'grazie-product-id': 'BSCATALOG',
            'lavender-product-id': 'BSCATALOG',
            'limebasil-product-id': 'BSCATALOG',
            'peony-product-id': 'BSCATALOG',
            'goldenamber-product-id': 'BSCATALOG',

            // ESENCIAS
            'essence-boungiorno-id': 'BSESSENCE',
            'essence-lacasasullago-id': 'BSESSENCE',
            'essence-boungiorno-refill-id': 'BSESSENCE',
            'essence-yuzu-id': 'BSESSENCE',
            'essence-limebasil-id': 'BSESSENCE',
            'essence-lavender-moonflower-id': 'BSESSENCE',
            'essence-woodsage-id': 'BSESSENCE',
            'essence-freshfig-refill-id': 'BSESSENCE',

            // GIFT SETS
            'gift-british-seaside-id': 'BSGIFTSET',
            'gift-lavender-moonflower-trio-id': 'BSGIFTSET',
            'gift-travel-candles-trio-id': 'BSGIFTSET',
            'gift-wildberry-bramble-duo-id': 'BSGIFTSET',
            'gift-festive-collection-trio-id': 'BSGIFTSET',
            'gift-terrace-trio-id': 'BSGIFTSET',
            'gift-ecodiluce-id': 'BSGIFTSET',
            'gift-chapeau-candle-id': 'BSGIFTSET'
        };

        // Agregamos la propiedad de categoria a cada item
        cartObj.items = cartObj.items.map(item => {
            const category = categoryMap[item.productId] || 'BSCATALOG';
            return { ...item, category };
        });

        res.status(200).json({ success: true, cart: cartObj });
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        res.status(500).json({ success: false, message: 'Error al obtener el carrito' });
    }
};

// 2. Agregar un producto al carrito
exports.addToCart = async (req, res) => {
    try {
        const { productId, name, price, image, quantity } = req.body;
        
        if (!productId || !name || !price || !image) {
            return res.status(400).json({ success: false, message: 'Faltan datos del producto' });
        }

        let cart = await Cart.findOne({ userId: req.user.userId });
        
        if (!cart) {
            cart = new Cart({ userId: req.user.userId, items: [] });
        }
        
        // Usamos el método addItem que creamos en el modelo
        await cart.addItem({ productId, name, price, image, quantity: quantity || 1 });
        
        res.status(200).json({ 
            success: true, 
            message: 'Producto agregado al carrito',
            cart 
        });
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        res.status(500).json({ success: false, message: 'Error al agregar producto' });
    }
};

// 3. Actualizar la cantidad de un producto
exports.updateQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        
        if (quantity === undefined) {
            return res.status(400).json({ success: false, message: 'Falta la cantidad' });
        }

        const cart = await Cart.findOne({ userId: req.user.userId });
        
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
        }
        
        // Usamos el método updateQuantity del modelo
        await cart.updateQuantity(productId, quantity);
        
        res.status(200).json({ success: true, message: 'Cantidad actualizada', cart });
    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Eliminar un producto del carrito
exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        
        const cart = await Cart.findOne({ userId: req.user.userId });
        
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
        }
        
        // Usamos el método removeItem del modelo
        await cart.removeItem(productId);
        
        res.status(200).json({ success: true, message: 'Producto eliminado', cart });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar producto' });
    }
};

// 5. Vaciar el carrito por completo
exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.userId });
        
        if (cart) {
            await cart.clearCart();
        }
        
        res.status(200).json({ success: true, message: 'Carrito vaciado' });
    } catch (error) {
        console.error('Error al vaciar carrito:', error);
        res.status(500).json({ success: false, message: 'Error al vaciar el carrito' });
    }
};