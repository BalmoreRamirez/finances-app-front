// src/services/api.js
import axios from 'axios';

const isDevelopment = import.meta.env.MODE === 'development';
const baseURL = isDevelopment 
    ? 'http://localhost:3000/'
    : 'https://finances-app-back.onrender.com';

const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000, // 30 segundos timeout
});

// Cache simple para peticiones GET
const cache = new Map();
const CACHE_TIME = 5 * 60 * 1000; // 5 minutos

// Interceptor para añadir el token a las cabeceras de todas las peticiones
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar cache para GET requests
    if (config.method === 'get') {
        const cacheKey = `${config.url}-${JSON.stringify(config.params)}`;
        const cached = cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
            config.adapter = () => Promise.resolve(cached.data);
        }
    }
    
    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptor para respuestas
apiClient.interceptors.response.use(response => {
    // Cache GET responses
    if (response.config.method === 'get') {
        const cacheKey = `${response.config.url}-${JSON.stringify(response.config.params)}`;
        cache.set(cacheKey, {
            data: response,
            timestamp: Date.now()
        });
    }
    return response;
}, error => {
    return Promise.reject(error);
});

export default apiClient;
