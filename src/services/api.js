// src/services/api.js
import axios from 'axios';

const PORT = import.meta.env.VITE_API_PORT || 3000;
const isDevelopment = import.meta.env.MODE === 'development';
const baseURL = isDevelopment 
    ? '/api'  // Use proxy in development
    : 'https://finances-app-back.onrender.com';

const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para añadir el token a las cabeceras de todas las peticiones
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        // Configura la cabecera de autorización como se espere en tu backend (ej. Bearer
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default apiClient;
