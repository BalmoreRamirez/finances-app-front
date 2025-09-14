// src/services/api.js
import axios from 'axios';

const isDevelopment = import.meta.env.MODE === 'development';
const baseURL = isDevelopment 
    ? 'http://localhost:3006/'
    : 'https://finances-app-back.onrender.com';

const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 60000, // 60 segundos timeout (aumentado para Render)
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

// Función de retry para peticiones fallidas
const retryRequest = async (originalRequest, retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
    
    if (retryCount >= maxRetries) {
        throw originalRequest;
    }
    
    console.log(`Reintentando petición (intento ${retryCount + 1}/${maxRetries})...`);
    
    // Esperar antes del retry
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    
    try {
        const response = await apiClient(originalRequest.config);
        return response;
    } catch (error) {
        return retryRequest(error, retryCount + 1);
    }
};

// Función helper para hacer peticiones con retry automático
export const apiRequest = async (config) => {
    try {
        const response = await apiClient(config);
        return response;
    } catch (error) {
        // Solo hacer retry en errores de timeout o conectividad
        if (error.code === 'ECONNABORTED' || 
            error.code === 'NETWORK_ERROR' || 
            error.response?.status >= 500) {
            console.warn('Error de conectividad detectado, intentando retry...', error.message);
            return retryRequest(error);
        }
        // Para otros errores, fallar inmediatamente
        throw error;
    }
};

export default apiClient;
