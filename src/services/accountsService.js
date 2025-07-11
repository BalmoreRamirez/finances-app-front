import apiClient from './api';

export default {
    getAccounts() {
        return apiClient.get('/accounts');
    },
    createAccount(accountData) {
        return apiClient.post('/accounts', accountData);
    },
    updateAccount(accountId, accountData) {
        return apiClient.put(`/accounts/${accountId}`, accountData);
    },
    deleteAccount(accountId) {
        return apiClient.delete(`/accounts/${accountId}`);
    },
    getAccountTypes() {
        return apiClient.get('/account-types');
    },
};