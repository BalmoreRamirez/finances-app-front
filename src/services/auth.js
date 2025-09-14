// src/services/auth.js
import axios from 'axios';

const isDevelopment = import.meta.env.MODE === 'development';
const baseURL = isDevelopment 
    ? 'http://localhost:3000/'
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
