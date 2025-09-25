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
    // Obtener todas las cuentas ordenadas por más recientes primero
    cuentasOrdenadas: (state) => {
      return [...state.cuentas].sort((a, b) => {
        // Ordenar por created_at si existe, sino por id (más reciente primero)
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB - dateA; // Más reciente primero
        }
        // Si las fechas son iguales o no existen, ordenar por id descendente
        return (b.id || 0) - (a.id || 0);
      });
    },

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
        return { success: true };
      } catch (error) {
        const notifications = this._initNotifications();
        notifications.handleBackendError(error, "Error al obtener cuentas");
        console.error("Error al obtener cuentas:", error);
        return { 
          success: false, 
          error: error.response?.data?.message || "Error al obtener cuentas"
        };
      }
    },
    async fetchAccounts() {
      try {
        const response = await cuentasService.getAccounts();
        // Ordenar por más recientes al cargar inicialmente
        this.cuentas = (response.data || []).sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateB - dateA; // Más reciente primero
          }
          return (b.id || 0) - (a.id || 0); // Por id descendente si no hay fecha
        });
        return { success: true };
      } catch (error) {
        const notifications = this._initNotifications();
        notifications.handleBackendError(error, "Error al obtener cuentas");
        console.error("Error al obtener cuentas:", error);
        return { 
          success: false, 
          error: error.response?.data?.message || "Error al obtener cuentas"
        };
      }
    },

    async fetchAccountTypes() {
      try {
        const response = await cuentasService.getAccountTypes();
        this.tiposCuenta = response.data.map((type) => ({
          nombre: type.name,
          value: type.id,
        }));
        return { success: true };
      } catch (error) {
        const notifications = this._initNotifications();
        notifications.handleBackendError(error, "Error al obtener tipos de cuenta");
        console.error("Error al obtener tipos de cuenta:", error);
        return { 
          success: false, 
          error: error.response?.data?.message || "Error al obtener tipos de cuenta"
        };
      }
    },

    async addCuenta(payload) {
      try {
        const response = await cuentasService.createAccount(payload);
        if (response.data) {
          // Actualizar el estado reactivamente (insertar al inicio para mantener orden)
          this.cuentas.unshift(response.data);
          // También actualizar accountsForSelect
          this.accountsForSelect.unshift({
            nombre: response.data.name,
            value: response.data.id,
          });
          
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
          // Actualizar el estado reactivamente
          const index = this.cuentas.findIndex(cuenta => cuenta.id === accountId);
          if (index !== -1) {
            this.cuentas[index] = response.data;
          }
          
          // También actualizar accountsForSelect
          const selectIndex = this.accountsForSelect.findIndex(account => account.value === accountId);
          if (selectIndex !== -1) {
            this.accountsForSelect[selectIndex] = {
              nombre: response.data.name,
              value: response.data.id,
            };
          }
          
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
          // Actualizar el estado reactivamente
          this.cuentas = this.cuentas.filter(cuenta => cuenta.id !== accountId);
          // También actualizar accountsForSelect
          this.accountsForSelect = this.accountsForSelect.filter(account => account.value !== accountId);
          
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
