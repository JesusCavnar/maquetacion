const crypto = require('crypto');

exports.createCheckout = async (req, res) => {
    try {
        const { orderData } = req.body; // Recibimos los datos de la orden desde el frontend

        if (!orderData || !orderData.total) {
            return res.status(400).json({ success: false, message: 'Datos de orden incompletos' });
        }

        // 1. Generar una referencia única para la orden
        const reference = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // 2. Wompi maneja los montos en centavos (ej: $10.000 COP -> 1000000 centavos)
        const amountInCents = Math.round(orderData.total * 100);
       console.log('Monto recibido del frontend:', orderData.total);
       console.log('Monto en centavos enviado a Wompi:', amountInCents);

        // 3. Generar la firma de integridad (obligatorio para Wompi)
        // La firma es un hash SHA-256 de: referencia + monto + moneda + secreto
        const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
        const stringToHash = `${reference}${amountInCents}COP${integritySecret}`;
        const signature = crypto.createHash('sha256').update(stringToHash).digest('hex');

        // 4. Construir la URL de Checkout Web de Wompi
        const publicKey = process.env.WOMPI_PUBLIC_KEY;
        const redirectUrl = process.env.WOMPI_REDIRECT_URL;
        
        const checkoutUrl = `https://checkout.wompi.co/p/?public-key=${publicKey}&currency=COP&amount-in-cents=${amountInCents}&reference=${reference}&signature:integrity=${signature}&redirect-url=${redirectUrl}&ngrok-skip-browser-warning=true`;
        // 5. Devolver la URL al frontend para que redirija al usuario
        res.status(200).json({ 
            success: true, 
            checkoutUrl: checkoutUrl 
        });

    } catch (error) {
        console.error('Error al crear checkout:', error);
        res.status(500).json({ success: false, message: 'Error al procesar el pago' });
    }
};