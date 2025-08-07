<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useInversionesStore } from "../../../../stores/investmentStore.js";
import { storeToRefs } from "pinia";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import Tag from "primevue/tag";
import ProgressSpinner from "primevue/progressspinner";
import ProgressBar from "primevue/progressbar";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext";
import ConfirmDialog from "primevue/confirmdialog";
import Toast from "primevue/toast";
// --- Importaciones para Vuelidate ---
import { useVuelidate } from "@vuelidate/core";
import {
  required,
  minValue,
  maxValue,
  maxLength,
  helpers,
} from "@vuelidate/validators";

// --- Inicialización ---
const route = useRoute();
const router = useRouter();
const store = useInversionesStore();
const confirm = useConfirm();
const toast = useToast();

// --- State del Store ---
const refs = storeToRefs(store);
const credito = refs.currentInvestment;
const payments = refs.payments;
const {
  fetchInvestmentById,
  fetchPaymentsByInvestment,
  addPayment,
  deletePayment,
} = store;

// --- State Local ---
const isLoading = ref(true);
const dialogPago = ref(false);
const nuevoPago = ref({
  fecha: new Date(),
  monto: 0,
  descripcion: "Pago de cuota",
});

// --- Propiedades Computadas ---
const pagosDelCredito = computed(() => payments?.value || []);

// Usar los campos reales del backend
const totalPagado = computed(() => {
  const arr = pagosDelCredito.value || [];
  return arr.reduce((sum, pago) => {
    const amount = parseFloat(pago.amount || pago.monto || 0);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
});

const saldoPendiente = computed(() => {
  const cred = credito?.value || {};
  const principal = parseFloat(cred.principal || 0);
  const expectedReturn = parseFloat(cred.expected_return || 0);
  const totalAmount = principal + expectedReturn; // Capital + Ganancia
  const saldo = totalAmount - totalPagado.value;
  return Math.max(0, saldo);
});

const porcentajePagado = computed(() => {
  const cred = credito?.value || {};
  const principal = parseFloat(cred.principal || 0);
  const expectedReturn = parseFloat(cred.expected_return || 0);
  const totalAmount = principal + expectedReturn; // Capital + Ganancia
  if (!totalAmount) return 0;
  const percentage = (totalPagado.value / totalAmount) * 100;
  return Math.min(percentage, 100);
});

// Computed para el monto total que se debe recibir
const montoTotalARecibir = computed(() => {
  const cred = credito?.value || {};
  const principal = parseFloat(cred.principal || 0);
  const expectedReturn = parseFloat(cred.expected_return || 0);
  return principal + expectedReturn;
});

// Computed para determinar el estado real basado en pagos
const estadoComputado = computed(() => {
  if (!credito?.value) return "Sin estado";
  
  const estadoActual = credito.value.status || credito.value.estado;
  const porcentaje = porcentajePagado.value;
  
  if (porcentaje >= 100) {
    return "completado";
  } else if (porcentaje > 0) {
    return "activa"; // Tiene pagos parciales
  } else {
    return estadoActual || "activa";
  }
});

// --- Métodos ---
const formatCurrency = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(num);
};

// --- Reglas de Validación con Vuelidate ---
const rules = {
  monto: {
    required: helpers.withMessage("El monto es obligatorio.", required),
    minValue: helpers.withMessage(
      "El monto debe ser mayor a cero.",
      minValue(0.01)
    ),
    maxValue: helpers.withMessage(
      "El monto no puede exceder el saldo pendiente.",
      maxValue(computed(() => saldoPendiente.value))
    ),
  },
  fecha: {
    required: helpers.withMessage("La fecha es obligatoria.", required),
  },
  descripcion: {
    maxLength: helpers.withMessage(
      "La descripción no debe exceder los 200 caracteres.",
      maxLength(200)
    ),
  },
};

// --- Instancia de Vuelidate ---
const v$ = useVuelidate(rules, nuevoPago);

// --- Ciclo de Vida ---
onMounted(async () => {
  const investmentId = route.params.id;
  if (investmentId) {
    try {
      await Promise.all([
        fetchInvestmentById(investmentId),
        fetchPaymentsByInvestment(investmentId),
      ]);
    } catch (error) {
      console.error("Error loading investment details:", error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar la información de la inversión",
        life: 5000,
      });
    }
  }
  isLoading.value = false;
});

onUnmounted(() => {
  store.currentInvestment = null;
  store.payments = [];
});

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "long", day: "numeric" };
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("es-MX", options);
};

const getEstadoTag = (estado) => {
  switch (estado) {
    case "activa":
      return { severity: "info", text: "Activa" };
    case "activo":
      return { severity: "info", text: "Activa" };
    case "actualizada":
      return { severity: "warning", text: "Actualizada" };
    case "pagado":
      return { severity: "success", text: "Pagada" };
    case "completado":
      return { severity: "success", text: "Completada" };
    case "cancelada":
      return { severity: "danger", text: "Cancelada" };
    case "vencido":
      return { severity: "danger", text: "Vencida" };
    default:
      return { severity: "secondary", text: estado || "Sin estado" };
  }
};

const abrirDialogPago = () => {
  const montoMaximo = saldoPendiente.value || 0;
  nuevoPago.value = {
    fecha: new Date(),
    monto: montoMaximo,
    descripcion: "Pago de cuota",
  };
  if (v$.value) {
    v$.value.$reset();
  }
  dialogPago.value = true;
};

// Método actualizado para usar el endpoint correcto
const guardarPago = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) {
    toast.add({
      severity: "warn",
      summary: "Datos Inválidos",
      detail: "Por favor, revisa los errores en el formulario.",
      life: 3000,
    });
    return;
  }

  const paymentData = {
    investment_id: parseInt(credito.value.id), // Asegurar que sea un entero
    date: nuevoPago.value.fecha.toISOString().slice(0, 10), // Formato YYYY-MM-DD
    amount: nuevoPago.value.monto,
    description: nuevoPago.value.descripcion,
    is_income: true, // Por defecto
    paid: true // Por defecto
  };

  const result = await addPayment(paymentData);

  if (result.success) {
    dialogPago.value = false;
    
    // Verificar si se completó el pago total
    const nuevoTotalPagado = totalPagado.value + nuevoPago.value.monto;
    const estaCompletamentePagado = nuevoTotalPagado >= montoTotalARecibir.value;
    
    if (estaCompletamentePagado) {
      toast.add({
        severity: "success",
        summary: "¡Inversión Completada!",
        detail: "Se ha completado el pago total de la inversión.",
        life: 5000,
      });
    } else {
      toast.add({
        severity: "success",
        summary: "Pago Registrado",
        detail: result.message || "Pago registrado correctamente",
        life: 3000,
      });
    }
  } else {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: result.error || "No se pudo registrar el pago",
      life: 5000,
    });
  }
};

// Método actualizado para eliminar pago con los parámetros correctos
const handleDeletePago = (pago) => {
  confirm.require({
    message: "¿Estás seguro de que deseas eliminar este registro de pago?",
    header: "Confirmar eliminación",
    icon: "pi pi-exclamation-triangle",
    acceptClass: "p-button-danger",
    accept: async () => {
      const result = await deletePayment(credito.value.id, pago.id);
      if (result.success) {
        toast.add({
          severity: "success",
          summary: "Pago Eliminado",
          detail: result.message || "Pago eliminado correctamente",
          life: 3000,
        });
      } else {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: result.error || "No se pudo eliminar el pago",
          life: 5000,
        });
      }
    },
  });
};

const goBack = () => {
  router.push({ name: "inversiones" });
};
</script>

<template>
  <div class="p-4 md:p-6 bg-gray-50 min-h-screen">
    <Toast />
    <ConfirmDialog />

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <ProgressSpinner />
    </div>

    <div v-else-if="credito && credito.id" class="max-w-5xl mx-auto space-y-6">
      <!-- Cabecera -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">
            {{ credito.name || credito.investment_name || credito.descripcion }}
          </h1>
          <p class="text-lg text-gray-600">
            Notas: {{ credito.notes || credito.descripcion }}
          </p>
        </div>
        <Button icon="pi pi-arrow-left" label="Volver a Inversiones" @click="goBack" class="p-button-text" />
      </div>

      <!-- Resumen del Crédito -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center border-b pb-4 mb-4">
          <h2 class="text-xl font-bold text-gray-700">Resumen del Crédito</h2>
          <Tag :severity="getEstadoTag(estadoComputado).severity"
            :value="getEstadoTag(estadoComputado).text" class="mt-2 md:mt-0" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="text-sm text-gray-500">Monto Invertido</p>
            <p class="text-2xl font-semibold text-blue-600">
              {{ formatCurrency(credito.principal) }}
            </p>
          </div>
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="text-sm text-gray-500">Ganancia Esperada</p>
            <p class="text-2xl font-semibold text-green-600">
              {{ formatCurrency(credito.expected_return) }}
            </p>
          </div>
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="text-sm text-gray-500">Total a Recibir</p>
            <p class="text-2xl font-semibold text-purple-600">
              {{ formatCurrency(montoTotalARecibir) }}
            </p>
          </div>
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="text-sm text-gray-500">Cuenta de Origen</p>
            <p class="text-2xl font-semibold text-gray-800">
              {{ credito.account?.name || "N/A" }}
            </p>
          </div>
        </div>
        <div class="mt-6 space-y-4">
          <div class="flex justify-between py-2 border-b">
            <span class="font-medium text-gray-600">Fecha de Inversión:</span>
            <span class="text-gray-800">{{
              formatDate(credito.start_date)
            }}</span>
          </div>
          <div class="flex justify-between py-2 border-b">
            <span class="font-medium text-gray-600">Fecha de Vencimiento:</span>
            <span class="text-gray-800">{{
              formatDate(credito.end_date)
            }}</span>
          </div>
          <div class="flex justify-between py-2 border-b">
            <span class="font-medium text-gray-600">ROI (Retorno de Inversión):</span>
            <span class="text-gray-800 font-semibold">
              {{ ((credito.expected_return / credito.principal) * 100).toFixed(2) }}%
            </span>
          </div>
          <div v-if="credito.notes" class="pt-2">
            <span class="font-medium text-gray-600">Notas:</span>
            <p class="text-gray-800 mt-1">{{ credito.notes }}</p>
          </div>
        </div>
      </div>

      <!-- Estado de cuenta y Pagos -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-700">Estado de Cuenta</h2>
          <Button v-if="
            estadoComputado !== 'pagado' &&
            estadoComputado !== 'completado' &&
            estadoComputado !== 'cancelada' &&
            saldoPendiente > 0 &&
            porcentajePagado < 100
          " label="Registrar Pago" icon="pi pi-plus" @click="abrirDialogPago" />
        </div>

        <!-- Resumen de Pagos -->
        <div class="mb-6">
          <div class="flex justify-between text-sm mb-1">
            <span class="font-medium text-gray-600">Progreso de Pago</span>
            <span class="font-bold text-gray-800">{{ formatCurrency(totalPagado) }} /
              {{ formatCurrency(montoTotalARecibir) }}</span>
          </div>
          <ProgressBar :value="porcentajePagado" :showValue="false" style="height: 10px"></ProgressBar>
          <div class="flex justify-between text-sm mt-1">
            <span class="text-gray-600">{{ porcentajePagado.toFixed(1) }}% completado</span>
            <span class="text-gray-600">Saldo pendiente: {{ formatCurrency(saldoPendiente) }}</span>
          </div>
        </div>

        <!-- Historial de Pagos -->
        <h3 class="text-lg font-semibold text-gray-700 mb-3">
          Historial de Pagos
        </h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Monto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Descripción
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
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
                  {{ formatDate(pago.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                  {{ formatCurrency(pago.amount) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ pago.description || "Sin descripción" }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <Tag :severity="pago.paid ? 'success' : 'warning'" :value="pago.paid ? 'Pagado' : 'Pendiente'"
                    class="mr-2" />
                  <Button icon="pi pi-trash" severity="danger" size="small" text @click="handleDeletePago(pago)"
                    v-tooltip.top="'Eliminar pago'" />
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
              :class="{ 'p-invalid': v$.fecha.$error }" />
            <small v-if="v$.fecha.$error" class="p-error">{{
              v$.fecha.$errors[0].$message
            }}</small>
          </div>
          <div>
            <label for="monto" class="block text-sm font-medium text-gray-700 mb-1">Monto del Pago</label>
            <InputNumber id="monto" v-model="nuevoPago.monto" mode="currency" currency="MXN" locale="es-MX"
              :class="{ 'p-invalid': v$.monto.$error }" />
            <small v-if="v$.monto.$error" class="p-error">{{
              v$.monto.$errors[0].$message
            }}</small>
          </div>
          <div>
            <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
            <InputText id="descripcion" v-model="nuevoPago.descripcion"
              :class="{ 'p-invalid': v$.descripcion.$error }" />
            <small v-if="v$.descripcion.$error" class="p-error">{{
              v$.descripcion.$errors[0].$message
            }}</small>
          </div>
        </div>
        <template #footer>
          <Button label="Cancelar" icon="pi pi-times" text @click="dialogPago = false" />
          <Button label="Guardar" icon="pi pi-check" @click="guardarPago" />
        </template>
      </Dialog>
    </div>

    <div v-else class="text-center p-10 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-700 mb-2">
        Crédito no encontrado
      </h2>
      <p class="text-gray-500 mb-4">
        No se pudo cargar la información del crédito solicitado.
      </p>
      <Button icon="pi pi-arrow-left" label="Volver a Inversiones" @click="goBack" />
    </div>
  </div>
</template>
