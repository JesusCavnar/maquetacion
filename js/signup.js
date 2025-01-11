document.getElementById("signupForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const userData = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        phone: document.getElementById("phone").value
    };
    try {
        const response = await fetch('http://localhost:3000/api/users/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        const result = await response.json();
        alert("Sign-up successful: " + result.message);
    } catch (error) {
        console.error("Error during sign-up:", error);
        alert("Error during sign-up. Please try again.");
    }
});
