import apiClient from './api';

export default {
    login(email, password) {
        return apiClient.post('/auth/login', { email, password });
    }
};