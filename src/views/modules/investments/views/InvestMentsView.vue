<template>
  <Toast />
  <div class="space-y-6">
    <ConfirmDialog />

    <!-- Cabecera -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Gestión de Inversiones</h1>
        <p class="text-gray-500 mt-1">
          Administra tus inversiones y créditos otorgados.
        </p>
      </div>
      <Button
        @click="openCreateModal"
        label="Registrar Inversión"
        icon="pi pi-plus"
        severity="success"
      />
    </div>

    <!-- Resumen estadístico -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-lg shadow-md flex items-center">
        <div class="rounded-full bg-blue-100 p-3 flex items-center justify-center">
          <i class="pi pi-wallet text-xl text-blue-600"></i>
        </div>
        <div class="ml-4">
          <p class="text-sm text-gray-500">Total Invertido</p>
          <p class="text-xl font-bold text-gray-800">
            {{ formatCurrency(totalInvertido) }}
          </p>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-md flex items-center">
        <div class="rounded-full bg-green-100 p-3 flex items-center justify-center">
          <i class="pi pi-chart-line text-xl text-green-600"></i>
        </div>
        <div class="ml-4">
          <p class="text-sm text-gray-500">Ganancias Potenciales</p>
          <p class="text-xl font-bold text-gray-800">
            {{ formatCurrency(totalGananciasPotenciales) }}
          </p>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-md flex items-center">
        <div class="rounded-full bg-purple-100 p-3 flex items-center justify-center">
          <i class="pi pi-check-circle text-xl text-purple-600"></i>
        </div>
        <div class="ml-4">
          <p class="text-sm text-gray-500">Ganancias Acumuladas</p>
          <p class="text-xl font-bold text-gray-800">
            {{ formatCurrency(totalGananciasAcumuladas) }}
          </p>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-md flex items-center">
        <div class="rounded-full bg-amber-100 p-3 flex items-center justify-center">
          <i class="pi pi-bolt text-xl text-amber-600"></i>
        </div>
        <div class="ml-4">
          <p class="text-sm text-gray-500">Inversiones Activas</p>
          <p class="text-xl font-bold text-gray-800">
            {{ totalInvertidoActivo }}
          </p>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex justify-end">
      <div class="w-full md:w-72">
        <label
          for="filtro-tipo"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Filtrar por tipo:
        </label>
        <Dropdown
          v-model="filtroTipo"
          :options="tiposFiltro"
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccionar tipo"
          class="w-full"
        />
      </div>
    </div>

    <!-- Tabla de Inversiones -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                ID
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Inversión
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Tipo
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Cuenta
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"
              >
                Monto Invertido
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Ganancia
              </th>
              <th
                class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"
              >
                Total Pagado
              </th>
              <th
                class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"
              >
                Estado
              </th>
              <th
                class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(inversion, idx) in investments" :key="inversion.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ idx + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ inversion.name }}
                </div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-500"
              >
                {{ getTipoLabel(inversion.investment_type?.name || "-") }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
              >
                {{ inversion.account?.name || "No Asignada" }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-800"
              >
                {{ formatCurrency(parseFloat(inversion.principal || 0)) }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600"
              >
                $ {{ inversion.expected_return|| 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                <span v-if="esTipoCredito(inversion)" class="font-medium text-green-600">
                  {{ formatCurrency(getTotalPagado(inversion)) }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <Tag
                  :severity="
                    getEstadoTag(inversion.status || inversion.estado).severity
                  "
                  :value="
                    getEstadoTag(inversion.status || inversion.estado).text
                  "
                  rounded
                />
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2"
              >
                <Button
                  v-if="
                    (inversion.investment_type?.name || inversion.tipo || '').toString().toLowerCase() === 'crédito' ||
                    (inversion.investment_type?.name || inversion.tipo || '').toString().toLowerCase() === 'credito'
                  "
                  icon="pi pi-eye"
                  severity="info"
                  text
                  rounded
                  @click="verDetalleCredito(inversion)"
                  v-tooltip.top="'Ver pagos del crédito'"
                />
                <Button
                  icon="pi pi-pencil"
                  severity="warning"
                  text
                  rounded
                  @click="openEditModal(inversion)"
                  v-tooltip.top="'Editar inversión'"
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  rounded
                  @click="handleDeleteInversion(inversion.id)"
                  v-tooltip.top="'Eliminar inversión'"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Pasamos los tipos de inversión como prop -->
    <InvestmentModal
      :visible="showModal"
      :isEditMode="isEditMode"
      :inversionData="inversionToEdit"
      :tiposInversion="typesInvestmentList"
      :cuentas="accountsList"
      @update:visible="showModal = $event"
      @save="handleSaveInversion"
    />
  </div>
</template>

<script setup>
// Imports
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useFinanceStore } from "../../../../stores/financeStore.js";
import { useInversionesStore } from "../../../../stores/investmentStore.js";
import Button from "primevue/button";
import ConfirmDialog from "primevue/confirmdialog";
import Dropdown from "primevue/dropdown";
import InvestmentModal from "../components/InvestmentModal.vue";
import Tag from "primevue/tag";
import Tooltip from "primevue/tooltip";
import Toast from "primevue/toast";

// Stores y referencias
const store = useFinanceStore();
const investmentStore = useInversionesStore();
const {
  deleteInvestment,
  addInvestment,
  updateInvestment,
  fetchInvestments,
  fetchInvestmentTypes,
  fetchAccounts,
  fetchAccountsForSelect,
} = store;
const {
  investments,
  totalGanancias,
  investmentTypes,
  accountForSelect,
} = storeToRefs(store);

// Router, confirm y toast
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

// Estado local
const showModal = ref(false);
const isEditMode = ref(false);
const inversionToEdit = ref(null);
const filtroTipo = ref("todos");
const pagosPorInversion = ref({});

// Ciclo de vida
onMounted(async () => {
  if (investments.value.length === 0) await fetchInvestments();
  if (investmentTypes.value.length === 0) fetchInvestmentTypes();
  if (accountForSelect.value.length === 0) fetchAccountsForSelect();
  
  // Cargar pagos para inversiones tipo crédito
  await cargarPagosCreditos();
});

// Computed
const typesInvestmentList = computed(() => investmentTypes.value || []);
const accountsList = computed(() => accountForSelect.value || []);
const totalInvertido = computed(() => {
  // Sumar solo las inversiones activas
  return (investments.value || [])
    .filter(inv => inv.status === 'activa' || inv.estado === 'activa')
    .reduce((sum, inv) => sum + parseFloat(inv.principal || 0), 0);
});
const totalEarnings = computed(() => store.totalEarnings);
const totalInvertidoActivo = computed(() => store.totalActiveInvested);
const totalGananciasPotenciales = computed(() => {
  // Sumar solo las ganancias de inversiones activas
  return (investments.value || [])
    .filter(inv => inv.status === 'activa' || inv.estado === 'activa')
    .reduce((sum, inv) => sum + parseFloat(inv.expected_return || 0), 0);
});

const totalGananciasAcumuladas = computed(() => {
  // Sumar solo las ganancias de inversiones finalizadas/completadas/pagadas
  return (investments.value || [])
    .filter(inv => ['finalizada', 'completado', 'pagado'].includes(inv.status) || ['finalizada', 'completado', 'pagado'].includes(inv.estado))
    .reduce((sum, inv) => sum + parseFloat(inv.expected_return || 0), 0);
});

// Filtros de tipo
const tiposFiltro = [
  { label: "Todos", value: "todos" },
  { label: "Compra", value: "compra" },
  { label: "Crédito", value: "credito" },
];

// Helpers
const formatCurrency = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "$0.00";
  return num.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
};

const getTipoLabel = (tipo) => {
  if (!tipo) return "No Asignado";
  if (typeof tipo === "string")
    return tipo.charAt(0).toUpperCase() + tipo.slice(1);
  return tipo.nombre || tipo.label || "-";
};

// Función para verificar si es tipo crédito
const esTipoCredito = (inversion) => {
  const tipo = (inversion.investment_type?.name || inversion.tipo || '').toString().toLowerCase();
  return tipo === 'crédito' || tipo === 'credito';
};

// Función para cargar pagos de todas las inversiones tipo crédito
const cargarPagosCreditos = async () => {
  const inversionesCredito = investments.value.filter(inv => esTipoCredito(inv));
  
  for (const inversion of inversionesCredito) {
    try {
      const result = await investmentStore.fetchPaymentsByInvestment(inversion.id);
      if (result.success) {
        pagosPorInversion.value[inversion.id] = investmentStore.payments || [];
      }
    } catch (error) {
      console.error(`Error al cargar pagos para inversión ${inversion.id}:`, error);
      pagosPorInversion.value[inversion.id] = [];
    }
  }
};

// Función para obtener el total pagado (suma de montos de cuotas)
const getTotalPagado = (inversion) => {
  const pagos = pagosPorInversion.value[inversion.id] || [];
  return pagos.reduce((total, pago) => {
    const monto = parseFloat(pago.amount || pago.monto || 0);
    return total + monto;
  }, 0);
};

const getEstadoTag = (status) => {
  switch (status) {
    case "activo":
      return { severity: "info", text: "Activo" };
    case "completado":
    case "pagado":
    case "finalizado":
      return { severity: "success", text: "Completado" };
    case "vencido":
      return { severity: "danger", text: "Vencido" };
    case "cancelado":
    case "pendiente":
      return {
        severity: "warning",
        text: status.charAt(0).toUpperCase() + status.slice(1),
      };
    default:
      return { severity: "secondary", text: status || "Sin estado" };
  }
};

// Acciones
const openCreateModal = () => {
  // Función helper para formatear fecha local
  const formatearFechaLocal = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()+1).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Obtener fecha actual
  const fechaActual = new Date();
  // Calcular fecha de vencimiento (15 días adelante)
  const fechaVencimiento = new Date();
  fechaVencimiento.setDate(fechaActual.getDate() + 15);
  
  isEditMode.value = false;
  inversionToEdit.value = {
    investment_type_id: "",
    name: "",
    principal: 0,
    expected_return: 0,
    account_id: "",
    start_date: formatearFechaLocal(fechaActual),
    end_date: formatearFechaLocal(fechaVencimiento),
    status: "",
    notes: "",
  };
  showModal.value = true;
};

const openEditModal = (inversion) => {

  
  isEditMode.value = true;
  inversionToEdit.value = { ...inversion };
    console.log("Editando inversión:", inversionToEdit.value);
  showModal.value = true;
};

const handleSaveInversion = async (inversionData) => {
  let result = null;
  if (isEditMode.value) {
    result = await updateInvestment(inversionToEdit.value.id, inversionData);
  } else {
    result = await addInvestment(inversionData);
  }
  
  if (result.success) {
    toast.add({
      severity: "success",
      summary: "Éxito",
      detail: result.message,
      life: 3000,
    });
    showModal.value = false;
    await fetchInvestments();
    // Recargar pagos después de actualizar inversiones
    await cargarPagosCreditos();
  } else {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: result.error,
      life: 5000,
    });
  }
};

const handleDeleteInversion = (id) => {
  confirm.require({
    message:
      "¿Estás seguro de que deseas eliminar esta inversión? Esta acción no se puede deshacer.",
    header: "Confirmar eliminación",
    icon: "pi pi-exclamation-triangle",
    acceptClass: "p-button-danger",
    accept: async () => {
      const result = await deleteInvestment(id);
      if (result.success) {
        toast.add({
          severity: "success",
          summary: "Éxito",
          detail: result.message,
          life: 3000,
        });
      } else {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: result.error,
          life: 5000,
        });
      }
    },
  });
};

const verDetalleCredito = (inversion) => {
  router.push({ name: "detalle-credito", params: { id: inversion.id } });
};
</script>
