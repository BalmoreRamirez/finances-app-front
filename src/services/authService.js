import apiClient, { clearAppState } from './api';

export default {
    login(email, password) {
        return apiClient.post('/login', { email, password });
    },

    // Función para cerrar sesión manualmente
    logout() {
        clearAppState();
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    },

    // Verificar si hay un token válido
    isAuthenticated() {
        return !!localStorage.getItem('accessToken');
    }
};