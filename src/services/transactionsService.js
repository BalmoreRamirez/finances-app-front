import api, { apiRequest } from './api';

const transactionsService = {
    // Transacciones
    getTransactions: () => {
        return apiRequest({ method: 'get', url: '/transactions' });
    },
    createTransaction: (transactionData) => {
        return api.post('/transactions', transactionData);
    },
    updateTransaction: (id, transactionData) => {
        return api.patch(`/transactions/${id}`, transactionData);
    },
    deleteTransaction: (id) => {
        return api.delete(`/transactions/${id}`);
    },

    // Categorías de transacciones
    getTransactionCategories: () => {
        return apiRequest({ method: 'get', url: '/transaction-categories' });
    },
    createTransactionCategory: (categoryData) => {
        return api.post('/transaction-categories', categoryData);
    },
    updateTransactionCategory: (id, categoryData) => {
        return api.patch(`/transaction-categories/${id}`, categoryData);
    },
    deleteTransactionCategory: (id) => {
        return api.delete(`/transaction-categories/${id}`);
    },

    // Cuentas (para mantener consistencia, aunque ya existe accountsService)
    getAccounts: () => {
        return api.get('/accounts');
    }
};

export default transactionsService;
