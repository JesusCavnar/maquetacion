// js/login.js
import API from "../src/api.js"; 

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const result = await API.login({ email, password });
        alert(result.message || "Login successful");

        if (result.success) {
            // Si el login es exitoso, redirige al usuario
            window.location.href = "/dashboard.html";
        } else {
            alert("Invalid credentials");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred. Please try again later.");
    }
});
