document.addEventListener("DOMContentLoaded", () => {
    console.log("Google Profile page loaded");

    // Fetch user data from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (user) {
        // Display welcome message with user's name
        const welcomeMessage = document.getElementById("welcome-message");
        welcomeMessage.textContent = `Bienvenido, ${user.displayName || 'Candles Fan'}!`;

        // Display profile picture if available
        if (user.photoURL) {
            const profilePhoto = document.getElementById("profile-photo");
            profilePhoto.src = user.photoURL;
        }

        // Display user information
        document.getElementById("current-name").textContent = user.displayName || "Not provided";
        document.getElementById("current-email").textContent = user.email || "Not provided";

        // Populate the form with user information
        document.getElementById("name").value = user.displayName || "";
        document.getElementById("email").value = user.email || "";
    } else {
        alert("User data not found. Please sign in again.");
        window.location.href = '../BSLOGIN/index2.html';
    }

    // Handle form submission to update user information
    document.getElementById("updateProfileForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const userData = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value
        };

        try {
            const response = await fetch('https://mundo-velas-api.onrender.com/api/users/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Profile updated successfully!");
                // Update localStorage with new data
                const updatedUser = { ...JSON.parse(localStorage.getItem('user')), ...userData };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Refresh the displayed information
                document.getElementById("welcome-message").textContent = `Bienvenido, ${userData.name || 'Candles Fan'}!`;
                document.getElementById("current-name").textContent = userData.name;
                document.getElementById("current-email").textContent = userData.email;
            } else {
                alert(`Update failed: ${result.message || "Please check your input and try again."}`);
            }
        } catch (error) {
            console.error("Error during update:", error);
            alert("Error during update. Please try again.");
        }
    });

    // Handle Delete Account button click
    document.getElementById("deleteProfileButton").addEventListener("click", async () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            try {
                const token = localStorage.getItem('token');
                console.log("Retrieved token:", token); // Debugging log

                const response = await fetch('https://mundo-velas-api.onrender.com/api/users/delete', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Account deleted successfully!");
                    localStorage.removeItem("token"); // Clear the token from localStorage
                    localStorage.removeItem("user"); // Clear the user data from localStorage
                    window.location.href = "../BSHOME/homemain.html"; // Redirect to home page
                } else {
                    alert(`Delete failed: ${result.message || "Please try again."}`);
                }
            } catch (error) {
                console.error("Error during deletion:", error);
                alert("Error during deletion. Please try again.");
            }
        }
    });
});