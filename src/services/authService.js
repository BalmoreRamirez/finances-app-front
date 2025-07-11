import apiClient from './api';

export default {
    login(email, password) {
        return apiClient.post('/login', { email, password });
    }
};