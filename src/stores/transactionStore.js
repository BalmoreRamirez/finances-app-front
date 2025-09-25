import { defineStore } from 'pinia';
import transactionsService from '../services/transactionsService';
import { useNotifications } from '../composables/useNotifications';

// Función helper para extraer mensajes de error del backend
function extractErrorMessage(error, defaultMessage = "Ha ocurrido un error") {
  if (error?.response?.data) {
    const errorData = error.response.data;
    
    // Si el backend devuelve un mensaje de error específico
    if (errorData.message) {
      // Si es un array de mensajes, unirlos
      if (Array.isArray(errorData.message)) {
        return errorData.message.join(', ');
      }
      return errorData.message;
    }
    // Si el backend devuelve errores de validación (array de errores)
    else if (errorData.errors && Array.isArray(errorData.errors)) {
      return errorData.errors.map(err => err.message || err).join(', ');
    }
    // Si el backend devuelve un objeto con errores por campo
    else if (errorData.errors && typeof errorData.errors === 'object') {
      const fieldErrors = Object.values(errorData.errors).flat();
      return fieldErrors.join(', ');
    }
    // Si hay un error general en el response
    else if (errorData.error) {
      return errorData.error;
    }
    // Si hay un detail
    else if (errorData.detail) {
      return errorData.detail;
    }
  }
  // Si es un error de red o conexión
  else if (error?.code === 'ECONNREFUSED' || error?.code === 'NETWORK_ERROR') {
    return "Error de conexión. Verifica tu conexión a internet.";
  }
  // Si es un error 500
  else if (error?.response?.status === 500) {
    return "Error interno del servidor. Intenta nuevamente más tarde.";
  }
  // Si es un error 404
  else if (error?.response?.status === 404) {
    return "Recurso no encontrado.";
  }
  // Si es un error 401
  else if (error?.response?.status === 401) {
    return "No tienes autorización para realizar esta acción.";
  }
  // Si es un error 403
  else if (error?.response?.status === 403) {
    return "Acceso denegado.";
  }
  
  return defaultMessage;
}

export const useTransaccionesStore = defineStore('transacciones', {
  state: () => ({
    transactions: [],
    categories: [],
    accounts: [],
    isLoading: false,
  }),
  getters: {
    transacciones(state) {
      return state.transactions.map(t => {
        // Buscar la categoría para determinar el tipo
        const categoria = state.categories.find(c => c.id === t.category_id);
        const tipo = categoria?.type || 'gasto'; // Default a gasto si no se encuentra
        
        return {
          ...t,
          tipo: tipo
        };
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    ingresos(state) {
      return state.transactions.filter(t => {
        const categoria = state.categories.find(c => c.id === t.category_id);
        return categoria?.type === 'ingreso';
      });
    },
    gastos(state) {
      return state.transactions.filter(t => {
        const categoria = state.categories.find(c => c.id === t.category_id);
        return categoria?.type === 'egreso';
      });
    },
  },
  actions: {
    async fetchTransactions() {
      try {
        this.isLoading = true;
        const response = await transactionsService.getTransactions();
        this.transactions = response.data;
        return { success: true };
      } catch (error) {
        console.error('Error fetching transactions:', error);
        const notifications = useNotifications();
        notifications.handleBackendError(error, "Error al cargar las transacciones");
        return { 
          success: false, 
          error: extractErrorMessage(error, "Error al cargar las transacciones")
        };
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCategories() {
      try {
        const response = await transactionsService.getTransactionCategories();
        this.categories = response.data;
        return { success: true };
      } catch (error) {
        console.error('Error fetching categories:', error);
        const notifications = useNotifications();
        notifications.handleBackendError(error, "Error al cargar las categorías");
        return { 
          success: false, 
          error: extractErrorMessage(error, "Error al cargar las categorías")
        };
      }
    },

    async fetchAccounts() {
      try {
        const response = await transactionsService.getAccounts();
        this.accounts = response.data;
        return { success: true };
      } catch (error) {
        console.error('Error fetching accounts:', error);
        const notifications = useNotifications();
        notifications.handleBackendError(error, "Error al cargar las cuentas");
        return { 
          success: false, 
          error: extractErrorMessage(error, "Error al cargar las cuentas")
        };
      }
    },

    async addTransaccion(transaccionData) {
      try {
        // Los datos ya vienen en el formato correcto del modal
        const backendData = {
          account_id: transaccionData.account_id,
          category_id: transaccionData.category_id,
          amount: transaccionData.amount,
          description: transaccionData.description,
          date: transaccionData.date
        };

        console.log('Datos a enviar:', backendData); // Para debug

        const response = await transactionsService.createTransaction(backendData);
        
        // Actualizar el estado reactivamente en lugar de hacer fetch completo
        if (response.data) {
          this.transactions.unshift(response.data); // Agregar al principio del array
        }
        
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error creating transaction:', error);
        return { 
          success: false, 
          error: extractErrorMessage(error, "Error al crear la transacción")
        };
      }
    },

    async updateTransaccion(transaccionActualizada) {
      try {
        // Los datos ya vienen en el formato correcto del modal
        const backendData = {
          account_id: transaccionActualizada.account_id,
          category_id: transaccionActualizada.category_id,
          amount: transaccionActualizada.amount,
          description: transaccionActualizada.description,
          date: transaccionActualizada.date
        };

        const response = await transactionsService.updateTransaction(transaccionActualizada.id, backendData);
        
        // Actualizar el estado reactivamente
        if (response.data) {
          const index = this.transactions.findIndex(t => t.id === transaccionActualizada.id);
          if (index !== -1) {
            this.transactions[index] = response.data;
          }
        }
        
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error updating transaction:', error);
        return { 
          success: false, 
          error: extractErrorMessage(error, "Error al actualizar la transacción")
        };
      }
    },

    async deleteTransaccion(transaccion) {
      try {
        const transaccionId = transaccion.id || transaccion;
        await transactionsService.deleteTransaction(transaccionId);
        
        // Actualizar el estado reactivamente
        this.transactions = this.transactions.filter(t => t.id !== transaccionId);
        
        return { success: true };
      } catch (error) {
        console.error('Error deleting transaction:', error);
        return { 
          success: false, 
          error: extractErrorMessage(error, "Error al eliminar la transacción")
        };
      }
    },
  },
});

