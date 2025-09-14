import apiClient, { apiRequest } from './api';

export default {
    getAccounts() {
        return apiRequest({ method: 'get', url: '/accounts' });
    },
    createAccount(accountData) {
        return apiClient.post('/accounts', accountData);
    },
    updateAccount(accountId, accountData) {
        return apiClient.patch(`/accounts/${accountId}`, accountData);
    },
    deleteAccount(accountId) {
        return apiClient.delete(`/accounts/${accountId}`);
    },
    getAccountTypes() {
        return apiRequest({ method: 'get', url: '/account-types' });
    },
};