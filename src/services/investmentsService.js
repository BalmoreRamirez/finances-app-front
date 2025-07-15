import api from './api';

const investmentsService = {
    getInvestments: () => {
        return api.get('/investments');
    },
    getInvestmentTypes: () => {
        return api.get('/investment-types');
    },
    createInvestment: (investmentData) => {
        return api.post('/investments', investmentData);
    },
    updateInvestment: (id, investmentData) => {
        return api.patch(`/investments/${id}`, investmentData);
    },
    deleteInvestment: (id) => {
        return api.delete(`/investments/${id}`);
    },
    getInvestmentById: (id) => {
        return api.get(`/investments/${id}`);
    },
    // --- Métodos para pagos de inversiones ---
    createPayment: (investmentId, paymentData) => {
        return api.post(`/investment-credit-payments/${investmentId}`, paymentData);
    },
    getInvestmentPayments: (investmentId) => {
        return api.get(`/investment-credit-payments/${investmentId}`);
    },
    updateInvestmentPayment: (id, paymentData) => {
        return api.put(`/investment-credit-payments/${id}`, paymentData);
    },
    deleteInvestmentPayment: (id) => {
        return api.delete(`/investment-credit-payments/${id}`);
    },
    deletePayment: (investmentId, paymentId) => {
        return api.delete(`/investment-credit-payments/${investmentId}/${paymentId}`);
    }
};

export default investmentsService;