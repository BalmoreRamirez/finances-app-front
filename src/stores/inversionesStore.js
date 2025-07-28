import { defineStore } from "pinia";
import investmentsService from "../services/investmentsService";

export const useInversionesStore = defineStore("inversiones", {
  state: () => ({
    inversiones: [],
    tiposInversion: [],
    pagos: [],
    inversionActual: null,
  }),
  actions: {
    async fetchInversiones() {
      try {
        const response = await investmentsService.getInvestments();
        this.inversiones = response.data;
      } catch (error) {
        console.error("Error al obtener las inversiones:", error);
      }
    },
    async fetchTiposInversion() {
      try {
        const response = await investmentsService.getInvestmentTypes();
        this.tiposInversion = response.data.map((type) => ({
          nombre: type.name,
          value: type.id,
        }));
      } catch (error) {
        console.error("Error al obtener los tipos de inversión:", error);
      }
    },
    async addInversion(inversionData) {
      try {
        await investmentsService.createInvestment(inversionData);
        await this.fetchInversiones();
        return true;
      } catch (error) {
        console.error("Error al crear la inversión:", error);
        return false;
      }
    },
    async updateInversion(inversionId, inversionData) {
      try {
        await investmentsService.updateInvestment(inversionId, inversionData);
        await this.fetchInversiones();
        return true;
      } catch (error) {
        console.error("Error al actualizar la inversión:", error);
        return false;
      }
    },
    async deleteInversion(inversionId) {
      try {
        await investmentsService.deleteInvestment(inversionId);
        await this.fetchInversiones();
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
    async fetchPagosPorInversion(investmentId) {
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
    async addPago(pagoData) {
      try {
        await investmentsService.addPago(pagoData);
        await this.fetchPagosPorInversion(pagoData.creditoId);
        return true;
      } catch (error) {
        console.error("Error al agregar el pago:", error);
      }
    },
  },
});
