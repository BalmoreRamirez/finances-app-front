<template>
  <div class="min-h-screen bg-background">
    <Toast />
    <ConfirmDialog />

    <!-- Header -->
    <header class="bg-background-white border-b border-neutral-200 px-6 py-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-text-primary">Gestión de Inversiones</h1>
          <p class="text-sm text-text-muted mt-1">Administra tus inversiones y créditos otorgados</p>
        </div>
        <button
          @click="openCreateModal"
          class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Registrar Inversión
        </button>
      </div>
    </header>

    <!-- Contenido principal -->
    <div class="container mx-auto px-6 py-8 space-y-8">
      <!-- Cards de resumen estadístico -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-text-muted mb-1">Total Invertido</p>
              <p class="text-2xl font-semibold text-primary">{{ formatCurrency(totalInvertido) }}</p>
            </div>
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-text-muted mb-1">Ganancias Potenciales</p>
              <p class="text-2xl font-semibold text-success-500">{{ formatCurrency(totalGananciasPotenciales) }}</p>
            </div>
            <div class="w-12 h-12 bg-success-500/10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-text-muted mb-1">Ingresos por Intereses</p>
              <p class="text-2xl font-semibold text-secondary">{{ formatCurrency(totalGananciasAcumuladas) }}</p>
            </div>
            <div class="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-text-muted mb-1">Inversiones Activas</p>
              <p class="text-2xl font-semibold text-warning-500">{{ totalInvertidoActivo }}</p>
            </div>
            <div class="w-12 h-12 bg-warning-500/10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 class="text-lg font-semibold text-text-primary">Lista de Inversiones</h2>
          <div class="flex items-center space-x-3">
            <label class="text-sm font-medium text-text-muted">Filtrar por estado:</label>
            <Dropdown
              v-model="filtroEstado"
              :options="estadosFiltro"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar estado"
              class="w-48"
            />
          </div>
        </div>
      </div>

      <!-- Tabla de Inversiones -->
      <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-neutral-100">
            <thead class="bg-background-light">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Inversión</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Cuenta</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Monto Invertido</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Ganancia</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Total Pagado</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-background-white divide-y divide-neutral-50">
              <tr v-for="(inversion, idx) in filteredInvestments" :key="inversion.id" class="hover:bg-background-light transition-colors">
                <td class="px-6 py-4 text-sm text-text-muted">{{ idx + 1 }}</td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-text-primary">{{ inversion.name || 'Sin nombre' }}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getTypeBadgeClass(inversion.investment_type || inversion.type)">
                    {{ getTypeLabel(inversion.investment_type || inversion.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-text-muted">
                  {{ getAccountName(inversion.account_id) }}
                </td>
                <td class="px-6 py-4 text-sm font-semibold text-text-primary text-right">
                  {{ formatCurrency(inversion.principal || inversion.amount || 0) }}
                </td>
                <td class="px-6 py-4 text-sm font-semibold text-success-500">
                  {{ formatCurrency(inversion.expected_return || 0) }}
                </td>
                <td class="px-6 py-4 text-center text-sm font-semibold text-secondary">
                  {{ formatCurrency(getTotalPagado(inversion)) }}
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusBadgeClass(inversion.status)">
                    {{ getStatusLabel(inversion.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center space-x-2">
                    <button
                      @click="openEditModal(inversion)"
                      class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Editar inversión"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      v-if="esTipoCredito(inversion)"
                      @click="verDetallePagos(inversion)"
                      class="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                      title="Ver pagos"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button
                      @click="confirmDelete(inversion.id)"
                      class="p-2 text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                      title="Eliminar inversión"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredInvestments.length === 0">
                <td colspan="9" class="px-6 py-8 text-center text-text-muted">
                  <div class="flex flex-col items-center">
                    <svg class="w-12 h-12 text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <p class="text-lg font-medium mb-1">No hay inversiones</p>
                    <p class="text-sm">Registra tu primera inversión para comenzar</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de inversión -->
    <InvestmentModal
      v-model:visible="showModal"
      :is-edit-mode="isEditMode"
      :investment-data="investmentToEdit"
      :accounts="accounts"
      @save="handleSaveInvestment"
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
import { useCuentasStore } from "../../../../stores/accountStore.js";
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
const cuentasStore = useCuentasStore();
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
const filtroEstado = ref("activa"); // Por defecto solo "activa"
const pagosPorInversion = ref({}); // Para almacenar pagos por inversión
// Filtros de estado
const estadosFiltro = [
  { label: "Activa", value: "activa" },
  { label: "Finalizada", value: "finalizada" },
  { label: "Todas", value: "todas" },
];
// Computed para filtrar inversiones por estado
const filteredInvestments = computed(() => {
  let arr = investments.value;
  
  // Filtrar por estado
  if (filtroEstado.value !== "todas") {
    arr = arr.filter(inv => {
      const estado = (inv.status || inv.estado || "").toLowerCase();
      return estado === filtroEstado.value;
    });
  }
  
  return arr;
});

// Ciclo de vida
onMounted(async () => {
  try {
    // Verificar si hay token de autenticación
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.add({
        severity: "error",
        summary: "Error de autenticación",
        detail: "No estás autenticado. Inicia sesión nuevamente.",
        life: 5000,
      });
      router.push('/login');
      return;
    }

    if (investments.value.length === 0) {
      try {
        const result = await fetchInvestments();
        // Verificar si el resultado tiene la propiedad success
        if (result && result.success === false) {
          // Si es error 403, redirigir al login
          if (result.error?.includes("403") || result.error?.includes("Acceso denegado")) {
            localStorage.removeItem('accessToken');
            router.push('/login');
            return;
          }
          toast.add({
            severity: "error",
            summary: "Error de carga",
            detail: result.error || "No se pudieron cargar las inversiones",
            life: 5000,
          });
        }
      } catch (error) {
        console.error("Error específico al cargar inversiones:", error);
        if (error.response?.status === 403) {
          localStorage.removeItem('accessToken');
          router.push('/login');
          return;
        }
      }
    }

    if (investmentTypes.value.length === 0) {
      try {
        const result = await fetchInvestmentTypes();
        if (result && result.success === false) {
          console.warn("No se pudieron cargar los tipos de inversión:", result.error);
        }
      } catch (error) {
        console.warn("Error al cargar tipos de inversión:", error);
      }
    }

    if (accountForSelect.value.length === 0) {
      try {
        const result = await fetchAccountsForSelect();
        if (result && result.success === false) {
          console.warn("No se pudieron cargar las cuentas:", result.error);
        }
      } catch (error) {
        console.warn("Error al cargar cuentas:", error);
      }
    }
    
    // Cargar cuentas completas para poder acceder a los balances
    if (cuentasStore.cuentas.length === 0) {
      try {
        const result = await cuentasStore.fetchAccounts();
        if (result && result.success === false) {
          console.warn("No se pudieron cargar las cuentas completas:", result.error);
        }
      } catch (error) {
        console.warn("Error al cargar cuentas completas:", error);
      }
    }
    
    // Cargar pagos de créditos después de cargar las inversiones
    await cargarPagosCreditos();

    // Debug temporal: Mostrar estructura de datos
    console.log('=== DEBUG INVERSIONES ===');
    console.log('Investments:', investments.value);
    console.log('Investment Types:', investmentTypes.value);
    console.log('Accounts:', accountForSelect.value);
    console.log('========================');
  } catch (error) {
    console.error("Error al cargar datos iniciales:", error);
    toast.add({
      severity: "error",
      summary: "Error de autenticación",
      detail: "Verifica tu sesión e intenta nuevamente",
      life: 5000,
    });
  }
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
  // Buscar cuentas que contengan "ingreso" e "interés" en el nombre
  const cuentas = cuentasStore.cuentas || [];
  const cuentasIngresoIntereses = cuentas.filter(cuenta => {
    const nombre = (cuenta.name || '').toLowerCase();
    return nombre.includes('ingreso') && (nombre.includes('interés') || nombre.includes('interes'));
  });
  
  // Sumar el balance de todas las cuentas de ingreso por intereses
  return cuentasIngresoIntereses.reduce((total, cuenta) => {
    return total + parseFloat(cuenta.balance || 0);
  }, 0);
});

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
    case "activa":
      return { severity: "info", text: "Activa" };
    case "finalizada":
      return { severity: "success", text: "Finalizada" };
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
    message: "¿Estás seguro de que deseas eliminar esta inversión? Esta acción no se puede deshacer.",
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
        await fetchInvestments();
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

// Funciones helper para el nuevo diseño minimalista
const getTypeBadgeClass = (type) => {
  if (!type) return 'bg-neutral-100 text-neutral-600';

  const tipoStr = (type?.name || type?.nombre || type || '').toLowerCase();
  if (tipoStr.includes('crédito') || tipoStr.includes('credito')) {
    return 'bg-primary/10 text-primary';
  }
  if (tipoStr.includes('inversión') || tipoStr.includes('inversion')) {
    return 'bg-success-100 text-success-600';
  }
  return 'bg-neutral-100 text-neutral-600';
};

const getTypeLabel = (type) => {
  if (!type) return 'Sin tipo';
  if (typeof type === 'object') return type.name || type.nombre || type.label || 'Sin tipo';
  if (typeof type === 'string') return type.charAt(0).toUpperCase() + type.slice(1);
  return 'Sin tipo';
};

const getStatusBadgeClass = (status) => {
  const estado = (status || '').toLowerCase();
  switch (estado) {
    case 'activa':
    case 'activo':
      return 'bg-success-100 text-success-600';
    case 'finalizada':
    case 'completado':
    case 'pagado':
      return 'bg-primary/10 text-primary';
    case 'vencido':
      return 'bg-danger-100 text-danger-600';
    case 'pendiente':
      return 'bg-warning-100 text-warning-600';
    default:
      return 'bg-neutral-100 text-neutral-600';
  }
};

const getStatusLabel = (status) => {
  const estado = (status || '').toLowerCase();
  switch (estado) {
    case 'activa':
    case 'activo':
      return 'Activa';
    case 'finalizada':
      return 'Finalizada';
    case 'completado':
      return 'Completado';
    case 'pagado':
      return 'Pagado';
    case 'vencido':
      return 'Vencido';
    case 'pendiente':
      return 'Pendiente';
    default:
      return status || 'Sin estado';
  }
};

// Función para ver detalle de pagos (para créditos)
const verDetallePagos = (inversion) => {
  // Navegar a la vista de detalle de crédito
  router.push({
    name: 'detalle-credito',
    params: { id: inversion.id }
  });
};

const getAccountName = (accountId) => {
  if (!accountId) return 'Sin cuenta';
  const account = accountsList.value.find(acc => acc.id === accountId || acc.value === accountId);
  return account?.name || account?.nombre || account?.label || 'Cuenta no encontrada';
};

// Corregir los computed de totales para usar los campos correctos
const totalInvertidoCorregido = computed(() => {
  return (investments.value || [])
    .filter(inv => (inv.status || inv.estado || '').toLowerCase() === 'activa')
    .reduce((sum, inv) => {
      const monto = parseFloat(inv.principal || inv.amount || inv.monto || 0);
      return sum + monto;
    }, 0);
});

const totalGananciasPotencialesCorregido = computed(() => {
  return (investments.value || [])
    .filter(inv => (inv.status || inv.estado || '').toLowerCase() === 'activa')
    .reduce((sum, inv) => {
      const ganancia = parseFloat(inv.expected_return || inv.ganancia_esperada || 0);
      return sum + ganancia;
    }, 0);
});

const totalGananciasAcumuladasCorregido = computed(() => {
  return (investments.value || [])
    .filter(inv => {
      const estado = (inv.status || inv.estado || '').toLowerCase();
      return ['finalizada', 'completado', 'pagado'].includes(estado);
    })
    .reduce((sum, inv) => {
      const ganancia = parseFloat(inv.expected_return || inv.ganancia_esperada || 0);
      return sum + ganancia;
    }, 0);
});

// Función para verificar si es tipo crédito - CORREGIDA
const esTipoCreditoCorregido = (inversion) => {
  const tipo = (inversion.investment_type?.name ||
                inversion.investment_type?.nombre ||
                inversion.tipo?.name ||
                inversion.tipo?.nombre ||
                inversion.tipo || '').toString().toLowerCase();
  return tipo.includes('crédito') || tipo.includes('credito');
};

// Alias para mantener compatibilidad
const handleSaveInvestment = handleSaveInversion;
const confirmDelete = handleDeleteInversion;
const investmentToEdit = inversionToEdit;
const accounts = accountsList;
</script>
