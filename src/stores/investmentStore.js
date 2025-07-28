import {defineStore} from "pinia";
import investmentsService from "../services/investmentsService";

export const useInversionesStore = defineStore("inversiones", {
    state: () => ({
        investments: [],
        typesInvestment: [],
        payments: [],
        currentInvestment: null,
    }),
    actions: {
        async fetchInvestments() {
            try {
                const response = await investmentsService.getInvestments();
                this.investments = response.data;
            } catch (error) {
                console.error("Error al obtener las inversiones:", error);
            }
        },
        async fetchInvestmentTypes() {
            try {
                const response = await investmentsService.getInvestmentTypes();
                this.typesInvestment = response.data.map((type) => ({
                    nombre: type.name,
                    value: type.id,
                }));
            } catch (error) {
                console.error("Error al obtener los tipos de inversión:", error);
            }
        },
        async addInvestment(inversionData) {
            try {
                await investmentsService.createInvestment(inversionData);
                await this.fetchInvestments();
                return true;
            } catch (error) {
                console.error("Error al crear la inversión:", error);
                return false;
            }
        },
        async updateInvestment(inversionId, inversionData) {
            try {
                await investmentsService.updateInvestment(inversionId, inversionData);
                await this.fetchInvestments();
                return true;
            } catch (error) {
                console.error("Error al actualizar la inversión:", error);
                return false;
            }
        },
        async deleteInvestment(inversionId) {
            try {
                await investmentsService.deleteInvestment(inversionId);
                await this.fetchInvestments();
                return true;
            } catch (error) {
                console.error("Error al eliminar la inversión:", error);
                return false;
            }
        },
        async fetchInvestmentById(id) {
            try {
                const response = await investmentsService.getInvestmentById(id);
                this.inversionActual = response.data;
            } catch (error) {
                this.inversionActual = null;
                console.error("Error al obtener la inversión:", error);
            }
        },
        async fetchPaymentsByInvestment(investmentId) {
            try {
                const response = await investmentsService.getPagosPorInversion(
                    investmentId
                );
                this.pagos = Array.isArray(response.data) ? response.data : [];
            } catch (error) {
                this.pagos = [];
                console.error("Error al obtener los pagos:", error);
            }
        },
        async addPayment(pagoData) {
            try {
                await investmentsService.addPayment(pagoData);
                await this.fetchPaymentsByInvestment(pagoData.creditoId);
                return true;
            } catch (error) {
                console.error("Error al agregar el pago:", error);
            }
        },
    },
});
