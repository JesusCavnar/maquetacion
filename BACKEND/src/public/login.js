document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita el recargo de la página

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Login successful!');
            // Guarda el token en localStorage para futuras solicitudes
            localStorage.setItem('token', data.token);
        } else {
            alert(`Login failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
