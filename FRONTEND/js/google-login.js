// Handle Google Sign-In
const googleSignInButton = document.getElementById('google-signin-button');
googleSignInButton.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({ prompt: 'select_account' });

    try {
        await signOut(auth); // Add this before signInWithPopup
        const result = await signInWithRedirect(auth, provider);; // Sign in with Google
        const idToken = await result.user.getIdToken(); // Get Firebase ID token

        // Send the ID token to backend
        const response = await fetch('http://localhost:3000/api/users/google-signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }), // Send the Firebase ID token
        });

        const data = await response.json();

        if (response.ok) {
            alert("Google Sign-In successful!");
            localStorage.setItem("token", data.token); // Save the token
            localStorage.setItem("user", JSON.stringify(data.user)); // Save user data
            window.location.href = "../BSUSERPAGE/profile-google.html"; // Redirect to the profile page
        } else {
            alert(`Google Sign-In failed: ${data.message || "Please try again."}`);
        }
    } catch (error) {
        console.error("Error during Google Sign-In:", error);
        alert("Google Sign-In failed. Please try again.");
    }
});