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
  actions: {
    async fetchInvestments() {
      try {
        const response = await investmentsService.getInvestments();
        this.investments = response.data;
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
        await investmentsService.createInvestment(inversionData);
        await this.fetchInvestments();
        return { success: true, message: "Inversión creada correctamente" };
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
        await investmentsService.updateInvestment(inversionId, inversionData);
        await this.fetchInvestments();
        return { success: true, message: "Inversión actualizada correctamente" };
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
        await this.fetchInvestments();
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
        await investmentsService.addPayment(investmentId, pagoData);
        await this.fetchPaymentsByInvestment(investmentId);
        return { success: true, message: "Pago registrado correctamente" };
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
        await this.fetchPaymentsByInvestment(investmentId);
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
