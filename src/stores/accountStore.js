import { defineStore } from "pinia";
import cuentasService from "../services/accountsService";
import { useNotifications } from "../composables/useNotifications";

export const useCuentasStore = defineStore("cuentas", {
  state: () => ({
    cuentas: [],
    tiposCuenta: [],
    cuentaActual: null,
    accountsForSelect: [],
  }),

  getters: {
    // Obtener cuentas de efectivo y banco
    cuentasEfectivoYBanco: (state) => {
      return state.cuentas.filter(cuenta => 
        cuenta.account_type_id === 1 || cuenta.account_type_id === 2
      );
    },

    // Calcular capital total (suma de efectivo y banco)
    capitalTotal: (state) => {
      const cuentasCapital = state.cuentas.filter(cuenta => 
        cuenta.account_type_id === 1 || cuenta.account_type_id === 2
      );
      return cuentasCapital.reduce((total, cuenta) => total + parseFloat(cuenta.balance || 0), 0);
    },

    // Saldo total de efectivo
    totalEfectivo: (state) => {
      const cuentasEfectivo = state.cuentas.filter(cuenta => cuenta.account_type_id === 1);
      return cuentasEfectivo.reduce((total, cuenta) => total + parseFloat(cuenta.balance || 0), 0);
    },

    // Saldo total de banco
    totalBanco: (state) => {
      const cuentasBanco = state.cuentas.filter(cuenta => cuenta.account_type_id === 2);
      return cuentasBanco.reduce((total, cuenta) => total + parseFloat(cuenta.balance || 0), 0);
    }
  },

  actions: {
    // Método para inicializar notificaciones
    _initNotifications() {
      if (!this._notifications) {
        this._notifications = useNotifications();
      }
      return this._notifications;
    },
    async fetchAccountsForSelect() {
      try {
        const response = await cuentasService.getAccounts();
        this.accountsForSelect = response.data.map((account) => ({
          nombre: account.name,
          value: account.id,
        }));
      } catch (error) {
        const notifications = this._initNotifications();
        notifications.handleBackendError(error, "Error al obtener cuentas");
        console.error("Error al obtener cuentas:", error);
      }
    },
    async fetchAccounts() {
      try {
        const response = await cuentasService.getAccounts();
        this.cuentas = response.data;
      } catch (error) {
        const notifications = this._initNotifications();
        notifications.handleBackendError(error, "Error al obtener cuentas");
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
        const notifications = this._initNotifications();
        notifications.handleBackendError(error, "Error al obtener tipos de cuenta");
        console.error("Error al obtener tipos de cuenta:", error);
      }
    },

    async addCuenta(payload) {
      try {
        const response = await cuentasService.createAccount(payload);
        if (response.data) {
          await this.fetchAccounts();
          const notifications = this._initNotifications();
          notifications.showSuccess("Éxito", "Cuenta creada correctamente");
          return true;
        }
        return false;
      } catch (error) {
        const notifications = this._initNotifications();
        notifications.handleBackendError(error, "Error al agregar cuenta");
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
          const notifications = this._initNotifications();
          notifications.showSuccess("Éxito", "Cuenta actualizada correctamente");
          return true;
        }
        return false;
      } catch (error) {
        const notifications = this._initNotifications();
        notifications.handleBackendError(error, "Error al actualizar cuenta");
        console.error("Error al actualizar cuenta:", error);
        return false;
      }
    },

    async deleteCuenta(accountId) {
      try {
        const response = await cuentasService.deleteAccount(accountId);
        if (response.data) {
          await this.fetchAccounts();
          const notifications = this._initNotifications();
          notifications.showSuccess("Éxito", "Cuenta eliminada correctamente");
          return true;
        }
        return false;
      } catch (error) {
        const notifications = this._initNotifications();
        notifications.handleBackendError(error, "Error al eliminar cuenta");
        console.error("Error al eliminar cuenta:", error);
        return false;
      }
    },
  },
});
