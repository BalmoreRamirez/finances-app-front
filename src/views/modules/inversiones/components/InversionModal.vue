<script setup>
import {ref, watch, computed} from 'vue';
import {storeToRefs} from 'pinia';
import {useFinanceStore} from '../../../../stores/financeStore.js';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';

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
  inversionData: Object,
  tiposInversion: Array,
  cuentas: Array,
});
const emit = defineEmits(['update:visible', 'save']);

// Store
const store = useFinanceStore();
const {cuentas} = storeToRefs(store);

// State local
const localInversion = ref({});
const submitted = ref(false);

// Reglas de validación
const rules = computed(() => ({
  cuentaId: { required },
  cuentaDestinoId: { required },
  tipo: { required },
}));
const v$ = useVuelidate(rules, localInversion);

// Función helper para determinar el tipo basado en investment_type_id o tipo
const getTipoFromData = (data) => {
  if (data.tipo) return data.tipo;
  if (data.investment_type_id) {
    const tipoFound = props.tiposInversion.find(type => type.id === data.investment_type_id);
    return tipoFound ? tipoFound.value : null;
  }
  return null;
};

// Watcher para sincronizar props con el state local
watch(() => props.inversionData, (newData) => {
  if (newData) {
    // Mapeo de nombres para compatibilidad entre el padre y el modal
    localInversion.value = {
      cuentaId: newData.account_origen_id ?? newData.cuentaId ?? null,
      cuentaDestinoId: newData.account_destino_id ?? newData.cuentaDestinoId ?? null,
      tipo: newData.investment_type_id ? (props.tiposInversion.find(t => t.id === newData.investment_type_id)?.value) : (newData.tipo ?? null),
      descripcion: newData.investment_name ?? newData.descripcion ?? '',
      beneficiario: newData.beneficiary ?? newData.beneficiario ?? '',
      monto: newData.invested_amount ?? newData.monto ?? 0,
      interes: newData.interest ?? newData.interes ?? null,
      cantidad: newData.cantidad ?? 1,
      costoUnitario: newData.costoUnitario ?? 0,
      gananciaUnitaria: newData.gananciaUnitaria ?? 0,
      ganancia: newData.profit ?? newData.ganancia ?? 0,
      montoTotal: newData.total_amount ?? newData.montoTotal ?? 0,
      fechaInversion: newData.investment_date ? new Date(newData.investment_date + 'T00:00:00') : (newData.fechaInversion ? new Date(newData.fechaInversion + 'T00:00:00') : null),
      fechaVencimiento: newData.due_date ? new Date(newData.due_date + 'T00:00:00') : (newData.fechaVencimiento ? new Date(newData.fechaVencimiento + 'T00:00:00') : null),
      status: newData.status ?? newData.estado ?? '',
    };
  }
}, {deep: true, immediate: true});

// También watcher que se ejecute cuando tiposInversion se carga
watch([() => props.inversionData, () => props.tiposInversion], ([newData]) => {
  if (newData && props.tiposInversion.length > 0) {
    const tipoDetectado = getTipoFromData(newData);
    if (tipoDetectado && tipoDetectado !== localInversion.value.tipo) {
      localInversion.value.tipo = tipoDetectado;
    }
  }
}, {deep: true});

// --- LÓGICA DE CÁLCULO CENTRALIZADA ---

// Calcula el monto total invertido basado en el tipo
const montoCalculado = computed(() => {
  const inv = localInversion.value;
  if (inv.tipo === 'compra') { // Cambio: usar 'compra' en lugar de 'compraventa'
    return (inv.cantidad || 0) * (inv.costoUnitario || 0);
  }
  return inv.monto || 0;
});

// Calcula la ganancia estimada basado en el tipo
const gananciaCalculada = computed(() => {
  const inv = localInversion.value;
  if (inv.tipo === 'credito') {
    const monto = inv.monto || 0;
    const interes = inv.interes || 0;
    return monto * (interes / 100);
  }
  if (inv.tipo === 'compra') { // Cambio: usar 'compra' en lugar de 'compraventa'
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
  if (localInversion.value.tipo === 'compra') { // Cambio: usar 'compra' en lugar de 'compraventa'
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

const preparePayload = () => {
  // Buscar el id del tipo de inversión seleccionado
  let investmentTypeId = null;
  if (localInversion.value.tipo && Array.isArray(props.tiposInversion)) {
    const tipoObj = props.tiposInversion.find(t => t.value === localInversion.value.tipo);
    if (tipoObj) investmentTypeId = tipoObj.id;
  }
  return {
    account_origen_id: localInversion.value.cuentaId ? parseInt(localInversion.value.cuentaId) : null,
    account_destino_id: localInversion.value.cuentaDestinoId ? parseInt(localInversion.value.cuentaDestinoId) : null,
    investment_name: localInversion.value.descripcion?.trim() || '',
    investment_type_id: investmentTypeId,
    description: localInversion.value.descripcion?.trim() || '',
    beneficiary: localInversion.value.beneficiario?.trim() || '',
    invested_amount: localInversion.value.monto ? parseFloat(localInversion.value.monto) : null,
    interest: localInversion.value.interes !== null && localInversion.value.interes !== undefined && localInversion.value.interes !== '' ? parseFloat(localInversion.value.interes) : null,
    total_amount: localInversion.value.montoTotal ? parseFloat(localInversion.value.montoTotal) : null,
    profit: localInversion.value.ganancia ? parseFloat(localInversion.value.ganancia) : null,
    investment_date: localInversion.value.fechaInversion ? new Date(localInversion.value.fechaInversion).toISOString() : '',
    due_date: localInversion.value.fechaVencimiento ? new Date(localInversion.value.fechaVencimiento).toISOString() : '',
    status: localInversion.value.status?.trim() || ''
  };
};

const saveInversion = async () => {
  submitted.value = true;
  v$.value.$touch();

  if (v$.value.$invalid) {
    alert('Por favor completa todos los campos obligatorios.');
    return;
  }

  const payload = preparePayload();
  console.log('Payload preparado:', payload);
  emit('save', payload);
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
          <Dropdown id="tipo" v-model="localInversion.tipo" :options="props.tiposInversion"
                    optionLabel="label" optionValue="value" placeholder="Selecciona un tipo"
                    :class="{'p-invalid': submitted && !localInversion.tipo}"/>
        </div>
        <div>
          <label for="cuentaId" class="block text-sm font-medium text-gray-700 mb-1">Cuenta de Origen</label>
          <Dropdown id="cuentaId" v-model="localInversion.cuentaId" :options="cuentas" optionLabel="nombre"
                    optionValue="id" placeholder="Selecciona una cuenta"
                    :class="{'p-invalid': submitted && !localInversion.cuentaId}"/>
        </div>
        <div>
          <label for="cuentaDestinoId" class="block text-sm font-medium text-gray-700 mb-1">Cuenta de Destino</label>
          <Dropdown id="cuentaDestinoId" v-model="localInversion.cuentaDestinoId" :options="cuentas" optionLabel="nombre"
                    optionValue="id" placeholder="Selecciona una cuenta"
                    :class="{'p-invalid': submitted && !localInversion.cuentaDestinoId}"/>
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

      <!-- Campos Condicionales para Compra -->
      <div v-if="localInversion.tipo === 'compra'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
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