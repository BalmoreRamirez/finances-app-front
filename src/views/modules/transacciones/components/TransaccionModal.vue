<script setup>
import {ref, watch, computed} from 'vue';
import {storeToRefs} from 'pinia';
import {useFinanceStore} from '../../../../stores/financeStore.js';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import SelectButton from 'primevue/selectbutton';
import Divider from 'primevue/divider';

const props = defineProps({
  visible: Boolean,
  transaccionToEdit: Object
});

const emit = defineEmits(['update:visible', 'save']);

// Store
const store = useFinanceStore();
const {cuentas, deudas, tipoTransaccionOptions, categoriasTransaccion} = storeToRefs(store);

// Local state
const transaccion = ref({});
const submitted = ref(false);
const categoriaPersonalizada = ref('');
const mostrarInputPersonalizado = ref(false);

// Computed para obtener las categorías según el tipo seleccionado
const categoriaOptions = computed(() => {
  const tipo = transaccion.value.tipo || 'gasto';
  return categoriasTransaccion.value[tipo] || [];
});

// Watch para manejar cambios en el tipo y categoría
watch(() => transaccion.value.tipo, () => {
  transaccion.value.categoria = '';
  mostrarInputPersonalizado.value = false;
  categoriaPersonalizada.value = '';
});

watch(() => transaccion.value.categoria, (newValue) => {
  mostrarInputPersonalizado.value = newValue === 'otra';
});

watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    submitted.value = false;
    mostrarInputPersonalizado.value = false;
    categoriaPersonalizada.value = '';

    if (props.transaccionToEdit) {
      transaccion.value = {
        ...props.transaccionToEdit,
        fecha: new Date(props.transaccionToEdit.fecha)
      };

      const tipoActual = props.transaccionToEdit.tipo;
      const categoriasDisponibles = categoriasTransaccion.value[tipoActual] || [];
      const categoriaExistente = categoriasDisponibles.find(
          cat => cat.value === props.transaccionToEdit.categoria
      );

      if (!categoriaExistente && props.transaccionToEdit.categoria) {
        mostrarInputPersonalizado.value = true;
        transaccion.value.categoria = 'otra';
        categoriaPersonalizada.value = props.transaccionToEdit.categoria;
      }
    } else {
      transaccion.value = {
        tipo: 'gasto',
        descripcion: '',
        monto: null,
        categoria: '',
        fecha: new Date(),
        cuentaId: null,
        cuentaDestinoId: null,
        deudaId: null,
      };
    }
  }
});

const closeModal = () => emit('update:visible', false);

const saveTransaccion = () => {
  submitted.value = true;

  let isValid = transaccion.value.descripcion && transaccion.value.monto > 0;

  if (!transaccion.value.categoria || (transaccion.value.categoria === 'otra' && !categoriaPersonalizada.value)) {
    isValid = false;
  }

  if (transaccion.value.tipo === 'ingreso' || transaccion.value.tipo === 'gasto') {
    isValid = isValid && transaccion.value.cuentaId;
  } else if (transaccion.value.tipo === 'transferencia') {
    isValid = isValid &&
        transaccion.value.cuentaId &&
        transaccion.value.cuentaDestinoId &&
        transaccion.value.cuentaId !== transaccion.value.cuentaDestinoId;
  } else if (transaccion.value.tipo === 'pago-deuda') {
    isValid = isValid &&
        transaccion.value.cuentaId &&
        transaccion.value.deudaId;
  }

  if (isValid) {
    const dataToSave = {
      ...transaccion.value,
      fecha: transaccion.value.fecha.toISOString().slice(0, 10),
      categoria: transaccion.value.categoria === 'otra' ? categoriaPersonalizada.value : transaccion.value.categoria
    };
    emit('save', dataToSave);
    closeModal();
  }
};

const modalTitle = computed(() => {
  const accion = transaccion.value.id ? 'Editar' : 'Agregar';
  return `${accion} Transacción`;
});

const muestraCuentaOrigen = computed(() =>
    ['ingreso', 'gasto', 'transferencia', 'pago-deuda'].includes(transaccion.value.tipo)
);

const muestraCuentaDestino = computed(() =>
    transaccion.value.tipo === 'transferencia'
);

const muestraDeuda = computed(() =>
    transaccion.value.tipo === 'pago-deuda'
);

const descripcionPlaceholder = computed(() => {
  switch (transaccion.value.tipo) {
    case 'ingreso':
      return 'Ej: Pago de salario';
    case 'gasto':
      return 'Ej: Compra de supermercado';
    case 'transferencia':
      return 'Ej: Ahorros para vacaciones';
    case 'pago-deuda':
      return 'Ej: Abono a tarjeta de crédito';
    default:
      return 'Descripción';
  }
});
</script>

<template>
  <Dialog
      :visible="visible"
      :style="{ width: '550px' }"
      :header="modalTitle"
      :modal="true"
      class="p-fluid"
      @update:visible="closeModal"
      :contentClass="'bg-gray-50'"
  >
    <!-- MEJORADO: Tipo de transacción con mejor UI y colores -->
    <div class="mb-5">
      <label class="block mb-2 text-sm font-semibold text-gray-700">Tipo de Transacción</label>
      <SelectButton
          v-model="transaccion.tipo"
          :options="tipoTransaccionOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full grid grid-cols-2 sm:grid-cols-4 gap-2"
      >
        <template #option="slotProps">
          <div class="flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200"
               :class="{
                  'bg-green-100 border-green-500 text-green-800 shadow-sm': transaccion.tipo === slotProps.option.value && slotProps.option.value === 'ingreso',
                  'bg-red-100 border-red-500 text-red-800 shadow-sm': transaccion.tipo === slotProps.option.value && slotProps.option.value === 'gasto',
                  'bg-blue-100 border-blue-500 text-blue-800 shadow-sm': transaccion.tipo === slotProps.option.value && slotProps.option.value === 'transferencia',
                  'bg-yellow-100 border-yellow-500 text-yellow-800 shadow-sm': transaccion.tipo === slotProps.option.value && slotProps.option.value === 'pago-deuda',
                  'bg-white border-gray-300 hover:bg-gray-100 hover:border-gray-400': transaccion.tipo !== slotProps.option.value
               }">
            <i :class="[slotProps.option.icon, 'text-xl mb-1']"></i>
            <span class="text-sm font-medium">{{ slotProps.option.label }}</span>
          </div>
        </template>
      </SelectButton>
    </div>

    <Divider/>

    <!-- MEJORADO: Espaciado y layout del formulario -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2">
      <!-- Columna izquierda -->
      <div class="space-y-4">
        <!-- Descripción -->
        <div>
          <label for="descripcion" class="block mb-2 text-sm font-medium text-gray-600">Descripción</label>
          <InputText id="descripcion" v-model.trim="transaccion.descripcion" required autofocus
                     :placeholder="descripcionPlaceholder"
                     :class="{'p-invalid': submitted && !transaccion.descripcion}"/>
          <small v-if="submitted && !transaccion.descripcion" class="p-error">La descripción es requerida.</small>
        </div>

        <!-- Monto -->
        <div>
          <label for="monto" class="block mb-2 text-sm font-medium text-gray-600">Monto</label>
          <InputNumber id="monto" v-model="transaccion.monto" mode="currency" currency="MXN" locale="es-MX" required
                       :min="0" :class="{'p-invalid': submitted && (!transaccion.monto || transaccion.monto <= 0)}"/>
          <small v-if="submitted && (!transaccion.monto || transaccion.monto <= 0)" class="p-error">Monto
            inválido.</small>
        </div>

        <!-- Categoría -->
        <div>
          <label for="categoria" class="block mb-2 text-sm font-medium text-gray-600">Categoría</label>
          <Dropdown id="categoria" v-model="transaccion.categoria" :options="categoriaOptions" optionLabel="label"
                    optionValue="value" placeholder="Selecciona categoría"
                    :class="{'p-invalid': submitted && !transaccion.categoria}"/>
          <small v-if="submitted && !transaccion.categoria" class="p-error">Categoría requerida.</small>
        </div>

        <!-- Input personalizado para categoría -->
        <div v-if="mostrarInputPersonalizado">
          <label for="categoriaPersonalizada" class="block mb-2 text-sm font-medium text-gray-600">Especificar
            categoría</label>
          <InputText id="categoriaPersonalizada" v-model.trim="categoriaPersonalizada"
                     placeholder="Escribe la categoría"
                     :class="{'p-invalid': submitted && transaccion.categoria === 'otra' && !categoriaPersonalizada}"/>
          <small v-if="submitted && transaccion.categoria === 'otra' && !categoriaPersonalizada" class="p-error">Debes
            especificar la categoría.</small>
        </div>
      </div>

      <!-- Columna derecha -->
      <div class="space-y-4">
        <!-- Fecha -->
        <div>
          <label for="fecha" class="block mb-2 text-sm font-medium text-gray-600">Fecha</label>
          <Calendar id="fecha" v-model="transaccion.fecha" dateFormat="dd/mm/yy" showIcon class="w-full"/>
        </div>

        <!-- Cuenta origen -->
        <div v-if="muestraCuentaOrigen">
          <label for="cuenta" class="block mb-2 text-sm font-medium text-gray-600">{{
              transaccion.tipo === 'transferencia' ? 'Cuenta Origen' : 'Cuenta'
            }}</label>
          <Dropdown id="cuenta" v-model="transaccion.cuentaId" :options="cuentas" optionLabel="nombre" optionValue="id"
                    placeholder="Selecciona una cuenta" :class="{'p-invalid': submitted && !transaccion.cuentaId}"/>
          <small v-if="submitted && muestraCuentaOrigen && !transaccion.cuentaId" class="p-error">Cuenta
            requerida.</small>
        </div>

        <!-- Cuenta destino -->
        <div v-if="muestraCuentaDestino">
          <label for="cuentaDestino" class="block mb-2 text-sm font-medium text-gray-600">Cuenta Destino</label>
          <Dropdown id="cuentaDestino" v-model="transaccion.cuentaDestinoId"
                    :options="cuentas.filter(c => c.id !== transaccion.cuentaId)" optionLabel="nombre" optionValue="id"
                    placeholder="Selecciona destino" :class="{'p-invalid': submitted && !transaccion.cuentaDestinoId}"/>
          <small v-if="submitted && muestraCuentaDestino && !transaccion.cuentaDestinoId" class="p-error">Destino
            requerido.</small>
          <small v-if="submitted && transaccion.cuentaId === transaccion.cuentaDestinoId && transaccion.cuentaDestinoId"
                 class="p-error">Cuentas deben ser diferentes.</small>
        </div>

        <!-- Deuda (solo para pago de deuda) -->
        <div v-if="muestraDeuda">
          <label for="deuda" class="block mb-2 text-sm font-medium text-gray-600">Deuda a pagar</label>
          <Dropdown id="deuda" v-model="transaccion.deudaId" :options="deudas" optionLabel="nombre" optionValue="id"
                    placeholder="Selecciona la deuda" :class="{'p-invalid': submitted && !transaccion.deudaId}"/>
          <small v-if="submitted && muestraDeuda && !transaccion.deudaId" class="p-error">Debes seleccionar una
            deuda.</small>
        </div>
      </div>
    </div>

    <!-- MEJORADO: Botones de acción con estilos más claros -->
    <template #footer>
      <div class="flex justify-end gap-2 pt-4">
        <Button label="Cancelar" icon="pi pi-times" @click="closeModal" class="p-button-text text-gray-700"/>
        <Button label="Guardar" icon="pi pi-check" @click="saveTransaccion"
                class="p-button-primary bg-blue-600 hover:bg-blue-700 border-blue-600"/>
      </div>
    </template>
  </Dialog>
</template>