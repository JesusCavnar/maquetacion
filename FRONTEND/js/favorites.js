import { auth, db } from '../firebase.js'; // Import Firebase auth and db
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "../BSLOGIN/index.html";
            return;
        }

        // DETERMINE USER TYPE
        const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');
        let userId;

        if (isGoogleUser) {
            userId = user.uid; // Use Firebase UID for Google users
        } else {
            // For manual users, get MongoDB ID reference
            const userDoc = await getDoc(doc(db, "manualUsers", user.uid));
            userId = userDoc.data().mongoUserId;
        }

        loadFavorites(userId, isGoogleUser);
        setupNavigation(user);
    });
});

// REPLACE the entire loadFavorites section in favorite.js with this:

async function loadFavorites(userId, isGoogleUser) {
    try {
        const favoritesList = document.getElementById("favorites-list");
        favoritesList.innerHTML = "<div class='spinner-border'></div>";

        if (isGoogleUser) {
            // For Google users - use Firestore directly
            const q = query(
                collection(db, "favorites"),
                where("userId", "==", userId),
                where("userType", "==", "google")
            );

            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                favoritesList.innerHTML = `
                    <div class="empty-state">
                        <i class="far fa-heart"></i>
                        <p>No favorites found</p>
                    </div>
                `;
                return;
            }

            favoritesList.innerHTML = snapshot.docs.map(doc => {
                const p = doc.data();
                return `
                    <div class="product-card">
                        <img src="${p.image}" class="product-image">
                        <div>
                            <h3>${p.name}</h3>
                            <p>${p.description}</p>
                            <button onclick="removeFavorite('${doc.id}', true)" class="btn btn-danger">
                                Remove
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            // For manual users - use your API
            const token = localStorage.getItem('token');
            const response = await fetch('https://mundo-velas-api.onrender.com/api/user/favorites', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const favorites = await response.json();
                
                if (favorites.length === 0) {
                    favoritesList.innerHTML = `
                        <div class="empty-state">
                            <i class="far fa-heart"></i>
                            <p>No favorites found</p>
                        </div>
                    `;
                    return;
                }

                favoritesList.innerHTML = favorites.map(fav => {
                    const product = fav.productId || fav; // Handle populated data
                    return `
                        <div class="product-card">
                            <img src="${product.image}" class="product-image">
                            <div>
                                <h3>${product.name}</h3>
                                <p>${product.description}</p>
                                <button onclick="removeFavorite('${product._id}', false)" class="btn btn-danger">
                                    Remove
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
        
    } catch (error) {
        console.error("Error:", error);
        favoritesList.innerHTML = `
            <div class="alert alert-danger">
                Error loading favorites
            </div>
        `;
    }
}

// Update removeFavorite function
window.removeFavorite = async function(favoriteId, isGoogleUser) {
    try {
        if (isGoogleUser) {
            // Remove from Firestore
            await deleteDoc(doc(db, "favorites", favoriteId));
        } else {
            // Remove via API for manual users
            const token = localStorage.getItem('token');
            await fetch(`https://mundo-velas-api.onrender.com/api/user/favorites/${favoriteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
        
        alert("Product removed from favorites!");
        window.location.reload();
    } catch (error) {
        console.error("Error removing favorite:", error);
        alert("Failed to remove favorite. Please try again.");
    }
}

// Setup navigation based on user type
function setupNavigation(user) {
    // Home link
    document.querySelector('[data-home]').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = "../BSHOME/index.html";
    });

    // Profile link - determine which profile page to show
    const profileLink = document.querySelector('.profile-link');
    profileLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Check if user signed in with Google (providerData contains google provider)
        const isGoogleUser = user.providerData.some(
            provider => provider.providerId === 'google.com'
        );
        
        window.location.href = isGoogleUser 
            "../BSUSERPAGE/profilemain.html";
    });

    // Navbar links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (link.textContent.includes('Home')) {
                window.location.href = "../BSHOME/index.html";
            } else if (link.textContent.includes('Profile')) {
                const isGoogleUser = user.providerData.some(
                    provider => provider.providerId === 'google.com'
                );
                window.location.href = isGoogleUser 
                    "../BSUSERPAGE/profilemain.html";
            }
            // Favorites link doesn't need action as we're already here
        });
    });
}