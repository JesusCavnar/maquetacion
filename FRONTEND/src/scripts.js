import API from "./api.js";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const result = await API.register({ email, password });
        alert(result.message || "Registro exitoso");
    } catch (error) {
        console.error("Error en el registro:", error);
        alert("Hubo un error en el registro");
    }
});
