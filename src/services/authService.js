import axios from "axios";
export const api = axios.create({
    baseURL: "/api/auth",
    timeout: 10000, // 10 seconds timeout
    headers: {
        "Content-Type": "application/json",
    },
});

// Send the new account details.
export async function registerUser({ name, email, password }) {
    const response = await api.post("/register", { name, email, password });

    return response.data.data.user;
}

// Check login details and return the session.
export async function loginUser({ email, password }) {
    const response = await api.post("/login", { email, password });

    return response.data.data;
}

// Get the user for this token.
export async function getCurrentUser(token) {
    const response = await api.get("/me",{
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data.data.user;
}
