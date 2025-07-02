<script setup>
import {ref, watch, computed, onMounted} from 'vue';
import {storeToRefs} from 'pinia';
import {useFinanceStore} from '../../../../stores/financeStore.js';

// Componentes de PrimeVue
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';

// Props y Emits
const props = defineProps({
  visible: Boolean,
  isEditMode: Boolean,
  inversionData: Object
});
const emit = defineEmits(['update:visible', 'save']);

// Store
const store = useFinanceStore();
const {cuentas} = storeToRefs(store);
const {fetchAccounts} = store;

// State local
const localInversion = ref({});
const submitted = ref(false);
const tiposInversion = ref([
  {label: 'Crédito', value: 'credito'},
  {label: 'Compra-Venta', value: 'compraventa'}
]);

// Cargar cuentas
onMounted(() => {
  if (cuentas.value.length === 0) {
    fetchAccounts();
  }
});

// Watcher para sincronizar props con el state local
watch(() => props.inversionData, (newData) => {
  if (newData) {
    // Inicializa el estado local con los datos de la inversión
    localInversion.value = {
      ...newData,
      // Asegura valores iniciales para los campos de compra-venta
      cantidad: newData.cantidad || 1,
      costoUnitario: newData.costoUnitario || (newData.tipo !== 'credito' ? newData.monto : 0) || 0,
      gananciaUnitaria: newData.gananciaUnitaria || 0,
    };
    // Manejo de fechas para edición
    if (typeof newData.fechaInversion === 'string') {
      localInversion.value.fechaInversion = new Date(newData.fechaInversion + 'T00:00:00');
    }
    if (typeof newData.fechaVencimiento === 'string' && newData.fechaVencimiento) {
      localInversion.value.fechaVencimiento = new Date(newData.fechaVencimiento + 'T00:00:00');
    }
  }
}, {deep: true, immediate: true});


// --- LÓGICA DE CÁLCULO CENTRALIZADA ---

// Calcula el monto total invertido basado en el tipo
const montoCalculado = computed(() => {
  const inv = localInversion.value;
  if (inv.tipo === 'compraventa') {
    return (inv.cantidad || 0) * (inv.costoUnitario || 0);
  }
  // Para 'credito', el monto se ingresa directamente
  return inv.monto || 0;
});

// Calcula la ganancia estimada basada en el tipo
const gananciaCalculada = computed(() => {
  const inv = localInversion.value;
  if (inv.tipo === 'credito') {
    const monto = inv.monto || 0;
    const interes = inv.interes || 0;
    return monto * (interes / 100);
  }
  if (inv.tipo === 'compraventa') {
    return (inv.cantidad || 0) * (inv.gananciaUnitaria || 0);
  }
  return 0;
});

// Calcula el monto total a recibir
const montoTotalCalculado = computed(() => {
  return montoCalculado.value + gananciaCalculada.value;
});

// Watcher para actualizar el objeto principal con los valores calculados
watch([montoCalculado, gananciaCalculada, montoTotalCalculado], ([newMonto, newGanancia, newMontoTotal]) => {
  // Solo actualiza el monto para compra-venta, para crédito es entrada manual
  if (localInversion.value.tipo === 'compraventa') {
    localInversion.value.monto = newMonto;
  }
  localInversion.value.ganancia = newGanancia;
  localInversion.value.montoTotal = newMontoTotal;
});

// --- MÉTODOS ---

const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(value);
};

const closeModal = () => {
  emit('update:visible', false);
  submitted.value = false;
};

const saveInversion = () => {
  submitted.value = true;
  const inv = localInversion.value;
  const isValid = inv.descripcion && inv.tipo && inv.cuentaId && inv.monto > 0;

  if (!isValid) return;

  // Formatear fechas a string YYYY-MM-DD antes de emitir
  if (inv.fechaInversion instanceof Date) {
    inv.fechaInversion = inv.fechaInversion.toISOString().split('T')[0];
  }
  if (inv.fechaVencimiento instanceof Date) {
    inv.fechaVencimiento = inv.fechaVencimiento.toISOString().split('T')[0];
  }
  emit('save', inv);
  closeModal();
};
</script>

<template>
  <Dialog :visible="props.visible" :style="{ width: '650px' }"
          :header="props.isEditMode ? 'Editar Inversión' : 'Registrar Inversión'" modal class="p-fluid"
          @update:visible="closeModal">
    <div class="space-y-6 p-4">
      <!-- Campos Comunes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="tipo" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Inversión</label>
          <Dropdown id="tipo" v-model="localInversion.tipo" :options="tiposInversion"
                    optionLabel="label" optionValue="value" placeholder="Selecciona un tipo"
                    :class="{'p-invalid': submitted && !localInversion.tipo}"/>
        </div>
        <div>
          <label for="cuentaId" class="block text-sm font-medium text-gray-700 mb-1">Cuenta de Origen</label>
          <Dropdown id="cuentaId" v-model="localInversion.cuentaId" :options="cuentas" optionLabel="nombre"
                    optionValue="id" placeholder="Selecciona una cuenta"
                    :class="{'p-invalid': submitted && !localInversion.cuentaId}"/>
        </div>
      </div>
      <div>
        <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <InputText id="descripcion" v-model.trim="localInversion.descripcion" required
                   :class="{'p-invalid': submitted && !localInversion.descripcion}"/>
      </div>
      <div v-if="localInversion.tipo === 'credito'">
        <label for="beneficiario" class="block text-sm font-medium text-gray-700 mb-1">Beneficiario
          (Prestatario)</label>
        <InputText id="beneficiario" v-model.trim="localInversion.beneficiario"/>
      </div>

      <!-- Campos Condicionales para Compra-Venta -->
      <div v-if="localInversion.tipo === 'compraventa'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="cantidad" class="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
          <InputNumber id="cantidad" v-model="localInversion.cantidad" :min="1"/>
        </div>
        <div>
          <label for="costoUnitario" class="block text-sm font-medium text-gray-700 mb-1">Costo Unitario</label>
          <InputNumber id="costoUnitario" v-model="localInversion.costoUnitario" mode="currency" currency="MXN"
                       locale="es-MX"/>
        </div>
        <div>
          <label for="gananciaUnitaria" class="block text-sm font-medium text-gray-700 mb-1">Ganancia Unitaria</label>
          <InputNumber id="gananciaUnitaria" v-model="localInversion.gananciaUnitaria" mode="currency" currency="MXN"
                       locale="es-MX"/>
        </div>
      </div>

      <!-- Campos Condicionales para Crédito -->
      <div v-if="localInversion.tipo === 'credito'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="monto" class="block text-sm font-medium text-gray-700 mb-1">Monto del Préstamo</label>
          <InputNumber id="monto" v-model="localInversion.monto" mode="currency" currency="MXN" locale="es-MX" required
                       :class="{'p-invalid': submitted && !(localInversion.monto > 0)}"/>
        </div>
        <div>
          <label for="interes" class="block text-sm font-medium text-gray-700 mb-1">Tasa de Interés (%)</label>
          <InputNumber id="interes" v-model="localInversion.interes" suffix=" %" :min="0"/>
        </div>
      </div>

      <!-- Resumen de Cálculos (siempre visible) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-3 rounded-md">
        <div>
          <p class="text-sm text-gray-500">Monto Total Invertido</p>
          <p class="font-semibold text-gray-800">{{ formatCurrency(montoCalculado) }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Ganancia Estimada</p>
          <p class="font-semibold text-green-600">{{ formatCurrency(gananciaCalculada) }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Monto Total a Recibir</p>
          <p class="font-semibold text-blue-600">{{ formatCurrency(montoTotalCalculado) }}</p>
        </div>
      </div>

      <!-- Fechas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="fechaInversion" class="block text-sm font-medium text-gray-700 mb-1">Fecha de Inversión /
            Compra</label>
          <Calendar id="fechaInversion" v-model="localInversion.fechaInversion" dateFormat="dd/mm/yy" showIcon/>
        </div>
        <div>
          <label for="fechaVencimiento" class="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento /
            Venta</label>
          <Calendar id="fechaVencimiento" v-model="localInversion.fechaVencimiento" dateFormat="dd/mm/yy" showIcon/>
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" text @click="closeModal"/>
      <Button label="Guardar" icon="pi pi-check" @click="saveInversion"/>
    </template>
  </Dialog>
</template>