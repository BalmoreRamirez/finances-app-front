// composables/useOptimizedApi.js
import { ref, computed } from 'vue';

const loadingStates = ref(new Map());
const errorStates = ref(new Map());

export function useOptimizedApi() {
  const setLoading = (key, value) => {
    loadingStates.value.set(key, value);
  };

  const setError = (key, error) => {
    errorStates.value.set(key, error);
  };

  const isLoading = (key) => {
    return computed(() => loadingStates.value.get(key) || false);
  };

  const getError = (key) => {
    return computed(() => errorStates.value.get(key) || null);
  };

  // Debounce para evitar múltiples llamadas
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Throttle para limitar llamadas
  const throttle = (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // Función para realizar llamadas optimizadas
  const optimizedCall = async (key, apiCall, options = {}) => {
    const { 
      useCache = true, 
      showLoading = true,
      retries = 3,
      retryDelay = 1000 
    } = options;

    if (showLoading) {
      setLoading(key, true);
    }
    
    setError(key, null);

    let attempt = 0;
    
    while (attempt < retries) {
      try {
        const result = await apiCall();
        
        if (showLoading) {
          setLoading(key, false);
        }
        
        return { success: true, data: result };
      } catch (error) {
        attempt++;
        
        if (attempt >= retries) {
          setError(key, error.message || 'Error en la operación');
          if (showLoading) {
            setLoading(key, false);
          }
          return { success: false, error: error.message };
        }
        
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  };

  return {
    setLoading,
    setError,
    isLoading,
    getError,
    debounce,
    throttle,
    optimizedCall
  };
}
