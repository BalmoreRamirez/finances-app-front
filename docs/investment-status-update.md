# Actualización: Select de Estado en Inversiones

## Cambios Realizados

### 1. Nuevos Estados de Inversión

Se agregaron tres estados posibles para las inversiones:

- **Activa**: Estado por defecto al crear una nueva inversión
- **Actualizada**: Para inversiones que han sido modificadas
- **Cancelada**: Para inversiones canceladas o finalizadas

### 2. Campo de Estado en el Modal

#### Comportamiento:
- **Al crear**: El campo de estado NO se muestra y se asigna automáticamente "activa"
- **Al editar**: El campo de estado SÍ se muestra y permite seleccionar entre los tres estados

#### Código del campo:
```vue
<!-- Campo de Estado (solo en modo edición) -->
<div v-if="props.isEditMode">
  <Select
    v-model="v$.status.$model"
    :errors="v$.status.$errors"
    :items="estadosInversion"
    optionLabel="nombre"
    placeholder="Estado de la Inversión*"
    class="w-full"
  />
</div>
```

### 3. Validación

El campo de estado es **obligatorio** cuando se muestra (modo edición):

```javascript
status: {
  required: helpers.withMessage("El estado es obligatorio.", required),
},
```

### 4. Manejo de Datos

#### Opciones de estado:
```javascript
const estadosInversion = ref([
  { nombre: "Activa", value: "activa" },
  { nombre: "Actualizada", value: "actualizada" },
  { nombre: "Cancelada", value: "cancelada" },
]);
```

#### Al guardar:
```javascript
status: data.value.status?.value ?? "activa",
```

#### Al cargar datos existentes:
```javascript
data.value.status = estadosInversion.value.find(
  (s) => s.value === (newData.status || "activa")
) || estadosInversion.value[0];
```

### 5. Experiencia de Usuario

1. **Crear nueva inversión**:
   - No se muestra el campo de estado
   - Se asigna automáticamente "activa"

2. **Editar inversión existente**:
   - Se muestra el campo de estado
   - Permite cambiar entre: Activa, Actualizada, Cancelada
   - Es obligatorio seleccionar un estado

### 6. Flujo de Datos

```
Modal → Parent Component → Store → Backend API
```

El valor seleccionado se envía como string al backend:
- `"activa"`
- `"actualizada"` 
- `"cancelada"`

## Ejemplo de Uso

```javascript
// Al crear una nueva inversión
const nuevaInversion = {
  investment_type_id: 1,
  name: "Mi Inversión",
  principal: 10000,
  expected_return: 12000,
  account_id: 1,
  start_date: "2024-01-01",
  end_date: "2024-12-31",
  status: "activa", // Asignado automáticamente
  notes: "Comentario de la inversión"
};

// Al actualizar una inversión
const inversionActualizada = {
  // ... otros campos
  status: "actualizada" // Seleccionado por el usuario
};
```
