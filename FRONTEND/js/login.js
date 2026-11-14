// js/login.js
import API from "../src/api.js"; 
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { app } from "../firebase.js";

const auth = getAuth(app);

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // First check if backend is available
 const response = await fetch('https://mundo-velas-api.onrender.com/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // Important for cookies/sessions
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store the token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('loginMethod', 'manual');
        
        // Redirect to profile page
        window.location.href = '../BSHOME/index.html';
        
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Login failed. Please try again.');
    }
});

// Google login handler (unchanged)
document.getElementById("google-signin-button")?.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const idToken = await user.getIdToken();
        
        // Store Google auth data
        localStorage.setItem("token", idToken);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("loginMethod", "google");
        
        // Redirect to profile page
        window.location.href = "../BSHOME/index.html";
    } catch (error) {
        console.error("Google sign-in error:", error);
        alert("Google sign-in failed. Please try again.");
    }
});
