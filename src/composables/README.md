# Composable useNotifications

Este composable centraliza el manejo de notificaciones y errores del backend en la aplicación.

## Funciones Disponibles

### showSuccess(summary, detail, life)
Muestra una notificación de éxito.

### showError(summary, detail, life) 
Muestra una notificación de error.

### showWarning(summary, detail, life)
Muestra una notificación de advertencia.

### showInfo(summary, detail, life)
Muestra una notificación informativa.

### handleBackendError(error, defaultMessage)
Procesa automáticamente errores del backend y muestra la notificación apropiada.

## Tipos de Errores Manejados

El composable maneja automáticamente diferentes tipos de errores del backend:

1. **Mensajes específicos del backend**: `error.response.data.message`
2. **Errores de validación (array)**: `error.response.data.errors` 
3. **Errores por campo (objeto)**: `error.response.data.errors`
4. **Errores generales**: `error.response.data.error`
5. **Detalles**: `error.response.data.detail`
6. **Errores de conexión**: `ECONNREFUSED`, `NETWORK_ERROR`
7. **Códigos de estado HTTP**: 401, 403, 404, 500

## Ejemplo de Uso en Store

```javascript
import { useNotifications } from "../composables/useNotifications";

export const useExampleStore = defineStore("example", {
  actions: {
    _initNotifications() {
      if (!this._notifications) {
        this._notifications = useNotifications();
      }
      return this._notifications;
    },
    
    async createItem(data) {
      try {
        await api.post('/items', data);
        const notifications = this._initNotifications();
        notifications.showSuccess("Éxito", "Elemento creado correctamente");
        return true;
      } catch (error) {
        const notifications = this._initNotifications();
        notifications.handleBackendError(error, "Error al crear elemento");
        return false;
      }
    }
  }
});
```

## Ejemplo de Respuestas del Backend

### Error de validación con array:
```json
{
  "errors": [
    { "message": "El nombre es requerido" },
    { "message": "El email debe ser válido" }
  ]
}
```

### Error de validación por campos:
```json
{
  "errors": {
    "name": ["El nombre es requerido"],
    "email": ["El email debe ser válido", "El email ya existe"]
  }
}
```

### Error con mensaje específico:
```json
{
  "message": "No tienes permisos para realizar esta acción"
}
```

Todas estas estructuras son procesadas automáticamente por `handleBackendError()`.
