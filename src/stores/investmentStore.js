import { defineStore } from "pinia";
import investmentsService from "../services/investmentsService";

// Función helper para extraer mensajes de error del backend
function extractErrorMessage(error, defaultMessage = "Ha ocurrido un error") {
  if (error?.response?.data) {
    const errorData = error.response.data;
    
    // Si el backend devuelve un mensaje de error específico
    if (errorData.message) {
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

export const useInversionesStore = defineStore("inversiones", {
  state: () => ({
    investments: [],
    typesInvestment: [],
    payments: [],
    currentInvestment: null,
  }),
  getters: {
    // Obtener todas las inversiones ordenadas por más recientes primero
    inversionesOrdenadas: (state) => {
      return [...state.investments].sort((a, b) => {
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

    // Obtener todos los pagos ordenados por más recientes primero
    pagosOrdenados: (state) => {
      return [...state.payments].sort((a, b) => {
        // Ordenar por fecha de pago si existe, sino por created_at, sino por id
        const dateA = a.payment_date ? new Date(a.payment_date) : 
                     (a.created_at ? new Date(a.created_at) : new Date(0));
        const dateB = b.payment_date ? new Date(b.payment_date) : 
                     (b.created_at ? new Date(b.created_at) : new Date(0));
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB - dateA; // Más reciente primero
        }
        // Si las fechas son iguales o no existen, ordenar por id descendente
        return (b.id || 0) - (a.id || 0);
      });
    }
  },
  actions: {
    async fetchInvestments() {
      try {
        const response = await investmentsService.getInvestments();
        // Ordenar por más recientes al cargar inicialmente
        this.investments = (response.data || []).sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateB - dateA; // Más reciente primero
          }
          return (b.id || 0) - (a.id || 0); // Por id descendente si no hay fecha
        });
        return { success: true };
      } catch (error) {
        console.error("Error al obtener las inversiones:", error);
        return { 
          success: false, 
          error: extractErrorMessage(error, "Error al obtener las inversiones")
        };
      }
    },
    async fetchInvestmentTypes() {
      try {
        const response = await investmentsService.getInvestmentTypes();
        this.typesInvestment = response.data.map((type) => ({
          nombre: type.name,
          value: type.id,
        }));
        return { success: true };
      } catch (error) {
        console.error("Error al obtener los tipos de inversión:", error);
        return { 
          success: false, 
          error: extractErrorMessage(error, "Error al obtener los tipos de inversión")
        };
      }
    },
    async addInvestment(inversionData) {
      try {
        const response = await investmentsService.createInvestment(inversionData);
        
        // Actualizar el estado reactivamente (insertar al inicio para mantener orden)
        if (response.data) {
          this.investments.unshift(response.data);
        }
        
        return { success: true, message: "Inversión creada correctamente", data: response.data };
      } catch (error) {
        console.error("Error al crear la inversión:", error);
        return { 
          success: false, 
          error: extractErrorMessage(error, "Error al crear la inversión"),
          data: error.response?.data || null
        };
      }
    },
    async updateInvestment(inversionId, inversionData) {
      try {
        const response = await investmentsService.updateInvestment(inversionId, inversionData);
        
        // Actualizar el estado reactivamente
        if (response.data) {
          const index = this.investments.findIndex(inv => inv.id === inversionId);
          if (index !== -1) {
            this.investments[index] = response.data;
          }
        }
        
        return { success: true, message: "Inversión actualizada correctamente", data: response.data };
      } catch (error) {
        console.error("Error al actualizar la inversión:", error);
        return { 
          success: false, 
          error: extractErrorMessage(error, "Error al actualizar la inversión")
        };
      }
    },
    async deleteInvestment(inversionId) {
      try {
        await investmentsService.deleteInvestment(inversionId);
        
        // Actualizar el estado reactivamente
        this.investments = this.investments.filter(inv => inv.id !== inversionId);
        
        return { success: true, message: "Inversión eliminada correctamente" };
      } catch (error) {
        console.error("Error al eliminar la inversión:", error);
        return { 
          success: false, 
          error: extractErrorMessage(error, "Error al eliminar la inversión")
        };
      }
    },
    async fetchInvestmentById(id) {
      try {
        const response = await investmentsService.getInvestmentById(id);
        this.currentInvestment = response.data;
        return { success: true };
      } catch (error) {
        this.currentInvestment = null;
        console.error("Error al obtener la inversión:", error);
        return { 
          success: false, 
          error: extractErrorMessage(error, "Error al obtener la inversión")
        };
      }
    },
    async fetchPaymentsByInvestment(investmentId) {
      try {
        const response = await investmentsService.getPagosPorInversion(
          investmentId
        );
        this.payments = Array.isArray(response.data) ? response.data : [];
        return { success: true };
      } catch (error) {
        this.payments = [];
        console.error("Error al obtener los pagos:", error);
        return { 
          success: false, 
          error: extractErrorMessage(error, "Error al obtener los pagos")
        };
      }
    },
    async addPayment(pagoData) {
      try {
        const investmentId = pagoData.investment_id;
        const response = await investmentsService.addPayment(investmentId, pagoData);
        
        // Actualizar el estado reactivamente (insertar al inicio para mantener orden)
        if (response.data) {
          this.payments.unshift(response.data);
        }
        
        return { success: true, message: "Pago registrado correctamente", data: response.data };
      } catch (error) {
        console.error("Error al agregar el pago:", error);
        return { 
          success: false, 
          error: extractErrorMessage(error, "Error al agregar el pago")
        };
      }
    },
    async deletePayment(investmentId, paymentId) {
      try {
        await investmentsService.deletePayment(investmentId, paymentId);
        
        // Actualizar el estado reactivamente
        this.payments = this.payments.filter(payment => payment.id !== paymentId);
        
        return { success: true, message: "Pago eliminado correctamente" };
      } catch (error) {
        console.error("Error al eliminar el pago:", error);
        return { 
          success: false, 
          error: extractErrorMessage(error, "Error al eliminar el pago")
        };
      }
    },
  },
});
