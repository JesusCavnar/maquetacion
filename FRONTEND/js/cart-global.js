// FRONTEND/js/cart-global.js

// Función para actualizar el contador del carrito en el navbar
async function updateCartCounter() {
    const token = localStorage.getItem('token');
    const counterElement = document.getElementById('cart-counter');

    if (!token || !counterElement) return; // Si no hay sesión, no hace nada

    try {
        const response = await fetch('http://localhost:3000/api/cart', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const totalItems = data.cart.totalItems || 0;

            if (totalItems > 0) {
                counterElement.textContent = totalItems;
                counterElement.style.display = 'inline-block'; // Mostrar
            } else {
                counterElement.style.display = 'none'; // Ocultar si está vacío
            }
        }
    } catch (error) {
        console.error('Error al actualizar el carrito:', error);
    }
}

// Actualizar el contador cuando la página carga
document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
});

// Exportamos la función para usarla desde otras páginas (ej: al añadir un producto)
window.updateCartCounter = updateCartCounter;