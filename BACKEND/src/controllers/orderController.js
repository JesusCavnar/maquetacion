const Order = require('../models/Order.js');
const Cart = require('../models/Cart.js');

exports.createOrder = async (req, res) => {
    try {
        const { transactionId } = req.body; // Solo necesitamos el ID de Wompi
        const userId = req.user.userId;

        // 1. Buscamos el carrito del usuario en la base de datos
        const cart = await Cart.findOne({ userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'El carrito está vacío' });
        }

        // 2. Calculamos los totales desde la base de datos (más seguro)
        const subtotal = cart.subtotal; // Este virtual ya lo tienes en tu modelo Cart
        const shipping = 15000;
        const total = subtotal + (subtotal * 0.19) + shipping;

        // 3. Creamos la orden con los datos del carrito
        const newOrder = new Order({
            userId,
            orderNumber: transactionId,
            items: cart.items,
            shippingAddress: { // Datos genéricos por ahora, ya que no enviamos el form desde aquí
                fullName: "Cliente Mundo Velas",
                email: req.user.email || "cliente@mundovelas.com",
                phone: "000000000",
                address: "Dirección de prueba",
                city: "Bucaramanga",
                postalCode: "680001"
            },
            paymentMethod: 'card',
            subtotal: subtotal,
            shipping: shipping,
            total: total,
            status: 'confirmed'
        });

        await newOrder.save();

        // 4. Vaciamos el carrito del usuario
        cart.items = [];
        await cart.save();

        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error('Error al guardar orden:', error);
        res.status(500).json({ success: false, message: 'Error al guardar la orden' });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });

        // 🎯 MAPA DE CATEGORÍAS
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

        // Recorremos las órdenes y asignamos la categoría a cada item
        const formattedOrders = orders.map(order => {
            let orderObj = order.toObject();
            orderObj.items = orderObj.items.map(item => ({
                ...item,
                category: categoryMap[item.productId] || 'BSCATALOG'
            }));
            return orderObj;
        });

        res.status(200).json({ success: true, orders: formattedOrders });
    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        res.status(500).json({ success: false, message: 'Error al obtener órdenes' });
    }
};