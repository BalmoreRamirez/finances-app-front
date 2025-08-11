// src/services/auth.js
import axios from 'axios';

const PORT = import.meta.env.VITE_API_PORT || 3000;
const isDevelopment = import.meta.env.MODE === 'development';
const baseURL = isDevelopment 
    ? '/api/'  // Use proxy in development
    : 'https://finances-app-back.onrender.com/';

const authApi = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default {
    login(email, password) {
        return authApi.post('/login', { email, password });
    }
};
