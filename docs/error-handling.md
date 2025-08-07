# Sistema de Manejo de Errores y Notificaciones

Este documento describe cómo funciona el nuevo sistema de manejo de errores del backend y notificaciones en la aplicación.

## Arquitectura

### 1. Stores (Pinia)
Los stores ahora devuelven objetos con información sobre el éxito o error de las operaciones:

```javascript
// ✅ Éxito
{
  success: true,
  message: "Operación completada exitosamente"
}

// ❌ Error
{
  success: false,
  error: "Mensaje de error específico del backend"
}
```

### 2. Composable useNotifications
Se creó un composable que puede funcionar tanto en componentes Vue como fuera del contexto de componentes:

```javascript
import { useNotifications } from '@/composables/useNotifications'

const notifications = useNotifications()

// Mostrar notificaciones
notifications.showSuccess("Éxito", "Operación completada")
notifications.showError("Error", "Algo salió mal")
notifications.showWarning("Advertencia", "Revisa los datos")
notifications.showInfo("Información", "Datos actualizados")

// Manejo automático de errores del backend
notifications.handleBackendError(error, "Mensaje por defecto")
```

## Uso en Componentes

### Ejemplo con Inversiones

```vue
<script setup>
import { useToast } from "primevue/usetoast"
import { useInversionesStore } from "@/stores/investmentStore"

const toast = useToast()
const store = useInversionesStore()

const handleCreateInvestment = async (data) => {
  const result = await store.addInvestment(data)
  
  if (result.success) {
    toast.add({
      severity: "success",
      summary: "Éxito",
      detail: result.message,
      life: 3000,
    })
    // Continuar con la lógica de éxito
  } else {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: result.error,
      life: 5000,
    })
  }
}
</script>
```

## Manejo de Errores del Backend

El sistema detecta automáticamente diferentes tipos de errores:

### 1. Errores de Validación
```json
{
  "errors": [
    {"message": "El campo nombre es requerido"},
    {"message": "El email debe ser válido"}
  ]
}
```

### 2. Errores por Campo
```json
{
  "errors": {
    "email": ["El email ya está en uso"],
    "password": ["La contraseña debe tener al menos 8 caracteres"]
  }
}
```

### 3. Errores Generales
```json
{
  "message": "No tienes permisos para realizar esta acción"
}
```

### 4. Errores de Estado HTTP
- **401**: "No tienes autorización para realizar esta acción"
- **403**: "Acceso denegado"
- **404**: "Recurso no encontrado"
- **500**: "Error interno del servidor. Intenta nuevamente más tarde"

## Beneficios

1. **Consistencia**: Todos los errores se manejan de la misma manera
2. **Flexibilidad**: Funciona en componentes y stores
3. **Mensajes Claros**: Los errores del backend se muestran tal como los envía el servidor
4. **Fallback**: Si no hay un mensaje específico, se muestra un mensaje por defecto
5. **Logging**: Los errores se siguen registrando en la consola para debugging

## Migración de Código Existente

### Antes
```javascript
try {
  await service.createData(data)
  // Éxito asumido
} catch (error) {
  console.error(error)
  // Sin notificación al usuario
}
```

### Después
```javascript
const result = await store.createData(data)
if (result.success) {
  toast.add({
    severity: "success",
    summary: "Éxito",
    detail: result.message,
    life: 3000,
  })
} else {
  toast.add({
    severity: "error",
    summary: "Error", 
    detail: result.error,
    life: 5000,
  })
}
```

## Servicios Actualizados

- ✅ `investmentStore.js` - Inversiones
- ⏳ `accountStore.js` - Cuentas (en progreso)
- ⏳ `transactionStore.js` - Transacciones (pendiente)
- ⏳ `financeStore.js` - Finanzas generales (pendiente)
