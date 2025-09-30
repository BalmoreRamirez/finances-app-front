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
    timeout: 60000,
});


const cache = new Map();
const CACHE_TIME = 5 * 60 * 1000; // 5 minutos


const clearAppState = () => {
    localStorage.removeItem('accessToken');
    cache.clear();
};

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

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
    if (error.response?.status === 401) {
        clearAppState();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            console.log('Redirigiendo al login...');
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});
const retryRequest = async (originalRequest, retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
    
    if (retryCount >= maxRetries) {
        throw originalRequest;
    }
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    
    try {
        const response = await apiClient(originalRequest.config);
        return response;
    } catch (error) {
        return retryRequest(error, retryCount + 1);
    }
};

export const apiRequest = async (config) => {
    try {
        const response = await apiClient(config);
        return response;
    } catch (error) {
        if (error.code === 'ECONNABORTED' || 
            error.code === 'NETWORK_ERROR' || 
            error.response?.status >= 500) {
            console.warn('Error de conectividad detectado, intentando retry...', error.message);
            return retryRequest(error);
        }
        throw error;
    }
};

export default apiClient;
export { clearAppState };
