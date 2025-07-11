// src/services/auth.js
import axios from 'axios';

const authApi = axios.create({
    baseURL: 'http://localhost:3000/',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default {
    login(email, password) {
        return authApi.post('/login', { email, password });
    }
};

