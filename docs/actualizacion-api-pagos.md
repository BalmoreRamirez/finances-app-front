# Actualización API de Pagos de Inversiones

## Cambios Realizados

### 1. 🔄 Actualización del Servicio (`investmentsService.js`)

**Antes:**
```javascript
addPayment: (paymentData) => {
    return api.post('/investment-credit-payments', paymentData);
}
```

**Después:**
```javascript
addPayment: (investmentId, paymentData) => {
    return api.post(`/investment-credit-payments/${investmentId}`, paymentData);
}
```

### 2. 📝 Nueva Estructura de Datos

**Estructura enviada al backend:**
```javascript
{
  "investment_id": 6,
  "date": "2025-08-06",
  "amount": 50,
  "description": "Pago de intereses - Mes 1",
  "is_income": true,  // Por defecto
  "paid": true        // Por defecto
}
```

**URL del endpoint:**
```
POST http://localhost:3006/investment-credit-payments/{investment_id}
```

### 3. 🏪 Actualización del Store (`investmentStore.js`)

```javascript
async addPayment(pagoData) {
  try {
    const { investment_id, ...paymentPayload } = pagoData;
    await investmentsService.addPayment(investment_id, paymentPayload);
    await this.fetchPaymentsByInvestment(investment_id);
    return { success: true, message: "Pago registrado correctamente" };
  } catch (error) {
    console.error("Error al agregar el pago:", error);
    return { 
      success: false, 
      error: extractErrorMessage(error, "Error al agregar el pago")
    };
  }
}
```

### 4. 🎯 Actualización del Componente (`DetalleCreditoView.vue`)

**Nueva función `guardarPago`:**
```javascript
const guardarPago = async () => {
  // ... validaciones

  const paymentData = {
    investment_id: credito.value.id,
    date: nuevoPago.value.fecha.toISOString().slice(0, 10), // YYYY-MM-DD
    amount: nuevoPago.value.monto,
    description: nuevoPago.value.descripcion,
    is_income: true, // Por defecto
    paid: true       // Por defecto
  };

  const result = await addPayment(paymentData);

  if (result.success) {
    // Manejo de éxito con notificaciones mejoradas
  } else {
    // Manejo de errores con mensajes específicos
  }
};
```

## Mapeo de Campos

| Campo Frontend | Campo Backend | Tipo | Descripción |
|----------------|---------------|------|-------------|
| `credito.value.id` | `investment_id` | number | ID de la inversión |
| `nuevoPago.value.fecha` | `date` | string | Fecha en formato YYYY-MM-DD |
| `nuevoPago.value.monto` | `amount` | number | Monto del pago |
| `nuevoPago.value.descripcion` | `description` | string | Descripción del pago |
| _(fijo)_ | `is_income` | boolean | Siempre `true` |
| _(fijo)_ | `paid` | boolean | Siempre `true` |

## Mejoras Implementadas

### ✅ **Manejo de Respuestas Mejorado**
- El store ahora devuelve objetos con `success`, `message` y `error`
- Mejor manejo de errores en el componente
- Notificaciones más específicas al usuario

### ✅ **Estructura de URL Correcta**
- URL RESTful: `/investment-credit-payments/{investment_id}`
- Separación clara del ID de la inversión en la URL
- Payload limpio sin duplicar el `investment_id`

### ✅ **Campos por Defecto**
- `is_income: true` - Marca todos los pagos como ingresos
- `paid: true` - Marca todos los pagos como completados

### ✅ **Validación de Formato**
- Fecha convertida a formato ISO (YYYY-MM-DD)
- Validación de tipos de datos
- Manejo de errores de validación

## Ejemplo de Uso

### Crear un Pago
```javascript
const paymentData = {
  investment_id: 6,
  date: "2025-08-06",
  amount: 500.50,
  description: "Pago de intereses - Mes 1",
  is_income: true,
  paid: true
};

// Se enviará a: POST /investment-credit-payments/6
const result = await addPayment(paymentData);
```

### Respuesta Esperada
```javascript
{
  success: true,
  message: "Pago registrado correctamente"
}
```

## Compatibilidad

✅ Compatible con la API backend esperada
✅ Mantiene la funcionalidad existente
✅ Mejora el manejo de errores
✅ Formato de datos consistente
