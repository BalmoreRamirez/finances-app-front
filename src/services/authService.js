import apiClient, {clearAppState} from './api';

export default {
    login(email, password) {
        return apiClient.post('/login', {email, password});
    },

    logout() {
        clearAppState();
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    },

    isAuthenticated() {
        return !!localStorage.getItem('accessToken');
    }
};