# Configuración de Transacciones con Backend

## Cambios Realizados

### 1. Nuevo Servicio de Transacciones (`transactionsService.js`)
- **Endpoint de transacciones**: `http://localhost:3006/transactions`
- **Endpoint de categorías**: `http://localhost:3006/transaction-categories` 
- **Endpoint de cuentas**: `http://localhost:3006/accounts`

### 2. Store Actualizado (`transactionStore.js`)
Transformación de datos al formato requerido por el backend:
```javascript
{
  "user_id": 1,
  "account_id": 2,
  "category_id": 1,
  "amount": 150.50,  // Positivo para ingresos, negativo para gastos
  "description": "Descripción de la transacción",
  "date": "2025-08-06"
}
```

### 3. Modal de Transacciones Actualizado (`TransaccionModal.vue`)
- Mapeo correcto entre campos del frontend y backend
- Soporte para editar transacciones existentes
- Validación de campos requeridos
- Uso de arrays de categorías del backend

### 4. Vista de Transacciones Actualizada (`TransaccionesView.vue`)
- Carga de datos del backend al montar el componente
- Manejo de estados de carga
- Notificaciones de éxito y error
- Visualización correcta de datos del backend

### 5. Manejo de Errores
- Integración con `useNotifications` composable
- Captura y visualización de errores del backend
- Mensajes de validación específicos

## Estructura de Datos

### Frontend → Backend (Crear/Actualizar)
```javascript
// Datos del formulario (frontend)
{
  tipo: 'gasto',           // 'ingreso' | 'gasto'
  monto: 150.50,           // Siempre positivo
  descripcion: 'Texto...',
  categoria: 1,            // category_id
  cuentaId: 2,             // account_id
  fecha: '2025-08-06'
}

// Se transforma a (backend)
{
  user_id: 1,              // Fijo por ahora (TODO: usuario autenticado)
  account_id: 2,
  category_id: 1,
  amount: -150.50,         // Negativo para gastos, positivo para ingresos
  description: 'Texto...',
  date: '2025-08-06'
}
```

### Backend → Frontend (Mostrar)
```javascript
// Datos del backend
{
  id: 1,
  user_id: 1,
  account_id: 2,
  category_id: 1,
  amount: -150.50,
  description: 'Texto...',
  date: '2025-08-06'
}

// Se muestra como
{
  id: 1,
  tipo: 'gasto',           // Calculado: amount < 0 ? 'gasto' : 'ingreso'
  monto: 150.50,           // Math.abs(amount)
  descripcion: 'Texto...',
  categoria: 1,
  cuentaId: 2,
  fecha: '2025-08-06'
}
```

## Endpoints Configurados

1. **Transacciones**
   - GET `/transactions` - Obtener todas las transacciones
   - POST `/transactions` - Crear nueva transacción
   - PATCH `/transactions/:id` - Actualizar transacción
   - DELETE `/transactions/:id` - Eliminar transacción

2. **Categorías de Transacciones**
   - GET `/transaction-categories` - Obtener categorías
   - POST `/transaction-categories` - Crear categoría
   - PATCH `/transaction-categories/:id` - Actualizar categoría
   - DELETE `/transaction-categories/:id` - Eliminar categoría

3. **Cuentas**
   - GET `/accounts` - Obtener cuentas

## Configuración
- Puerto del backend: 3006 (configurado en `.env` como `VITE_API_PORT=3006`)
- Base URL: `http://localhost:3006`

## Próximos Pasos
1. Implementar autenticación real para obtener el `user_id`
2. Agregar filtros y búsqueda de transacciones
3. Implementar paginación si hay muchas transacciones
4. Validaciones adicionales en el frontend
