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
    getPagosPorInversion: (investmentId) => {
        return api.get(`/investment-credit-payments/${investmentId}`);
    },
    getInvestmentById: (id) => {
        return api.get(`/investments/${id}`);
    },
    addPayment: (investmentId, paymentData) => {
        return api.post(`/investment-credit-payments/${investmentId}`, paymentData);
    },
    deletePayment: (investmentId, paymentId) => {
        return api.delete(`/investment-credit-payments/${investmentId}/${paymentId}`);
    }

};

export default investmentsService;