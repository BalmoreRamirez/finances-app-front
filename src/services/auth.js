// src/services/auth.js
import axios from 'axios';

const PORT = import.meta.env.VITE_API_PORT || 3000;
const authApi = axios.create({
    baseURL: `http://localhost:${PORT}/`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default {
    login(email, password) {
        return authApi.post('/login', { email, password });
    }
};
