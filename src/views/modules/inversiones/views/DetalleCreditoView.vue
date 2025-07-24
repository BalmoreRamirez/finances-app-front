<script setup>
import {ref, onMounted, computed, onUnmounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useInversionesStore} from '../../../../stores/inversionesStore.js';
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
// --- Importaciones para Vuelidate ---
import {useVuelidate} from '@vuelidate/core';
import {required, minValue, maxValue, maxLength, helpers} from '@vuelidate/validators';

// --- Inicialización ---
const route = useRoute();
const router = useRouter();
const store = useInversionesStore();
const confirm = useConfirm();
const toast = useToast();

// --- State del Store ---
const {inversionActual: credito, pagos} = storeToRefs(store);
const {fetchInvestmentById, fetchPagosPorInversion, addPago, deletePago} = store;

// --- State Local ---
const isLoading = ref(true);
const dialogPago = ref(false);
const nuevoPago = ref({
  fecha: new Date(),
  monto: 0,
  descripcion: 'Pago de cuota'
});

// --- Propiedades Computadas ---
const pagosDelCredito = computed(() => pagos.value);

// Actualizar para manejar campos del backend
const totalPagado = computed(() => {
  return pagosDelCredito.value.reduce((sum, pago) => {
    const amount = parseFloat(pago.amount || pago.monto || 0);
    return sum + amount;
  }, 0);
});

const saldoPendiente = computed(() => {
  if (!credito.value) return 0;
  const totalAmount = parseFloat(credito.value.total_amount || credito.value.montoTotal || 0);
  const saldo = totalAmount - totalPagado.value;
  return Math.max(0, saldo);
});

const porcentajePagado = computed(() => {
  if (!credito.value) return 0;
  const totalAmount = parseFloat(credito.value.total_amount || credito.value.montoTotal || 0);
  if (!totalAmount) return 0;
  const percentage = (totalPagado.value / totalAmount) * 100;
  return Math.min(percentage, 100);
});

// --- Métodos ---
const formatCurrency = (value) => {
  if (typeof value !== 'number') return '$0.00';
  return new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(value);
};

// --- Reglas de Validación con Vuelidate ---
const rules = computed(() => ({
  monto: {
    required: helpers.withMessage('El monto es obligatorio.', required),
    minValue: helpers.withMessage('El monto debe ser mayor a cero.', minValue(0.01)),
    maxValue: helpers.withMessage(`El monto no puede exceder el saldo pendiente de ${formatCurrency(saldoPendiente.value)}.`, maxValue(saldoPendiente.value))
  },
  fecha: {
    required: helpers.withMessage('La fecha es obligatoria.', required)
  },
  descripcion: {
    maxLength: helpers.withMessage('La descripción no debe exceder los 200 caracteres.', maxLength(200))
  }
}));

// --- Instancia de Vuelidate ---
const v$ = useVuelidate(rules, nuevoPago);

// --- Ciclo de Vida ---
onMounted(async () => {
  const investmentId = route.params.id;
  if (investmentId) {
    await Promise.all([
      fetchInvestmentById(investmentId),
      fetchPagosPorInversion(investmentId)
    ]);
  }
  isLoading.value = false;
});

onUnmounted(() => {
  store.inversionActual = null;
  store.pagos = [];
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = {year: 'numeric', month: 'long', day: 'numeric'};
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-MX', options);
};

const getEstadoTag = (estado) => {
  switch (estado) {
    case 'activo':
      return {severity: 'info', text: 'Activo'};
    case 'pagado':
      return {severity: 'success', text: 'Pagado'};
    case 'completado':
      return {severity: 'success', text: 'Completado'};
    case 'vencido':
      return {severity: 'danger', text: 'Vencido'};
    default:
      return {severity: 'secondary', text: estado || 'Sin estado'};
  }
};

const abrirDialogPago = () => {
  const montoMaximo = saldoPendiente.value;
  nuevoPago.value = {
    fecha: new Date(),
    monto: montoMaximo,
    descripcion: 'Pago de cuota'
  };
  v$.value.$reset();
  dialogPago.value = true;
};

// Método actualizado para usar el endpoint correcto
const guardarPago = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) {
    toast.add({
      severity: 'warn',
      summary: 'Datos Inválidos',
      detail: 'Por favor, revisa los errores en el formulario.',
      life: 3000
    });
    return;
  }

  try {
    const success = await addPago({
      creditoId: credito.value.id,
      payment_date: nuevoPago.value.fecha.toISOString().slice(0, 10), // Formato esperado por el backend
      amount: nuevoPago.value.monto,
      description: nuevoPago.value.descripcion
    });

    if (success) {
      toast.add({severity: 'success', summary: 'Éxito', detail: 'Pago registrado correctamente', life: 3000});
      dialogPago.value = false;
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error al registrar pago',
        detail: 'No se pudo registrar el pago',
        life: 3000
      });
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error al registrar pago',
      detail: 'No se pudo registrar el pago',
      life: 3000
    });
  }
};

// Método actualizado para eliminar pago con los parámetros correctos
const handleDeletePago = (pago) => {
  confirm.require({
    message: '¿Estás seguro de que deseas eliminar este registro de pago?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const success = await deletePago(credito.value.id, pago.id);
        if (success) {
          toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Pago eliminado correctamente',
            life: 3000
          });
        } else {
          toast.add({
            severity: 'error',
            summary: 'Error al eliminar pago',
            detail: 'No se pudo eliminar el pago',
            life: 3000
          });
        }
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error al eliminar pago',
          detail: 'No se pudo eliminar el pago',
          life: 3000
        });
      }
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
          <h1 class="text-3xl font-bold text-gray-800">{{ credito.investment_name || credito.descripcion }}</h1>
          <p class="text-lg text-gray-600">Beneficiario: {{ credito.beneficiary || credito.beneficiario }}</p>
        </div>
        <Button icon="pi pi-arrow-left" label="Volver a Inversiones" @click="goBack" class="p-button-text"/>
      </div>

      <!-- Resumen del Crédito -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center border-b pb-4 mb-4">
          <h2 class="text-xl font-bold text-gray-700">Resumen del Crédito</h2>
          <Tag :severity="getEstadoTag(credito.status || credito.estado).severity"
               :value="getEstadoTag(credito.status || credito.estado).text" class="mt-2 md:mt-0"/>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="text-sm text-gray-500">Monto Invertido</p>
            <p class="text-2xl font-semibold text-blue-600">
              {{ formatCurrency(parseFloat(credito.invested_amount || credito.monto || 0)) }}</p>
          </div>
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="text-sm text-gray-500">Interés</p>
            <p class="text-2xl font-semibold text-green-600">{{
                parseFloat(credito.interest || credito.interes || 0)
              }}%</p>
          </div>
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="text-sm text-gray-500">Monto Total a Recibir</p>
            <p class="text-2xl font-semibold text-gray-800">
              {{ formatCurrency(parseFloat(credito.total_amount || credito.montoTotal || 0)) }}</p>
          </div>
        </div>
        <div class="mt-6 space-y-4">
          <div class="flex justify-between py-2 border-b">
            <span class="font-medium text-gray-600">Cuenta de Origen:</span>
            <span class="text-gray-800">{{ credito.account?.account_name || credito.nombreCuenta || 'N/A' }}</span>
          </div>
          <div class="flex justify-between py-2 border-b">
            <span class="font-medium text-gray-600">Fecha de Inversión:</span>
            <span class="text-gray-800">{{ formatDate(credito.investment_date || credito.fechaInversion) }}</span>
          </div>
          <div class="flex justify-between py-2 border-b">
            <span class="font-medium text-gray-600">Fecha de Vencimiento:</span>
            <span class="text-gray-800">{{ formatDate(credito.due_date || credito.fechaVencimiento) }}</span>
          </div>
          <div v-if="credito.description || credito.descripcion" class="pt-2">
            <span class="font-medium text-gray-600">Descripción:</span>
            <p class="text-gray-800 mt-1">{{ credito.description || credito.descripcion }}</p>
          </div>
        </div>
      </div>

      <!-- Estado de cuenta y Pagos -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-700">Estado de Cuenta</h2>
          <Button v-if="(credito.status || credito.estado) !== 'pagado' && saldoPendiente > 0"
                  label="Registrar Pago" icon="pi pi-plus" @click="abrirDialogPago"/>
        </div>

        <!-- Resumen de Pagos -->
        <div class="mb-6">
          <div class="flex justify-between text-sm mb-1">
            <span class="font-medium text-gray-600">Progreso de Pago</span>
            <span class="font-bold text-gray-800">{{
                formatCurrency(totalPagado)
              }} / {{ formatCurrency(parseFloat(credito.total_amount || credito.montoTotal || 0)) }}</span>
          </div>
          <ProgressBar :value="porcentajePagado" :showValue="false" style="height: 10px"></ProgressBar>
          <div class="flex justify-between text-sm mt-1">
            <span class="text-gray-600">{{ porcentajePagado.toFixed(1) }}% completado</span>
            <span class="text-gray-600">Saldo pendiente: {{ formatCurrency(saldoPendiente) }}</span>
          </div>
        </div>

        <!-- Historial de Pagos -->
        <h3 class="text-lg font-semibold text-gray-700 mb-3">Historial de Pagos</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="pagosDelCredito.length === 0">
              <td colspan="4" class="text-center py-8 text-gray-500">
                No se han registrado pagos para este crédito.
              </td>
            </tr>
            <tr v-for="pago in pagosDelCredito" :key="pago.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(pago.payment_date || pago.fecha) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                {{ formatCurrency(parseFloat(pago.amount || pago.monto || 0)) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ pago.description || pago.descripcion || 'Sin descripción' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <Button icon="pi pi-trash" severity="danger" size="small" text
                        @click="handleDeletePago(pago)" v-tooltip.top="'Eliminar pago'"/>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de registro de pago -->
      <Dialog v-model:visible="dialogPago" modal header="Registrar Nuevo Pago" :style="{ width: '450px' }"
              class="p-fluid">
        <div class="space-y-4">
          <div>
            <label for="fecha" class="block text-sm font-medium text-gray-700 mb-1">Fecha del Pago</label>
            <Calendar id="fecha" v-model="nuevoPago.fecha" dateFormat="dd/mm/yy" showIcon
                      :class="{'p-invalid': v$.fecha.$error}"/>
            <small v-if="v$.fecha.$error" class="p-error">{{ v$.fecha.$errors[0].$message }}</small>
          </div>
          <div>
            <label for="monto" class="block text-sm font-medium text-gray-700 mb-1">Monto del Pago</label>
            <InputNumber id="monto" v-model="nuevoPago.monto" mode="currency" currency="MXN" locale="es-MX"
                         :class="{'p-invalid': v$.monto.$error}"/>
            <small v-if="v$.monto.$error" class="p-error">{{ v$.monto.$errors[0].$message }}</small>
          </div>
          <div>
            <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
            <InputText id="descripcion" v-model="nuevoPago.descripcion"
                       :class="{'p-invalid': v$.descripcion.$error}"/>
            <small v-if="v$.descripcion.$error" class="p-error">{{ v$.descripcion.$errors[0].$message }}</small>
          </div>
        </div>
        <template #footer>
          <Button label="Cancelar" icon="pi pi-times" text @click="dialogPago = false"/>
          <Button label="Guardar" icon="pi pi-check" @click="guardarPago"/>
        </template>
      </Dialog>
    </div>

    <div v-else class="text-center p-10 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-700 mb-2">Crédito no encontrado</h2>
      <p class="text-gray-500 mb-4">No se pudo cargar la información del crédito solicitado.</p>
      <Button icon="pi pi-arrow-left" label="Volver a Inversiones" @click="goBack"/>
    </div>
  </div>
</template>