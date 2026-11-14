document.addEventListener("DOMContentLoaded", async () => {
    console.log("Profile page loaded");

    const fetchUserInfo = async () => {
        const token = localStorage.getItem("token");
        console.log("Retrieved token:", token ? `${token.substring(0, 15)}...` : "none");
        
        if (!token) {
            alert('Please login to view profile');
            window.location.href = "../BSLOGIN/index2.html";
            return;
        }

        try {
            console.log("Fetching user profile...");
            const response = await fetch('https://mundo-velas-api.onrender.com/api/users/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    
                },
                credentials: 'include', // Important for cookies/sessions
                mode: 'cors',
            });

            console.log("Response status:", response.status);
            
            // First check for 401/403 errors
            if (response.status === 401 || response.status === 403) {
                const errorData = await response.json();
                console.error("Auth error:", errorData);
                throw new Error(errorData.message || 'Session expired');
            }

            // Then check for other errors
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("API error:", errorData);
                throw new Error(errorData.message || 'Failed to fetch profile');
            }

            // Parse successful response
            const data = await response.json();
            console.log("Profile data received:", data);

            if (!data.user) {
                throw new Error('User data missing in response');
            }

            // Update UI with user data
            document.getElementById("current-firstName").textContent = data.user.firstName || 'Not provided';
            document.getElementById("current-lastName").textContent = data.user.lastName || 'Not provided';
            document.getElementById("current-email").textContent = data.user.email || 'Not provided';
            document.getElementById("current-phone").textContent = data.user.phone || 'Not provided';

            // Populate form fields
            document.getElementById("firstName").value = data.user.firstName || '';
            document.getElementById("lastName").value = data.user.lastName || '';
            document.getElementById("email").value = data.user.email || '';
            document.getElementById("phone").value = data.user.phone || '';

        } catch (error) {
            console.error("Profile load error:", {
                message: error.message,
                stack: error.stack,
                time: new Date().toISOString()
            });
            
            localStorage.removeItem("token");
            alert('Session expired. Please login again.');
            window.location.href = "../BSLOGIN/index2.html";
        }
    };

    await fetchUserInfo();
    // Handle form submission to update user information
    document.getElementById("updateProfileForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const userData = {
            firstName: document.getElementById("firstName").value,
            lastName: document.getElementById("lastName").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value
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
                await fetchUserInfo(); // Refresh the displayed information
            } else {
                alert(`Update failed: ${result.message || "Please check your input and try again."}`);
            }
        } catch (error) {
            console.error("Error during update:", error);
            alert("Error during update. Please try again.");
        }
    });


    
    // Handle delete profile button click
    document.getElementById("deleteProfileButton").addEventListener("click", async () => {
        if (confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
            try {
                const response = await fetch('https://mundo-velas-api.onrender.com/api/users/delete', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    }
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Profile deleted successfully!");
                    localStorage.removeItem("token"); // Clear the token from localStorage
                    window.location.href = "../BSHOME/index2.html"; // Redirect to home page 
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