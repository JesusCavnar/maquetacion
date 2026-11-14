
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // For authentication


const firebaseConfig = {
  apiKey: "AIzaSyAagH119XMFr-RZTt_CsPXjNIr7s-XLaqA",
  authDomain: "mundovelas-f2aa9.firebaseapp.com",
  projectId: "mundovelas-f2aa9",
  storageBucket: "mundovelas-f2aa9.firebasestorage.app",
  messagingSenderId: "976188484759",
  appId: "1:976188484759:web:35cd9ae5ded07320ec8dd2",
  measurementId: "G-HGJM3K8MKJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize Firebase Authentication

export { auth }; // Export auth for use in otherfiles 