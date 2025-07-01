<script setup>
import {ref, onMounted, computed, onUnmounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useFinanceStore} from '../../../../stores/financeStore.js';
import {storeToRefs} from 'pinia';
import {useConfirm} from 'primevue/useconfirm';
import {useToast} from 'primevue/usetoast';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import ProgressBar from 'primevue/progressbar';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import InputText from 'primevue/inputtext';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

// --- Inicialización ---
const route = useRoute();
const router = useRouter();
const store = useFinanceStore();
const confirm = useConfirm();
const toast = useToast();

// --- State del Store ---
const {inversionActual: credito, pagos: todosLosPagos} = storeToRefs(store);
const {fetchInvestmentById, addPago, deletePago} = store;

// --- State Local ---
const isLoading = ref(true);
const dialogPago = ref(false);
const nuevoPago = ref({
  fecha: new Date(),
  monto: 0,
  descripcion: 'Pago de cuota'
});

// --- Ciclo de Vida ---
onMounted(async () => {
  const investmentId = route.params.id;
  if (investmentId) {
    await fetchInvestmentById(investmentId);
  }
  isLoading.value = false;
});
onUnmounted(() => {
  store.inversionActual = null;
})
// --- Propiedades Computadas ---
const pagosDelCredito = computed(() => {
  if (!credito.value) return [];
  // Filtra los pagos que corresponden al ID de este crédito
  return todosLosPagos.value.filter(p => p.creditoId === credito.value.id);
});

const totalPagado = computed(() => {
  return pagosDelCredito.value.reduce((sum, pago) => sum + pago.monto, 0);
});

const saldoPendiente = computed(() => {
  if (!credito.value) return 0;
  return credito.value.montoTotal - totalPagado.value;
});

const porcentajePagado = computed(() => {
  if (!credito.value || !credito.value.montoTotal) return 0;
  const percentage = (totalPagado.value / credito.value.montoTotal) * 100;
  return Math.min(percentage, 100);
});

// --- Métodos ---
const formatCurrency = (value) => {
  if (typeof value !== 'number') return '$0.00';
  return new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = {year: 'numeric', month: 'long', day: 'numeric'};
  // Asegurarse de que la fecha se interpreta correctamente (UTC)
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-MX', options);
};

const getEstadoTag = (estado) => {
  switch (estado) {
    case 'activa':
      return {severity: 'info', text: 'Activa'};
    case 'pagada':
      return {severity: 'success', text: 'Pagada'};
    case 'vencida':
      return {severity: 'danger', text: 'Vencida'};
    default:
      return {severity: 'secondary', text: estado};
  }
};

const abrirDialogPago = () => {
  const montoMaximo = saldoPendiente.value > 0 ? saldoPendiente.value : 0;
  nuevoPago.value = {
    fecha: new Date(),
    monto: montoMaximo,
    descripcion: 'Pago de cuota'
  };
  dialogPago.value = true;
};

const guardarPago = () => {
  if (!nuevoPago.value.monto || nuevoPago.value.monto <= 0) {
    toast.add({severity: 'warn', summary: 'Inválido', detail: 'Por favor ingresa un monto válido', life: 3000});
    return;
  }

  addPago({
    creditoId: credito.value.id,
    fecha: nuevoPago.value.fecha.toISOString().slice(0, 10),
    monto: nuevoPago.value.monto,
    descripcion: nuevoPago.value.descripcion
  });

  toast.add({severity: 'success', summary: 'Éxito', detail: 'Pago registrado correctamente', life: 3000});
  dialogPago.value = false;
};

const handleDeletePago = (pagoId) => {
  confirm.require({
    message: '¿Estás seguro de que deseas eliminar este registro de pago?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => {
      deletePago(pagoId);
      toast.add({severity: 'info', summary: 'Eliminado', detail: 'El pago ha sido eliminado', life: 3000});
    }
  });
};

const goBack = () => {
  router.push({name: 'inversiones'});
};
</script>

<template>
  <div class="p-4 md:p-6 bg-gray-50 min-h-screen">
    <Toast/>
    <ConfirmDialog/>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <ProgressSpinner/>
    </div>

    <div v-else-if="credito" class="max-w-5xl mx-auto space-y-6">
      <!-- Cabecera -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">{{ credito.descripcion }}</h1>
          <p class="text-lg text-gray-600">Beneficiario: {{ credito.beneficiario }}</p>
        </div>
        <Button icon="pi pi-arrow-left" label="Volver a Inversiones" @click="goBack" class="p-button-text"/>
      </div>

      <!-- Resumen del Crédito -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center border-b pb-4 mb-4">
          <h2 class="text-xl font-bold text-gray-700">Resumen del Crédito</h2>
          <Tag :severity="getEstadoTag(credito.estado).severity" :value="getEstadoTag(credito.estado).text"
               class="mt-2 md:mt-0"/>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="text-sm text-gray-500">Monto Invertido</p>
            <p class="text-2xl font-semibold text-blue-600">{{ formatCurrency(credito.montoInvertido) }}</p>
          </div>
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="text-sm text-gray-500">Interés</p>
            <p class="text-2xl font-semibold text-green-600">{{ credito.interes }}%</p>
          </div>
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="text-sm text-gray-500">Monto Total a Recibir</p>
            <p class="text-2xl font-semibold text-gray-800">{{ formatCurrency(credito.montoTotal) }}</p>
          </div>
        </div>
        <div class="mt-6 space-y-4">
          <div class="flex justify-between py-2 border-b">
            <span class="font-medium text-gray-600">Cuenta de Origen:</span>
            <span class="text-gray-800">{{ credito.nombreCuenta }}</span>
          </div>
          <div class="flex justify-between py-2 border-b">
            <span class="font-medium text-gray-600">Fecha de Inversión:</span>
            <span class="text-gray-800">{{ formatDate(credito.fechaInversion) }}</span>
          </div>
          <div class="flex justify-between py-2 border-b">
            <span class="font-medium text-gray-600">Fecha de Vencimiento:</span>
            <span class="text-gray-800">{{ formatDate(credito.fechaVencimiento) }}</span>
          </div>
          <div v-if="credito.descripcionDetallada" class="pt-2">
            <span class="font-medium text-gray-600">Descripción Adicional:</span>
            <p class="text-gray-800 mt-1">{{ credito.descripcionDetallada }}</p>
          </div>
        </div>
      </div>

      <!-- Estado de cuenta y Pagos -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-700">Estado de Cuenta</h2>
          <Button v-if="credito.estado !== 'pagada'" label="Registrar Pago" icon="pi pi-plus" @click="abrirDialogPago"/>
        </div>

        <!-- Resumen de Pagos -->
        <div class="mb-6">
          <div class="flex justify-between text-sm mb-1">
            <span class="font-medium text-gray-600">Progreso de Pago</span>
            <span class="font-bold text-gray-800">{{
                formatCurrency(totalPagado)
              }} / {{ formatCurrency(credito.montoTotal) }}</span>
          </div>
          <ProgressBar :value="porcentajePagado" :showValue="false" style="height: 10px"></ProgressBar>
          <div class="flex justify-between text-sm mt-1">
            <span class="text-gray-500">{{ porcentajePagado.toFixed(2) }}% Pagado</span>
            <span class="font-medium text-red-600">Pendiente: {{ formatCurrency(saldoPendiente) }}</span>
          </div>
        </div>

        <!-- Historial de Pagos -->
        <h3 class="text-lg font-semibold text-gray-700 mb-3">Historial de Pagos</h3>
        <div class="overflow-x-auto">
          <table v-if="pagosDelCredito.length > 0" class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="pago in pagosDelCredito" :key="pago.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{{ formatDate(pago.fecha) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ pago.descripcion }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-800">
                {{ formatCurrency(pago.monto) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <Button icon="pi pi-trash" severity="danger" text rounded @click="handleDeletePago(pago.id)"/>
              </td>
            </tr>
            </tbody>
          </table>
          <div v-else class="text-center py-8 bg-gray-50 rounded-md">
            <i class="pi pi-info-circle text-4xl text-gray-400"></i>
            <p class="mt-2 text-gray-600">Aún no se han registrado pagos para este crédito.</p>
          </div>
        </div>
      </div>

      <!-- Modal de registro de pago -->
      <Dialog v-model:visible="dialogPago" modal header="Registrar Nuevo Pago" :style="{ width: '450px' }"
              class="p-fluid">
        <div class="space-y-4">
          <div>
            <label for="pago-monto" class="block mb-2 text-sm font-medium text-gray-700">Monto del Pago</label>
            <InputNumber id="pago-monto" v-model="nuevoPago.monto" mode="currency" currency="MXN" locale="es-MX"
                         :max="saldoPendiente" :min="0.01" autofocus/>
          </div>
          <div>
            <label for="pago-fecha" class="block mb-2 text-sm font-medium text-gray-700">Fecha del Pago</label>
            <Calendar id="pago-fecha" v-model="nuevoPago.fecha" dateFormat="dd/mm/yy" showIcon/>
          </div>
          <div>
            <label for="pago-descripcion" class="block mb-2 text-sm font-medium text-gray-700">Descripción
              (Opcional)</label>
            <InputText id="pago-descripcion" v-model="nuevoPago.descripcion"/>
          </div>
        </div>
        <template #footer>
          <Button label="Cancelar" icon="pi pi-times" @click="dialogPago = false" text/>
          <Button label="Guardar Pago" icon="pi pi-check" @click="guardarPago"/>
        </template>
      </Dialog>
    </div>

    <div v-else class="text-center p-10 bg-white rounded-lg shadow-md">
      <i class="pi pi-exclamation-triangle text-5xl text-amber-500"></i>
      <h2 class="mt-4 text-2xl font-bold text-gray-800">Crédito no encontrado</h2>
      <p class="text-gray-500 mt-2">No se pudo cargar la información del crédito. Por favor, intenta de nuevo.</p>
      <Button label="Volver" @click="goBack" class="mt-6"/>
    </div>
  </div>
</template>