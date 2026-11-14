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
        const response = await fetch('https://mundo-velas-api.onrender.com/api/users/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Thank you for signing up!");
            window.location.href = "../BSLOGIN/index2.html"; // Redirect to sign-in page
        } else {
            alert(`Sign-up failed: ${result.message || "Please check your input and try again."}`);
        }
    } catch (error) {
        console.error("Error during sign-up:", error);
        alert("Error during sign-up. Please try again.");
    }
});