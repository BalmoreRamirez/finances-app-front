import { useToast } from "primevue/usetoast";
import { getCurrentInstance } from "vue";

export function useNotifications() {
  let toast = null;
  
  try {
    // Intentar obtener el toast si estamos en un contexto de componente Vue
    const instance = getCurrentInstance();
    if (instance) {
      toast = useToast();
    }
  } catch (error) {
    // Si no estamos en un contexto de componente, toast será null
    console.warn("Toast service no disponible en este contexto");
  }

  const showSuccess = (summary, detail, life = 3000) => {
    if (toast) {
      toast.add({
        severity: "success",
        summary,
        detail,
        life,
      });
    } else {
      console.log(`✅ SUCCESS: ${summary} - ${detail}`);
    }
  };

  const showError = (summary, detail, life = 5000) => {
    if (toast) {
      toast.add({
        severity: "error",
        summary,
        detail,
        life,
      });
    } else {
      console.error(`❌ ERROR: ${summary} - ${detail}`);
    }
  };

  const showWarning = (summary, detail, life = 4000) => {
    if (toast) {
      toast.add({
        severity: "warn",
        summary,
        detail,
        life,
      });
    } else {
      console.warn(`⚠️ WARNING: ${summary} - ${detail}`);
    }
  };

  const showInfo = (summary, detail, life = 3000) => {
    if (toast) {
      toast.add({
        severity: "info",
        summary,
        detail,
        life,
      });
    } else {
      console.info(`ℹ️ INFO: ${summary} - ${detail}`);
    }
  };

  const handleBackendError = (error, defaultMessage = "Ha ocurrido un error") => {
    let errorMessage = defaultMessage;
    
    if (error?.response?.data) {
      const errorData = error.response.data;
      
      // Si el backend devuelve un mensaje de error específico
      if (errorData.message) {
        errorMessage = errorData.message;
      }
      // Si el backend devuelve errores de validación (array de errores)
      else if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.map(err => err.message || err).join(', ');
      }
      // Si el backend devuelve un objeto con errores por campo
      else if (errorData.errors && typeof errorData.errors === 'object') {
        const fieldErrors = Object.values(errorData.errors).flat();
        errorMessage = fieldErrors.join(', ');
      }
      // Si hay un error general en el response
      else if (errorData.error) {
        errorMessage = errorData.error;
      }
      // Si hay un detail
      else if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    }
    // Si es un error de red o conexión
    else if (error?.code === 'ECONNREFUSED' || error?.code === 'NETWORK_ERROR') {
      errorMessage = "Error de conexión. Verifica tu conexión a internet.";
    }
    // Si es un error 500
    else if (error?.response?.status === 500) {
      errorMessage = "Error interno del servidor. Intenta nuevamente más tarde.";
    }
    // Si es un error 404
    else if (error?.response?.status === 404) {
      errorMessage = "Recurso no encontrado.";
    }
    // Si es un error 401
    else if (error?.response?.status === 401) {
      errorMessage = "No tienes autorización para realizar esta acción.";
    }
    // Si es un error 403
    else if (error?.response?.status === 403) {
      errorMessage = "Acceso denegado.";
    }

    showError("Error", errorMessage);
    return errorMessage;
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    handleBackendError,
    isToastAvailable: !!toast,
  };
}
