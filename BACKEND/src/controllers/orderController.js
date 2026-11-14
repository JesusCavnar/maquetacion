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
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener órdenes' });
    }
};