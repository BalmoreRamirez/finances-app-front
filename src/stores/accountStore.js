import { defineStore } from "pinia";
import cuentasService from "../services/accountsService";

export const useCuentasStore = defineStore("cuentas", {
  state: () => ({
    cuentas: [],
    tiposCuenta: [],
    cuentaActual: null,
  }),

  actions: {
    async fetchAccounts() {
      try {
        const response = await cuentasService.getAccounts();
        this.cuentas = response.data;
      } catch (error) {
        console.error("Error al obtener cuentas:", error);
      }
    },

    async fetchAccountTypes() {
      try {
        const response = await cuentasService.getAccountTypes();
        this.tiposCuenta = response.data.map((type) => ({
          nombre: type.name,
          value: type.id,
        }));
      } catch (error) {
        console.error("Error al obtener tipos de cuenta:", error);
      }
    },

    async addCuenta(payload) {
      try {
        const response = await cuentasService.createAccount(payload);
        if (response.data) {
          await this.fetchAccounts();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error al agregar cuenta:", error);
        return false;
      }
    },

    async updateCuenta(payload) {
      try {
        const { accountId, ...data } = payload;
        const response = await cuentasService.updateAccount(accountId, data);
        if (response.data) {
          await this.fetchAccounts();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error al actualizar cuenta:", error);
        return false;
      }
    },

    async deleteCuenta(accountId) {
      try {
        const response = await cuentasService.deleteAccount(accountId);
        if (response.data) {
          await this.fetchAccounts();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error al eliminar cuenta:", error);
        return false;
      }
    },
  },
});