
const BASE_URL = "http://localhost:3000"; 

const API = {
    register: async (userData) => {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        return response.json();
    },
    login: async (credentials) => {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        return response.json();
    },
    getProducts: async () => {
        const response = await fetch(`${BASE_URL}/products`, {
            method: "GET",
        });
        return response.json();
    },
};

export default API;
