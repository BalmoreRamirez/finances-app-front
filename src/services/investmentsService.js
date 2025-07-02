import api from './api';

const investmentsService = {
    getInvestments: () => {
        return api.get('/investments');
    },
    getInvestmentTypes: () => {
        return api.get('/investments/types');
    },
    createInvestment: (investmentData) => {
        return api.post('/investments', investmentData);
    },
    updateInvestment: (id, investmentData) => {
        return api.put(`/investments/${id}`, investmentData);
    },
    deleteInvestment: (id) => {
        return api.delete(`/investments/${id}`);
    },
    getInvestmentById: (id) => {
        return api.get(`/investments/${id}`);
    },
    // --- Nuevo método para crear pagos ---
    createInvestmentPayment: (paymentData) => {
        return api.post('/investment-payments', paymentData);
    },
    getInvestmentPayments: (investmentId) => {
        return api.get(`/investment-payments/investment/${investmentId}`);
    },
    updateInvestmentPayment: (id, paymentData) => {
        return api.put(`/investment-payments/${id}`, paymentData);
    },
    deleteInvestmentPayment: (id) => {
        return api.delete(`/investment-payments/${id}`);
    }
};

export default investmentsService;